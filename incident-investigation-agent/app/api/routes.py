import hmac
import hashlib
import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.ai.investigation_agent import run_incident_investigation
from app.audit.audit_service import get_incident_timeline, record_audit_log
from app.config import get_settings
from app.database import get_db
from app.decision.policy_engine import evaluate_action_risk, requires_human_approval
from app.ingestion.correlation import correlate_events
from app.ingestion.deduplication import deduplicate_events
from app.ingestion.filtering import filter_event
from app.ingestion.normalizer import (
    normalize_github_event,
    normalize_log_event,
    normalize_simulator_event,
)
from app.ingestion.priority import calculate_incident_priority
from app.models.engine import (
    ApprovalRecord,
    EventRecord,
    IncidentEventLinkRecord,
    IncidentRecord,
    InvestigationRecord,
)
from app.rag.knowledge_base import store_resolved_incident_as_knowledge
from app.remediation.simulator import simulate_remediation
from app.remediation.verifier import verify_recovery
from app.schemas.event import EventSchema, LogIngestionPayload
from app.schemas.incident import (
    ApprovalDecision,
    DecisionRequest,
    IncidentSchema,
    InvestigationResult,
    RemediationResult,
)
from app.simulator.scenario_runner import generate_scenario_1_events, generate_scenario_2_events

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health_check() -> dict:
    return {"status": "ok", "engine": "autonomous-incident-resolution-engine"}


@router.get("/integrations")
async def get_integrations() -> dict:
    return get_settings().integration_status()


# ==========================================
# 1. EVENT INGESTION PIPELINE
# ==========================================

def _process_and_store_events(raw_events: list[EventSchema], db: Session) -> list[IncidentSchema]:
    created_incidents: list[IncidentSchema] = []

    for evt in raw_events:
        status_filter = filter_event(evt)
        evt.filter_status = status_filter

        # Preserve raw event in DB
        evt_rec = EventRecord(
            event_id=evt.event_id,
            source=evt.source,
            event_type=evt.event_type,
            service=evt.service,
            severity=evt.severity,
            timestamp=evt.timestamp,
            error_code=evt.error_code,
            message=evt.message,
            metadata_json=evt.metadata,
            fingerprint=evt.fingerprint,
            filter_status=evt.filter_status,
        )
        db.merge(evt_rec)

    db.commit()

    # Deduplicate non-ignored events
    filtered_events = [e for e in raw_events if e.filter_status != "IGNORE"]
    deduped = deduplicate_events(filtered_events)

    # Correlate into incidents
    correlated = correlate_events(deduped)

    for inc in correlated:
        # Calculate dynamic priority
        inc.priority = calculate_incident_priority(inc.events, service_importance="HIGH")

        # Check existing active incident for this service
        existing = db.query(IncidentRecord).filter(
            IncidentRecord.service == inc.service,
            IncidentRecord.status.in_(["OPEN", "INVESTIGATING", "DECISION_PENDING", "AWAITING_APPROVAL"])
        ).first()

        if existing:
            inc_id = existing.incident_id
            inc.incident_id = inc_id
            existing.payload = inc.model_dump()
            db.commit()
        else:
            total_count = db.query(IncidentRecord).count() + 1
            inc_id = f"INC-{total_count:03d}"
            inc.incident_id = inc_id

            inc_rec = IncidentRecord(
                incident_id=inc_id,
                title=inc.title,
                service=inc.service,
                severity=inc.severity,
                priority=inc.priority,
                status=inc.status,
                payload=inc.model_dump(),
            )
            db.add(inc_rec)
            db.commit()

            record_audit_log(
                db,
                incident_id=inc_id,
                action="INCIDENT_CREATED",
                details={"title": inc.title, "service": inc.service, "priority": inc.priority},
            )

        # Link events
        for e in inc.events:
            link = IncidentEventLinkRecord(incident_id=inc_id, event_id=e.event_id)
            db.add(link)
        db.commit()

        created_incidents.append(inc)


    return created_incidents


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def ingest_event(event: EventSchema, db: Session = Depends(get_db)) -> dict:
    incidents = _process_and_store_events([event], db)
    return {"message": "Event ingested", "event_id": event.event_id, "correlated_incidents": [i.incident_id for i in incidents]}


@router.post("/events/logs", status_code=status.HTTP_201_CREATED)
async def ingest_log(payload: LogIngestionPayload, db: Session = Depends(get_db)) -> dict:
    evt = normalize_log_event(payload)
    incidents = _process_and_store_events([evt], db)
    return {"message": "Log event ingested", "event_id": evt.event_id, "correlated_incidents": [i.incident_id for i in incidents]}


@router.post("/github/webhook", status_code=status.HTTP_200_OK)
async def github_webhook(
    request: Request,
    x_github_event: str = Header(default="push"),
    x_hub_signature_256: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> dict:
    body_bytes = await request.body()
    settings = get_settings()

    # Webhook signature validation if secret is set
    if settings.github_webhook_secret and x_hub_signature_256:
        expected_sig = "sha256=" + hmac.new(settings.github_webhook_secret.encode(), body_bytes, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, x_hub_signature_256):
            raise HTTPException(status_code=401, detail="Invalid GitHub webhook signature")

    try:
        payload = json.loads(body_bytes.decode("utf-8"))
    except Exception:
        payload = {}

    evt = normalize_github_event(x_github_event, payload)
    incidents = _process_and_store_events([evt], db)
    return {"message": "GitHub webhook ingested", "event_id": evt.event_id, "correlated_incidents": [i.incident_id for i in incidents]}


@router.post("/simulator/trigger", status_code=status.HTTP_200_OK)
async def trigger_simulator(scenario: int = 1, db: Session = Depends(get_db)) -> dict:
    if scenario == 1:
        events = generate_scenario_1_events()
        scenario_name = "Payment Service Degradation Scenario"
    else:
        events = generate_scenario_2_events()
        scenario_name = "Insufficient Evidence Scenario"

    incidents = _process_and_store_events(events, db)
    return {
        "message": f"Simulator triggered: {scenario_name}",
        "scenario": scenario,
        "events_generated": len(events),
        "incidents": [i.model_dump() for i in incidents],
    }


# ==========================================
# 2. INCIDENT MANAGEMENT & INVESTIGATION
# ==========================================

@router.get("/incidents")
async def list_incidents(db: Session = Depends(get_db)) -> list[dict]:
    records = db.query(IncidentRecord).order_by(IncidentRecord.created_at.desc()).all()
    results = []
    for r in records:
        data = r.payload if r.payload else {}
        data["incident_id"] = r.incident_id
        data["status"] = r.status
        results.append(data)
    return results


@router.get("/incidents/{incident_id}")
async def get_incident(incident_id: str, db: Session = Depends(get_db)) -> dict:
    record = db.query(IncidentRecord).filter(IncidentRecord.incident_id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    data = record.payload if record.payload else {}
    data["incident_id"] = record.incident_id
    data["status"] = record.status

    # Attach investigation if exists
    inv_rec = db.query(InvestigationRecord).filter(InvestigationRecord.incident_id == incident_id).first()
    if inv_rec and inv_rec.rca:
        data["investigation"] = inv_rec.rca

    return data


@router.post("/incidents/{incident_id}/investigate")
async def investigate_incident(incident_id: str, db: Session = Depends(get_db)) -> InvestigationResult:
    record = db.query(IncidentRecord).filter(IncidentRecord.incident_id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    record.status = "INVESTIGATING"
    db.commit()

    record_audit_log(db, incident_id=incident_id, action="INVESTIGATION_STARTED")

    payload = record.payload or {}
    incident_schema = IncidentSchema.model_validate(payload)

    # Run Groq + RAG evidence grounded investigation
    result = await run_incident_investigation(incident_schema, db)

    # Persist investigation
    inv_rec = db.query(InvestigationRecord).filter(InvestigationRecord.incident_id == incident_id).first()
    if not inv_rec:
        inv_rec = InvestigationRecord(id=f"inv_{incident_id}", incident_id=incident_id)

    inv_rec.status = "completed"
    inv_rec.root_cause = {"summary": result.probable_root_cause, "confidence": result.confidence}
    inv_rec.confidence = result.confidence
    inv_rec.rca = result.model_dump()
    db.add(inv_rec)

    # Update incident status based on risk level
    if result.risk_level in {"HIGH", "BLOCKED"} and result.recommended_action != "ESCALATE":
        record.status = "AWAITING_APPROVAL"
    else:
        record.status = "DECISION_PENDING"

    db.commit()

    record_audit_log(
        db,
        incident_id=incident_id,
        action="RCA_GENERATED",
        details={
            "probable_root_cause": result.probable_root_cause,
            "confidence": result.confidence,
            "recommended_action": result.recommended_action,
            "risk_level": result.risk_level,
        },
    )

    return result


# ==========================================
# 3. DECISION, APPROVAL, REMEDIATION & VERIFICATION
# ==========================================

@router.post("/incidents/{incident_id}/approve")
async def approve_remediation(
    incident_id: str,
    action: str = "ROLLBACK_DEPLOYMENT",
    actor: str = "developer",
    reason: str = "Approved by developer via frontend dashboard",
    db: Session = Depends(get_db),
) -> dict:
    record = db.query(IncidentRecord).filter(IncidentRecord.incident_id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    approval = ApprovalRecord(
        incident_id=incident_id,
        action=action,
        decision="APPROVED",
        reason=reason,
        actor=actor,
    )
    db.add(approval)
    record.status = "DECISION_PENDING"
    db.commit()

    record_audit_log(
        db,
        incident_id=incident_id,
        action="APPROVAL_GRANTED",
        details={"action": action, "actor": actor, "reason": reason},
    )

    return {"message": "Action approved", "incident_id": incident_id, "action": action}


@router.post("/incidents/{incident_id}/reject")
async def reject_remediation(
    incident_id: str,
    action: str = "ROLLBACK_DEPLOYMENT",
    actor: str = "developer",
    reason: str = "Rejected by developer",
    db: Session = Depends(get_db),
) -> dict:
    record = db.query(IncidentRecord).filter(IncidentRecord.incident_id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    approval = ApprovalRecord(
        incident_id=incident_id,
        action=action,
        decision="REJECTED",
        reason=reason,
        actor=actor,
    )
    db.add(approval)
    record.status = "ESCALATED"
    db.commit()

    record_audit_log(
        db,
        incident_id=incident_id,
        action="APPROVAL_REJECTED",
        details={"action": action, "actor": actor, "reason": reason},
    )

    return {"message": "Action rejected", "incident_id": incident_id, "action": action}


@router.post("/incidents/{incident_id}/remediate")
async def remediate_incident(
    incident_id: str,
    action: str | None = None,
    db: Session = Depends(get_db),
) -> RemediationResult:
    record = db.query(IncidentRecord).filter(IncidentRecord.incident_id == incident_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Incident not found")

    inv_rec = db.query(InvestigationRecord).filter(InvestigationRecord.incident_id == incident_id).first()
    target_action = action or (inv_rec.rca.get("recommended_action") if inv_rec and inv_rec.rca else "ROLLBACK_DEPLOYMENT")

    # Safety check: if HIGH risk, check if approval was granted
    if requires_human_approval(target_action):
        app_rec = (
            db.query(ApprovalRecord)
            .filter(ApprovalRecord.incident_id == incident_id, ApprovalRecord.decision == "APPROVED")
            .first()
        )
        if not app_rec:
            raise HTTPException(
                status_code=400,
                detail=f"Action '{target_action}' is HIGH risk and requires human approval before remediation.",
            )

    record.status = "REMEDIATING"
    db.commit()

    record_audit_log(db, incident_id=incident_id, action="REMEDIATION_STARTED", details={"action": target_action})

    # Run safe deterministic simulation
    result = simulate_remediation(incident_id, target_action)

    # Independent Metric Verification
    record.status = "VERIFYING"
    db.commit()
    record_audit_log(db, incident_id=incident_id, action="VERIFICATION_STARTED")

    passed, ver_reason = verify_recovery(result.after_metrics)

    if passed:
        record.status = "RESOLVED"
        db.commit()
        record_audit_log(
            db,
            incident_id=incident_id,
            action="INCIDENT_RESOLVED",
            details={"action": target_action, "verification": ver_reason},
        )

        # Store resolved incident into RAG Knowledge base for future learning
        payload = record.payload or {}
        store_resolved_incident_as_knowledge(
            db,
            incident_id=incident_id,
            service=record.service,
            symptoms=[e.get("message", "") for e in payload.get("events", [])],
            root_cause=inv_rec.rca.get("probable_root_cause") if inv_rec and inv_rec.rca else "Recent deployment regression",
            resolution_action=target_action,
            verification_result="RECOVERED",
        )
    else:
        record.status = "ESCALATED"
        db.commit()
        record_audit_log(
            db,
            incident_id=incident_id,
            action="VERIFICATION_FAILED",
            details={"action": target_action, "verification": ver_reason},
        )

    return result


@router.get("/incidents/{incident_id}/timeline")
async def get_timeline(incident_id: str, db: Session = Depends(get_db)) -> list[dict]:
    timeline = get_incident_timeline(db, incident_id)
    return [item.model_dump() for item in timeline]
