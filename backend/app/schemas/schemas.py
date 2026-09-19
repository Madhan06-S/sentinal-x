from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.models import (
    AlertStatus,
    ApprovalDecision,
    DeploymentStatus,
    IncidentStatus,
    RemediationStatus,
    RiskLevel,
    Severity,
)


from pydantic import BaseModel, ConfigDict, Field, AliasChoices

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class AlertCreate(BaseModel):
    source: str
    service: str
    alert_type: str
    severity: Severity
    message: str
    timestamp: datetime
    meta: dict[str, Any] = Field(default_factory=dict, validation_alias=AliasChoices("meta", "metadata"), serialization_alias="metadata")

    model_config = ConfigDict(populate_by_name=True)


class AlertResponse(AlertCreate, ORMModel):
    id: str
    event_id: Optional[str] = None
    error_code: Optional[str] = None
    status: AlertStatus
    fingerprint: Optional[str] = None
    created_at: datetime
    incident_id: Optional[str] = None


class NormalizedEvent(BaseModel):
    event_id: str
    source: str
    event_type: str
    service: str
    environment: str
    severity: Severity
    timestamp: datetime
    error_code: Optional[str] = None
    message: str
    metadata: dict[str, Any] = Field(default_factory=dict)



class IncidentCreate(BaseModel):
    title: str
    severity: Severity


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[Severity] = None
    business_impact: Optional[str] = None
    confidence: Optional[float] = None
    root_cause: Optional[str] = None
    root_cause_evidence: Optional[Any] = None
    analysis_summary: Optional[str] = None
    dependency_graph: Optional[dict[str, Any]] = None
    recommended_action: Optional[str] = None
    action_parameters: Optional[dict[str, Any]] = None
    decision_reason: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    approval_required: Optional[bool] = None


class IncidentResponse(ORMModel):
    id: str
    title: str
    status: IncidentStatus
    severity: Severity
    business_impact: Optional[str] = None
    confidence: Optional[float] = None
    root_cause: Optional[str] = None
    root_cause_evidence: Optional[Any] = None
    analysis_summary: Optional[str] = None
    dependency_graph: Optional[dict[str, Any]] = None
    recommended_action: Optional[str] = None
    action_parameters: Optional[dict[str, Any]] = None
    decision_reason: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    approval_required: bool
    fingerprint: Optional[Any] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None


class GraphNode(BaseModel):
    id: str
    type: str = "service"
    label: str
    data: dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    data: dict[str, Any] = Field(default_factory=dict)


class IncidentGraphResponse(BaseModel):
    incident_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class AIAnalysisRecord(ORMModel):
    id: str
    incident_id: str
    layer: int
    correlated_alert_ids: Optional[list[str]] = None
    root_cause: Optional[str] = None
    confidence: Optional[float] = None
    evidence: Optional[Any] = None
    hypotheses: Optional[Any] = None
    dependency_graph: Optional[dict[str, Any]] = None
    analysis_summary: Optional[str] = None
    decision: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    approval_required: Optional[bool] = None
    reason: Optional[str] = None
    action_parameters: Optional[dict[str, Any]] = None
    business_impact: Optional[Any] = None
    created_at: datetime


class IncidentDetailResponse(IncidentResponse):
    alerts: list[AlertResponse] = Field(default_factory=list)
    analyses: list[AIAnalysisRecord] = Field(default_factory=list)


class AuditLogResponse(ORMModel):
    id: str
    incident_id: Optional[str] = None
    event_type: str
    details: Optional[dict[str, Any]] = None
    created_at: datetime


class Hypothesis(BaseModel):
    statement: str
    supported: bool
    confidence: float
    evidence: list[dict[str, Any]] = Field(default_factory=list)


class AIAnalysisRequest(BaseModel):
    incident_id: str
    title: str
    severity: Severity
    alerts: list[dict[str, Any]]
    services: list[dict[str, Any]] = Field(default_factory=list)
    deployments: list[dict[str, Any]] = Field(default_factory=list)
    dependency_graph: dict[str, Any] = Field(default_factory=dict)
    logs: list[dict[str, Any]] = Field(default_factory=list)
    metrics: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)


