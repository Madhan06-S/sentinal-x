from __future__ import annotations

import logging
import time
from typing import Any

from app.graph.correlation import metric_change_flags
from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest
from app.tools.prometheus import PrometheusClient

logger = logging.getLogger(__name__)


async def collect_metrics(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    client = PrometheusClient()
    start, end = incident.window()
    evidence: list[dict[str, Any]] = []

    if not client.configured():
        source = await client.query("up")
        logger.info(
            "prometheus unavailable",
            extra={
                "investigation_id": state.get("investigation_id"),
                "incident_id": incident.incident_id,
                "node": "collect_metrics",
                "source": "prometheus",
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                "success": False,
            },
        )
        return {
            "metrics": {"status": "unavailable", "error": source.error},
            "sources": [source.model_dump(mode="json")],
            "evidence": [],
            "errors": [],
        }

    names_result = await client.list_metric_names()
    metric_names: list[str] = []
    if names_result.status == "ok":
        metric_names = (names_result.data or {}).get("metric_names") or []
    queries: dict[str, str] = {}
    try:
        queries = client.select_queries(
            service=incident.service,
            symptoms=incident.symptoms,
            metric_names=metric_names,
        )
    except ValueError as exc:
        return {
            "metrics": {"status": "error", "error": str(exc)},
            "sources": [{"source": "prometheus", "status": "error", "error": str(exc)}],
            "evidence": [],
            "errors": [{"source": "prometheus", "error": str(exc)}],
        }

    series: list[dict[str, Any]] = []
    last_source = names_result
    any_ok = names_result.status == "ok"
    query_errors: list[str] = []
    for name, expression in list(queries.items())[:12]:
        result = await client.query_range(expression, start, end)
        last_source = result
        if result.status == "ok":
            any_ok = True
            series.append({"name": name, "query": expression, "result": (result.data or {}).get("result")})
        elif result.status == "error":
            query_errors.append(result.error or "query failed")
            series.append({"name": name, "query": expression, "error": result.error})

    status = "ok" if any_ok else last_source.status
    payload = {"status": status, "metric_names_count": len(metric_names), "series": series}
    flags = metric_change_flags(payload)
    for idx, flag in enumerate(flags):
        item = EvidenceItem(
            id=f"metric-{idx+1}",
            type="metric",
            description=(
                f"Metric change for query {flag.get('query')}: "
                f"start={flag.get('start')} end={flag.get('end')} peak={flag.get('peak')}"
            ),
            timestamp=start,
            source="prometheus",
            service=incident.service,
            metadata=flag,
        )
        evidence.append(item.model_dump(mode="json"))

    logger.info(
        "collect_metrics complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "collect_metrics",
            "source": "prometheus",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": status in {"ok", "unavailable"},
            "evidence_count": len(evidence),
        },
    )
    source_payload = last_source.model_dump(mode="json")
    source_payload["status"] = status
    if status == "ok":
        source_payload["error"] = None
        source_payload["data"] = {"metric_names_count": len(metric_names), "series_count": len(series)}
    errors = [{"source": "prometheus", "error": err} for err in query_errors]
    if not any_ok and last_source.status == "error" and last_source.error:
        errors.append({"source": "prometheus", "error": last_source.error})
    return {
        "metrics": payload,
        "sources": [source_payload],
        "evidence": evidence,
        "errors": errors,
    }
