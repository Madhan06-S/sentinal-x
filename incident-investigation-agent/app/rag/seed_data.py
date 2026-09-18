SEED_KNOWLEDGE_DOCUMENTS = [
    {
        "doc_type": "error_code",
        "error_code": "DB-104",
        "title": "DB-104 Database Connection Pool Exhausted",
        "service": "payment-service",
        "content": (
            "Error DB-104 occurs when application worker threads exceed the maximum allowed database connection pool size. "
            "Common causes include connection leaks in newly deployed code, sudden traffic spikes, or long-running unindexed SQL queries. "
            "Investigation steps: Inspect recent deployments for connection pool configuration changes or unclosed database handles, "
            "check database active connections, inspect API response latency. "
            "Remediation: Rollback recent deployment if code changes caused the leak, or restart the affected service to flush leaked connections."
        ),
        "remediation_suggestion": "ROLLBACK_DEPLOYMENT",
        "metadata_json": {"severity": "CRITICAL", "category": "database"},
    },
    {
        "doc_type": "error_code",
        "error_code": "MEM-503",
        "title": "MEM-503 Memory Limit Warning / Spike",
        "service": "payment-service",
        "content": (
            "Error MEM-503 indicates memory utilization has crossed 90% threshold. "
            "Typically caused by memory leaks in newly deployed code versions, heap exhaustion, or large buffer allocations. "
            "Investigation steps: Correlate timestamp with recent deployments or code pushes. "
            "Remediation: Rollback deployment or restart service instance."
        ),
        "remediation_suggestion": "ROLLBACK_DEPLOYMENT",
        "metadata_json": {"severity": "WARNING", "category": "resource"},
    },
    {
        "doc_type": "error_code",
        "error_code": "LAT-504",
        "title": "LAT-504 API Response Latency Spike",
        "service": "payment-service",
        "content": (
            "Error LAT-504 signifies API P99 latency exceeding 4000ms threshold. "
            "Downstream effect of database exhaustion, thread pool starvation, or memory throttling. "
            "Remediation: Clear cache or rollback recent deployment."
        ),
        "remediation_suggestion": "ROLLBACK_DEPLOYMENT",
        "metadata_json": {"severity": "ERROR", "category": "latency"},
    },
    {
        "doc_type": "guide",
        "error_code": None,
        "title": "Payment Service Troubleshooting Manual",
        "service": "payment-service",
        "content": (
            "Payment service handles user checkout transactions. "
            "When deployment is followed by memory increase -> DB connection pool exhaustion -> API latency -> payment failure, "
            "the root cause is almost certainly a regression or connection leak introduced in the recent deployment. "
            "Recommended action: Execute deployment rollback."
        ),
        "remediation_suggestion": "ROLLBACK_DEPLOYMENT",
        "metadata_json": {"category": "playbook"},
    },
    {
        "doc_type": "historical",
        "error_code": "DB-104",
        "title": "Historical Incident INC-882: Payment DB Exhaustion Post-Deploy",
        "service": "payment-service",
        "content": (
            "Historical Incident: Payment service experienced DB-104 errors 4 minutes after v2.4.1 deployment. "
            "Root Cause: Recent deployment v2.4.1 introduced unclosed DB transactions. "
            "Resolution: Rolled back deployment to v2.4.0. Verification passed in 60s."
        ),
        "remediation_suggestion": "ROLLBACK_DEPLOYMENT",
        "metadata_json": {"verified_resolution": "ROLLBACK_DEPLOYMENT", "resolution_status": "RESOLVED"},
    },
]
