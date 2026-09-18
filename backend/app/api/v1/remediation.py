from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import IncidentResponse
from app.api.v1.incidents import remediate_incident

router = APIRouter()


@router.post("/{incident_id}/remediate", response_model=IncidentResponse)
async def remediate_alias(incident_id: str, db: AsyncSession = Depends(get_db)):
    return await remediate_incident(incident_id, db)
