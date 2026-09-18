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
    if incident.status == IncidentStatus.RESOLVED:
        raise ValueError(f"Incident {incident_id} is already resolved.")
    if incident.approval_required and incident.status == IncidentStatus.AWAITING_APPROVAL:
        raise ValueError(f"Incident {incident_id} requires human approval before remediation.")

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

    # Simulated Remediation Controller
    # Based on the action, we generate mock before/after metrics
    before_metrics = {"memory_percent": 94, "db_connections_percent": 100, "api_latency_ms": 4800, "error_rate_percent": 31}
    after_metrics = {"memory_percent": 94, "db_connections_percent": 100, "api_latency_ms": 4800, "error_rate_percent": 31}
    
    if incident.recommended_action == "ROLLBACK_DEPLOYMENT":
        after_metrics = {"memory_percent": 45, "db_connections_percent": 42, "api_latency_ms": 180, "error_rate_percent": 0.8}
    elif incident.recommended_action == "RESTART_SERVICE":
        after_metrics = {"memory_percent": 30, "db_connections_percent": 5, "api_latency_ms": 120, "error_rate_percent": 1.2}
    elif incident.recommended_action == "SCALE_SERVICE":
        after_metrics = {"memory_percent": 55, "db_connections_percent": 60, "api_latency_ms": 210, "error_rate_percent": 2.5}
    elif incident.recommended_action == "CLEAR_CACHE":
        after_metrics = {"memory_percent": 75, "db_connections_percent": 90, "api_latency_ms": 300, "error_rate_percent": 4.5}

    result = {
        "executed": True,
        "action": incident.recommended_action,
        "parameters": incident.action_parameters or {},
        "simulated": True,
        "SIMULATED_REMEDIATION": True,
        "metrics_before": before_metrics,
        "metrics_after": after_metrics,
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

    action = await _latest_action(db, incident.id)
    
    class MockVerificationResponse:
        def __init__(self, healthy: bool, summary: str, checks: list[dict]):
            self.healthy = healthy
            self.summary = summary
            self.checks = checks
        
        def model_dump(self, mode="json"):
            return {"healthy": self.healthy, "summary": self.summary, "checks": self.checks}
            
    # Deterministic check
    healthy = False
    summary = "No remediation action executed."
    checks = []
    
    if action and action.result and action.result.get("metrics_after"):
        metrics = action.result["metrics_after"]
        checks = [
            {"name": "memory_percent", "passed": metrics["memory_percent"] < 70, "value": metrics["memory_percent"]},
            {"name": "db_connections_percent", "passed": metrics["db_connections_percent"] < 80, "value": metrics["db_connections_percent"]},
            {"name": "api_latency_ms", "passed": metrics["api_latency_ms"] < 500, "value": metrics["api_latency_ms"]},
            {"name": "error_rate_percent", "passed": metrics["error_rate_percent"] < 5, "value": metrics["error_rate_percent"]},
        ]
        healthy = all(c["passed"] for c in checks)
        summary = "All simulated metrics passed thresholds." if healthy else "Some simulated metrics failed thresholds."
    elif action and action.action_type in {"NO_ACTION", "ESCALATE"}:
        healthy = True
        summary = f"Verification skipped for non-remediating action: {action.action_type}"
        
    verification = MockVerificationResponse(healthy, summary, checks)

    if verification.healthy:
        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = datetime.now(timezone.utc)
        if action:
            action.status = RemediationStatus.VERIFIED
            action.result = {**(action.result or {}), "verification": verification.model_dump(mode="json")}
        await db.commit()
        await create_audit_log(db, "INCIDENT_RESOLVED", incident.id, {"summary": verification.summary, "checks": verification.checks})
        
        from app.services.rag_service import save_resolved_incident_as_knowledge
        await save_resolved_incident_as_knowledge(db, incident)
        
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
