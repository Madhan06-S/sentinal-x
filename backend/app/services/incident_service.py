from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Alert, AuditLog, Incident, IncidentStatus
from app.schemas.schemas import IncidentUpdate
from app.core.realtime import publish
from app.services.catalog_service import incident_graph_from_payload


async def get_incident(db: AsyncSession, incident_id: str) -> Incident | None:
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    return result.scalars().first()


async def get_incident_detailed(db: AsyncSession, incident_id: str) -> Incident | None:
    result = await db.execute(
        select(Incident)
        .options(selectinload(Incident.alerts), selectinload(Incident.analyses))
        .where(Incident.id == incident_id)
    )
    return result.scalars().first()


async def get_incidents(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    status: IncidentStatus | None = None,
) -> list[Incident]:
    stmt = select(Incident).order_by(Incident.created_at.desc()).offset(skip).limit(limit)
    if status:
        stmt = stmt.where(Incident.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_incident(db: AsyncSession, incident_id: str, incident_update: IncidentUpdate) -> Incident | None:
    incident = await get_incident(db, incident_id)
    if not incident:
        return None

    update_data = incident_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(incident, key, value)
    incident.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(incident)
    await publish("incident.updated", {"id": incident.id, "status": incident.status}, incident.id)
    return incident


async def get_incident_timeline(db: AsyncSession, incident_id: str) -> list[AuditLog]:
    result = await db.execute(
        select(AuditLog).where(AuditLog.incident_id == incident_id).order_by(AuditLog.created_at.asc())
    )
    return list(result.scalars().all())


async def get_incident_alerts(db: AsyncSession, incident_id: str) -> list[Alert]:
    result = await db.execute(
        select(Alert).where(Alert.incident_id == incident_id).order_by(Alert.timestamp.asc())
    )
    return list(result.scalars().all())


def get_incident_graph(incident: Incident):
    return incident_graph_from_payload(incident.id, incident.dependency_graph)
