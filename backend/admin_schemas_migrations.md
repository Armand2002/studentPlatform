# ================================
# ADMIN PYDANTIC SCHEMAS
# ================================

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

# ================================
# ENUMS FOR API
# ================================

class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial" 
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

class PaymentMethodEnum(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CHECK = "check"
    CARD_OFFLINE = "card_offline"
    OTHER = "other"

class PackageAssignmentStatusEnum(str, Enum):
    DRAFT = "draft"
    ASSIGNED = "assigned"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# ================================
# PACKAGE ASSIGNMENT SCHEMAS
# ================================

class AdminPackageAssignmentBase(BaseModel):
    student_id: int = Field(..., gt=0, description="ID dello studente")
    tutor_id: int = Field(..., gt=0, description="ID del tutor") 
    package_id: int = Field(..., gt=0, description="ID pacchetto base")
    
    # Customization fields
    custom_name: Optional[str] = Field(None, max_length=200, description="Nome personalizzato pacchetto")
    custom_total_hours: Optional[int] = Field(None, ge=1, le=200, description="Ore totali personalizzate")
    custom_price: Optional[Decimal] = Field(None, ge=0, le=5000, description="Prezzo personalizzato €")
    custom_expiry_date: Optional[date] = Field(None, description="Data scadenza personalizzata")
    
    # Notes
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Note interne admin")
    student_notes: Optional[str] = Field(None, max_length=500, description="Note visibili allo studente")
    
    # Settings
    auto_activate_on_payment: bool = Field(default=True, description="Attiva automaticamente dopo pagamento")

class AdminPackageAssignmentCreate(AdminPackageAssignmentBase):
    """Schema per creazione assegnazione admin"""
    pass

class AdminPackageAssignmentUpdate(BaseModel):
    """Schema per aggiornamento assegnazione"""
    custom_name: Optional[str] = Field(None, max_length=200)
    custom_total_hours: Optional[int] = Field(None, ge=1, le=200)
    custom_price: Optional[Decimal] = Field(None, ge=0, le=5000)
    custom_expiry_date: Optional[date] = None
    admin_notes: Optional[str] = Field(None, max_length=1000)
    student_notes: Optional[str] = Field(None, max_length=500)
    auto_activate_on_payment: Optional[bool] = None

class AdminPackageAssignment(AdminPackageAssignmentBase):
    """Schema response assegnazione"""
    id: int
    assignment_date: datetime
    status: PackageAssignmentStatusEnum
    hours_used: int
    hours_remaining: int
    assigned_by_admin_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AdminPackageAssignmentWithDetails(AdminPackageAssignment):
    """Schema response con dettagli completi"""
    student_name: str = Field(..., description="Nome completo studente")
    tutor_name: str = Field(..., description="Nome completo tutor")
    package_name: str = Field(..., description="Nome del pacchetto")
    assigned_by_admin_name: str = Field(..., description="Nome admin che ha assegnato")
    total_paid: Decimal = Field(..., description="Totale pagato finora")
    total_due: Decimal = Field(..., description="Totale dovuto")
    payment_status: str = Field(..., description="Stato pagamento riassuntivo")

class AssignmentStatusUpdate(BaseModel):
    """Schema per aggiornamento stato assegnazione"""
    status: PackageAssignmentStatusEnum = Field(..., description="Nuovo stato")
    notes: Optional[str] = Field(None, max_length=500, description="Note per il cambio stato")

# ================================
# PAYMENT SCHEMAS
# ================================

class AdminPaymentBase(BaseModel):
    package_assignment_id: int = Field(..., gt=0, description="ID assegnazione pacchetto")
    student_id: int = Field(..., gt=0, description="ID studente")
    amount: Decimal = Field(..., gt=0, le=5000, description="Importo pagamento €")
    payment_method: PaymentMethodEnum = Field(..., description="Metodo di pagamento")
    payment_date: date = Field(..., description="Data pagamento")
    
    # Optional details
    reference_number: Optional[str] = Field(None, max_length=100, description="Numero riferimento")
    bank_details: Optional[str] = Field(None, max_length=500, description="Dettagli bancari")
    admin_notes: Optional[str] = Field(None, max_length=1000, description="Note admin")

class AdminPaymentCreate(AdminPaymentBase):
    """Schema per registrazione nuovo pagamento"""
    pass

class AdminPaymentUpdate(BaseModel):
    """Schema per aggiornamento pagamento"""
    amount: Optional[Decimal] = Field(None, gt=0, le=5000)
    payment_method: Optional[PaymentMethodEnum] = None
    payment_date: Optional[date] = None
    reference_number: Optional[str] = Field(None, max_length=100)
    bank_details: Optional[str] = Field(None, max_length=500)
    admin_notes: Optional[str] = Field(None, max_length=1000)
    status: Optional[PaymentStatusEnum] = None

class AdminPayment(AdminPaymentBase):
    """Schema response pagamento"""
    id: int
    status: PaymentStatusEnum
    processed_by_admin_id: int
    confirmed_by_admin_id: Optional[int]
    confirmation_date: Optional[datetime]
    receipt_sent: bool
    receipt_sent_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AdminPaymentWithDetails(AdminPayment):
    """Schema response pagamento con dettagli completi"""
    student_name: str = Field(..., description="Nome completo studente")
    package_name: str = Field(..., description="Nome pacchetto")
    processed_by_admin_name: str = Field(..., description="Nome admin che ha registrato")
    confirmed_by_admin_name: Optional[str] = Field(None, description="Nome admin che ha confermato")
    assignment_status: str = Field(..., description="Stato assegnazione correlata")

class PaymentConfirmation(BaseModel):
    """Schema per conferma pagamento"""
    notes: Optional[str] = Field(None, max_length=500, description="Note di conferma")

# ================================
# DASHBOARD & REPORT SCHEMAS
# ================================

class FinancialDashboard(BaseModel):
    """Schema dashboard finanziario admin"""
    # Today metrics
    today_payments_count: int
    today_payments_amount: Decimal
    today_new_assignments: int
    
    # This week metrics
    week_payments_count: int
    week_payments_amount: Decimal
    week_revenue: Decimal
    
    # This month metrics
    month_payments_count: int
    month_payments_amount: Decimal
    month_revenue: Decimal
    
    # Status breakdown
    pending_payments_count: int
    pending_payments_amount: Decimal
    overdue_payments_count: int
    overdue_payments_amount: Decimal
    
    # Package status breakdown
    active_packages_count: int
    draft_packages_count: int
    suspended_packages_count: int
    
    # Conversion metrics
    assignment_to_active_rate: float = Field(..., description="% conversione da assigned ad active")
    payment_completion_rate: float = Field(..., description="% pagamenti completati vs pending")
    
    # Top performers
    top_tutors_by_revenue: List[dict]
    top_subjects_by_revenue: List[dict]

class RevenueReportItem(BaseModel):
    """Schema item report revenue"""
    period: str = Field(..., description="Periodo (2024-01, 2024-W01, etc)")
    period_label: str = Field(..., description="Label periodo (Gen 2024, Settimana 1, etc)")
    total_revenue: Decimal
    payments_count: int
    active_packages: int
    avg_package_value: Decimal
    tutor_earnings: Decimal
    platform_fees: Decimal

class RevenueReport(BaseModel):
    """Schema report revenue completo"""
    date_from: date
    date_to: date
    group_by: str
    total_revenue: Decimal
    total_payments: int
    total_tutor_earnings: Decimal
    total_platform_fees: Decimal
    items: List[RevenueReportItem]

# ================================
# BULK OPERATIONS SCHEMAS
# ================================

class BulkPackageAssignmentCreate(BaseModel):
    """Schema per assegnazione bulk pacchetti"""
    assignments: List[AdminPackageAssignmentCreate] = Field(..., min_items=1, max_items=50)
    send_notifications: bool = Field(default=True, description="Invia email notifiche")

class BulkAssignmentResponse(BaseModel):
    """Schema response operazione bulk"""
    created_count: int
    failed_count: int
    created_ids: List[int]
    errors: List[str] = Field(default_factory=list)

class BulkPaymentCreate(BaseModel):
    """Schema per registrazione bulk pagamenti"""
    payments: List[AdminPaymentCreate] = Field(..., min_items=1, max_items=20)
    auto_confirm: bool = Field(default=False, description="Conferma automaticamente")
    send_receipts: bool = Field(default=True, description="Invia ricevute email")

class BulkPaymentResponse(BaseModel):
    """Schema response pagamenti bulk"""
    processed_count: int
    confirmed_count: int
    failed_count: int
    processed_ids: List[int]
    errors: List[str] = Field(default_factory=list)

# ================================
# ALEMBIC MIGRATION
# ================================

"""
Revision ID: admin_package_system_001
Revises: remove_hourly_rate_20250828
Create Date: 2025-08-28 16:00:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'admin_package_system_001'
down_revision = 'remove_hourly_rate_20250828'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Create admin package management system"""
    
    # ================================
    # CREATE ENUM TYPES
    # ================================
    
    payment_status_enum = postgresql.ENUM(
        'pending', 'partial', 'completed', 'overdue', 'cancelled', 
        name='paymentstatus'
    )
    payment_status_enum.create(op.get_bind())
    
    payment_method_enum = postgresql.ENUM(
        'bank_transfer', 'cash', 'check', 'card_offline', 'other',
        name='paymentmethod'
    )
    payment_method_enum.create(op.get_bind())
    
    assignment_status_enum = postgresql.ENUM(
        'draft', 'assigned', 'active', 'suspended', 'completed', 'cancelled',
        name='packageassignmentstatus'
    )
    assignment_status_enum.create(op.get_bind())
    
    # ================================
    # CREATE ADMIN_PACKAGE_ASSIGNMENTS TABLE
    # ================================
    
    op.create_table('admin_package_assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        
        # Foreign Keys
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('tutor_id', sa.Integer(), nullable=False),
        sa.Column('package_id', sa.Integer(), nullable=False),
        sa.Column('assigned_by_admin_id', sa.Integer(), nullable=False),
        
        # Custom package details
        sa.Column('custom_name', sa.String(length=200), nullable=True),
        sa.Column('custom_total_hours', sa.Integer(), nullable=True),
        sa.Column('custom_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('custom_expiry_date', sa.Date(), nullable=True),
        
        # Assignment details
        sa.Column('assignment_date', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('status', assignment_status_enum, nullable=False, default='draft'),
        
        # Hours tracking
        sa.Column('hours_used', sa.Integer(), nullable=False, default=0),
        sa.Column('hours_remaining', sa.Integer(), nullable=False),
        
        # Notes
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('student_notes', sa.Text(), nullable=True),
        
        # Settings
        sa.Column('auto_activate_on_payment', sa.Boolean(), nullable=False, default=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now(), onupdate=sa.func.now()),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['tutor_id'], ['tutors.id'], ),
        sa.ForeignKeyConstraint(['package_id'], ['packages.id'], ),
        sa.ForeignKeyConstraint(['assigned_by_admin_id'], ['users.id'], ),
    )
    
    # Indexes for performance
    op.create_index('ix_admin_assignments_student', 'admin_package_assignments', ['student_id'])
    op.create_index('ix_admin_assignments_tutor', 'admin_package_assignments', ['tutor_id'])
    op.create_index('ix_admin_assignments_status', 'admin_package_assignments', ['status'])
    op.create_index('ix_admin_assignments_date', 'admin_package_assignments', ['assignment_date'])
    
    # ================================
    # CREATE ADMIN_PAYMENTS TABLE
    # ================================
    
    op.create_table('admin_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        
        # Foreign Keys
        sa.Column('package_assignment_id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('processed_by_admin_id', sa.Integer(), nullable=False),
        sa.Column('confirmed_by_admin_id', sa.Integer(), nullable=True),
        
        # Payment details
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('payment_method', payment_method_enum, nullable=False),
        sa.Column('payment_date', sa.Date(), nullable=False),
        sa.Column('status', payment_status_enum, nullable=False, default='pending'),
        
        # Payment tracking
        sa.Column('reference_number', sa.String(length=100), nullable=True),
        sa.Column('bank_details', sa.Text(), nullable=True),
        
        # Admin processing
        sa.Column('confirmation_date', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        
        # Email tracking
        sa.Column('receipt_sent', sa.Boolean(), nullable=False, default=False),
        sa.Column('receipt_sent_at', sa.DateTime(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.func.now(), onupdate=sa.func.now()),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['package_assignment_id'], ['admin_package_assignments.id'], ),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.ForeignKeyConstraint(['processed_by_admin_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['confirmed_by_admin_id'], ['users.id'], ),
    )
    
    # Indexes for performance
    op.create_index('ix_admin_payments_assignment', 'admin_payments', ['package_assignment_id'])
    op.create_index('ix_admin_payments_student', 'admin_payments', ['student_id'])
    op.create_index('ix_admin_payments_status', 'admin_payments', ['status'])
    op.create_index('ix_admin_payments_date', 'admin_payments', ['payment_date'])
    op.create_index('ix_admin_payments_method', 'admin_payments', ['payment_method'])
    
    # ================================
    # ADD FOREIGN KEY TO BOOKINGS
    # ================================
    
    # Add reference from bookings to admin assignments
    op.add_column('bookings', sa.Column('admin_assignment_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_booking_admin_assignment',
        'bookings', 'admin_package_assignments',
        ['admin_assignment_id'], ['id']
    )
    op.create_index('ix_bookings_admin_assignment', 'bookings', ['admin_assignment_id'])

def downgrade() -> None:
    """Remove admin package management system"""
    
    # Remove booking foreign key
    op.drop_constraint('fk_booking_admin_assignment', 'bookings', type_='foreignkey')
    op.drop_index('ix_bookings_admin_assignment', 'bookings')
    op.drop_column('bookings', 'admin_assignment_id')
    
    # Drop tables in reverse order
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
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS packageassignmentstatus')
    op.execute('DROP TYPE IF EXISTS paymentmethod')
    op.execute('DROP TYPE IF EXISTS paymentstatus')

# ================================
# SENDGRID SETUP CONFIGURATION
# ================================

"""
SendGrid Setup Instructions:

1. Create SendGrid Account & Get API Key
   - Sign up at sendgrid.com
   - Go to Settings > API Keys
   - Create API Key with Mail Send permissions
   - Add to .env: SENDGRID_API_KEY=SG.xxx

2. Create Dynamic Templates
   
   Template 1: Package Assigned (d-template-id-1)
   Subject: 🎓 Nuovo pacchetto lezioni assegnato - {{package_name}}
   
   Template 2: Payment Receipt (d-template-id-2)  
   Subject: 🧾 Ricevuta pagamento - €{{amount}}
   
   Template 3: Package Activated (d-template-id-3)
   Subject: 🚀 Pacchetto attivato - Prenota le tue lezioni!

3. Update .env file:
   SENDGRID_API_KEY=SG.your-api-key-here
   SENDGRID_TEMPLATE_PACKAGE_ASSIGNED=d-your-template-id-1
   SENDGRID_TEMPLATE_PAYMENT_RECEIPT=d-your-template-id-2
   SENDGRID_TEMPLATE_PACKAGE_ACTIVATED=d-your-template-id-3
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://app.yourdomain.com

4. Install SendGrid:
   pip install sendgrid

5. Template Variables Available:
   
   Package Assigned:
   - student_name, tutor_name, package_name
   - total_hours, price, expiry_date, subject
   - student_notes, login_url
   
   Payment Receipt:
   - student_name, amount, payment_method, payment_date
   - reference_number, package_name, receipt_number
   - total_due, total_paid
   
   Package Activated:
   - student_name, tutor_name, package_name
   - hours_remaining, expiry_date, booking_url
   - tutor_email, next_steps
"""

# ================================
# INSTALLATION REQUIREMENTS
# ================================

"""
Add to requirements/base.txt:

sendgrid==6.10.0
"""