import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ingestion.normalizer import compute_fingerprint, normalize_log_event, normalize_github_event
from app.ingestion.filtering import filter_event
from app.ingestion.deduplication import deduplicate_events
from app.ingestion.priority import calculate_incident_priority
from app.schemas.event import EventSchema, LogIngestionPayload
from app.decision.policy_engine import evaluate_action_risk, requires_human_approval
from app.remediation.simulator import simulate_remediation
from app.remediation.verifier import verify_recovery


def test_event_normalization():
    payload = LogIngestionPayload(
        service="payment-service",
        level="ERROR",
        error_code="DB-104",
        message="Database connection pool exhausted",
    )
    event = normalize_log_event(payload)
    assert event.service == "payment-service"
    assert event.severity == "ERROR"
    assert event.error_code == "DB-104"
    assert event.source == "application"
    assert event.fingerprint is not None


def test_noise_filtering():
    debug_evt = EventSchema(
        event_id="evt_debug",
        source="application",
        event_type="info",
        service="payment-service",
        severity="DEBUG",
        message="heartbeat ping",
    )
    assert filter_event(debug_evt) == "IGNORE"

    critical_evt = EventSchema(
        event_id="evt_crit",
        source="application",
        event_type="error",
        service="payment-service",
        severity="CRITICAL",
        error_code="DB-104",
        message="Database connection pool exhausted",
    )
    assert filter_event(critical_evt) == "KEEP"


def test_event_deduplication():
    evt1 = EventSchema(
        event_id="evt_1",
        source="application",
        event_type="error",
        service="payment-service",
        severity="ERROR",
        error_code="DB-104",
        message="Database pool exhausted",
        fingerprint="fp123",
    )
    evt2 = EventSchema(
        event_id="evt_2",
        source="application",
        event_type="error",
        service="payment-service",
        severity="ERROR",
        error_code="DB-104",
        message="Database pool exhausted",
        fingerprint="fp123",
    )
    deduped = deduplicate_events([evt1, evt2])
    assert len(deduped) == 1
    assert deduped[0].metadata.get("duplicate_count") == 2


def test_policy_engine_risk():
    assert evaluate_action_risk("CLEAR_CACHE") == "LOW"
    assert evaluate_action_risk("RESTART_SERVICE") == "MEDIUM"
    assert evaluate_action_risk("ROLLBACK_DEPLOYMENT") == "HIGH"
    assert evaluate_action_risk("UNKNOWN_ACTION") == "BLOCKED"

    assert requires_human_approval("ROLLBACK_DEPLOYMENT") is True
    assert requires_human_approval("CLEAR_CACHE") is False


def test_simulated_remediation_and_verification():
    res = simulate_remediation("INC-001", "ROLLBACK_DEPLOYMENT")
    assert res.simulated is True
    assert res.before_metrics.status == "DEGRADED"
    assert res.after_metrics.status == "HEALTHY"

    passed, reason = verify_recovery(res.after_metrics)
    assert passed is True


def test_simulator_trigger_api():
    with TestClient(app) as client:
        response = client.post("/api/v1/simulator/trigger?scenario=1")
        assert response.status_code == 200
        data = response.json()
        assert "incidents" in data
        assert len(data["incidents"]) > 0

        inc_id = data["incidents"][0]["incident_id"]

        # Retrieve incident
        get_res = client.get(f"/api/v1/incidents/{inc_id}")
        assert get_res.status_code == 200

        # Run investigation
        inv_res = client.post(f"/api/v1/incidents/{inc_id}/investigate")
        assert inv_res.status_code == 200
        inv_data = inv_res.json()
        assert "probable_root_cause" in inv_data
        assert "recommended_action" in inv_data

        # Approve action
        app_res = client.post(f"/api/v1/incidents/{inc_id}/approve?action=ROLLBACK_DEPLOYMENT")
        assert app_res.status_code == 200

        # Remediate
        rem_res = client.post(f"/api/v1/incidents/{inc_id}/remediate?action=ROLLBACK_DEPLOYMENT")
        assert rem_res.status_code == 200
        rem_data = rem_res.json()
        assert rem_data["verified"] is True
        assert rem_data["final_status"] == "RESOLVED"

        # Get Timeline
        time_res = client.get(f"/api/v1/incidents/{inc_id}/timeline")
        assert time_res.status_code == 200
        assert len(time_res.json()) >= 4


def test_scenario_2_insufficient_evidence():
    with TestClient(app) as client:
        response = client.post("/api/v1/simulator/trigger?scenario=2")
        assert response.status_code == 200
        data = response.json()
        inc_id = data["incidents"][0]["incident_id"]

        inv_res = client.post(f"/api/v1/incidents/{inc_id}/investigate")
        assert inv_res.status_code == 200
        inv_data = inv_res.json()
        assert inv_data["probable_root_cause"] == "UNKNOWN"
        assert "INSUFFICIENT_EVIDENCE" in inv_data["reasoning"]
