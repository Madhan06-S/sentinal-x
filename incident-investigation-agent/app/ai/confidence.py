from app.schemas.event import EventSchema


def calculate_deterministic_confidence(
    events: list[EventSchema],
    rag_docs: list[dict],
    probable_root_cause: str,
) -> float:
    """
    Deterministic Confidence Validation Engine:
    Validates confidence using temporal evidence, error codes, deployment evidence,
    service relationship, and RAG relevance.
    """
    if "UNKNOWN" in probable_root_cause.upper() or "INSUFFICIENT" in probable_root_cause.upper():
        return 0.15

    score = 0.0

    # Deployment evidence (+0.25)
    has_deployment = any(e.event_type == "deployment" for e in events)
    if has_deployment and ("deployment" in probable_root_cause.lower() or "commit" in probable_root_cause.lower()):
        score += 0.25

    # Error code evidence (+0.20)
    has_error_code = any(bool(e.error_code) for e in events)
    if has_error_code:
        score += 0.20

    # Temporal sequence (e.g., deployment -> memory warning -> DB error) (+0.25)
    if len(events) >= 3 and has_deployment:
        score += 0.25
    elif len(events) >= 2:
        score += 0.15

    # Service consistency (+0.15)
    services = {e.service for e in events if e.service}
    if len(services) == 1:
        score += 0.15

    # RAG knowledge match (+0.15)
    if rag_docs and any(doc.get("relevance_score", 0) > 1.0 for doc in rag_docs):
        score += 0.15

    # Cap between 0.10 and 0.95
    final_confidence = min(max(score, 0.10), 0.95)
    return round(final_confidence, 2)
