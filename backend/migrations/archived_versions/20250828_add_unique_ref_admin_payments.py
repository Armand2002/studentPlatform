"""add unique index on admin_payments.reference_number

Revision ID: add_unique_ref_admin_payments
Revises: 
Create Date: 2025-08-28 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_unique_ref_admin_payments'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    dialect = conn.engine.dialect.name
    if dialect == 'postgresql':
        # create partial unique index where reference_number is not null
        op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_payments_reference_number ON admin_payments (reference_number) WHERE reference_number IS NOT NULL;")
    else:
        # SQLite does not support partial indexes in the same way; create a unique index but it will treat NULLs.
        try:
            op.create_index('ux_admin_payments_reference_number', 'admin_payments', ['reference_number'], unique=True)
        except Exception:
            # best-effort: ignore if cannot create
            pass


def downgrade():
    conn = op.get_bind()
    dialect = conn.engine.dialect.name
    if dialect == 'postgresql':
        op.execute("DROP INDEX IF EXISTS ux_admin_payments_reference_number;")
    else:
        try:
            op.drop_index('ux_admin_payments_reference_number', table_name='admin_payments')
        except Exception:
            pass
