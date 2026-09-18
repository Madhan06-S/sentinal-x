from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogResponse

router = APIRouter()


@router.get("/", response_model=list[AuditLogResponse])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 100,
    incident_id: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    if incident_id:
        stmt = stmt.where(AuditLog.incident_id == incident_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
