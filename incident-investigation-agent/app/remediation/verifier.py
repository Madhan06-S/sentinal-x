from app.schemas.incident import RemediationMetrics


def verify_recovery(metrics: RemediationMetrics) -> tuple[bool, str]:
    """
    Independent Verification Engine:
    Verifies that system operational metrics recovered back below safe thresholds:
    - memory < 70%
    - DB connections < 80%
    - latency < 500ms
    - failure rate < 5%
    Returns (passed: bool, reason: str).
    """
    failures = []
    if metrics.memory_usage_pct >= 70.0:
        failures.append(f"Memory high: {metrics.memory_usage_pct}% (threshold < 70%)")

    if metrics.db_connections_used >= 80:
        failures.append(f"DB connections high: {metrics.db_connections_used}/100 (threshold < 80)")

    if metrics.latency_ms >= 500.0:
        failures.append(f"Latency high: {metrics.latency_ms}ms (threshold < 500ms)")

    if metrics.failure_rate_pct >= 5.0:
        failures.append(f"Failure rate high: {metrics.failure_rate_pct}% (threshold < 5%)")

    if not failures:
        return True, "All operational metrics successfully returned within healthy thresholds."
    return False, f"Verification failed: {'; '.join(failures)}"
