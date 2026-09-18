from typing import Literal

from app.decision.action_registry import PREDEFINED_ACTION_REGISTRY

RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "BLOCKED"]


def evaluate_action_risk(action: str) -> RiskLevel:
    """
    Deterministic Policy & Risk Classification:
    Evaluates action against predefined policy rules.
    HIGH-risk actions (e.g., ROLLBACK_DEPLOYMENT) require human approval.
    Arbitrary or unknown actions are BLOCKED.
    """
    action_upper = action.upper().strip()
    if action_upper not in PREDEFINED_ACTION_REGISTRY:
        return "BLOCKED"

    return PREDEFINED_ACTION_REGISTRY[action_upper]["risk_level"]


def requires_human_approval(action: str) -> bool:
    risk = evaluate_action_risk(action)
    return risk in {"HIGH", "BLOCKED"}
