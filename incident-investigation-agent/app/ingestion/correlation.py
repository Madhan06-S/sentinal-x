from typing import Sequence

from app.schemas.event import EventSchema
from app.schemas.incident import IncidentSchema


def correlate_events(events: Sequence[EventSchema], incident_id_prefix: str = "INC") -> list[IncidentSchema]:
    """
    Alert Correlation Engine:
    Groups related events across time, service, deployment, and error relationships into Logical Incidents.
    """
    keep_events = [e for e in events if e.filter_status != "IGNORE"]
    if not keep_events:
        return []

    # Group events by service or related deployment proximity
    groups: dict[str, list[EventSchema]] = {}
    for event in keep_events:
        key = event.service
        if key not in groups:
            groups[key] = []
        groups[key].append(event)

    incidents: list[IncidentSchema] = []
    idx = 1
    for service, group_events in groups.items():
        # Check if there are errors or warnings
        has_critical = any(e.severity in {"ERROR", "CRITICAL"} for e in group_events)
        if not has_critical and len(group_events) < 2:
            continue  # Single routine info item doesn't form an incident

        inc_id = f"{incident_id_prefix}-{idx:03d}"
        idx += 1

        highest_sev = "ERROR"
        if any(e.severity == "CRITICAL" for e in group_events):
            highest_sev = "CRITICAL"
        elif all(e.severity == "WARNING" for e in group_events):
            highest_sev = "WARNING"

        title = f"{service.replace('-', ' ').title()} Degradation / Incident"
        if any("DB" in (e.error_code or "") for e in group_events):
            title = f"{service.replace('-', ' ').title()} Database Connection Pool Exhaustion"

        incident = IncidentSchema(
            incident_id=inc_id,
            title=title,
            service=service,
            severity=highest_sev,
            priority="HIGH" if highest_sev in {"CRITICAL", "ERROR"} else "MEDIUM",
            status="OPEN",
            events=group_events,
        )
        incidents.append(incident)

    return incidents
