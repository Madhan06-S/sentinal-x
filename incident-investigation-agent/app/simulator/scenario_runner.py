from datetime import datetime, timezone
import uuid

from app.ingestion.normalizer import compute_fingerprint, normalize_simulator_event
from app.schemas.event import EventSchema


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def generate_scenario_1_events() -> list[EventSchema]:
    """
    DEMO SCENARIO 1: PAYMENT SERVICE DEGRADATION
    Timeline:
    10:00 Deployment event (commit 4a2b1c)
    10:02 Memory spike warning (MEM-503)
    10:04 DB connection pool exhaustion (DB-104)
    10:06 API latency spike (LAT-504)
    10:08 Payment checkout failures (PAY-500)
    """
    raw_events = [
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "github",
            "event_type": "deployment",
            "service": "payment-service",
            "severity": "INFO",
            "timestamp": _utcnow_iso(),
            "error_code": None,
            "message": "Deployment commit 4a2b1c to production: updated payment connection pool settings",
            "metadata": {
                "repository": "payment-service",
                "commit_sha": "4a2b1c7",
                "branch": "main",
                "author": "dev-team",
            },
        },
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "application",
            "event_type": "warning",
            "service": "payment-service",
            "severity": "WARNING",
            "timestamp": _utcnow_iso(),
            "error_code": "MEM-503",
            "message": "Memory usage warning: memory pool reached 94.2%",
            "metadata": {"memory_pct": 94.2},
        },
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "application",
            "event_type": "error",
            "service": "payment-service",
            "severity": "CRITICAL",
            "timestamp": _utcnow_iso(),
            "error_code": "DB-104",
            "message": "Database connection pool exhausted: 100/100 active connections in use",
            "metadata": {"active_connections": 100, "max_connections": 100},
        },
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "application",
            "event_type": "error",
            "service": "payment-service",
            "severity": "ERROR",
            "timestamp": _utcnow_iso(),
            "error_code": "LAT-504",
            "message": "API P99 response latency spike: 4800ms threshold breached",
            "metadata": {"latency_ms": 4800},
        },
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "application",
            "event_type": "error",
            "service": "payment-service",
            "severity": "CRITICAL",
            "timestamp": _utcnow_iso(),
            "error_code": "PAY-500",
            "message": "Payment processing checkout failed for user request #8841",
            "metadata": {"failure_rate_pct": 31.5},
        },
    ]

    return [normalize_simulator_event(e) for e in raw_events]


def generate_scenario_2_events() -> list[EventSchema]:
    """
    DEMO SCENARIO 2: INSUFFICIENT EVIDENCE SCENARIO
    Generates a single isolated error without preceding deployment or correlated signals.
    Exemplifies that the AI engine returns ROOT_CAUSE = UNKNOWN instead of hallucinating.
    """
    raw_events = [
        {
            "event_id": f"evt_sim_{uuid.uuid4().hex[:8]}",
            "source": "application",
            "event_type": "error",
            "service": "payment-service",
            "severity": "ERROR",
            "timestamp": _utcnow_iso(),
            "error_code": "UNK-999",
            "message": "Uncorrelated transient database socket timeout",
            "metadata": {"transient": True},
        }
    ]
    return [normalize_simulator_event(e) for e in raw_events]
