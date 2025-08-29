# ================================
# ADMIN PACKAGE MANAGEMENT SYSTEM
# ================================

"""
Sistema completo per gestione admin-centrica di:
1. Creazione pacchetti personalizzati
2. Assegnazione pacchetti a studenti/tutors
3. Gestione pagamenti offline
4. Email notifications via SendGrid
"""

# ================================
# 1. MODELS ESTESI
# ================================

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Numeric, Date, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, date
import enum
from app.core.database import Base

class PaymentStatus(enum.Enum):
    PENDING = "pending"           # In attesa conferma admin
    PARTIAL = "partial"           # Pagamento parziale confermato
    COMPLETED = "completed"       # Pagamento completo
    OVERDUE = "overdue"          # Scaduto
    CANCELLED = "cancelled"       # Annullato

class PaymentMethod(enum.Enum):
    BANK_TRANSFER = "bank_transfer"    # Bonifico
    CASH = "cash"                      # Contanti
    CHECK = "check"                    # Assegno
    CARD_OFFLINE = "card_offline"      # POS offline
    OTHER = "other"                    # Altro

class PackageAssignmentStatus(enum.Enum):
    DRAFT = "draft"              # Bozza admin
    ASSIGNED = "assigned"        # Assegnato ma non pagato
    ACTIVE = "active"           # Attivo e pagato
    SUSPENDED = "suspended"      # Sospeso per mancato pagamento
    COMPLETED = "completed"      # Completato
    CANCELLED = "cancelled"      # Cancellato

# ================================
# EXTENDED MODELS
# ================================

class AdminPackageAssignment(Base):
    """
    Sistema centralizzato admin per assegnare pacchetti
    Sostituisce la creazione diretta da parte degli studenti
    """
    __tablename__ = "admin_package_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)  
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    assigned_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Custom package details (override package defaults)
    custom_name = Column(String(200), nullable=True)
    custom_total_hours = Column(Integer, nullable=True)
    custom_price = Column(Numeric(10, 2), nullable=True)
    custom_expiry_date = Column(Date, nullable=True)
    
    # Assignment details
    assignment_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(PackageAssignmentStatus), default=PackageAssignmentStatus.DRAFT)
    
    # Hours tracking
    hours_used = Column(Integer, default=0)
    hours_remaining = Column(Integer, nullable=False)
    
    # Admin notes
    admin_notes = Column(Text, nullable=True)
    student_notes = Column(Text, nullable=True)  # Visible to student
    
    # Auto-activation
    auto_activate_on_payment = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student")
    tutor = relationship("Tutor")
    package = relationship("Package")
    assigned_by = relationship("User", foreign_keys=[assigned_by_admin_id])
    payments = relationship("AdminPayment", back_populates="package_assignment")
    bookings = relationship("Booking", back_populates="package_assignment")

