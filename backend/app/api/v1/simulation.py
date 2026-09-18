from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, get_db
from app.models.models import Severity
from app.schemas.schemas import AlertCreate
from app.services.alert_service import ingest_alert
from app.services.jobs import schedule_analysis
import asyncio

router = APIRouter()


CASCADE = [
    {
        "delay": 0,
        "source": "GitHub Actions",
        "service": "payment-service",
        "alert_type": "deployment_anomaly",
        "severity": Severity.HIGH,
        "message": "Deployment v2.4.1 completed but memory usage immediately spiked.",
        "metadata": {"version": "v2.4.1", "event": "deployment"},
    },
    {
        "delay": 1,
        "source": "Prometheus",
        "service": "payment-service",
        "alert_type": "memory_spike",
        "severity": Severity.HIGH,
        "message": "Memory usage exceeded 90% after deployment.",
        "metadata": {"memory_pct": 93},
    },
    {
        "delay": 1,
        "source": "Prometheus",
        "service": "postgres-primary",
        "alert_type": "connection_exhaustion",
        "severity": Severity.CRITICAL,
        "message": "Database connections saturated (1500/1500).",
        "metadata": {"connections": 1500, "cpu_usage": 99.5},
    },
    {
        "delay": 1,
        "source": "Datadog",
        "service": "api-gateway",
        "alert_type": "api_timeout",
        "severity": Severity.HIGH,
        "message": "API Gateway p99 latency > 5000ms on /api/checkout.",
        "metadata": {"latency_ms": 5200, "endpoint": "/api/checkout"},
    },
    {
        "delay": 1,
        "source": "Datadog",
        "service": "payment-service",
        "alert_type": "payment_failure",
        "severity": Severity.CRITICAL,
        "message": "Payment failure rate exceeded 25%.",
        "metadata": {"failure_rate": 0.27, "business_function": "checkout"},
    },
]


async def _ingest(spec: dict, occurred_at: datetime) -> None:
    async with AsyncSessionLocal() as session:
        alert = AlertCreate(
            source=spec["source"],
            service=spec["service"],
            alert_type=spec["alert_type"],
            severity=spec["severity"],
            message=spec["message"],
            timestamp=occurred_at,
            metadata=spec["metadata"],
        )
        created = await ingest_alert(session, alert)
        return created


@router.post("/start")
async def start_simulation(db: AsyncSession = Depends(get_db)):
    created_ids = []
    incident_id = None
    occurred_at = datetime.now(timezone.utc) - timedelta(seconds=40)

    first = await ingest_alert(
        db,
        AlertCreate(
            source=CASCADE[0]["source"],
            service=CASCADE[0]["service"],
            alert_type=CASCADE[0]["alert_type"],
            severity=CASCADE[0]["severity"],
            message=CASCADE[0]["message"],
            timestamp=occurred_at,
            metadata=CASCADE[0]["metadata"],
        ),
    )
    created_ids.append(first.id)
    incident_id = first.incident_id

    async def run_remaining() -> None:
        current = occurred_at
        last_incident = incident_id
        for spec in CASCADE[1:]:
            await asyncio.sleep(spec["delay"])
            current = current + timedelta(seconds=max(spec["delay"], 1))
            alert = await _ingest(spec, current)
            last_incident = alert.incident_id or last_incident
        if last_incident:
            schedule_analysis(last_incident)

    asyncio.create_task(run_remaining())
    return {"status": "Simulation started", "seed_alert_id": first.id, "incident_id": incident_id}
