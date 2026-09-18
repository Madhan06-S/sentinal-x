from __future__ import annotations

import logging
import time
from datetime import datetime
from typing import Any

from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest
from app.tools.prometheus import PrometheusClient

logger = logging.getLogger(__name__)


def _parse_alert_time(raw: Any) -> datetime | None:
    if not raw:
        return None
    if isinstance(raw, (int, float)):
        return datetime.fromtimestamp(raw)
    try:
        return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
    except Exception:
        return None


async def collect_alerts(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    client = PrometheusClient()
    source = await client.alerts()
    evidence: list[dict[str, Any]] = []

    for idx, symptom in enumerate(incident.symptoms):
        item = EvidenceItem(
            id=f"symptom-{idx+1}",
            type="symptom",
            description=f"Reported symptom: {symptom}",
            timestamp=incident.start_time,
            source="incident_request",
            service=incident.service,
            metadata={"severity": incident.severity},
        )
        evidence.append(item.model_dump(mode="json"))

    alerts: list[dict[str, Any]] = []
    if source.status == "ok":
        raw_alerts = (source.data or {}).get("alerts") or []
        for idx, alert in enumerate(raw_alerts):
            labels = alert.get("labels") or {}
            annotations = alert.get("annotations") or {}
            alerts.append(
                {
                    "state": alert.get("state"),
                    "labels": labels,
                    "annotations": annotations,
                    "active_at": alert.get("activeAt"),
                }
            )
            item = EvidenceItem(
                id=f"prom-alert-{idx+1}",
                type="alert",
                description=annotations.get("description")
                or annotations.get("summary")
                or labels.get("alertname")
                or "Prometheus alert",
                timestamp=_parse_alert_time(alert.get("activeAt")),
                source="prometheus",
                service=labels.get("service") or labels.get("app") or incident.service,
                metadata={"labels": labels, "state": alert.get("state")},
            )
            evidence.append(item.model_dump(mode="json"))

    logger.info(
        "collect_alerts complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "collect_alerts",
            "source": "prometheus",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": source.status == "ok" or bool(incident.symptoms),
            "evidence_count": len(evidence),
        },
    )
    return {
        "alerts": {"source": source.model_dump(mode="json"), "items": alerts},
        "evidence": evidence,
        "sources": [source.model_dump(mode="json")],
        "errors": [{"source": "prometheus", "error": source.error}] if source.status == "error" else [],
    }
