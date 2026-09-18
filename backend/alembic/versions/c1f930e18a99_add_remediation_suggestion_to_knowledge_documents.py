"""Add remediation_suggestion to knowledge_documents

Revision ID: c1f930e18a99
Revises: a9b24fb1bb0a
Create Date: 2026-09-19 02:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'c1f930e18a99'
down_revision: Union[str, Sequence[str], None] = 'ce207ff6205d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('knowledge_documents', sa.Column('remediation_suggestion', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('knowledge_documents', 'remediation_suggestion')
