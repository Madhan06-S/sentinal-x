from __future__ import annotations

import logging
import time
from datetime import datetime
from typing import Any

from app.config import get_settings
from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest
from app.tools.kubernetes import KubernetesClient

logger = logging.getLogger(__name__)


def _parse_time(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return None


async def collect_kubernetes(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    settings = get_settings()
    namespace = incident.namespace or settings.kubernetes_namespace
    client = KubernetesClient(settings)
    source = await client.snapshot(namespace=namespace, service=incident.service)
    evidence: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []

    if source.status == "ok":
        data = source.data or {}
        events = data.get("events") or []
        for idx, event in enumerate(events[:50]):
            item = EvidenceItem(
                id=f"k8s-event-{idx+1}",
                type="kubernetes_event",
                description=f"{event.get('reason')}: {event.get('message')}",
                timestamp=_parse_time(event.get("last_timestamp") or event.get("first_timestamp")),
                source="kubernetes",
                service=incident.service,
                metadata=event,
            )
            evidence.append(item.model_dump(mode="json"))
        for idx, deploy in enumerate((data.get("deployments") or [])[:20]):
            item = EvidenceItem(
                id=f"k8s-deploy-{idx+1}",
                type="deployment",
                description=(
                    f"Kubernetes deployment {deploy.get('name')} images={deploy.get('images')} "
                    f"ready={deploy.get('ready_replicas')}/{deploy.get('replicas')}"
                ),
                timestamp=_parse_time(deploy.get("created_at")),
                source="kubernetes",
                service=incident.service,
                metadata=deploy,
            )
            evidence.append(item.model_dump(mode="json"))
        for idx, pod in enumerate((data.get("pods") or [])[:30]):
            if (pod.get("restart_count") or 0) > 0:
                item = EvidenceItem(
                    id=f"k8s-restart-{idx+1}",
                    type="kubernetes_event",
                    description=f"Pod {pod.get('name')} restart_count={pod.get('restart_count')} phase={pod.get('phase')}",
                    timestamp=_parse_time(pod.get("created_at")),
                    source="kubernetes",
                    service=incident.service,
                    metadata=pod,
                )
                evidence.append(item.model_dump(mode="json"))
        restarted = [p for p in (data.get("pods") or []) if (p.get("restart_count") or 0) > 0][:2]
        for pod in restarted:
            logs_result = await client.get_pod_logs(namespace, pod.get("name") or "", tail_lines=80)
            if logs_result.status == "ok":
                raw_logs = (logs_result.data or {}).get("logs")
                snippet = str(raw_logs)[-2000:] if raw_logs else ""
                if snippet:
                    item = EvidenceItem(
                        id=f"k8s-log-{pod.get('name')}",
                        type="log",
                        description=f"Recent logs for pod {pod.get('name')}",
                        timestamp=_parse_time(pod.get("created_at")),
                        source="kubernetes",
                        service=incident.service,
                        metadata={"pod": pod.get("name"), "tail": snippet},
                    )
                    evidence.append(item.model_dump(mode="json"))

    logger.info(
        "collect_kubernetes complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "collect_kubernetes",
            "source": "kubernetes",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": source.status != "error",
            "evidence_count": len(evidence),
        },
    )
    return {
        "kubernetes_data": source.model_dump(mode="json"),
        "events": events,
        "sources": [source.model_dump(mode="json")],
        "evidence": evidence,
        "errors": [{"source": "kubernetes", "error": source.error}] if source.status == "error" else [],
    }
