from datetime import datetime, timedelta, timezone
import hashlib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import logger
from app.core.realtime import publish
from app.models.models import Alert, AlertStatus, Incident, IncidentStatus, Severity
from app.schemas.schemas import NormalizedEvent
from app.services.audit_service import create_audit_log
from app.services.catalog_service import catalog_graph_payload, related_service_names
from app.services.jobs import schedule_analysis
import uuid

NOISE_TYPES = {"heartbeat", "ok", "resolved"}

def _fingerprint(event: NormalizedEvent) -> str:
    # service + event_type + error_code + important message
    parts = [
        event.service,
        event.event_type,
        event.error_code or "",
        event.message.strip().lower()
    ]
    raw = "|".join(parts)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def _is_noise(event: NormalizedEvent) -> bool:
    if event.severity == Severity.INFO:
        return True
    if event.event_type.lower() in NOISE_TYPES:
        return True
    return False

async def _find_duplicate(db: AsyncSession, fingerprint: str, timestamp: datetime, exclude_id: str | None = None) -> Alert | None:
    cutoff = timestamp - timedelta(seconds=settings.ALERT_DEDUP_WINDOW_SECONDS)
    stmt = select(Alert).where(Alert.fingerprint == fingerprint, Alert.timestamp >= cutoff)
    if exclude_id:
        stmt = stmt.where(Alert.id != exclude_id)
    result = await db.execute(stmt.order_by(Alert.timestamp.desc()))
    return result.scalars().first()

async def _find_correlatable_incident(db: AsyncSession, event: NormalizedEvent, related_services: set[str]) -> Incident | None:
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=settings.INCIDENT_CORRELATION_WINDOW_SECONDS)
    active_statuses = [
        IncidentStatus.OPEN,
        IncidentStatus.INVESTIGATING,
        IncidentStatus.AWAITING_APPROVAL,
        IncidentStatus.REMEDIATING,
        IncidentStatus.VERIFYING,
        IncidentStatus.DECISION_PENDING,
        IncidentStatus.ESCALATED,
    ]
    
    result = await db.execute(
        select(Incident).where(
            Incident.status.in_(active_statuses), 
            Incident.created_at >= cutoff
        ).order_by(Incident.created_at.desc())
    )
    incidents = list(result.scalars().all())
    
    best_incident = None
    highest_score = 0
    
    for incident in incidents:
        score = 0
        
        alerts_result = await db.execute(select(Alert).where(Alert.incident_id == incident.id))
        incident_alerts = list(alerts_result.scalars().all())
        incident_services = {a.service for a in incident_alerts}
        incident_error_codes = {a.error_code for a in incident_alerts if a.error_code}
        
        if event.service in incident_services:
            score += 2
        elif incident_services & related_services:
            score += 1
            
        if event.error_code and event.error_code in incident_error_codes:
            score += 3
            
        if event.event_type == "deployment" or any(a.alert_type == "deployment" for a in incident_alerts):
            score += 1
            
        if score > highest_score and score > 0:
            highest_score = score
            best_incident = incident
            
    return best_incident

async def get_event_by_event_id(db: AsyncSession, event_id: str) -> Alert | None:
    result = await db.execute(select(Alert).where(Alert.event_id == event_id))
    return result.scalars().first()

def _max_severity(s1: Severity, s2: Severity) -> Severity:
    order = {
        Severity.CRITICAL: 5,
        Severity.HIGH: 4,
        Severity.MEDIUM: 3,
        Severity.LOW: 2,
        Severity.INFO: 1,
    }
    return s1 if order.get(s1, 0) > order.get(s2, 0) else s2

