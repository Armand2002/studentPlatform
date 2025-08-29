"""admin_package_system_001

Revision ID: admin_package_system_001
Revises: remove_hourly_rate_20250828
Create Date: 2025-08-28 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'admin_package_system_001'
down_revision = 'remove_hourly_rate_20250828'
branch_labels = None
depends_on = None


def upgrade():
    # create enums
    # create enums if they do not already exist (idempotent)
    op.execute("""
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
        CREATE TYPE paymentstatus AS ENUM ('pending', 'partial', 'completed', 'overdue', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentmethod') THEN
        CREATE TYPE paymentmethod AS ENUM ('bank_transfer', 'cash', 'check', 'card_offline', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'packageassignmentstatus') THEN
        CREATE TYPE packageassignmentstatus AS ENUM ('draft', 'assigned', 'active', 'suspended', 'completed', 'cancelled');
    END IF;
END$$;
""")

    # create admin_package_assignments table
    op.create_table(
        'admin_package_assignments',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('tutor_id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.Integer(), nullable=False),
        sa.Column('assigned_by_admin_id', sa.Integer(), nullable=False),
        sa.Column('custom_name', sa.String(length=200), nullable=True),
        sa.Column('custom_total_hours', sa.Integer(), nullable=True),
        sa.Column('custom_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('custom_expiry_date', sa.Date(), nullable=True),
        sa.Column('assignment_date', sa.DateTime(), nullable=True),
    sa.Column('status', postgresql.ENUM('draft', 'assigned', 'active', 'suspended', 'completed', 'cancelled', name='packageassignmentstatus', create_type=False), nullable=True),
        sa.Column('hours_used', sa.Integer(), nullable=True),
        sa.Column('hours_remaining', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('student_notes', sa.Text(), nullable=True),
        sa.Column('auto_activate_on_payment', sa.Boolean(), nullable=True, server_default=sa.sql.expression.true()),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['assigned_by_admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['tutor_id'], ['tutors.id'], ),
        sa.ForeignKeyConstraint(['package_id'], ['packages.id'], ),
    )

    op.create_index('ix_admin_assignments_student', 'admin_package_assignments', ['student_id'])
    op.create_index('ix_admin_assignments_tutor', 'admin_package_assignments', ['tutor_id'])
    op.create_index('ix_admin_assignments_status', 'admin_package_assignments', ['status'])
    op.create_index('ix_admin_assignments_date', 'admin_package_assignments', ['assignment_date'])

    # create admin_payments table
    op.create_table(
        'admin_payments',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('package_assignment_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('processed_by_admin_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
    sa.Column('payment_method', postgresql.ENUM('bank_transfer', 'cash', 'check', 'card_offline', 'other', name='paymentmethod', create_type=False), nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=False),
    sa.Column('status', postgresql.ENUM('pending', 'partial', 'completed', 'overdue', 'cancelled', name='paymentstatus', create_type=False), nullable=True),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('bank_details', sa.Text(), nullable=True),
        sa.Column('confirmed_by_admin_id', sa.Integer(), nullable=True),
        sa.Column('confirmation_date', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('receipt_sent', sa.Boolean(), nullable=True, server_default=sa.sql.expression.false()),
        sa.Column('receipt_sent_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['package_assignment_id'], ['admin_package_assignments.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['processed_by_admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['confirmed_by_admin_id'], ['users.id'], ),
    )

    op.create_index('ix_admin_payments_assignment', 'admin_payments', ['package_assignment_id'])
    op.create_index('ix_admin_payments_student', 'admin_payments', ['student_id'])
    op.create_index('ix_admin_payments_status', 'admin_payments', ['status'])
    op.create_index('ix_admin_payments_date', 'admin_payments', ['payment_date'])
    op.create_index('ix_admin_payments_method', 'admin_payments', ['payment_method'])

    # add admin_assignment_id to bookings
    op.add_column('bookings', sa.Column('admin_assignment_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_booking_admin_assignment', 'bookings', 'admin_package_assignments', ['admin_assignment_id'], ['id'])
    op.create_index('ix_bookings_admin_assignment', 'bookings', ['admin_assignment_id'])


def downgrade():
    op.drop_index('ix_bookings_admin_assignment', 'bookings')
    op.drop_constraint('fk_booking_admin_assignment', 'bookings', type_='foreignkey')
    op.drop_column('bookings', 'admin_assignment_id')

    op.drop_index('ix_admin_payments_method', 'admin_payments')
    op.drop_index('ix_admin_payments_date', 'admin_payments')
    op.drop_index('ix_admin_payments_status', 'admin_payments')
    op.drop_index('ix_admin_payments_student', 'admin_payments')
    op.drop_index('ix_admin_payments_assignment', 'admin_payments')
    op.drop_table('admin_payments')

    op.drop_index('ix_admin_assignments_date', 'admin_package_assignments')
    op.drop_index('ix_admin_assignments_status', 'admin_package_assignments')
    op.drop_index('ix_admin_assignments_tutor', 'admin_package_assignments')
    op.drop_index('ix_admin_assignments_student', 'admin_package_assignments')
    op.drop_table('admin_package_assignments')

    # drop enums
    op.execute('DROP TYPE IF EXISTS packageassignmentstatus')
    op.execute('DROP TYPE IF EXISTS paymentmethod')
    op.execute('DROP TYPE IF EXISTS paymentstatus')
