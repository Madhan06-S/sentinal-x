"""initial investigation tables

Revision ID: 001_initial
Revises:
Create Date: 2026-09-18
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("incidents") and inspector.has_table("investigations"):
        return

    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("incident_id", sa.String(length=128), nullable=False),
        sa.Column("service", sa.String(length=255), nullable=True),
        sa.Column("namespace", sa.String(length=255), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_incidents_incident_id", "incidents", ["incident_id"], unique=True)
    op.create_index("ix_incidents_service", "incidents", ["service"])

    op.create_table(
        "investigations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("incident_id", sa.String(length=128), nullable=False),
        sa.Column("service", sa.String(length=255), nullable=True),
        sa.Column("investigation_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("investigation_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("root_cause", sa.JSON(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=True),
        sa.Column("candidate_causes", sa.JSON(), nullable=True),
        sa.Column("backtracking_path", sa.JSON(), nullable=True),
        sa.Column("uncertainties", sa.JSON(), nullable=True),
        sa.Column("sources", sa.JSON(), nullable=True),
        sa.Column("rca", sa.JSON(), nullable=True),
        sa.Column("errors", sa.JSON(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_investigations_incident_id", "investigations", ["incident_id"])
    op.create_index("ix_investigations_service", "investigations", ["service"])
    op.create_index("ix_investigations_status", "investigations", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if inspector.has_table("investigations"):
        op.drop_index("ix_investigations_status", table_name="investigations")
        op.drop_index("ix_investigations_service", table_name="investigations")
        op.drop_index("ix_investigations_incident_id", table_name="investigations")
        op.drop_table("investigations")
    if inspector.has_table("incidents"):
        op.drop_index("ix_incidents_service", table_name="incidents")
        op.drop_index("ix_incidents_incident_id", table_name="incidents")
        op.drop_table("incidents")
