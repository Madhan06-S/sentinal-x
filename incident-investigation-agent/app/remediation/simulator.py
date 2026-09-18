from app.schemas.incident import RemediationMetrics, RemediationResult


def simulate_remediation(incident_id: str, action: str) -> RemediationResult:
    """
    Deterministic Safe Remediation Simulator:
    Simulates operational state BEFORE vs AFTER executing remediation.
    Clearly labeled SIMULATED REMEDIATION for safety.
    """
    # Degraded BEFORE metrics
    before = RemediationMetrics(
        status="DEGRADED",
        memory_usage_pct=94.2,
        db_connections_used=100,
        latency_ms=4800.0,
        failure_rate_pct=31.5,
    )

    action_upper = action.upper().strip()

    if action_upper in {"ROLLBACK_DEPLOYMENT", "RESTART_SERVICE"}:
        # Recovery AFTER metrics
        after = RemediationMetrics(
            status="HEALTHY",
            memory_usage_pct=42.0,
            db_connections_used=42,
            latency_ms=180.0,
            failure_rate_pct=0.8,
        )
        verified = True
        final_status = "RESOLVED"
    elif action_upper == "CLEAR_CACHE":
        after = RemediationMetrics(
            status="DEGRADED",
            memory_usage_pct=88.0,
            db_connections_used=95,
            latency_ms=3200.0,
            failure_rate_pct=22.0,
        )
        verified = False
        final_status = "FAILED"
    else:
        after = before
        verified = False
        final_status = "FAILED"

    return RemediationResult(
        incident_id=incident_id,
        action=action,
        simulated=True,
        before_metrics=before,
        after_metrics=after,
        verified=verified,
        final_status=final_status,
    )
