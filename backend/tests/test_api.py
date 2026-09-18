from datetime import datetime, timezone
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.core.seed import seed_catalog
from app.main import app
from app.models.models import IncidentStatus
from app.services import jobs


@pytest.fixture
async def client():
    jobs.ENABLED = False
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with session_factory() as session:
        await seed_catalog(session)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", follow_redirects=True) as ac:
        yield ac
    app.dependency_overrides.clear()
    jobs.ENABLED = True
    await engine.dispose()


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["environment"] == "development"
    assert body["status"] in {"ok", "degraded"}


@pytest.mark.asyncio
async def test_catalog_seeded(client):
    services = await client.get("/api/v1/services")
    assert services.status_code == 200
    names = {item["name"] for item in services.json()}
    assert {"api-gateway", "payment-service", "postgres-primary"} <= names

    deployments = await client.get("/api/v1/deployments")
    assert deployments.status_code == 200
    assert len(deployments.json()) >= 1


@pytest.mark.asyncio
async def test_alert_ingestion_creates_incident(client):
    payload = {
        "source": "prometheus",
        "service": "payment-service",
        "alert_type": "payment_failure",
        "severity": "CRITICAL",
        "message": "Payment failure rate exceeded 25%.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": {"failure_rate": 0.27},
    }
    created = await client.post("/api/v1/alerts", json=payload)
    assert created.status_code == 201
    body = created.json()
    assert body["incident_id"]

    incident = await client.get(f"/api/v1/incidents/{body['incident_id']}")
    assert incident.status_code == 200
    assert incident.json()["status"] in {
        IncidentStatus.OPEN.value,
        IncidentStatus.INVESTIGATING.value,
        IncidentStatus.AWAITING_APPROVAL.value,
        IncidentStatus.REMEDIATING.value,
    }


@pytest.mark.asyncio
async def test_info_alerts_are_filtered(client):
    payload = {
        "source": "prometheus",
        "service": "redis",
        "alert_type": "heartbeat",
        "severity": "INFO",
        "message": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    created = await client.post("/api/v1/alerts", json=payload)
    assert created.status_code == 201
    assert created.json()["status"] == "FILTERED"
    assert created.json()["incident_id"] is None