class AdminPayment(Base):
    """
    Sistema pagamenti offline gestito da admin
    """
    __tablename__ = "admin_payments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    package_assignment_id = Column(Integer, ForeignKey("admin_package_assignments.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    processed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_date = Column(Date, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Payment tracking
    reference_number = Column(String(100), nullable=True)  # Numero bonifico, ricevuta, etc
    bank_details = Column(Text, nullable=True)  # Dettagli bancari se bonifico
    
    # Admin processing
    confirmed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    confirmation_date = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    # Email tracking
    receipt_sent = Column(Boolean, default=False)
    receipt_sent_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    package_assignment = relationship("AdminPackageAssignment", back_populates="payments")
    student = relationship("Student")
    processed_by = relationship("User", foreign_keys=[processed_by_admin_id])
    confirmed_by = relationship("User", foreign_keys=[confirmed_by_admin_id])

# ================================
# 2. ADMIN ROUTES
# ================================

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User, UserRole

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ================================
# PACKAGE ASSIGNMENT ROUTES
# ================================

@router.post("/package-assignments", response_model=schemas.AdminPackageAssignment)
async def create_package_assignment(
    assignment_data: schemas.AdminPackageAssignmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    🎯 CREA ASSEGNAZIONE PACCHETTO - Admin crea e assegna pacchetto a studente/tutor
    
    Workflow:
    1. Admin seleziona studente, tutor, pacchetto base
    2. Può personalizzare ore, prezzo, scadenza  
    3. Sistema calcola ore rimanenti
    4. Invia email notifica a studente
    5. Crea record payment pending se prezzo > 0
    """
    try:
        assignment = await AdminPackageService.create_assignment(
            db, assignment_data, admin_user.id
        )
        
        # Send email notification in background
        background_tasks.add_task(
            EmailService.send_package_assigned_notification,
            assignment.student.user.email,
            assignment
        )
        
        return assignment
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/package-assignments", response_model=List[schemas.AdminPackageAssignmentWithDetails])
async def list_package_assignments(
    status: Optional[PackageAssignmentStatus] = None,
    student_id: Optional[int] = None,
    tutor_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    📋 LISTA ASSEGNAZIONI - Dashboard admin con filtri
    """
    return await AdminPackageService.list_assignments(
        db, status=status, student_id=student_id, tutor_id=tutor_id, skip=skip, limit=limit
    )

@router.put("/package-assignments/{assignment_id}/status")
async def update_assignment_status(
    assignment_id: int,
    status_data: schemas.AssignmentStatusUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    🔄 AGGIORNA STATO ASSEGNAZIONE
    
    Stati disponibili:
    - DRAFT -> ASSIGNED (invia email a studente)
    - ASSIGNED -> ACTIVE (attiva dopo pagamento)  
    - ACTIVE -> SUSPENDED (sospende per mancato pagamento)
    - * -> CANCELLED (cancella)
    """
    try:
        assignment = await AdminPackageService.update_assignment_status(
            db, assignment_id, status_data.status, admin_user.id, status_data.notes
        )
        
        # Send appropriate email based on status change
        if status_data.status == PackageAssignmentStatus.ASSIGNED:
            background_tasks.add_task(
                EmailService.send_package_ready_notification,
                assignment.student.user.email, assignment
            )
        elif status_data.status == PackageAssignmentStatus.ACTIVE:
            background_tasks.add_task(
                EmailService.send_package_activated_notification,
                assignment.student.user.email, assignment
            )
            
        return {"message": "Status updated successfully", "assignment": assignment}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ================================
# PAYMENT MANAGEMENT ROUTES  
# ================================

@router.post("/payments", response_model=schemas.AdminPayment)
async def record_payment(
    payment_data: schemas.AdminPaymentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    💰 REGISTRA PAGAMENTO OFFLINE
    
    Workflow:
    1. Admin registra pagamento ricevuto (bonifico, contanti, etc)
    2. Sistema aggiorna stato assignment se pagamento completa il totale
    3. Invia ricevuta via email a studente
    4. Se auto_activate_on_payment=True, attiva automaticamente il pacchetto
    """
    try:
        payment = await AdminPaymentService.record_payment(
            db, payment_data, admin_user.id
        )
        
        # Send receipt email in background
        background_tasks.add_task(
            EmailService.send_payment_receipt,
            payment.student.user.email,
            payment
        )
        
        return payment
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: int,
    confirmation_data: schemas.PaymentConfirmation,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    ✅ CONFERMA PAGAMENTO
    
    Admin conferma che il pagamento è stato ricevuto e verificato
    """
    try:
        payment = await AdminPaymentService.confirm_payment(
            db, payment_id, admin_user.id, confirmation_data.notes
        )
        
        # Check if package should be activated
        assignment = payment.package_assignment
        total_paid = sum(p.amount for p in assignment.payments if p.status == PaymentStatus.COMPLETED)
        total_due = assignment.custom_price or assignment.package.price
        
        if total_paid >= total_due and assignment.auto_activate_on_payment:
            await AdminPackageService.update_assignment_status(
                db, assignment.id, PackageAssignmentStatus.ACTIVE, admin_user.id, 
                "Auto-activated after payment confirmation"
            )
            
            # Send activation email
            background_tasks.add_task(
                EmailService.send_package_activated_notification,
                assignment.student.user.email, assignment
            )
        
        return {"message": "Payment confirmed", "payment": payment}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/payments", response_model=List[schemas.AdminPaymentWithDetails])
async def list_payments(
    status: Optional[PaymentStatus] = None,
    payment_method: Optional[PaymentMethod] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    💳 LISTA PAGAMENTI - Dashboard finanziario admin
    """
    return await AdminPaymentService.list_payments(
        db, status=status, payment_method=payment_method, 
        date_from=date_from, date_to=date_to, skip=skip, limit=limit
    )

# ================================
# DASHBOARD & REPORTS
# ================================

@router.get("/dashboard/financial")
async def get_financial_dashboard(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    📊 DASHBOARD FINANZIARIO ADMIN
    
    KPIs:
    - Pagamenti pending/completed oggi/settimana/mese
    - Revenue breakdown per tutor/materia
    - Pacchetti attivi vs scaduti
    - Rate conversion da assigned -> active
    """
    return await AdminDashboardService.get_financial_overview(db)

@router.get("/reports/revenue")
async def get_revenue_report(
    date_from: date,
    date_to: date,
    group_by: str = "month",  # day, week, month
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    """
    📈 REPORT REVENUE - Per Excel export
    """
    return await AdminReportService.get_revenue_report(
        db, date_from, date_to, group_by
    )

# ================================
# 3. EMAIL SERVICE (SENDGRID)
# ================================

import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from app.core.config import settings

class EmailService:
    """
    Sistema email professionale con SendGrid
    Template-based con personalizzazione
    """
    
    @staticmethod
    def _get_sendgrid_client():
        return sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
    
    @staticmethod
    async def send_package_assigned_notification(email: str, assignment: AdminPackageAssignment):
        """
        📧 EMAIL: Nuovo pacchetto assegnato
        """
        sg = EmailService._get_sendgrid_client()
        
        # Use dynamic template
        message = Mail(
            from_email=Email(settings.EMAIL_FROM, "Tutoring Platform"),
            to_emails=To(email)
        )
        
        message.template_id = settings.SENDGRID_TEMPLATE_PACKAGE_ASSIGNED
        message.dynamic_template_data = {
            'student_name': f"{assignment.student.first_name} {assignment.student.last_name}",
            'tutor_name': f"{assignment.tutor.first_name} {assignment.tutor.last_name}",
            'package_name': assignment.custom_name or assignment.package.name,
            'total_hours': assignment.custom_total_hours or assignment.package.total_hours,
            'price': float(assignment.custom_price or assignment.package.price),
            'expiry_date': (assignment.custom_expiry_date or assignment.assignment_date.date()).strftime('%d/%m/%Y'),
            'subject': assignment.package.subject,
            'student_notes': assignment.student_notes or "",
            'login_url': f"{settings.FRONTEND_URL}/login"
        }
        
        try:
            response = sg.send(message)
            print(f"✅ Package assigned email sent to {email}: {response.status_code}")
        except Exception as e:
            print(f"❌ Email failed: {e}")
    
    @staticmethod
    async def send_payment_receipt(email: str, payment: AdminPayment):
        """
        🧾 EMAIL: Ricevuta pagamento
        """
        sg = EmailService._get_sendgrid_client()
        
        message = Mail(
            from_email=Email(settings.EMAIL_FROM, "Tutoring Platform - Pagamenti"),
            to_emails=To(email)
        )
        
        message.template_id = settings.SENDGRID_TEMPLATE_PAYMENT_RECEIPT
        message.dynamic_template_data = {
            'student_name': f"{payment.student.first_name} {payment.student.last_name}",
            'amount': float(payment.amount),
            'payment_method': payment.payment_method.value.replace('_', ' ').title(),
            'payment_date': payment.payment_date.strftime('%d/%m/%Y'),
            'reference_number': payment.reference_number or "N/A",
            'package_name': payment.package_assignment.custom_name or payment.package_assignment.package.name,
            'receipt_number': f"RCP-{payment.id:06d}",
            'total_due': float(payment.package_assignment.custom_price or payment.package_assignment.package.price),
            'total_paid': float(sum(p.amount for p in payment.package_assignment.payments if p.status == PaymentStatus.COMPLETED))
        }
        
        try:
            response = sg.send(message)
            # Mark as sent
            payment.receipt_sent = True
            payment.receipt_sent_at = datetime.utcnow()
            print(f"✅ Payment receipt sent to {email}: {response.status_code}")
        except Exception as e:
            print(f"❌ Receipt email failed: {e}")
    
    @staticmethod  
    async def send_package_activated_notification(email: str, assignment: AdminPackageAssignment):
        """
        🚀 EMAIL: Pacchetto attivato e pronto all'uso
        """
        sg = EmailService._get_sendgrid_client()
        
        message = Mail(
            from_email=Email(settings.EMAIL_FROM, "Tutoring Platform"),
            to_emails=To(email)
        )
        
        message.template_id = settings.SENDGRID_TEMPLATE_PACKAGE_ACTIVATED
        message.dynamic_template_data = {
            'student_name': f"{assignment.student.first_name} {assignment.student.last_name}",
            'tutor_name': f"{assignment.tutor.first_name} {assignment.tutor.last_name}",
            'package_name': assignment.custom_name or assignment.package.name,
            'hours_remaining': assignment.hours_remaining,
            'expiry_date': (assignment.custom_expiry_date or assignment.assignment_date.date()).strftime('%d/%m/%Y'),
            'booking_url': f"{settings.FRONTEND_URL}/bookings/new",
            'tutor_email': assignment.tutor.user.email,
            'next_steps': "Ora puoi prenotare le tue lezioni direttamente sulla piattaforma!"
        }
        
        try:
            response = sg.send(message)
            print(f"✅ Package activated email sent to {email}: {response.status_code}")
        except Exception as e:
            print(f"❌ Activation email failed: {e}")

# ================================
# 4. BUSINESS LOGIC SERVICES
# ================================

class AdminPackageService:
    """
    Business logic per gestione admin pacchetti
    """
    
    @staticmethod
    async def create_assignment(db: Session, data: schemas.AdminPackageAssignmentCreate, admin_id: int):
        # Validate references exist
        student = db.query(Student).filter(Student.id == data.student_id).first()
        if not student:
            raise ValueError("Student not found")
            
        tutor = db.query(Tutor).filter(Tutor.id == data.tutor_id).first() 
        if not tutor:
            raise ValueError("Tutor not found")
            
        package = db.query(Package).filter(Package.id == data.package_id).first()
        if not package:
            raise ValueError("Package not found")
        
        # Calculate hours remaining
        total_hours = data.custom_total_hours or package.total_hours
        
        assignment = AdminPackageAssignment(
            student_id=data.student_id,
            tutor_id=data.tutor_id,
            package_id=data.package_id,
            assigned_by_admin_id=admin_id,
            custom_name=data.custom_name,
            custom_total_hours=data.custom_total_hours,
            custom_price=data.custom_price,
            custom_expiry_date=data.custom_expiry_date,
            hours_remaining=total_hours,
            admin_notes=data.admin_notes,
            student_notes=data.student_notes,
            auto_activate_on_payment=data.auto_activate_on_payment
        )
        
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        
        # Create pending payment if price > 0
        price = data.custom_price or package.price
        if price > 0:
            pending_payment = AdminPayment(
                package_assignment_id=assignment.id,
                student_id=data.student_id,
                processed_by_admin_id=admin_id,
                amount=price,
                payment_method=PaymentMethod.BANK_TRANSFER,  # Default
                payment_date=date.today(),
                status=PaymentStatus.PENDING,
                admin_notes="Auto-created pending payment"
            )
            db.add(pending_payment)
            db.commit()
        
        return assignment

class AdminPaymentService:
    """
    Business logic per gestione pagamenti offline
    """
    
    @staticmethod
    async def record_payment(db: Session, data: schemas.AdminPaymentCreate, admin_id: int):
        payment = AdminPayment(
            package_assignment_id=data.package_assignment_id,
            student_id=data.student_id, 
            processed_by_admin_id=admin_id,
            amount=data.amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date,
            reference_number=data.reference_number,
            bank_details=data.bank_details,
            admin_notes=data.admin_notes,
            status=PaymentStatus.COMPLETED  # Admin confirms immediately
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

# ================================
# 5. CONFIGURATION UPDATE
# ================================

# Add to app/core/config.py
class Settings(BaseSettings):
    # ... existing settings ...
    
    # SendGrid Configuration
    SENDGRID_API_KEY: str
    SENDGRID_TEMPLATE_PACKAGE_ASSIGNED: str = "d-your-template-id-1"
    SENDGRID_TEMPLATE_PAYMENT_RECEIPT: str = "d-your-template-id-2" 
    SENDGRID_TEMPLATE_PACKAGE_ACTIVATED: str = "d-your-template-id-3"
    
    # Email Settings
    EMAIL_FROM: str = "noreply@tutoringplatform.com"
    FRONTEND_URL: str = "https://app.tutoringplatform.com"