"""add email_events table

Revision ID: 20250831_add_email_events
Revises: 
Create Date: 2025-08-31 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250831_add_email_events'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'email_events',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('kind', sa.String(length=128), nullable=False),
        sa.Column('recipient', sa.String(length=320), nullable=True),
        sa.Column('template_id', sa.String(length=128), nullable=True),
        sa.Column('status', sa.String(length=64), nullable=True),
        sa.Column('payload', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
    )


def downgrade():
    op.drop_table('email_events')
