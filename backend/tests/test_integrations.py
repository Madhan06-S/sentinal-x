import pytest
import hmac
import hashlib
import json
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

settings.GITHUB_WEBHOOK_SECRET = "test-secret"

def generate_signature(payload: dict) -> str:
    body = json.dumps(payload).encode("utf-8")
    hash_object = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256,
    )
    return "sha256=" + hash_object.hexdigest()

@pytest.mark.asyncio
async def test_github_webhook_ping():
    payload = {"zen": "Non-blocking is better than blocking."}
    signature = generate_signature(payload)
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.post(
            "/api/v1/integrations/github/webhook",
            content=json.dumps(payload).encode("utf-8"),
            headers={
                "X-GitHub-Event": "ping",
                "X-GitHub-Delivery": "test-delivery-id",
                "X-Hub-Signature-256": signature
            }
        )
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "event": "ping"}

@pytest.mark.asyncio
async def test_github_webhook_missing_signature():
    payload = {"zen": "test"}
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.post(
            "/api/v1/integrations/github/webhook",
            json=payload,
            headers={
                "X-GitHub-Event": "ping",
                "X-GitHub-Delivery": "test-delivery-id"
            }
        )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"

@pytest.mark.asyncio
async def test_simulator_start():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.post("/api/v1/simulation/start")
        
    assert response.status_code == 200
    assert response.json()["status"] in ["Simulation started", "already_running"]

@pytest.mark.asyncio
async def test_simulator_status():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        response = await ac.get("/api/v1/simulation/status")
        
    assert response.status_code == 200
    assert "running" in response.json()
