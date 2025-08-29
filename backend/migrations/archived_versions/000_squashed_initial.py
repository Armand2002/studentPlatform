"""squashed initial migration

Revision ID: 000_squashed_initial
Revises:
Create Date: 2025-08-28 00:00:00.000000

This is a dev-only squash migration that drops the public schema and recreates the
entire database schema from SQLAlchemy metadata. Use only in development when data
loss is acceptable.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '000_squashed_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    # destructive: drop public schema and recreate it to ensure clean state
    bind.execute("DROP SCHEMA public CASCADE;")
    bind.execute("CREATE SCHEMA public;")

    # create all tables from SQLAlchemy metadata
    # Import here to ensure models are loaded and registered
    from app.core.database import Base
    Base.metadata.create_all(bind=bind)


def downgrade():
    bind = op.get_bind()
    bind.execute("DROP SCHEMA public CASCADE;")
    bind.execute("CREATE SCHEMA public;")
"""initial squash migration

Revision ID: squash_20250828
Revises: 
Create Date: 2025-08-28 00:00:00.000000

This is a dev-only squash migration that drops the public schema and recreates the
entire database schema from SQLAlchemy metadata. Use only in development when data
loss is acceptable.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'squash_20250828'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    # destructive: drop public schema and recreate it to ensure clean state
    bind.execute("DROP SCHEMA public CASCADE;")
    bind.execute("CREATE SCHEMA public;")

    # create all tables from SQLAlchemy metadata
    # Import here to ensure models are loaded and registered
    from app.core.database import Base
    Base.metadata.create_all(bind=bind)


def downgrade():
    bind = op.get_bind()
    bind.execute("DROP SCHEMA public CASCADE;")
    bind.execute("CREATE SCHEMA public;")
