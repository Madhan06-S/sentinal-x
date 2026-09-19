import asyncio
import random
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from app.schemas.schemas import NormalizedEvent
from app.models.models import Severity
from app.services.event_service import process_event
from app.core.database import AsyncSessionLocal
from app.core.logging import logger
from app.core.realtime import publish

# Live enterprise service catalog metrics state
SERVICES_CATALOG = [
    "payment-service",
    "order-service",
    "auth-service",
    "postgres-primary",
    "redis",
    "checkout-queue",
    "notification-service",
    "user-db",
    "api-gateway",
]

# State store for live simulation & active chaos injections
simulator_state: Dict[str, Any] = {
    "running": False,
    "started_at": None,
    "active_chaos": {},  # { service: { failure_type, intensity } }
    "telemetry": {},
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
    }
]


async def run_scenario(scenario_name: str = "cascade"):
    inject_chaos("payment-db", "connection_exhaustion", 0.8)
    for step in CASCADE_SCENARIO:
        if step.get("delay", 0) > 0:
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
    return {"status": "completed", "scenario": scenario_name}


def get_simulator_status() -> Dict[str, Any]:
    return {
        "running": simulator_state["running"],
        "started_at": simulator_state["started_at"],
        "active_chaos": simulator_state["active_chaos"],
        "services_monitored": len(SERVICES_CATALOG),
    }


def inject_chaos(service: str, failure_type: str, intensity: float = 0.8) -> Dict[str, Any]:
    # Normalize service names if aliases used (e.g. payment-db -> postgres-primary, cache-redis -> redis)
    name_map = {
        "payment-db": "postgres-primary",
        "cache-redis": "redis",
        "payment-api": "payment-service",
        "order-api": "order-service",
        "notification-svc": "notification-service",
    }
    svc = name_map.get(service, service)
    simulator_state["active_chaos"][svc] = {
        "failure": failure_type,
        "intensity": min(1.0, max(0.1, intensity)),
        "injected_at": datetime.now(timezone.utc).isoformat(),
    }
    logger.info("[CHAOS] Injected %s on %s (intensity %.2f)", failure_type, svc, intensity)
    return {
        "status": "injected",
        "service": svc,
        "failure": failure_type,
        "intensity": intensity,
    }


def clear_chaos() -> Dict[str, Any]:
    cleared = list(simulator_state["active_chaos"].keys())
    simulator_state["active_chaos"] = {}
    logger.info("[CHAOS] Cleared all chaos injections (%s)", cleared)
    return {"status": "cleared", "services_cleared": cleared}


async def generate_telemetry_tick():
    """Generates 1 tick of realistic simulated enterprise telemetry."""
    now = datetime.now(timezone.utc)
    telemetry_payload = []

    for svc in SERVICES_CATALOG:
        chaos = simulator_state["active_chaos"].get(svc)

        # Baseline healthy metrics
        cpu = round(random.uniform(15.0, 35.0), 1)
        memory = round(random.uniform(30.0, 55.0), 1)
        latency = round(random.uniform(35.0, 95.0), 1)
        error_rate = round(random.uniform(0.01, 0.2), 2)
        open_connections = random.randint(15, 60)
        request_rate = random.randint(300, 850)
        status = "HEALTHY"

        # Apply chaos modifications if active
        if chaos:
            ftype = chaos.get("failure")
            intensity = chaos.get("intensity", 0.8)

            if ftype in ("connection_exhaustion", "db_pool_leak"):
                open_connections = int(1200 * intensity + random.randint(50, 300))
                latency = round(4500.0 * intensity + random.uniform(200, 800), 1)
                error_rate = round(65.0 * intensity + random.uniform(5.0, 15.0), 2)
                status = "CRITICAL"
            elif ftype in ("memory_leak", "heap_spike"):
                memory = round(88.0 + (10.0 * intensity), 1)
                cpu = round(75.0 + (15.0 * intensity), 1)
                status = "CRITICAL"
            elif ftype in ("cpu_spike", "cpu_burn"):
                cpu = round(92.0 + (6.0 * intensity), 1)
                latency = round(1500.0 * intensity + random.uniform(100, 400), 1)
                status = "DEGRADED" if cpu < 95 else "CRITICAL"
            elif ftype in ("crash", "service_down"):
                status = "CRITICAL"
                error_rate = 100.0
                open_connections = 0
                request_rate = 0

        # Dependency propagation: if postgres-primary or redis is CRITICAL, degrade payment-service & api-gateway
        if svc in ("payment-service", "api-gateway"):
            db_chaos = simulator_state["active_chaos"].get("postgres-primary")
            if db_chaos:
                latency = max(latency, 4800.0)
                error_rate = max(error_rate, 78.4)
                status = "CRITICAL"

        svc_metric = {
            "service": svc,
            "cpu_percent": cpu,
            "memory_percent": memory,
            "latency_ms": latency,
            "error_rate_percent": error_rate,
            "open_connections": open_connections,
            "request_rate_rps": request_rate,
            "status": status,
            "timestamp": now.isoformat(),
        }
        telemetry_payload.append(svc_metric)
        simulator_state["telemetry"][svc] = svc_metric

        # Trigger telemetry alerts if critical thresholds breached
        if status == "CRITICAL" and random.random() < 0.35:
            ftype = chaos.get("failure") if chaos else ""
            err_code = "DB-104" if "connections" in ftype else "LAT-504" if latency > 3000 else "MEM-503"
            msg = f"{svc}: {ftype if chaos else 'Performance breach'} detected (latency={latency}ms, mem={memory}%, connections={open_connections})"
            event = NormalizedEvent(
                event_id=f"sim_{uuid.uuid4().hex[:8]}",
                source="simulator",
                event_type="metric_alert",
                service=svc,
                environment="production",
                severity=Severity.CRITICAL if status == "CRITICAL" else Severity.HIGH,
                timestamp=now,
                error_code=err_code,
                message=msg,
                metadata={"metric": "telemetry_spike", "latency_ms": latency, "memory_percent": memory, "connections": open_connections},
            )
            async with AsyncSessionLocal() as session:
                await process_event(session, event)

    # Broadcast live telemetry over WebSocket
    await publish("telemetry", {"timestamp": now.isoformat(), "metrics": telemetry_payload})


async def simulator_loop():
    """Background loop that ticks every 2 seconds."""
    simulator_state["running"] = True
    simulator_state["started_at"] = datetime.now(timezone.utc).isoformat()
    logger.info("[SIMULATOR] Enterprise telemetry loop started (interval=2s)")

    try:
        while True:
            await generate_telemetry_tick()
            await asyncio.sleep(2.0)
    except asyncio.CancelledError:
        logger.info("[SIMULATOR] Telemetry loop received cancellation signal")
    except Exception as exc:
        logger.exception("[SIMULATOR] Error in background simulator loop: %s", exc)
    finally:
        simulator_state["running"] = False
        logger.info("[SIMULATOR] Enterprise telemetry loop stopped")
