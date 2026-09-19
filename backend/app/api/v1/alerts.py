from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Alert, AlertStatus
from app.schemas.schemas import AlertCreate, AlertResponse, NormalizedEvent
from app.services.event_service import process_event
import uuid

router = APIRouter()


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(alert_in: AlertCreate, db: AsyncSession = Depends(get_db)):
    # Convert old AlertCreate to new NormalizedEvent format
    event_in = NormalizedEvent(
        event_id=f"legacy_{uuid.uuid4().hex[:8]}",
        source=alert_in.source,
        event_type=alert_in.alert_type,
        service=alert_in.service,
        environment="unknown",  # Legacy API didn't have environment
        severity=alert_in.severity,
        timestamp=alert_in.timestamp,
        error_code=None,
        message=alert_in.message,
        metadata=alert_in.meta,
    )
    return await process_event(db, event_in)


@router.get("", response_model=list[AlertResponse])
@router.get("/", response_model=list[AlertResponse])
async def list_alerts(
    skip: int = 0,
    limit: int = 100,
    service: str | None = None,
    status_filter: AlertStatus | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Alert).order_by(Alert.timestamp.desc()).offset(skip).limit(limit)
    if service:
        stmt = stmt.where(Alert.service == service)
    if status_filter:
        stmt = stmt.where(Alert.status == status_filter)
    result = await db.execute(stmt)
    return list(result.scalars().all())


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert
