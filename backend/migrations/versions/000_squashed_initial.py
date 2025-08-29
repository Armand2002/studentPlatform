"""squashed initial migration

Revision ID: 000_squashed_initial
Revises:
Create Date: 2025-08-28 21:30:00.000000

This single migration recreates the entire schema for development purposes.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '000_squashed_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # NOTE: This squashed migration is intended for development only. It drops any existing objects
    # that conflict and recreates the expected schema. Do NOT use in production.
    conn = op.get_bind()

    # Drop and recreate enums if present
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")
    op.execute("CREATE TYPE userrole AS ENUM ('STUDENT','TUTOR','ADMIN')")

    op.execute("DROP TYPE IF EXISTS bookingstatus CASCADE")
    op.execute("CREATE TYPE bookingstatus AS ENUM ('PENDING','CONFIRMED','COMPLETED','CANCELLED')")

    # Admin enums
    op.execute("DROP TYPE IF EXISTS paymentstatus CASCADE")
    op.execute("CREATE TYPE paymentstatus AS ENUM ('pending','partial','completed','overdue','cancelled')")
    op.execute("DROP TYPE IF EXISTS paymentmethod CASCADE")
    op.execute("CREATE TYPE paymentmethod AS ENUM ('bank_transfer','cash','check','card_offline','other')")
    op.execute("DROP TYPE IF EXISTS packageassignmentstatus CASCADE")
    op.execute("CREATE TYPE packageassignmentstatus AS ENUM ('draft','assigned','active','suspended','completed','cancelled')")

    # Create tables (simplified; includes the main tables required by tests)
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', postgresql.ENUM('STUDENT','TUTOR','ADMIN', name='userrole', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table('students',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('institute', sa.String(), nullable=False),
        sa.Column('class_level', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
    )

    op.create_table('tutors',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('subjects', sa.Text(), nullable=True),
    sa.Column('is_available', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table('packages',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tutor_id', sa.Integer(), sa.ForeignKey('tutors.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('total_hours', sa.Integer(), nullable=False),
        sa.Column('price', sa.Numeric(10,2), nullable=False),
        sa.Column('subject', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    # admin package assignment and payments
    op.create_table('admin_package_assignments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('students.id'), nullable=False),
        sa.Column('tutor_id', sa.Integer(), sa.ForeignKey('tutors.id'), nullable=False),
        sa.Column('package_id', sa.Integer(), sa.ForeignKey('packages.id'), nullable=False),
        sa.Column('assigned_by_admin_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
    sa.Column('custom_name', sa.String(length=200), nullable=True),
    sa.Column('custom_total_hours', sa.Integer(), nullable=True),
    sa.Column('custom_price', sa.Numeric(10,2), nullable=True),
    sa.Column('custom_expiry_date', sa.Date(), nullable=True),
    sa.Column('assignment_date', sa.DateTime(), nullable=True),
    sa.Column('status', postgresql.ENUM('draft','assigned','active','suspended','completed','cancelled', name='packageassignmentstatus', create_type=False), nullable=True),
        sa.Column('hours_used', sa.Integer(), nullable=True),
        sa.Column('hours_remaining', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('auto_activate_on_payment', sa.Boolean(), nullable=True, server_default=sa.sql.expression.true()),
    sa.Column('admin_notes', sa.Text(), nullable=True),
    sa.Column('student_notes', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table('admin_payments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('package_assignment_id', sa.Integer(), sa.ForeignKey('admin_package_assignments.id'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('students.id'), nullable=False),
        sa.Column('processed_by_admin_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('amount', sa.Numeric(10,2), nullable=False),
    sa.Column('payment_method', postgresql.ENUM('bank_transfer','cash','check','card_offline','other', name='paymentmethod', create_type=False), nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=False),
    sa.Column('status', postgresql.ENUM('pending','partial','completed','overdue','cancelled', name='paymentstatus', create_type=False), nullable=True),
        sa.Column('reference_number', sa.String(length=100), nullable=True),
    sa.Column('confirmation_date', sa.DateTime(), nullable=True),
    sa.Column('bank_details', sa.Text(), nullable=True),
    sa.Column('confirmed_by_admin_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
    sa.Column('admin_notes', sa.Text(), nullable=True),
    sa.Column('receipt_sent', sa.Boolean(), nullable=True, server_default=sa.sql.expression.false()),
    sa.Column('receipt_sent_at', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

def downgrade():
    op.drop_table('admin_payments')
    op.drop_table('admin_package_assignments')
    op.drop_table('packages')
    op.drop_table('tutors')
    op.drop_table('students')
    op.drop_table('users')
