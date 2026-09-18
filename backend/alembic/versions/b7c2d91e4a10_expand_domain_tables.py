"""Expand domain tables for catalog, AI, and remediation.

Revision ID: b7c2d91e4a10
Revises: ef9fce3b4be5
Create Date: 2026-09-18 18:50:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "b7c2d91e4a10"
down_revision: Union[str, Sequence[str], None] = "ef9fce3b4be5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("incidents") as batch:
        batch.add_column(sa.Column("analysis_summary", sa.Text(), nullable=True))
        batch.add_column(sa.Column("dependency_graph", sa.JSON(), nullable=True))
        batch.add_column(sa.Column("action_parameters", sa.JSON(), nullable=True))
        batch.add_column(sa.Column("decision_reason", sa.Text(), nullable=True))
        batch.add_column(sa.Column("fingerprint", sa.JSON(), nullable=True))

    with op.batch_alter_table("alerts") as batch:
        batch.add_column(sa.Column("fingerprint", sa.String(), nullable=True))
        batch.create_index("ix_alerts_fingerprint", ["fingerprint"])

    op.create_table(
        "services",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.Column("kind", sa.String(), nullable=False),
        sa.Column("business_function", sa.String(), nullable=True),
        sa.Column("criticality", sa.Enum("CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO", name="severity"), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_services_name", "services", ["name"], unique=True)

    op.create_table(
        "service_dependencies",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("source_service_id", sa.String(), nullable=False),
        sa.Column("target_service_id", sa.String(), nullable=False),
        sa.Column("dependency_type", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["source_service_id"], ["services.id"]),
        sa.ForeignKeyConstraint(["target_service_id"], ["services.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "deployments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("service_id", sa.String(), nullable=False),
        sa.Column("version", sa.String(), nullable=False),
        sa.Column("environment", sa.String(), nullable=False),
        sa.Column("status", sa.Enum("IN_PROGRESS", "SUCCEEDED", "FAILED", "ROLLED_BACK", name="deploymentstatus"), nullable=False),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("deployed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "ai_analyses",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("incident_id", sa.String(), nullable=False),
        sa.Column("layer", sa.Integer(), nullable=False),
        sa.Column("correlated_alert_ids", sa.JSON(), nullable=True),
        sa.Column("root_cause", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=True),
        sa.Column("hypotheses", sa.JSON(), nullable=True),
        sa.Column("dependency_graph", sa.JSON(), nullable=True),
        sa.Column("analysis_summary", sa.Text(), nullable=True),
        sa.Column("decision", sa.String(), nullable=True),
        sa.Column("risk_level", sa.Enum("HIGH", "MEDIUM", "LOW", name="risklevel"), nullable=True),
        sa.Column("approval_required", sa.Boolean(), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("action_parameters", sa.JSON(), nullable=True),
        sa.Column("business_impact", sa.JSON(), nullable=True),
        sa.Column("raw_response", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_analyses_incident_id", "ai_analyses", ["incident_id"])

    op.create_table(
        "remediation_actions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("incident_id", sa.String(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column("parameters", sa.JSON(), nullable=True),
        sa.Column("risk_level", sa.Enum("HIGH", "MEDIUM", "LOW", name="risklevel"), nullable=False),
        sa.Column("approval_required", sa.Boolean(), nullable=True),
        sa.Column("status", sa.Enum("PENDING", "APPROVED", "REJECTED", "RUNNING", "SUCCEEDED", "FAILED", "VERIFIED", name="remediationstatus"), nullable=False),
        sa.Column("result", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_remediation_actions_incident_id", "remediation_actions", ["incident_id"])

    op.create_table(
        "approvals",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("incident_id", sa.String(), nullable=False),
        sa.Column("action_id", sa.String(), nullable=True),
        sa.Column("decision", sa.Enum("APPROVED", "REJECTED", "PENDING", name="approvaldecision"), nullable=False),
        sa.Column("actor", sa.String(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"]),
        sa.ForeignKeyConstraint(["action_id"], ["remediation_actions.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_approvals_incident_id", "approvals", ["incident_id"])


def downgrade() -> None:
    op.drop_index("ix_approvals_incident_id", table_name="approvals")
    op.drop_table("approvals")
    op.drop_index("ix_remediation_actions_incident_id", table_name="remediation_actions")
    op.drop_table("remediation_actions")
    op.drop_index("ix_ai_analyses_incident_id", table_name="ai_analyses")
    op.drop_table("ai_analyses")
    op.drop_table("deployments")
    op.drop_table("service_dependencies")
    op.drop_index("ix_services_name", table_name="services")
    op.drop_table("services")
    with op.batch_alter_table("alerts") as batch:
        batch.drop_index("ix_alerts_fingerprint")
        batch.drop_column("fingerprint")
    with op.batch_alter_table("incidents") as batch:
        batch.drop_column("fingerprint")
        batch.drop_column("decision_reason")
        batch.drop_column("action_parameters")
        batch.drop_column("dependency_graph")
        batch.drop_column("analysis_summary")
