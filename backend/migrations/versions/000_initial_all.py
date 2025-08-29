"""initial all migration

Revision ID: initial_all_20250829
Revises: 
Create Date: 2025-08-29 18:42:00.000000

This migration creates any missing tables from SQLAlchemy metadata.
It's safe for development and idempotent: it will not drop schema.
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'initial_all_20250829'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    # Importing Base here ensures all models are registered
    from app.core.database import Base
    Base.metadata.create_all(bind=bind)


def downgrade():
    # No-op downgrade for development convenience
    pass
