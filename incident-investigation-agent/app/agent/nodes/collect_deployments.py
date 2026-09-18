from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta
from typing import Any

from app.schemas.evidence import EvidenceItem
from app.schemas.incident import IncidentRequest
from app.tools.github import GitHubClient

logger = logging.getLogger(__name__)


def _parse_time(raw: str | None) -> datetime | None:
    if not raw:
        return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except Exception:
        return None


async def collect_deployments(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    start, end = incident.window()
    since = start - timedelta(hours=6)
    client = GitHubClient()
    source = await client.collect(since=since, until=end)
    evidence: list[dict[str, Any]] = []

    if source.status == "ok":
        data = source.data or {}
        for idx, deployment in enumerate((data.get("deployments") or [])[:20]):
            item = EvidenceItem(
                id=f"deploy-{idx+1}",
                type="deployment",
                description=(
                    f"GitHub deployment sha={deployment.get('sha')} "
                    f"env={deployment.get('environment')} ref={deployment.get('ref')}"
                ),
                timestamp=_parse_time(deployment.get("created_at") or deployment.get("updated_at")),
                source="github",
                service=incident.service,
                metadata=deployment,
            )
            evidence.append(item.model_dump(mode="json"))
        for idx, commit in enumerate((data.get("commits") or [])[:20]):
            item = EvidenceItem(
                id=f"commit-{idx+1}",
                type="commit",
                description=f"Commit {(commit.get('sha') or '')[:12]}: {commit.get('message')}",
                timestamp=_parse_time(commit.get("timestamp")),
                source="github",
                service=incident.service,
                metadata=commit,
            )
            evidence.append(item.model_dump(mode="json"))

    logger.info(
        "collect_deployments complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "collect_deployments",
            "source": "github",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": source.status != "error",
            "evidence_count": len(evidence),
        },
    )
    return {
        "deployments": source.model_dump(mode="json"),
        "sources": [source.model_dump(mode="json")],
        "evidence": evidence,
        "errors": [{"source": "github", "error": source.error}] if source.status == "error" else [],
    }