class AIAnalysisResponse(BaseModel):
    incident_id: str
    correlated_alert_ids: list[str]
    root_cause: str
    confidence: float
    evidence: list[dict[str, Any]]
    hypotheses: list[Hypothesis] = Field(default_factory=list)
    dependency_graph: dict[str, Any]
    analysis_summary: str
    fingerprint: Optional[dict[str, Any]] = None


class AIDecisionRequest(BaseModel):
    incident_id: str
    root_cause: str
    confidence: float
    severity: Severity
    business_context: dict[str, Any]
    available_actions: list[dict[str, Any]]
    analysis: dict[str, Any] = Field(default_factory=dict)


class AIDecisionResponse(BaseModel):
    incident_id: str
    decision: str
    risk_level: RiskLevel
    approval_required: bool
    reason: str
    action_parameters: dict[str, Any] = Field(default_factory=dict)
    business_impact: Optional[dict[str, Any]] = None
    verification_checks: list[str] = Field(default_factory=list)


class AIVerificationRequest(BaseModel):
    incident_id: str
    action: str
    action_parameters: dict[str, Any] = Field(default_factory=dict)
    recent_alerts: list[dict[str, Any]] = Field(default_factory=list)


class AIVerificationResponse(BaseModel):
    incident_id: str
    healthy: bool
    summary: str
    checks: list[dict[str, Any]] = Field(default_factory=list)


class ApprovalRequest(BaseModel):
    approved_by: str
    comment: Optional[str] = None
    decision: ApprovalDecision = ApprovalDecision.APPROVED


class RejectionRequest(BaseModel):
    rejected_by: str
    comment: Optional[str] = None


class ServiceResponse(ORMModel):
    id: str
    name: str
    display_name: str
    kind: str
    business_function: Optional[str] = None
    criticality: Severity
    meta: dict[str, Any] | None = Field(default=None, validation_alias=AliasChoices("meta", "metadata"), serialization_alias="metadata")
    created_at: datetime


class ServiceDetailResponse(ServiceResponse):
    depends_on: list[str] = Field(default_factory=list)
    depended_by: list[str] = Field(default_factory=list)


class DeploymentResponse(ORMModel):
    id: str
    service_id: str
    version: str
    environment: str
    status: DeploymentStatus
    source: Optional[str] = None
    deployed_at: datetime
    meta: dict[str, Any] | None = Field(default=None, validation_alias=AliasChoices("meta", "metadata"), serialization_alias="metadata")


class RemediationActionResponse(ORMModel):
    id: str
    incident_id: str
    action_type: str
    parameters: Optional[dict[str, Any]] = None
    risk_level: RiskLevel
    approval_required: bool
    status: RemediationStatus
    result: Optional[dict[str, Any]] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class KnowledgeDocumentCreate(BaseModel):
    title: str
    content: str
    document_type: str
    service: Optional[str] = None
    environment: Optional[str] = None
    error_code: Optional[str] = None
    tags: Optional[dict[str, Any]] = None


class KnowledgeDocumentResponse(KnowledgeDocumentCreate, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class AIInvestigationResult(BaseModel):
    probable_root_cause: str
    confidence: float
    hypotheses: list[Any] = Field(default_factory=list)
    evidence: list[str] = Field(default_factory=list)
    supporting_evidence: list[str] = Field(default_factory=list)
    contradicting_evidence: list[str] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)
    business_impact: str = "Unknown"
    recommended_action: str = "NO_ACTION"
    reasoning: Optional[str] = None



class AIDecisionResult(BaseModel):
    decision: str
    reason: str
    action_parameters: dict[str, Any] = {}


class BlastRadiusNode(BaseModel):
    service: str
    status: str
    impact: str


class BlastRadiusRings(BaseModel):
    ring1: list[BlastRadiusNode] = Field(default_factory=list)
    ring2: list[BlastRadiusNode] = Field(default_factory=list)
    ring3: list[BlastRadiusNode] = Field(default_factory=list)


class BlastRadiusResponse(BaseModel):
    root_cause: str
    rings: BlastRadiusRings

