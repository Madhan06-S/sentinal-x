import pytest
from datetime import datetime, timezone
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.models import Severity

@pytest.fixture
def base_event():
    return {
        "event_id": f"test_{uuid.uuid4().hex[:8]}",
        "source": "test-system",
        "event_type": "error",
        "service": "payment-service",
        "environment": "production",
        "severity": Severity.HIGH,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "error_code": "ERR_500",
        "message": f"Internal server error {uuid.uuid4()}",
        "metadata": {"test": True}
    }

@pytest.mark.asyncio
async def test_canonical_ingestion(base_event):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.post("/api/v1/events/", json=base_event)
        
    assert response.status_code == 201
    data = response.json()
    assert data["event_id"] == base_event["event_id"]
    assert data["status"] in ["PROCESSING", "NEW"]

@pytest.mark.asyncio
async def test_noise_filtering(base_event):
    base_event["severity"] = Severity.INFO
    base_event["event_id"] = f"test_{uuid.uuid4().hex[:8]}"
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.post("/api/v1/events", json=base_event)
        
    assert response.status_code == 201
    assert response.json()["status"] == "FILTERED"

@pytest.mark.asyncio
async def test_deduplication(base_event):
    base_event["event_id"] = f"test_{uuid.uuid4().hex[:8]}"
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        # First request
        resp1 = await ac.post("/api/v1/events/", json=base_event)
        assert resp1.status_code == 201
        assert resp1.json()["status"] != "DUPLICATE"
        
        # Second request with same event ID (should skip exact duplicate)
        resp2 = await ac.post("/api/v1/events/", json=base_event)
        assert resp2.status_code == 201
        assert resp2.json()["status"] != "DUPLICATE" # exact duplicate doesn't re-save, just returns existing
        
        # Third request with new event ID but same content (semantic duplicate)
        base_event["event_id"] = f"test_{uuid.uuid4().hex[:8]}"
        resp3 = await ac.post("/api/v1/events/", json=base_event)
        assert resp3.status_code == 201
        assert resp3.json()["status"] == "DUPLICATE"

@pytest.mark.asyncio
async def test_correlation_weight(base_event):
    # Send first event (creates incident)
    base_event["event_id"] = f"test_{uuid.uuid4().hex[:8]}"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        resp1 = await ac.post("/api/v1/events/", json=base_event)
        assert resp1.status_code == 201
        inc_id = resp1.json().get("incident_id")
        assert inc_id is not None
        
        # Send second event on same service (should correlate)
        event2 = base_event.copy()
        event2["event_id"] = f"test_{uuid.uuid4().hex[:8]}"
        event2["event_type"] = "api_alert"
        event2["error_code"] = "ERR_501"
        event2["message"] = f"Another message {uuid.uuid4()}"
        
        resp2 = await ac.post("/api/v1/events/", json=event2)
        assert resp2.status_code == 201
        assert resp2.json()["status"] == "PROCESSING"
        assert resp2.json().get("incident_id") == inc_id
