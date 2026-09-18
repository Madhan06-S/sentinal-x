import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any

from app.schemas.event import EventSchema, LogIngestionPayload


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def compute_fingerprint(service: str, event_type: str, error_code: str | None, message: str) -> str:
    norm_msg = (message or "").lower().strip()
    raw = f"{service.lower()}:{event_type.lower()}:{(error_code or '').lower()}:{norm_msg}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def normalize_log_event(payload: LogIngestionPayload | dict[str, Any]) -> EventSchema:
    if isinstance(payload, LogIngestionPayload):
        data = payload.model_dump()
    else:
        data = payload

    evt_id = f"evt_{uuid.uuid4().hex[:12]}"
    service = data.get("service") or "payment-service"
    level = (data.get("level") or data.get("severity") or "ERROR").upper()
    error_code = data.get("error_code")
    message = data.get("message") or "Application log message"
    timestamp = data.get("timestamp") or _utcnow_iso()
    metadata = data.get("metadata") or {}
    if data.get("request_id"):
        metadata["request_id"] = data["request_id"]

    fingerprint = compute_fingerprint(service, "error" if level in {"ERROR", "CRITICAL"} else "info", error_code, message)

    return EventSchema(
        event_id=evt_id,
        source="application",
        event_type="error" if level in {"ERROR", "CRITICAL"} else "info",
        service=service,
        severity=level if level in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"} else "ERROR",
        timestamp=timestamp,
        error_code=error_code,
        message=message,
        metadata=metadata,
        fingerprint=fingerprint,
    )


def normalize_github_event(event_type: str, payload: dict[str, Any]) -> EventSchema:
    evt_id = f"evt_{uuid.uuid4().hex[:12]}"
    repo_data = payload.get("repository", {})
    repo_name = repo_data.get("name") or repo_data.get("full_name") or "payment-service"
    service = repo_name.split("/")[-1] if "/" in repo_name else repo_name

    commit_sha = ""
    message = f"GitHub {event_type} event"
    author = ""

    if event_type == "push":
        commits = payload.get("commits", [])
        if commits:
            commit_sha = commits[-1].get("id", "")[:7]
            message = f"Push: {commits[-1].get('message', 'Code commit')}"
            author = commits[-1].get("author", {}).get("name", "")
        head_commit = payload.get("head_commit") or {}
        if head_commit:
            commit_sha = head_commit.get("id", "")[:7]
            message = f"Push deployment: {head_commit.get('message', 'Deployment commit')}"
    elif event_type == "deployment":
        deployment = payload.get("deployment", {})
        commit_sha = deployment.get("sha", "")[:7]
        message = f"Deployment to {deployment.get('environment', 'production')}"

    metadata = {
        "repository": repo_name,
        "branch": payload.get("ref", "").replace("refs/heads/", ""),
        "commit_sha": commit_sha,
        "author": author,
    }

    fingerprint = compute_fingerprint(service, "deployment", None, message)

    return EventSchema(
        event_id=evt_id,
        source="github",
        event_type="deployment",
        service=service,
        severity="INFO",
        timestamp=_utcnow_iso(),
        error_code=None,
        message=message,
        metadata=metadata,
        fingerprint=fingerprint,
    )


def normalize_simulator_event(raw_event: dict[str, Any]) -> EventSchema:
    evt_id = raw_event.get("event_id") or f"evt_{uuid.uuid4().hex[:12]}"
    service = raw_event.get("service") or "payment-service"
    event_type = raw_event.get("event_type") or "error"
    severity = raw_event.get("severity") or "ERROR"
    error_code = raw_event.get("error_code")
    message = raw_event.get("message") or "Simulator signal"
    timestamp = raw_event.get("timestamp") or _utcnow_iso()
    metadata = raw_event.get("metadata") or {}

    fingerprint = raw_event.get("fingerprint") or compute_fingerprint(service, event_type, error_code, message)

    return EventSchema(
        event_id=evt_id,
        source=raw_event.get("source") or "simulator",
        event_type=event_type,
        service=service,
        severity=severity,
        timestamp=timestamp,
        error_code=error_code,
        message=message,
        metadata=metadata,
        fingerprint=fingerprint,
    )
