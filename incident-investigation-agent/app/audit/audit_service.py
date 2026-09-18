from typing import Any
from sqlalchemy.orm import Session

from app.models.engine import AuditLogRecord
from app.schemas.incident import AuditLogSchema


def record_audit_log(
    db: Session, incident_id: str, action: str, details: dict[str, Any] | None = None
) -> AuditLogSchema:
    details_dict = details or {}
    record = AuditLogRecord(
        incident_id=incident_id,
        action=action,
        details_json=details_dict,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AuditLogSchema(
        id=record.id,
        incident_id=record.incident_id,
        action=record.action,
        details=record.details_json,
        timestamp=record.timestamp.isoformat(),
    )


def get_incident_timeline(db: Session, incident_id: str) -> list[AuditLogSchema]:
    records = (
        db.query(AuditLogRecord)
        .filter(AuditLogRecord.incident_id == incident_id)
        .order_by(AuditLogRecord.id.asc())
        .all()
    )
    return [
        AuditLogSchema(
            id=r.id,
            incident_id=r.incident_id,
            action=r.action,
            details=r.details_json,
            timestamp=r.timestamp.isoformat() if r.timestamp else "",
        )
        for r in records
    ]
