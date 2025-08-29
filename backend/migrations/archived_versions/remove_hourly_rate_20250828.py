"""Remove hourly_rate from tutors table

Revision ID: remove_hourly_rate_20250828
Revises: remove_address_20250828
Create Date: 2025-08-28 15:45:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'remove_hourly_rate_20250828'
down_revision = 'remove_address_20250828'
branch_labels = None
depend_on = None


def upgrade():
    op.drop_column('tutors', 'hourly_rate')


def downgrade():
    op.add_column('tutors', sa.Column('hourly_rate', sa.Integer(), nullable=False, server_default='0'))
    # remove server_default after adding if desired
