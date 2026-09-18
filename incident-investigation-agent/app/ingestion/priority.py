from typing import Literal

from app.schemas.event import EventSchema

PriorityLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]


def calculate_incident_priority(
    events: list[EventSchema], service_importance: str = "HIGH"
) -> PriorityLevel:
    """
    Deterministic Incident Priority Score:
    Factors: event severity, service importance, event frequency, deployment correlation.
    """
    score = 0.0

    # Severity weights
    for event in events:
        sev = (event.severity or "INFO").upper()
        if sev == "CRITICAL":
            score += 4.0
        elif sev == "ERROR":
            score += 2.5
        elif sev == "WARNING":
            score += 1.0

    # Service importance
    if service_importance.upper() == "CRITICAL":
        score += 3.0
    elif service_importance.upper() == "HIGH":
        score += 2.0

    # Frequency factor
    score += min(len(events) * 0.5, 3.0)

    # Deployment proximity
    if any(e.event_type == "deployment" for e in events):
        score += 1.5

    if score >= 8.0:
        return "CRITICAL"
    if score >= 5.0:
        return "HIGH"
    if score >= 2.5:
        return "MEDIUM"
    return "LOW"
