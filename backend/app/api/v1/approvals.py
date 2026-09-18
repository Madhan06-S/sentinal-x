from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import ApprovalRequest, IncidentResponse, RejectionRequest
from app.api.v1.incidents import approve_incident, reject_incident

router = APIRouter()


@router.post("/{incident_id}/approve", response_model=IncidentResponse)
async def approve_alias(incident_id: str, request: ApprovalRequest, db: AsyncSession = Depends(get_db)):
    return await approve_incident(incident_id, request, db)


@router.post("/{incident_id}/reject", response_model=IncidentResponse)
async def reject_alias(incident_id: str, request: RejectionRequest, db: AsyncSession = Depends(get_db)):
    return await reject_incident(incident_id, request, db)
