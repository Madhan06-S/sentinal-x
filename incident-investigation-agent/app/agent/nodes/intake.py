from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from sqlalchemy import select

from app.database import SessionLocal
from app.models.investigation import InvestigationRecord
from app.schemas.incident import IncidentRequest

logger = logging.getLogger(__name__)


def _parse_incident(raw: dict[str, Any]) -> IncidentRequest:
    return IncidentRequest.model_validate(raw)


async def intake(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = _parse_incident(state["incident"])
    investigation_id = state.get("investigation_id") or str(uuid4())
    now = datetime.now(timezone.utc).isoformat()

    previous: list[dict[str, Any]] = []
    db = SessionLocal()
    try:
        stmt = (
            select(InvestigationRecord)
            .where(InvestigationRecord.incident_id == incident.incident_id)
            .order_by(InvestigationRecord.created_at.desc())
            .limit(5)
        )
        if incident.service:
            extra = (
                select(InvestigationRecord)
                .where(InvestigationRecord.service == incident.service)
                .order_by(InvestigationRecord.created_at.desc())
                .limit(5)
            )
            for row in db.execute(extra).scalars():
                previous.append(
                    {
                        "investigation_id": row.id,
                        "incident_id": row.incident_id,
                        "status": row.status,
                        "root_cause": row.root_cause,
                        "confidence": row.confidence,
                        "created_at": row.created_at.isoformat() if row.created_at else None,
                    }
                )
        for row in db.execute(stmt).scalars():
            previous.append(
                {
                    "investigation_id": row.id,
                    "incident_id": row.incident_id,
                    "status": row.status,
                    "root_cause": row.root_cause,
                    "confidence": row.confidence,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                }
            )
    except Exception:
        logger.warning(
            "previous investigation lookup failed",
            extra={
                "investigation_id": investigation_id,
                "incident_id": incident.incident_id,
                "node": "intake",
                "success": False,
            },
        )
        previous = []
    finally:
        db.close()

    logger.info(
        "intake complete",
        extra={
            "investigation_id": investigation_id,
            "incident_id": incident.incident_id,
            "node": "intake",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
        },
    )
    return {
        "investigation_id": investigation_id,
        "incident": json.loads(incident.model_dump_json()),
        "previous_investigations": previous,
        "investigation_start": now,
        "status": "in_progress",
        "errors": [],
        "sources": [],
        "evidence": [],
        "uncertainties": [],
        "events": [],
        "correlations": [],
        "candidate_causes": [],
        "backtracking_path": [],
    }