async def process_event(db: AsyncSession, event_in: NormalizedEvent) -> Alert:
    # 1. Exact Delivery Protection (e.g. GitHub duplicate delivery ID)
    if event_in.event_id:
        existing = await get_event_by_event_id(db, event_in.event_id)
        if existing:
            logger.info("Event %s already exists, skipping exact duplicate.", event_in.event_id)
            return existing
    
    # 2. Setup record
    fingerprint = _fingerprint(event_in)
    
    alert = Alert(
        event_id=event_in.event_id or f"evt_{uuid.uuid4().hex[:12]}",
        source=event_in.source,
        service=event_in.service,
        alert_type=event_in.event_type,
        error_code=event_in.error_code,
        severity=event_in.severity,
        message=event_in.message,
        timestamp=event_in.timestamp,
        meta=event_in.metadata,
        environment=event_in.environment,
        status=AlertStatus.NEW,
        fingerprint=fingerprint,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    logger.info("Ingested canonical event %s (alert id: %s)", alert.event_id, alert.id)
    await create_audit_log(db, "EVENT_RECEIVED", details={"alert_id": alert.id, "event_id": alert.event_id, "service": alert.service, "type": alert.alert_type})
    await publish("event.ingested", {"id": alert.id, "event_id": alert.event_id, "service": alert.service, "severity": alert.severity}, None)

    # If this is a deployment event, record it in deployments table for RAG/AI telemetry correlation
    if event_in.event_type == "deployment" or "deploy" in event_in.message.lower():
        try:
            from app.models.models import Service, Deployment, DeploymentStatus
            stmt = select(Service).where(Service.name == event_in.service)
            res = await db.execute(stmt)
            svc = res.scalars().first()
            if not svc:
                svc = Service(name=event_in.service, display_name=event_in.service.title(), kind="service")
                db.add(svc)
                await db.commit()
                await db.refresh(svc)
            
            dep = Deployment(
                service_id=svc.id,
                version=str(event_in.metadata.get("version", "v1.0.0")),
                environment=event_in.environment or "production",
                status=DeploymentStatus.SUCCEEDED,
                source=event_in.source,
                deployed_at=event_in.timestamp or datetime.now(timezone.utc),
                meta=event_in.metadata
            )
            db.add(dep)
            await db.commit()
        except Exception as e:
            logger.warning("Could not auto-create deployment record: %s", e)

    # 3. Deduplication (Semantic)
    duplicate = await _find_duplicate(db, fingerprint, alert.timestamp, exclude_id=alert.id)
    if duplicate:
        alert.status = AlertStatus.DUPLICATE
        alert.incident_id = duplicate.incident_id
        await db.commit()
        await create_audit_log(db, "EVENT_DEDUPLICATED", alert.incident_id, {"alert_id": alert.id, "duplicate_of": duplicate.id})
        return alert

    # 4. Noise Filtering
    if _is_noise(event_in):
        alert.status = AlertStatus.FILTERED
        await db.commit()
        await create_audit_log(db, "EVENT_FILTERED", details={"alert_id": alert.id, "reason": "noise"})
        return alert

    # 5. Correlation
    graph = await catalog_graph_payload(db)
    related = related_service_names(alert.service, graph)
    incident = await _find_correlatable_incident(db, event_in, related)

    # 6. Incident Formation
    if not incident and alert.severity in {Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM}:
        incident = Incident(
            title=f"{alert.service}: {alert.message[:80]}",
            severity=alert.severity,
        )
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        await create_audit_log(db, "INCIDENT_CREATED", incident.id, {"alert_id": alert.id})
        await publish("incident.created", {"id": incident.id, "title": incident.title, "status": incident.status}, incident.id)
    
    if incident:
        # Increase incident severity if new event is higher
        new_severity = _max_severity(incident.severity, alert.severity)
        if new_severity != incident.severity:
            incident.severity = new_severity
            
        alert.incident_id = incident.id
        alert.status = AlertStatus.PROCESSING
        await db.commit()
        await create_audit_log(db, "EVENT_CORRELATED", incident.id, {"alert_id": alert.id})
        
        if incident.status in {IncidentStatus.OPEN, IncidentStatus.INVESTIGATING, IncidentStatus.FAILED}:
            schedule_analysis(incident.id)

    return alert
