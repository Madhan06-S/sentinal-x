from __future__ import annotations

import logging
import time
from typing import Any

from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest
from app.tools.logs import get_log_provider

logger = logging.getLogger(__name__)


def _as_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("hits", "logs", "items", "results", "entries"):
            value = payload.get(key)
            if isinstance(value, list):
                return [item for item in value if isinstance(item, dict)]
            if isinstance(value, dict) and isinstance(value.get("hits"), list):
                return [item for item in value["hits"] if isinstance(item, dict)]
    return []


async def collect_logs(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    start, end = incident.window()
    provider = get_log_provider()
    query_parts = [incident.service or "", *incident.symptoms]
    query = " ".join(part for part in query_parts if part).strip() or "error"
    source = await provider.search(query=query, start=start, end=end, service=incident.service)
    evidence: list[dict[str, Any]] = []

    if source.status == "ok":
        for idx, row in enumerate(_as_items(source.data)[:50]):
            timestamp = row.get("timestamp") or row.get("@timestamp") or row.get("time")
            message = row.get("message") or row.get("msg") or str(row)[:300]
            item = EvidenceItem(
                id=f"log-{idx+1}",
                type="log",
                description=str(message)[:500],
                timestamp=timestamp,
                source="logs",
                service=row.get("service") or incident.service,
                metadata=row,
            )
            evidence.append(item.model_dump(mode="json"))

    logger.info(
        "collect_logs complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "collect_logs",
            "source": "logs",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": source.status != "error",
            "evidence_count": len(evidence),
        },
    )
    return {
        "logs": source.model_dump(mode="json"),
        "sources": [source.model_dump(mode="json")],
        "evidence": evidence,
        "errors": [{"source": "logs", "error": source.error}] if source.status == "error" else [],
    }
