from __future__ import annotations

import logging
import time
from typing import Any

from app.graph.dependency_graph import InvestigationGraph
from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest

logger = logging.getLogger(__name__)


async def build_graph(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    graph = InvestigationGraph()
    if incident.service:
        graph.add_entity(incident.service, "service", name=incident.service)
    for related in incident.related_services:
        graph.add_entity(related, "service", name=related)
        if incident.service:
            graph.add_relation(incident.service, related, "related")
    graph.add_supplied_dependencies(incident.dependencies)

    kube = state.get("kubernetes_data") or {}
    if kube.get("status") == "ok" and isinstance(kube.get("data"), dict):
        graph.add_kubernetes(kube["data"])

    evidence_items = [EvidenceItem.model_validate(item) for item in state.get("evidence") or []]
    for item in evidence_items:
        graph.add_evidence_node(item.id, item.type, item.service, item.timestamp)

    payload = graph.to_payload()
    logger.info(
        "build_graph complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "build_graph",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
            "evidence_count": len(payload.get("nodes") or []),
        },
    )
    return {"dependencies": payload}
