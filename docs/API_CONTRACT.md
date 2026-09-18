# Aegis Incident Command - API Contract Specification

This document defines the REST API contract and WebSocket event specification between the **Aegis React Frontend**, **Backend REST API (SQLite3 compatible)**, and **AI Execution Layers (L1 & L2)**.

---

## Environment Configuration

- **Default Base API URL**: `http://localhost:8000/api/v1`
- **Default WebSocket URL**: `ws://localhost:8000/ws`
- **Database Engine**: SQLite3 (or PostgreSQL / MySQL)

---

## 1. Incidents API

### GET `/incidents`
Returns a list of all correlated operational incidents.

**Response `200 OK`**:
```json
[
  {
    "incident_id": "INC-1042",
    "title": "Payment Service Degraded & Database Connection Exhaustion",
    "status": "AWAITING_APPROVAL",
    "severity": "CRITICAL",
    "affected_services": ["payment-service", "postgresql-primary"],
    "business_impact_summary": "78% checkout drop rate",
    "confidence": 94,
    "root_cause": "Database Connection Exhaustion from memory leak in v2.4.1",
    "correlated_alert_ids": ["ALT-901", "ALT-902", "ALT-903", "ALT-904"],
    "recommended_action": "ROLLBACK_DEPLOYMENT",
    "risk_level": "MEDIUM",
    "approval_required": true,
    "created_at": "2026-09-18T12:41:31Z",
    "updated_at": "2026-09-18T12:42:03Z"
  }
]
```

### GET `/incidents/{id}`
Returns full detailed view of a specific incident including timeline, AI evidence, business impact details, AI decision, and remediation execution status.

**Response `200 OK`**:
```json
{
  "incident_id": "INC-1042",
  "title": "Payment Service Degraded & Database Connection Exhaustion",
  "status": "AWAITING_APPROVAL",
  "severity": "CRITICAL",
  "affected_services": ["payment-service", "postgresql-primary"],
  "confidence": 94,
  "root_cause": "Database connection exhaustion",
  "created_at": "2026-09-18T12:41:31Z",
  "updated_at": "2026-09-18T12:42:03Z",
  "timeline": [
    {
      "id": "t1",
      "timestamp": "12:41:03",
      "title": "Deployment started",
      "description": "payment-service v2.4.1 deployed to production",
      "type": "DEPLOYMENT"
    }
  ],
  "ai_investigation": {
    "probable_root_cause": "Database connection pool leakage in v2.4.1",
    "confidence": 94,
    "evidence": [
      {
        "id": "ev-1",
        "type": "metric",
        "description": "Database active connection count reached 98%",
        "verified": true
      }
    ],
    "hypothesis": "Recent deployment increased connection usage.",
    "validation_steps": ["Correlated deployment timestamps with sockets."],
    "conclusion": "Deployment v2.4.1 is initiating event.",
    "analyzed_at": "2026-09-18T12:41:41Z"
  },
  "business_impact_details": {
    "affected_services": ["Payment API", "Checkout Engine"],
    "affected_capabilities": ["Credit Card Processing"],
    "estimated_tx_failure_rate": "78.4%",
    "customer_impact": "CRITICAL",
    "estimated_financial_risk_usd": 42000
  },
  "ai_decision": {
    "recommended_action": "ROLLBACK_DEPLOYMENT",
    "target_service": "payment-service",
    "risk_level": "MEDIUM",
    "approval_required": true,
    "reason": "Rollback to stable v2.4.0 expected to restore pool connections."
  },
  "remediation": {
    "action": "ROLLBACK_DEPLOYMENT",
    "target_service": "payment-service",
    "status": "EXECUTING",
    "progress_percent": 50,
    "verification_steps": [
      { "name": "Kubernetes Pod Rollback to v2.4.0", "status": "PASSED" },
      { "name": "Database Connection Pool Flushing", "status": "IN_PROGRESS" }
    ]
  }
}
```

### GET `/incidents/{id}/graph`
Returns dynamic React Flow topology node and edge data for the Causal RCA Graph.

**Response `200 OK`**:
```json
{
  "nodes": [
    {
      "id": "node-deploy",
      "type": "customRCA",
      "position": { "x": 100, "y": 180 },
      "data": {
        "label": "Deployment v2.4.1",
        "subtext": "payment-service",
        "nodeType": "deployment",
        "status": "root_cause",
        "metrics": "commit: e9a4f21",
        "confidence": 94
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "node-deploy",
      "target": "node-memory",
      "label": "Triggered memory leak",
      "animated": true,
      "style": { "stroke": "#EF4444" }
    }
  ]
}
```

### POST `/incidents/{id}/approve`
Triggers human approval for the recommended remediation action.

**Response `200 OK`**: Updated Incident object with status `REMEDIATING`.

### POST `/incidents/{id}/reject`
Rejects the proposed remediation action.

**Request Body**:
```json
{
  "reason": "Manual engineer override"
}
```

---

## 2. Alerts API

### GET `/alerts`
Returns a list of all raw and correlated telemetry alerts.

---

## 3. Services API

### GET `/services`
Returns microservice registry health, CPU/Memory metrics, latency, and deployment info.

---

## 4. Deployments API

### GET `/deployments`
Returns deployment history and suspected deployment flags.

---

## 5. Audit Log API

### GET `/audit`
Returns immutable audit trail entries of AI decisions, human approvals, and remediation actions.

---

## 6. Demo Simulation Trigger

### POST `/simulation/start`
Triggers a live end-to-end incident resolution demo flow on the backend.

---

## 7. Real-Time WebSocket Events

WebSocket Connection: `ws://localhost:8000/ws`

Events dispatched by backend:
1. `NEW_ALERT` → `{ type: "NEW_ALERT", payload: Alert }`
2. `NEW_INCIDENT` → `{ type: "NEW_INCIDENT", payload: Incident }`
3. `INCIDENT_UPDATED` → `{ type: "INCIDENT_UPDATED", payload: Incident }`
4. `SERVICES_UPDATED` → `{ type: "SERVICES_UPDATED", payload: ServiceInfo[] }`
5. `AUDIT_LOG_ADDED` → `{ type: "AUDIT_LOG_ADDED", payload: AuditEntry }`
