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


@router.get("/export")
async def export_audit_logs(
    incident_id: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime, timezone
    import json
    from fastapi.responses import Response

    stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y%m%d-%H%M")
    full_date_str = now.strftime("%Y%m%d")

    if incident_id:
        stmt = stmt.where(AuditLog.incident_id == incident_id)
        filename = f"sentinel-x-audit-{incident_id}-{date_str}.json"
    else:
        filename = f"sentinel-x-audit-full-{full_date_str}.json"

    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    # Serialize logs
    data = []
    for log in logs:
        data.append({
            "id": log.id,
            "incident_id": log.incident_id,
            "event_type": log.event_type,
            "actor": log.actor,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })

    json_content = json.dumps(data, indent=2)
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Access-Control-Expose-Headers": "Content-Disposition",
    }
    return Response(content=json_content, media_type="application/json", headers=headers)

