from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import Severity
from app.schemas.schemas import AlertCreate, AlertResponse
from app.services.alert_service import ingest_alert

router = APIRouter()


def _severity_from_text(value: str | None) -> Severity:
    mapping = {
        "critical": Severity.CRITICAL,
        "error": Severity.HIGH,
        "warning": Severity.MEDIUM,
        "page": Severity.CRITICAL,
        "info": Severity.INFO,
        "firing": Severity.HIGH,
        "normal": Severity.INFO,
    }
    return mapping.get((value or "").lower(), Severity.HIGH)


@router.post("/alertmanager", response_model=list[AlertResponse])
async def ingest_alertmanager(payload: dict, db: AsyncSession = Depends(get_db)):
    created = []
    for item in payload.get("alerts", []):
        labels = item.get("labels", {})
        annotations = item.get("annotations", {})
        timestamp = item.get("startsAt") or datetime.now(timezone.utc).isoformat()
        alert = AlertCreate(
            source="alertmanager",
            service=labels.get("service") or labels.get("job") or "unknown",
            alert_type=labels.get("alertname") or "alert",
            severity=_severity_from_text(labels.get("severity") or item.get("status")),
            message=annotations.get("summary") or annotations.get("description") or "Alertmanager alert",
            timestamp=datetime.fromisoformat(timestamp.replace("Z", "+00:00")) if isinstance(timestamp, str) else datetime.now(timezone.utc),
            metadata={"labels": labels, "annotations": annotations, "generatorURL": item.get("generatorURL")},
        )
        created.append(await ingest_alert(db, alert))
    return created


@router.post("/github", response_model=AlertResponse | dict)
async def ingest_github(payload: dict, db: AsyncSession = Depends(get_db)):
    deployment = payload.get("deployment") or payload.get("deployment_status") or {}
    environment = deployment.get("environment") or payload.get("environment") or "production"
    service = (
        (payload.get("repository") or {}).get("name")
        or payload.get("service")
        or "unknown"
    )
    status = (payload.get("deployment_status") or {}).get("state") or payload.get("action") or "unknown"
    version = payload.get("sha") or (payload.get("deployment") or {}).get("sha") or "unknown"
    if status in {"success", "inactive"}:
        return {"status": "ignored", "reason": "non-incident deployment event"}
    alert = AlertCreate(
        source="github",
        service=service,
        alert_type="deployment_event",
        severity=Severity.HIGH if status in {"failure", "error"} else Severity.MEDIUM,
        message=f"GitHub deployment event '{status}' for {service} ({version}) in {environment}",
        timestamp=datetime.now(timezone.utc),
        metadata=payload,
    )
    return await ingest_alert(db, alert)


@router.post("/kubernetes", response_model=AlertResponse)
async def ingest_kubernetes(payload: dict, db: AsyncSession = Depends(get_db)):
    involved = payload.get("involvedObject") or {}
    service = involved.get("name") or payload.get("service") or "unknown"
    reason = payload.get("reason") or "KubernetesEvent"
    message = payload.get("message") or reason
    event_type = payload.get("type") or "Warning"
    alert = AlertCreate(
        source="kubernetes",
        service=service,
        alert_type=reason,
        severity=Severity.HIGH if event_type.lower() == "warning" else Severity.INFO,
        message=message,
        timestamp=datetime.now(timezone.utc),
        metadata=payload,
    )
    return await ingest_alert(db, alert)
