from datetime import datetime, timezone
from typing import Sequence

from app.schemas.event import EventSchema


def deduplicate_events(events: Sequence[EventSchema], time_window_seconds: int = 300) -> list[EventSchema]:
    """
    Fingerprint & time-window deduplication:
    Groups repeated identical alerts (same service + event_type + error_code + message fingerprint)
    within the time window into a single representative event with incremented count metadata.
    """
    deduped: list[EventSchema] = []
    seen: dict[str, EventSchema] = {}

    for event in events:
        fp = event.fingerprint or f"{event.service}:{event.event_type}:{event.error_code}:{event.message}"
        if fp in seen:
            existing = seen[fp]
            existing_count = existing.metadata.get("duplicate_count", 1)
            existing.metadata["duplicate_count"] = existing_count + 1
        else:
            event_copy = event.model_copy(deep=True)
            if "duplicate_count" not in event_copy.metadata:
                event_copy.metadata["duplicate_count"] = 1
            seen[fp] = event_copy
            deduped.append(event_copy)

    return deduped
