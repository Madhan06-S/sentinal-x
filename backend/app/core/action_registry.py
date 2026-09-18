import json
import os
from pathlib import Path
from app.models.models import RiskLevel

_config_path = Path(os.path.dirname(__file__)) / "actions.json"
try:
    with open(_config_path, "r", encoding="utf-8") as f:
        _raw_registry = json.load(f)
except FileNotFoundError:
    _raw_registry = {}

ACTION_REGISTRY = {}
for name, data in _raw_registry.items():
    ACTION_REGISTRY[name] = {
        "risk_level": RiskLevel(data["risk_level"]),
        "approval_required": data["approval_required"],
        "description": data["description"],
    }


def list_available_actions() -> list[dict]:
    return [
        {
            "action": name,
            "risk_level": spec["risk_level"].value,
            "approval_required": spec["approval_required"],
            "description": spec["description"],
        }
        for name, spec in ACTION_REGISTRY.items()
    ]


def validate_action(action: str) -> dict:
    if action not in ACTION_REGISTRY:
        raise ValueError(f"Action '{action}' is not in the approved action registry")
    return ACTION_REGISTRY[action]


def apply_risk_policy(action: str, ai_requires_approval: bool) -> tuple[RiskLevel, bool]:
    spec = validate_action(action)
    risk = spec["risk_level"]
    approval_required = bool(spec["approval_required"] or ai_requires_approval)
    if risk == RiskLevel.HIGH:
        approval_required = True
    return risk, approval_required
