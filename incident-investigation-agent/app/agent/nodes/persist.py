from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select

from app.database import SessionLocal
from app.models.incident import IncidentRecord
from app.models.investigation import InvestigationRecord
from app.schemas.incident import IncidentRequest

logger = logging.getLogger(__name__)


async def persist(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    rca = state.get("rca") or {}
    db = SessionLocal()
    try:
        row = db.execute(
            select(IncidentRecord).where(IncidentRecord.incident_id == incident.incident_id)
        ).scalar_one_or_none()
        if row is None:
            row = IncidentRecord(
                incident_id=incident.incident_id,
                service=incident.service,
                namespace=incident.namespace,
                payload=incident.model_dump(mode="json"),
            )
            db.add(row)
        else:
            row.service = incident.service or row.service
            row.namespace = incident.namespace or row.namespace
            row.payload = incident.model_dump(mode="json")

        start = state.get("investigation_start")
        end = state.get("investigation_end")
        start_dt = datetime.fromisoformat(start) if isinstance(start, str) else start
        end_dt = datetime.fromisoformat(end) if isinstance(end, str) else end or datetime.now(timezone.utc)
        record = InvestigationRecord(
            id=state["investigation_id"],
            incident_id=incident.incident_id,
            service=incident.service,
            investigation_start=start_dt,
            investigation_end=end_dt,
            status=state.get("status") or rca.get("status") or "completed",
            root_cause=rca.get("root_cause"),
            confidence=state.get("confidence"),
            evidence=rca.get("evidence"),
            candidate_causes=rca.get("candidate_causes"),
            backtracking_path=rca.get("backtracking_path"),
            uncertainties=rca.get("uncertainties"),
            sources=rca.get("sources"),
            rca=rca,
            errors=state.get("errors") or rca.get("errors"),
        )
        db.merge(record)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    logger.info(
        "persist complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "persist",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
            "status": state.get("status"),
            "evidence_count": len(rca.get("evidence") or []),
        },
    )
    return {}
