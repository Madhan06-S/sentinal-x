import asyncio
from datetime import datetime, timezone
import uuid
from app.schemas.schemas import NormalizedEvent
from app.models.models import Severity
from app.services.event_service import process_event
from app.core.database import AsyncSessionLocal
from app.core.logging import logger

simulator_state = {
    "running": False,
    "scenario": None,
    "started_at": None,
    "events_generated": 0
}

CASCADE_SCENARIO = [
    {
        "delay": 0,
        "source": "simulator",
        "service": "payment-service",
        "event_type": "deployment",
        "severity": Severity.INFO,
        "message": "Deployment v2.4.1 completed",
        "metadata": {"version": "v2.4.1", "event": "deployment"}
    },
    {
        "delay": 1,
        "source": "simulator",
        "service": "payment-service",
        "event_type": "metric_alert",
        "severity": Severity.HIGH,
        "message": "Memory usage exceeded 90%",
        "metadata": {"metric": "memory_usage", "value": 94, "threshold": 90, "unit": "percent"}
    },
    {
        "delay": 1,
        "source": "simulator",
        "service": "payment-service",
        "event_type": "database_alert",
        "severity": Severity.CRITICAL,
        "message": "Database connection pool exhausted",
        "error_code": "DB-104",
        "metadata": {"metric": "db_connections", "value": 1500, "threshold": 1500}
    },
    {
        "delay": 1,
        "source": "simulator",
        "service": "payment-service",
        "event_type": "api_alert",
        "severity": Severity.CRITICAL,
        "message": "Payment API latency exceeded threshold",
        "error_code": "LAT-504",
        "metadata": {"metric": "latency_ms", "value": 5200, "threshold": 5000, "endpoint": "/api/checkout"}
    },
    {
        "delay": 1,
        "source": "simulator",
        "service": "payment-service",
        "event_type": "business_alert",
        "severity": Severity.CRITICAL,
        "message": "Payment failure rate exceeded threshold",
        "metadata": {"metric": "failure_rate", "value": 0.27, "threshold": 0.25, "business_function": "checkout"}
    }
]

INSUFFICIENT_EVIDENCE_SCENARIO = [
    {
        "delay": 0,
        "source": "simulator",
        "service": "notification-service",
        "event_type": "app_error",
        "severity": Severity.HIGH,
        "message": "Isolated transient socket reset error occurred",
        "metadata": {"error_type": "socket_reset", "scenario": "insufficient_evidence"}
    }
]


async def run_scenario(scenario_name: str):
    global simulator_state
    simulator_state["running"] = True
    simulator_state["scenario"] = scenario_name
    simulator_state["started_at"] = datetime.now(timezone.utc).isoformat()
    simulator_state["events_generated"] = 0

    logger.info(f"Simulator started scenario: {scenario_name}")

    if scenario_name in ("insufficient_evidence", "unknown", "scenario_2"):
        scenario_steps = INSUFFICIENT_EVIDENCE_SCENARIO
    else:
        scenario_steps = CASCADE_SCENARIO

    try:
        for step in scenario_steps:
            if step["delay"] > 0:
                await asyncio.sleep(step["delay"])
            
            event = NormalizedEvent(
                event_id=f"sim_{uuid.uuid4().hex[:8]}",
                source=step["source"],
                event_type=step["event_type"],
                service=step["service"],
                environment="production",
                severity=step["severity"],
                timestamp=datetime.now(timezone.utc),
                error_code=step.get("error_code"),
                message=step["message"],
                metadata=step.get("metadata", {})
            )
            
            async with AsyncSessionLocal() as session:
                await process_event(session, event)
                
            simulator_state["events_generated"] += 1
            logger.info(f"Simulator generated event: {event.event_type} - {event.message}")
            
    except Exception as e:
        logger.error(f"Simulator error: {e}")
    finally:
        simulator_state["running"] = False
        logger.info(f"Simulator finished scenario: {scenario_name}")


def get_simulator_status() -> dict:
    return simulator_state
