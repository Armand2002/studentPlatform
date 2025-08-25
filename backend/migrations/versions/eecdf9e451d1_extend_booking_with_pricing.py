"""extend_booking_with_pricing

Revision ID: eecdf9e451d1
Revises: add_pricing_system_001
Create Date: 2025-08-25 02:21:20.390058

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eecdf9e451d1'
down_revision: Union[str, None] = 'add_pricing_system_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Extend booking table with pricing fields"""
    
    # Aggiungi campi pricing a booking
    op.add_column('bookings', sa.Column('calculated_duration', sa.Integer(), nullable=True))
    op.add_column('bookings', sa.Column('calculated_price', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('bookings', sa.Column('tutor_earnings', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('bookings', sa.Column('platform_fee', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('bookings', sa.Column('pricing_rule_applied', sa.String(length=100), nullable=True))
    op.add_column('bookings', sa.Column('pricing_calculation_id', sa.Integer(), nullable=True))
    
    # Foreign key a pricing_calculations
    op.create_foreign_key(
        'fk_booking_pricing_calculation',
        'bookings', 'pricing_calculations',
        ['pricing_calculation_id'], ['id']
    )
    
    # Index per performance
    op.create_index('ix_bookings_calculated_price', 'bookings', ['calculated_price'])
    op.create_index('ix_bookings_pricing_rule', 'bookings', ['pricing_rule_applied'])


def downgrade() -> None:
    """Remove pricing fields from booking"""
    
    op.drop_constraint('fk_booking_pricing_calculation', 'bookings', type_='foreignkey')
    op.drop_index('ix_bookings_calculated_price', 'bookings')
    op.drop_index('ix_bookings_pricing_rule', 'bookings')
    
    op.drop_column('bookings', 'pricing_calculation_id')
    op.drop_column('bookings', 'pricing_rule_applied')
    op.drop_column('bookings', 'platform_fee')
    op.drop_column('bookings', 'tutor_earnings')
    op.drop_column('bookings', 'calculated_price')
    op.drop_column('bookings', 'calculated_duration')
