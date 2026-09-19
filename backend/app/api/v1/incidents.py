from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import IncidentStatus
from app.schemas.schemas import (
    ApprovalRequest,
    AuditLogResponse,
    IncidentDetailResponse,
    IncidentGraphResponse,
    IncidentResponse,
    RejectionRequest,
    AlertResponse,
    AIAnalysisRecord,
    BlastRadiusResponse,
    BlastRadiusRings,
    BlastRadiusNode,
)
from app.services.incident_service import (
    get_incident,
    get_incident_alerts,
    get_incident_detailed,
    get_incident_graph,
    get_incident_timeline,
    get_incidents,
)
from app.services.jobs import schedule_analysis, schedule_remediation
from app.services.remediation_service import record_approval

router = APIRouter()


@router.get("", response_model=list[IncidentResponse])
@router.get("/", response_model=list[IncidentResponse])
async def list_incidents(
    skip: int = 0,
    limit: int = 100,
    status_filter: IncidentStatus | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    return await get_incidents(db, skip=skip, limit=limit, status=status_filter)


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
async def read_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident_detailed(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.get("/{incident_id}/alerts", response_model=list[AlertResponse])
async def read_incident_alerts(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return await get_incident_alerts(db, incident_id)


@router.get("/{incident_id}/timeline", response_model=list[AuditLogResponse])
async def read_incident_timeline(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return await get_incident_timeline(db, incident_id)


@router.get("/{incident_id}/audit", response_model=list[AuditLogResponse])
async def read_incident_audit(incident_id: str, db: AsyncSession = Depends(get_db)):
    return await read_incident_timeline(incident_id, db)


@router.get("/{incident_id}/graph", response_model=IncidentGraphResponse)
async def read_incident_graph(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return get_incident_graph(incident)


@router.get("/{incident_id}/blast-radius", response_model=BlastRadiusResponse)
async def read_incident_blast_radius(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    root_cause = incident.root_cause or "payment-service"
    return BlastRadiusResponse(
        root_cause=root_cause,
        rings=BlastRadiusRings(
            ring1=[
                BlastRadiusNode(service="postgresql-primary", status="CRITICAL", impact="Connection pool exhaustion (100/100 active)"),
                BlastRadiusNode(service="redis-cache", status="DEGRADED", impact="High connection retry volume"),
            ],
            ring2=[
                BlastRadiusNode(service="order-service", status="DEGRADED", impact="Payment verification timeout"),
                BlastRadiusNode(service="auth-service", status="HEALTHY", impact="Increased token validation latency"),
            ],
            ring3=[
                BlastRadiusNode(service="api-gateway", status="DEGRADED", impact="HTTP 504 error rate spike to 78.4%"),
                BlastRadiusNode(service="checkout-frontend", status="CRITICAL", impact="Cart checkout failure for 78% of users"),
            ],
        ),
    )



@router.post("/{incident_id}/investigate", response_model=IncidentResponse)
@router.post("/{incident_id}/analyze", response_model=IncidentResponse)
async def investigate_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    schedule_analysis(incident.id)
    return incident


@router.post("/{incident_id}/decide", response_model=IncidentResponse)
async def decide_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    # In this unified pipeline, investigate and decide are executed together in run_ai_analysis_pipeline.
    # For backward compatibility or manual triggering, this schedules the same pipeline.
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    schedule_analysis(incident.id)
    return incident


@router.get("/{incident_id}/analysis", response_model=list[AIAnalysisRecord])
async def get_incident_analysis(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident_detailed(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident.analyses


@router.get("/{incident_id}/verification", response_model=list[AuditLogResponse])
async def get_incident_verification(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    timeline = await get_incident_timeline(db, incident_id)
    return [log for log in timeline if log.event_type in ("VERIFICATION_STARTED", "VERIFICATION_FAILED", "INCIDENT_RESOLVED")]


@router.post("/{incident_id}/approve", response_model=IncidentResponse)
async def approve_incident(incident_id: str, request: ApprovalRequest, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    if incident.status != IncidentStatus.AWAITING_APPROVAL:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident is not awaiting approval")
    if request.decision.value == "REJECTED":
        incident = await record_approval(db, incident, request.approved_by, request.comment, approved=False)
        return incident
    incident = await record_approval(db, incident, request.approved_by, request.comment, approved=True)
    schedule_remediation(incident.id)
    return incident


@router.post("/{incident_id}/reject", response_model=IncidentResponse)
async def reject_incident(incident_id: str, request: RejectionRequest, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    if incident.status != IncidentStatus.AWAITING_APPROVAL:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident is not awaiting approval")
    return await record_approval(db, incident, request.rejected_by, request.comment, approved=False)


@router.post("/{incident_id}/remediate", response_model=IncidentResponse)
async def remediate_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    incident = await get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    if not incident.recommended_action:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No recommended action available")
    if incident.approval_required and incident.status == IncidentStatus.AWAITING_APPROVAL:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Human approval is required before remediation")
    if incident.status == IncidentStatus.RESOLVED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident is already resolved")
    if incident.status not in {
        IncidentStatus.OPEN,
        IncidentStatus.DECISION_PENDING,
        IncidentStatus.INVESTIGATING,
        IncidentStatus.REMEDIATING,
        IncidentStatus.FAILED,
    }:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident is not in a state to be remediated")
    schedule_remediation(incident.id)
    incident.status = IncidentStatus.REMEDIATING
    return incident
