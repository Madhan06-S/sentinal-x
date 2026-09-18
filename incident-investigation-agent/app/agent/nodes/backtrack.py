from __future__ import annotations

import logging
import time
from typing import Any

from app.graph.backtracking import backtrack_causes
from app.graph.confidence import apply_scores
from app.graph.dependency_graph import InvestigationGraph
from app.schemas.evidence import CorrelationLink, EvidenceItem, SourceResult
from app.schemas.incident import IncidentRequest

logger = logging.getLogger(__name__)


async def backtrack(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    graph = InvestigationGraph.from_payload(state.get("dependencies") or {})
    evidence = [EvidenceItem.model_validate(item) for item in state.get("evidence") or []]
    correlations = [CorrelationLink.model_validate(item) for item in state.get("correlations") or []]
    sources = [SourceResult.model_validate(item) for item in state.get("sources") or []]
    starts = [svc for svc in [incident.service, *incident.related_services] if svc]
    path, candidates = backtrack_causes(
        graph=graph,
        start_services=starts,
        evidence=evidence,
        correlations=correlations,
    )
    scored = apply_scores(candidates, evidence, correlations, sources)
    logger.info(
        "backtrack complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "backtrack",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
            "evidence_count": len(scored),
        },
    )
    return {
        "backtracking_path": path,
        "candidate_causes": [item.model_dump(mode="json") for item in scored],
    }
