from typing import Literal

ActionType = Literal[
    "NO_ACTION",
    "RESTART_SERVICE",
    "ROLLBACK_DEPLOYMENT",
    "CLEAR_CACHE",
    "SCALE_SERVICE",
    "ESCALATE",
]

PREDEFINED_ACTION_REGISTRY = {
    "NO_ACTION": {
        "name": "No Action",
        "description": "Take no immediate automated action. Monitor status.",
        "risk_level": "LOW",
    },
    "CLEAR_CACHE": {
        "name": "Clear Cache",
        "description": "Flush application redis/in-memory cache.",
        "risk_level": "LOW",
    },
    "RESTART_SERVICE": {
        "name": "Restart Service",
        "description": "Restart service container/process to flush leaked resources.",
        "risk_level": "MEDIUM",
    },
    "SCALE_SERVICE": {
        "name": "Scale Service",
        "description": "Increase service instance count.",
        "risk_level": "MEDIUM",
    },
    "ROLLBACK_DEPLOYMENT": {
        "name": "Rollback Deployment",
        "description": "Roll back recent deployment to previous stable version.",
        "risk_level": "HIGH",
    },
    "ESCALATE": {
        "name": "Escalate to Human On-Call",
        "description": "Escalate incident to senior developer or on-call team.",
        "risk_level": "LOW",
    },
}
