from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Alert, Severity
from app.schemas.schemas import NormalizedEvent
from app.core.logging import logger


async def get_event_by_id(db: AsyncSession, event_id: str) -> Alert | None:
    result = await db.execute(select(Alert).filter(Alert.event_id == event_id))
    return result.scalar_one_or_none()


async def save_normalized_event(db: AsyncSession, event: NormalizedEvent) -> Alert:
    # Check if exists (duplicate protection)
    existing = await get_event_by_id(db, event.event_id)
    if existing:
        logger.info("Event %s already exists, skipping duplicate.", event.event_id)
        return existing

    db_alert = Alert(
        event_id=event.event_id,
        source=event.source,
        service=event.service,
        alert_type=event.event_type,
        severity=event.severity,
        message=event.message,
        timestamp=event.timestamp,
        meta=event.metadata,
        environment=event.environment,
    )
    
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    
    logger.info("Persisted normalized event %s from %s.", event.event_id, event.source)
    return db_alert
