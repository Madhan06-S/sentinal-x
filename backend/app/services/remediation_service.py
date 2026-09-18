from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.action_registry import apply_risk_policy
from app.core.logging import logger
from app.core.realtime import publish
from app.integrations.ai_layer_2 import request_verification
from app.models.models import (
    Alert,
    Approval,
    ApprovalDecision,
    Incident,
    IncidentStatus,
    RemediationAction,
    RemediationStatus,
)
from app.schemas.schemas import AIVerificationRequest, IncidentResponse
from app.services.audit_service import create_audit_log
from app.services.incident_service import get_incident


async def _latest_action(db: AsyncSession, incident_id: str) -> RemediationAction | None:
    result = await db.execute(
        select(RemediationAction)
        .where(RemediationAction.incident_id == incident_id)
        .order_by(RemediationAction.created_at.desc())
    )
    return result.scalars().first()


async def record_approval(db: AsyncSession, incident: Incident, actor: str, comment: str | None, approved: bool) -> Incident:
    action = await _latest_action(db, incident.id)
    decision = ApprovalDecision.APPROVED if approved else ApprovalDecision.REJECTED
    db.add(
        Approval(
            incident_id=incident.id,
            action_id=action.id if action else None,
            decision=decision,
            actor=actor,
            comment=comment,
        )
    )
    if approved:
        if action:
            action.status = RemediationStatus.APPROVED
        incident.status = IncidentStatus.REMEDIATING
        await create_audit_log(db, "ACTION_APPROVED", incident.id, {"approved_by": actor, "action": incident.recommended_action})
    else:
        if action:
            action.status = RemediationStatus.REJECTED
        incident.status = IncidentStatus.OPEN
        await create_audit_log(db, "ACTION_REJECTED", incident.id, {"rejected_by": actor, "action": incident.recommended_action})
    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(incident)
    await publish("incident.updated", IncidentResponse.model_validate(incident).model_dump(mode="json"), incident.id)
    return incident


async def execute_remediation(db: AsyncSession, incident_id: str) -> Incident:
    incident = await get_incident(db, incident_id)
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")
    if not incident.recommended_action:
        raise ValueError("No recommended action available")

    risk, approval_required = apply_risk_policy(incident.recommended_action, incident.approval_required)
    incident.risk_level = risk
    incident.approval_required = approval_required
    action = await _latest_action(db, incident.id)

    logger.info("Starting remediation for %s: %s", incident.id, incident.recommended_action)
    incident.status = IncidentStatus.REMEDIATING
    incident.updated_at = datetime.now(timezone.utc)
    if action:
        action.status = RemediationStatus.RUNNING
        action.started_at = datetime.now(timezone.utc)
        action.risk_level = risk
    await db.commit()
    await create_audit_log(db, "REMEDIATION_STARTED", incident.id, {"action": incident.recommended_action, "parameters": incident.action_parameters})
    await publish("incident.updated", IncidentResponse.model_validate(incident).model_dump(mode="json"), incident.id)

    result = {
        "executed": True,
        "action": incident.recommended_action,
        "parameters": incident.action_parameters or {},
        "simulated": True,
        "message": f"Executed structured action {incident.recommended_action} through the remediation controller.",
    }
    if action:
        action.status = RemediationStatus.SUCCEEDED
        action.result = result
        action.completed_at = datetime.now(timezone.utc)
    incident.status = IncidentStatus.VERIFYING
    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await create_audit_log(db, "REMEDIATION_COMPLETED", incident.id, result)

    from app.services.jobs import schedule_verification

    schedule_verification(incident.id)
    await db.refresh(incident)
    return incident


async def verify_remediation(db: AsyncSession, incident_id: str) -> Incident:
    incident = await get_incident(db, incident_id)
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")

    await create_audit_log(db, "VERIFICATION_STARTED", incident.id)
    incident.status = IncidentStatus.VERIFYING
    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()

    alerts_result = await db.execute(
        select(Alert).where(Alert.incident_id == incident_id).order_by(Alert.timestamp.desc())
    )
    recent_alerts = [
        {"id": alert.id, "service": alert.service, "alert_type": alert.alert_type, "severity": alert.severity, "message": alert.message}
        for alert in alerts_result.scalars().all()
    ]
    verification = await request_verification(
        AIVerificationRequest(
            incident_id=incident.id,
            action=incident.recommended_action or "",
            action_parameters=incident.action_parameters or {},
            recent_alerts=recent_alerts,
        )
    )
    action = await _latest_action(db, incident.id)

    if verification.healthy:
        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = datetime.now(timezone.utc)
        if action:
            action.status = RemediationStatus.VERIFIED
            action.result = {**(action.result or {}), "verification": verification.model_dump(mode="json")}
        await db.commit()
        await create_audit_log(db, "INCIDENT_RESOLVED", incident.id, {"summary": verification.summary, "checks": verification.checks})
        logger.info("Incident %s resolved", incident.id)
    else:
        incident.status = IncidentStatus.INVESTIGATING
        if action:
            action.status = RemediationStatus.FAILED
        await db.commit()
        await create_audit_log(db, "VERIFICATION_FAILED", incident.id, {"summary": verification.summary, "checks": verification.checks})
        from app.services.jobs import schedule_analysis

        schedule_analysis(incident.id)

    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await publish("incident.updated", IncidentResponse.model_validate(incident).model_dump(mode="json"), incident.id)
    await db.refresh(incident)
    return incident
