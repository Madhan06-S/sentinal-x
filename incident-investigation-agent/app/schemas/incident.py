from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field

from app.schemas.event import EventSchema


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Hypothesis(BaseModel):
    cause: str
    explanation: str = ""
    supporting_evidence: list[str] = Field(default_factory=list)
    contradicting_evidence: list[str] = Field(default_factory=list)
    confidence: float = 0.0


class BusinessImpact(BaseModel):
    affected_service: str
    business_function: str
    impact_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    description: str


class IncidentSchema(BaseModel):
    incident_id: str
    title: str
    service: str
    severity: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "ERROR"
    priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "HIGH"
    status: Literal[
        "OPEN",
        "INVESTIGATING",
        "DECISION_PENDING",
        "AWAITING_APPROVAL",
        "REMEDIATING",
        "VERIFYING",
        "RESOLVED",
        "FAILED",
        "ESCALATED",
    ] = "OPEN"
    events: list[EventSchema] = Field(default_factory=list)
    created_at: str = Field(default_factory=_utcnow_iso)
    updated_at: str = Field(default_factory=_utcnow_iso)


class InvestigationResult(BaseModel):
    incident_id: str
    status: str = "completed"
    probable_root_cause: str
    confidence: float
    hypotheses: list[Hypothesis] = Field(default_factory=list)
    supporting_evidence: list[str] = Field(default_factory=list)
    contradicting_evidence: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    business_impact: BusinessImpact | None = None
    recommended_action: str = "NO_ACTION"
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "BLOCKED"] = "LOW"
    reasoning: str = ""


class DecisionRequest(BaseModel):
    recommended_action: str


class ApprovalDecision(BaseModel):
    incident_id: str
    action: str
    decision: Literal["APPROVED", "REJECTED"]
    reason: str = ""
    actor: str = "developer"
    timestamp: str = Field(default_factory=_utcnow_iso)


class RemediationMetrics(BaseModel):
    status: str
    memory_usage_pct: float
    db_connections_used: int
    latency_ms: float
    failure_rate_pct: float


class RemediationResult(BaseModel):
    incident_id: str
    action: str
    simulated: bool = True
    before_metrics: RemediationMetrics
    after_metrics: RemediationMetrics
    verified: bool
    final_status: str  # RESOLVED or FAILED -> ESCALATED


class AuditLogSchema(BaseModel):
    id: int | None = None
    incident_id: str
    action: str
    details: dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=_utcnow_iso)
