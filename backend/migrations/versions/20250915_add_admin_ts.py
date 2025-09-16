"""Add activated_at and completed_at to admin_package_assignments

Revision ID: 20250915_add_admin_ts
Revises: 
Create Date: 2025-09-15 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250915_add_admin_ts'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add columns if not exists (some DBs don't support IF NOT EXISTS in ALTER)
    conn = op.get_bind()
    dialect = conn.dialect.name
    if dialect == 'postgresql':
        op.execute("ALTER TABLE admin_package_assignments ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;")
        op.execute("ALTER TABLE admin_package_assignments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;")
    else:
        # Fallback - try simple ALTER and ignore errors
        try:
            op.add_column('admin_package_assignments', sa.Column('activated_at', sa.DateTime(), nullable=True))
        except Exception:
            pass
        try:
            op.add_column('admin_package_assignments', sa.Column('completed_at', sa.DateTime(), nullable=True))
        except Exception:
            pass


def downgrade():
    # Remove columns if they exist
    conn = op.get_bind()
    dialect = conn.dialect.name
    if dialect == 'postgresql':
        op.execute("ALTER TABLE admin_package_assignments DROP COLUMN IF EXISTS activated_at;")
        op.execute("ALTER TABLE admin_package_assignments DROP COLUMN IF EXISTS completed_at;")
    else:
        try:
            op.drop_column('admin_package_assignments', 'activated_at')
        except Exception:
            pass
        try:
            op.drop_column('admin_package_assignments', 'completed_at')
        except Exception:
            pass
