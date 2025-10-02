"""add password reset table

Revision ID: 20250923_password_reset
Revises: 20250915_add_admin_ts
Create Date: 2025-09-23 19:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey


# revision identifiers, used by Alembic.
revision = '20250923_password_reset'
down_revision = '20250915_add_admin_ts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create password_resets table"""
    op.create_table(
        'password_resets',
        Column('id', Integer, primary_key=True, index=True),
        Column('user_id', Integer, ForeignKey('users.id'), nullable=False),
        Column('token', String, nullable=False),
        Column('expires_at', DateTime, nullable=False),
        Column('used', Boolean, default=False),
        Column('created_at', DateTime, nullable=False)
    )
    
    # Create index for faster token lookups
    op.create_index('idx_password_resets_token', 'password_resets', ['token'])
    op.create_index('idx_password_resets_user_id', 'password_resets', ['user_id'])


def downgrade() -> None:
    """Drop password_resets table"""
    op.drop_index('idx_password_resets_user_id', 'password_resets')
    op.drop_index('idx_password_resets_token', 'password_resets')
    op.drop_table('password_resets')
