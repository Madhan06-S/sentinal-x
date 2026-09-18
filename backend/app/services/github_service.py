import hmac
import hashlib
from datetime import datetime, timezone
from app.schemas.schemas import NormalizedEvent
from app.models.models import Severity
from app.core.config import settings
from app.core.logging import logger

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    if not signature_header:
        logger.warning("Missing X-Hub-Signature-256 header")
        return False
    
    if not settings.GITHUB_WEBHOOK_SECRET:
        logger.warning("GITHUB_WEBHOOK_SECRET is not configured")
        return False

    hash_object = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        msg=payload_body,
        digestmod=hashlib.sha256,
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    if not hmac.compare_digest(expected_signature, signature_header):
        logger.warning("Invalid GitHub webhook signature")
        return False
        
    return True


def normalize_github_event(event_type: str, delivery_id: str, payload: dict) -> NormalizedEvent | None:
    if event_type == "ping":
        return None # Handled directly by router
        
    timestamp = datetime.now(timezone.utc)
    service = "unknown"
    environment = "unknown"
    severity = Severity.INFO
    message = f"GitHub {event_type} event"
    
    if event_type == "push":
        repository = payload.get("repository", {}).get("full_name", "unknown")
        service = payload.get("repository", {}).get("name", "unknown")
        ref = payload.get("ref", "")
        head_commit = payload.get("head_commit") or {}
        commit_sha = head_commit.get("id", "")
        commit_msg = head_commit.get("message", "No commit message")
        sender = payload.get("sender", {}).get("login", "unknown")
        
        message = f"Code pushed to {ref} by {sender}"
        metadata = {
            "repository": repository,
            "branch": ref.replace("refs/heads/", ""),
            "commit_sha": commit_sha,
            "sender": sender,
            "commit_message": commit_msg
        }
        
        return NormalizedEvent(
            event_id=delivery_id,
            source="github",
            event_type="push",
            service=service,
            environment=environment,
            severity=severity,
            timestamp=timestamp,
            message=message,
            metadata=metadata
        )
        
    elif event_type == "deployment":
        repository = payload.get("repository", {}).get("full_name", "unknown")
        service = payload.get("repository", {}).get("name", "unknown")
        deployment = payload.get("deployment", {})
        deployment_id = str(deployment.get("id", ""))
        commit_sha = deployment.get("sha", "")
        ref = deployment.get("ref", "")
        environment = deployment.get("environment", "production")
        creator = payload.get("sender", {}).get("login", "unknown")
        
        message = f"Deployment created in {environment} by {creator}"
        metadata = {
            "repository": repository,
            "deployment_id": deployment_id,
            "commit_sha": commit_sha,
            "ref": ref
        }
        
        return NormalizedEvent(
            event_id=delivery_id,
            source="github",
            event_type="deployment",
            service=service,
            environment=environment,
            severity=severity,
            timestamp=timestamp,
            message=message,
            metadata=metadata
        )
        
    elif event_type == "deployment_status":
        repository = payload.get("repository", {}).get("full_name", "unknown")
        service = payload.get("repository", {}).get("name", "unknown")
        deployment = payload.get("deployment", {})
        status_info = payload.get("deployment_status", {})
        
        deployment_id = str(deployment.get("id", ""))
        state = status_info.get("state", "unknown")
        environment = status_info.get("environment") or deployment.get("environment", "production")
        commit_sha = deployment.get("sha", "")
        target_url = status_info.get("target_url", "")
        
        message = f"Deployment status updated to {state} in {environment}"
        if state in ["error", "failure"]:
            severity = Severity.HIGH
            
        metadata = {
            "repository": repository,
            "deployment_id": deployment_id,
            "commit_sha": commit_sha,
            "status": state,
            "target_url": target_url
        }
        
        return NormalizedEvent(
            event_id=delivery_id,
            source="github",
            event_type="deployment_status",
            service=service,
            environment=environment,
            severity=severity,
            timestamp=timestamp,
            message=message,
            metadata=metadata
        )
        
    return None
