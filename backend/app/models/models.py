from datetime import datetime, timezone
import enum
import uuid
from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AlertStatus(str, enum.Enum):
    NEW = "NEW"
    FILTERED = "FILTERED"
    DUPLICATE = "DUPLICATE"
    PROCESSING = "PROCESSING"
    CORRELATED = "CORRELATED"
    IGNORED = "IGNORED"


class IncidentStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    REMEDIATING = "REMEDIATING"
    VERIFYING = "VERIFYING"
    RESOLVED = "RESOLVED"
    FAILED = "FAILED"


class Severity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class RiskLevel(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ApprovalDecision(str, enum.Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PENDING = "PENDING"


class RemediationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    RUNNING = "RUNNING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    VERIFIED = "VERIFIED"


class DeploymentStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    source = Column(String, index=True, nullable=False)
    service = Column(String, index=True, nullable=False)
    alert_type = Column(String, index=True, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    meta = Column("metadata", JSON, default=dict)
    status = Column(Enum(AlertStatus), default=AlertStatus.NEW, nullable=False)
    fingerprint = Column(String, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    incident = relationship("Incident", back_populates="alerts")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: f"INC-{uuid.uuid4().hex[:8].upper()}")
    title = Column(String, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN, nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    business_impact = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    root_cause = Column(Text, nullable=True)
    root_cause_evidence = Column(JSON, nullable=True)
    analysis_summary = Column(Text, nullable=True)
    dependency_graph = Column(JSON, nullable=True)
    recommended_action = Column(String, nullable=True)
    action_parameters = Column(JSON, nullable=True)
    decision_reason = Column(Text, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    approval_required = Column(Boolean, default=False)
    fingerprint = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    alerts = relationship("Alert", back_populates="incident")
    audit_logs = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan")
    analyses = relationship("AIAnalysis", back_populates="incident", cascade="all, delete-orphan")
    remediation_actions = relationship("RemediationAction", back_populates="incident", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="incident", cascade="all, delete-orphan")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    event_type = Column(String, index=True, nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    incident = relationship("Incident", back_populates="audit_logs")


class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    kind = Column(String, nullable=False)
    business_function = Column(String, nullable=True)
    criticality = Column(Enum(Severity), default=Severity.MEDIUM, nullable=False)
    meta = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    outgoing_dependencies = relationship(
        "ServiceDependency",
        foreign_keys="ServiceDependency.source_service_id",
        back_populates="source_service",
        cascade="all, delete-orphan",
    )
    incoming_dependencies = relationship(
        "ServiceDependency",
        foreign_keys="ServiceDependency.target_service_id",
        back_populates="target_service",
        cascade="all, delete-orphan",
    )
    deployments = relationship("Deployment", back_populates="service", cascade="all, delete-orphan")


class ServiceDependency(Base):
    __tablename__ = "service_dependencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    source_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    target_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    dependency_type = Column(String, default="runtime", nullable=False)

    source_service = relationship("Service", foreign_keys=[source_service_id], back_populates="outgoing_dependencies")
    target_service = relationship("Service", foreign_keys=[target_service_id], back_populates="incoming_dependencies")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=generate_uuid)
    service_id = Column(String, ForeignKey("services.id"), nullable=False)
    version = Column(String, nullable=False)
    environment = Column(String, default="production", nullable=False)
    status = Column(Enum(DeploymentStatus), default=DeploymentStatus.SUCCEEDED, nullable=False)
    source = Column(String, nullable=True)
    deployed_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    meta = Column("metadata", JSON, default=dict)

    service = relationship("Service", back_populates="deployments")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    layer = Column(Integer, nullable=False)
    correlated_alert_ids = Column(JSON, nullable=True)
    root_cause = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    evidence = Column(JSON, nullable=True)
    hypotheses = Column(JSON, nullable=True)
    dependency_graph = Column(JSON, nullable=True)
    analysis_summary = Column(Text, nullable=True)
    decision = Column(String, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    approval_required = Column(Boolean, nullable=True)
    reason = Column(Text, nullable=True)
    action_parameters = Column(JSON, nullable=True)
    business_impact = Column(JSON, nullable=True)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    incident = relationship("Incident", back_populates="analyses")


class RemediationAction(Base):
    __tablename__ = "remediation_actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False)
    parameters = Column(JSON, default=dict)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    approval_required = Column(Boolean, default=True)
    status = Column(Enum(RemediationStatus), default=RemediationStatus.PENDING, nullable=False)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    incident = relationship("Incident", back_populates="remediation_actions")
    approvals = relationship("Approval", back_populates="action")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    action_id = Column(String, ForeignKey("remediation_actions.id"), nullable=True)
    decision = Column(Enum(ApprovalDecision), default=ApprovalDecision.PENDING, nullable=False)
    actor = Column(String, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    incident = relationship("Incident", back_populates="approvals")
    action = relationship("RemediationAction", back_populates="approvals")
