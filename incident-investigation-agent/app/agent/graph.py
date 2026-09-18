from __future__ import annotations

import asyncio
import logging
from typing import Any

from langgraph.graph import END, START, StateGraph

from app.agent.nodes.analyze_evidence import analyze_evidence
from app.agent.nodes.backtrack import backtrack
from app.agent.nodes.build_graph import build_graph
from app.agent.nodes.collect_alerts import collect_alerts
from app.agent.nodes.collect_deployments import collect_deployments
from app.agent.nodes.collect_kubernetes import collect_kubernetes
from app.agent.nodes.collect_logs import collect_logs
from app.agent.nodes.collect_metrics import collect_metrics
from app.agent.nodes.correlate_evidence import correlate_evidence_node
from app.agent.nodes.generate_rca import generate_rca
from app.agent.nodes.intake import intake
from app.agent.nodes.persist import persist
from app.agent.state import InvestigationState

logger = logging.getLogger(__name__)


async def collect_evidence(state: InvestigationState) -> dict[str, Any]:
    tasks = [
        collect_alerts(state),
        collect_metrics(state),
        collect_kubernetes(state),
        collect_deployments(state),
        collect_logs(state),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    merged: dict[str, Any] = {"evidence": [], "sources": [], "errors": []}
    collectors = ["collect_alerts", "collect_metrics", "collect_kubernetes", "collect_deployments", "collect_logs"]
    for name, result in zip(collectors, results, strict=True):
        if isinstance(result, Exception):
            logger.exception("collector failed", extra={"node": name, "investigation_id": state.get("investigation_id")})
            merged["errors"].append({"source": name, "error": str(result)})
            merged["sources"].append({"source": name, "status": "error", "error": str(result)})
            continue
        merged["evidence"].extend(result.get("evidence") or [])
        merged["sources"].extend(result.get("sources") or [])
        merged["errors"].extend(result.get("errors") or [])
        for key, value in result.items():
            if key not in {"evidence", "sources", "errors"}:
                merged[key] = value
    return merged


def build_investigation_graph():
    workflow = StateGraph(InvestigationState)
    workflow.add_node("intake", intake)
    workflow.add_node("collect_evidence", collect_evidence)
    workflow.add_node("build_graph", build_graph)
    workflow.add_node("correlate_evidence", correlate_evidence_node)
    workflow.add_node("backtrack", backtrack)
    workflow.add_node("analyze_evidence", analyze_evidence)
    workflow.add_node("generate_rca", generate_rca)
    workflow.add_node("persist", persist)
    workflow.add_edge(START, "intake")
    workflow.add_edge("intake", "collect_evidence")
    workflow.add_edge("collect_evidence", "build_graph")
    workflow.add_edge("build_graph", "correlate_evidence")
    workflow.add_edge("correlate_evidence", "backtrack")
    workflow.add_edge("backtrack", "analyze_evidence")
    workflow.add_edge("analyze_evidence", "generate_rca")
    workflow.add_edge("generate_rca", "persist")
    workflow.add_edge("persist", END)
    return workflow.compile()


investigation_graph = build_investigation_graph()
