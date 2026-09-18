from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import NormalizedEvent, AlertResponse
from app.services.event_service import process_event

router = APIRouter()

@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(event_in: NormalizedEvent, db: AsyncSession = Depends(get_db)):
    """
    Canonical Event Ingestion Endpoint.
    Accepts the unified NormalizedEvent format.
    """
    return await process_event(db, event_in)
