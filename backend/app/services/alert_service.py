from datetime import datetime, timedelta, timezone
import hashlib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.logging import logger
from app.core.realtime import publish
from app.models.models import Alert, AlertStatus, Incident, IncidentStatus, Severity
from app.schemas.schemas import AlertCreate
from app.services.audit_service import create_audit_log
from app.services.catalog_service import catalog_graph_payload, related_service_names
from app.services.jobs import schedule_analysis


NOISE_TYPES = {"heartbeat", "ok", "resolved"}


def _fingerprint(alert_in: AlertCreate) -> str:
    raw = "|".join([alert_in.source, alert_in.service, alert_in.alert_type, alert_in.message.strip().lower()])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _is_noise(alert: Alert) -> bool:
    if alert.severity == Severity.INFO:
        return True
    return alert.alert_type.lower() in NOISE_TYPES


async def _find_duplicate(db: AsyncSession, fingerprint: str, timestamp: datetime) -> Alert | None:
    cutoff = timestamp - timedelta(seconds=settings.ALERT_DEDUP_WINDOW_SECONDS)
    result = await db.execute(
        select(Alert)
        .where(Alert.fingerprint == fingerprint, Alert.timestamp >= cutoff)
        .order_by(Alert.timestamp.desc())
    )
    return result.scalars().first()


async def _find_correlatable_incident(db: AsyncSession, alert: Alert, related_services: set[str]) -> Incident | None:
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=settings.INCIDENT_CORRELATION_WINDOW_SECONDS)
    active = [
        IncidentStatus.OPEN,
        IncidentStatus.INVESTIGATING,
        IncidentStatus.AWAITING_APPROVAL,
        IncidentStatus.REMEDIATING,
        IncidentStatus.VERIFYING,
    ]
    result = await db.execute(
        select(Incident).where(Incident.status.in_(active), Incident.created_at >= cutoff).order_by(Incident.created_at.desc())
    )
    incidents = list(result.scalars().all())
    for incident in incidents:
        alerts_result = await db.execute(select(Alert.service).where(Alert.incident_id == incident.id))
        incident_services = {row[0] for row in alerts_result.all()}
        if incident_services & related_services or alert.service in incident_services:
            return incident
    return None


async def ingest_alert(db: AsyncSession, alert_in: AlertCreate) -> Alert:
    fingerprint = _fingerprint(alert_in)
    duplicate = await _find_duplicate(db, fingerprint, alert_in.timestamp)
    alert = Alert(
        source=alert_in.source,
        service=alert_in.service,
        alert_type=alert_in.alert_type,
        severity=alert_in.severity,
        message=alert_in.message,
        timestamp=alert_in.timestamp,
        meta=alert_in.meta,
        status=AlertStatus.NEW,
        fingerprint=fingerprint,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    logger.info("Ingested alert %s", alert.id)
    await create_audit_log(db, "ALERT_RECEIVED", details={"alert_id": alert.id, "service": alert.service, "type": alert.alert_type})
    await publish("alert.ingested", {"id": alert.id, "service": alert.service, "severity": alert.severity}, None)

    if duplicate:
        alert.status = AlertStatus.DUPLICATE
        alert.incident_id = duplicate.incident_id
        await db.commit()
        await create_audit_log(db, "ALERT_DEDUPLICATED", alert.incident_id, {"alert_id": alert.id, "duplicate_of": duplicate.id})
        return alert

    if _is_noise(alert):
        alert.status = AlertStatus.FILTERED
        await db.commit()
        await create_audit_log(db, "ALERT_FILTERED", details={"alert_id": alert.id, "reason": "noise"})
        return alert

    graph = await catalog_graph_payload(db)
    related = related_service_names(alert.service, graph)
    incident = await _find_correlatable_incident(db, alert, related)

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
        alert.incident_id = incident.id
        alert.status = AlertStatus.PROCESSING
        await db.commit()
        await create_audit_log(db, "ALERT_CORRELATED", incident.id, {"alert_id": alert.id})
        if incident.status in {IncidentStatus.OPEN, IncidentStatus.INVESTIGATING, IncidentStatus.FAILED}:
            schedule_analysis(incident.id)

    return alert
