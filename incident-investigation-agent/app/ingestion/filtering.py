from typing import Literal

from app.schemas.event import EventSchema

FilterStatus = Literal["KEEP", "DEPRIORITIZE", "IGNORE"]


def filter_event(event: EventSchema) -> FilterStatus:
    """
    Deterministic Noise Filtering:
    Classifies events into KEEP, DEPRIORITIZE, or IGNORE.
    Raw events are ALWAYS preserved in DB, filtering determines incident processing importance.
    """
    msg_lower = (event.message or "").lower()
    severity_upper = (event.severity or "INFO").upper()

    # Ignore trivial debug / heartbeats
    if severity_upper == "DEBUG" or "heartbeat" in msg_lower or "healthcheck" in msg_lower or "ping" in msg_lower:
        return "IGNORE"

    # Deprioritize routine info messages that aren't deployments
    if severity_upper == "INFO" and event.event_type != "deployment":
        if "started" in msg_lower or "listening" in msg_lower:
            return "DEPRIORITIZE"

    # Keep critical errors, warnings, deployments, and failure signals
    if severity_upper in {"ERROR", "CRITICAL", "WARNING"}:
        return "KEEP"

    if event.event_type in {"deployment", "error", "warning", "metric_spike"}:
        return "KEEP"

    return "KEEP"
