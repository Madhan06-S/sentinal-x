from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.action_registry import apply_risk_policy, list_available_actions
from app.core.config import settings
from app.core.logging import logger
from app.core.realtime import publish
from app.integrations.ai_layer_1 import analyze_incident
from app.integrations.ai_layer_2 import request_decision
from app.models.models import AIAnalysis, Alert, AlertStatus, Incident, IncidentStatus, RemediationAction, RemediationStatus
from app.schemas.schemas import AIAnalysisRequest, AIDecisionRequest, IncidentResponse
from app.services.audit_service import create_audit_log
from app.services.catalog_service import catalog_graph_payload, recent_deployments


async def _touch(incident: Incident) -> None:
    incident.updated_at = datetime.now(timezone.utc)


async def build_analysis_payload(db: AsyncSession, incident: Incident, alerts: list[Alert]) -> AIAnalysisRequest:
    graph = await catalog_graph_payload(db)
    deployments = await recent_deployments(db, minutes=180)
    return AIAnalysisRequest(
        incident_id=incident.id,
        title=incident.title,
        severity=incident.severity,
        alerts=[
            {
                "id": alert.id,
                "source": alert.source,
                "service": alert.service,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "message": alert.message,
                "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
                "metadata": alert.meta or {},
            }
            for alert in alerts
        ],
        services=graph["nodes"],
        deployments=[
            {
                "id": item.id,
                "service": item.service.name if item.service else item.service_id,
                "version": item.version,
                "status": item.status,
                "deployed_at": item.deployed_at.isoformat() if item.deployed_at else None,
                "metadata": item.meta or {},
            }
            for item in deployments
        ],
        dependency_graph=graph,
        logs=[{"service": alert.service, "message": alert.message, "timestamp": alert.timestamp.isoformat() if alert.timestamp else None} for alert in alerts],
        metrics=[alert.meta or {} for alert in alerts],
        context={"incident_status": incident.status},
    )


async def run_ai_analysis_pipeline(db: AsyncSession, incident_id: str) -> Incident:
    result = await db.execute(
        select(Incident).options(selectinload(Incident.alerts)).where(Incident.id == incident_id)
    )
    incident = result.scalars().first()
    if not incident:
        raise ValueError(f"Incident {incident_id} not found")

    alerts = [alert for alert in incident.alerts if alert.status != AlertStatus.DUPLICATE]
    try:
        incident.status = IncidentStatus.INVESTIGATING
        await _touch(incident)
        await db.commit()
        await create_audit_log(db, "RCA_STARTED", incident.id, {"alert_count": len(alerts)})
        await publish("incident.updated", IncidentResponse.model_validate(incident).model_dump(mode="json"), incident.id)

        analysis_payload = await build_analysis_payload(db, incident, alerts)
        analysis_result = await analyze_incident(analysis_payload)

        for alert in alerts:
            if alert.id in set(analysis_result.correlated_alert_ids):
                alert.status = AlertStatus.CORRELATED

        incident.root_cause = analysis_result.root_cause
        incident.confidence = analysis_result.confidence
        incident.root_cause_evidence = [item.model_dump() if hasattr(item, "model_dump") else item for item in analysis_result.evidence]
        incident.analysis_summary = analysis_result.analysis_summary
        incident.dependency_graph = analysis_result.dependency_graph
        incident.fingerprint = analysis_result.fingerprint
        await _touch(incident)

        analysis_row = AIAnalysis(
            incident_id=incident.id,
            layer=1,
            correlated_alert_ids=analysis_result.correlated_alert_ids,
            root_cause=analysis_result.root_cause,
            confidence=analysis_result.confidence,
            evidence=incident.root_cause_evidence,
            hypotheses=[item.model_dump() for item in analysis_result.hypotheses],
            dependency_graph=analysis_result.dependency_graph,
            analysis_summary=analysis_result.analysis_summary,
            raw_response=analysis_result.model_dump(mode="json"),
        )
        db.add(analysis_row)
        await db.commit()
        await create_audit_log(db, "RCA_COMPLETED", incident.id, {"confidence": analysis_result.confidence, "root_cause": analysis_result.root_cause})

        decision_payload = AIDecisionRequest(
            incident_id=incident.id,
            root_cause=analysis_result.root_cause,
            confidence=analysis_result.confidence,
            severity=incident.severity,
            business_context={
                "affected_services": sorted({alert.service for alert in alerts}),
                "severity": incident.severity,
            },
            available_actions=list_available_actions(),
            analysis=analysis_result.model_dump(mode="json"),
        )
        decision_result = await request_decision(decision_payload)
        risk_level, approval_required = apply_risk_policy(decision_result.decision, decision_result.approval_required)

        incident.recommended_action = decision_result.decision
        incident.action_parameters = decision_result.action_parameters
        incident.decision_reason = decision_result.reason
        incident.risk_level = risk_level
        incident.approval_required = approval_required
        if decision_result.business_impact:
            incident.business_impact = (
                decision_result.business_impact.get("customer_impact")
                or str(decision_result.business_impact)
            )

        action = RemediationAction(
            incident_id=incident.id,
            action_type=decision_result.decision,
            parameters=decision_result.action_parameters,
            risk_level=risk_level,
            approval_required=approval_required,
            status=RemediationStatus.PENDING,
        )
        db.add(action)
        db.add(
            AIAnalysis(
                incident_id=incident.id,
                layer=2,
                decision=decision_result.decision,
                risk_level=risk_level,
                approval_required=approval_required,
                reason=decision_result.reason,
                action_parameters=decision_result.action_parameters,
                business_impact=decision_result.business_impact,
                raw_response=decision_result.model_dump(mode="json"),
            )
        )

        if approval_required:
            incident.status = IncidentStatus.AWAITING_APPROVAL
            await create_audit_log(db, "APPROVAL_REQUESTED", incident.id, {"action": decision_result.decision})
        else:
            incident.status = IncidentStatus.REMEDIATING
            await create_audit_log(db, "DECISION_CREATED", incident.id, {"action": decision_result.decision, "auto": True})

        await _touch(incident)
        await db.commit()
        await db.refresh(incident)
        await publish("incident.updated", IncidentResponse.model_validate(incident).model_dump(mode="json"), incident.id)

        if not approval_required and settings.AUTO_REMEDIATE_LOW_RISK:
            from app.services.jobs import schedule_remediation

            schedule_remediation(incident.id)

        return incident
    except Exception as exc:
        logger.exception("Error in AI pipeline for %s", incident_id)
        incident.status = IncidentStatus.FAILED
        await _touch(incident)
        await db.commit()
        await create_audit_log(db, "AI_PIPELINE_FAILED", incident.id, {"error": str(exc)})
        raise
