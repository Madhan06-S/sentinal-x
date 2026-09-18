from __future__ import annotations

import logging
import time
from typing import Any

from app.graph.correlation import correlate_evidence
from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest

logger = logging.getLogger(__name__)


async def correlate_evidence_node(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    evidence = [EvidenceItem.model_validate(item) for item in state.get("evidence") or []]
    related = set(incident.related_services)
    if incident.service:
        related.add(incident.service)
    for hint in incident.dependencies:
        related.add(hint.source)
        related.add(hint.target)
    links = correlate_evidence(evidence, related_services=related)
    payload = [link.model_dump(mode="json") for link in links]
    logger.info(
        "correlate_evidence complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "correlate_evidence",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
            "evidence_count": len(payload),
        },
    )
    return {"correlations": payload}
