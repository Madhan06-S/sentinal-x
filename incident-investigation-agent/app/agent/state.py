from __future__ import annotations

from typing import Annotated, Any, TypedDict

from operator import add


def merge_dicts(left: dict[str, Any] | None, right: dict[str, Any] | None) -> dict[str, Any]:
    result = dict(left or {})
    result.update(right or {})
    return result


class InvestigationState(TypedDict, total=False):
    investigation_id: str
    incident: dict[str, Any]
    previous_investigations: list[dict[str, Any]]
    alerts: dict[str, Any]
    metrics: dict[str, Any]
    kubernetes_data: dict[str, Any]
    deployments: dict[str, Any]
    logs: dict[str, Any]
    dependencies: dict[str, Any]
    events: list[dict[str, Any]]
    correlations: list[dict[str, Any]]
    candidate_causes: list[dict[str, Any]]
    backtracking_path: list[str]
    evidence: list[dict[str, Any]]
    llm_analysis: dict[str, Any]
    root_cause: dict[str, Any] | None
    confidence: float | None
    uncertainties: list[str]
    status: str
    errors: Annotated[list[dict[str, str]], add]
    sources: Annotated[list[dict[str, Any]], add]
    rca: dict[str, Any]
    investigation_start: str
    investigation_end: str | None
