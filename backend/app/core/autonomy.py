import enum
from typing import Dict, Any

class AutonomyLevel(str, enum.Enum):
    L1 = "L1"  # Advisory — AI analyzes and reports only, zero remediation proposed
    L2 = "L2"  # Guarded — AI proposes actions, NEVER executes; human runs them manually
    L3 = "L3"  # Semi-Auto — AI auto-executes LOW-risk actions; MEDIUM/HIGH require human approval
    L4 = "L4"  # Full-Auto — AI auto-executes LOW+MEDIUM risk; HIGH still requires human approval

CANONICAL_AUTONOMY_DETAILS: Dict[str, Dict[str, Any]] = {
    "L1": {
        "autonomy_level": "L1",
        "level": "L1",
        "name": "L1: Advisory",
        "title": "Advisory",
        "description": "AI analyzes and reports only, zero remediation proposed.",
    },
    "L2": {
        "autonomy_level": "L2",
        "level": "L2",
        "name": "L2: Guarded",
        "title": "Guarded",
        "description": "AI proposes actions, NEVER executes; human runs them manually.",
    },
    "L3": {
        "autonomy_level": "L3",
        "level": "L3",
        "name": "L3: Semi-Auto",
        "title": "Semi-Auto",
        "description": "AI auto-executes LOW-risk actions; MEDIUM/HIGH require human approval.",
    },
    "L4": {
        "autonomy_level": "L4",
        "level": "L4",
        "name": "L4: Full-Auto",
        "title": "Full-Auto",
        "description": "AI auto-executes LOW+MEDIUM risk; HIGH still requires human approval.",
    },
}

class AutonomyManager:
    def __init__(self):
        self._current_level: AutonomyLevel = AutonomyLevel.L3

    def get_level(self) -> AutonomyLevel:
        return self._current_level

    def set_level(self, level_str: str) -> Dict[str, Any]:
        level_upper = (level_str or "").strip().upper()
        if level_upper.startswith("L1"):
            level_enum = AutonomyLevel.L1
        elif level_upper.startswith("L2"):
            level_enum = AutonomyLevel.L2
        elif level_upper.startswith("L3"):
            level_enum = AutonomyLevel.L3
        elif level_upper.startswith("L4"):
            level_enum = AutonomyLevel.L4
        else:
            raise ValueError(f"Invalid autonomy level: {level_str}. Must be one of L1, L2, L3, L4.")

        self._current_level = level_enum
        return self.get_details()

    def get_details(self) -> Dict[str, Any]:
        lvl_key = self._current_level.value
        return CANONICAL_AUTONOMY_DETAILS[lvl_key]

autonomy_manager = AutonomyManager()
