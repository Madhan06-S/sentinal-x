from datetime import datetime, timezone
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AuditLog
from app.core.logging import logger
from app.core.realtime import publish


async def create_audit_log(
    db: AsyncSession,
    event_type: str,
    incident_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> AuditLog:
    logger.info("Audit Event: %s (Incident: %s)", event_type, incident_id)
    log = AuditLog(incident_id=incident_id, event_type=event_type, details=details)
    db.add(log)
    await db.commit()
    await db.refresh(log)
    await publish(
        "audit.created",
        {
            "id": log.id,
            "event_type": log.event_type,
            "incident_id": log.incident_id,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else datetime.now(timezone.utc).isoformat(),
        },
        incident_id=incident_id,
    )
    return log
