# backend/app/services/email_service.py
"""
Email Service con SendGrid per eventi booking
Sostituisce il sistema notifiche con email dirette
"""
import os
from typing import Dict, List, Optional
from datetime import datetime
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, DynamicTemplateData
from sqlalchemy.orm import Session

from app.bookings.models import Booking
from app.users.models import User, Student, Tutor
from app.packages.models import Package


class EmailService:
    """
    🎯 Email Service Semplificato
    
    Gestisce invio email via SendGrid per eventi principali:
    - Booking confermato/annullato/rimandato
    - Pacchetto assegnato
    - Promemoria scadenze
    """
    
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        if not self.api_key:
            print("⚠️ Warning: SENDGRID_API_KEY not configured")
            self.client = None
        else:
            self.client = SendGridAPIClient(api_key=self.api_key)
        
        # Template IDs (da configurare in SendGrid)
        self.templates = {
            'booking_confirmed': os.getenv('SENDGRID_TEMPLATE_BOOKING_CONFIRMED', 'd-booking-confirmed'),
            'booking_cancelled': os.getenv('SENDGRID_TEMPLATE_BOOKING_CANCELLED', 'd-booking-cancelled'), 
            'booking_rescheduled': os.getenv('SENDGRID_TEMPLATE_BOOKING_RESCHEDULED', 'd-booking-rescheduled'),
            'package_assigned': os.getenv('SENDGRID_TEMPLATE_PACKAGE_ASSIGNED', 'd-package-assigned'),
            'package_expiring': os.getenv('SENDGRID_TEMPLATE_PACKAGE_EXPIRING', 'd-package-expiring')
        }
        
        # Email mittente
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@tutoring-platform.com')
        self.from_name = os.getenv('SENDGRID_FROM_NAME', 'Tutoring Platform')

    async def send_booking_confirmed(self, booking: Booking, db: Session) -> bool:
        """📧 Email conferma booking - inviata a studente e tutor"""
        try:
            # Carica dati completi
            student = db.query(Student).filter(Student.id == booking.student_id).first()
            tutor = db.query(Tutor).filter(Tutor.id == booking.tutor_id).first()
            
            if not student or not tutor:
                return False
            
            # Dati dinamici per template
            template_data = {
                'student_name': f"{student.first_name} {student.last_name}",
                'tutor_name': f"{tutor.first_name} {tutor.last_name}",
                'subject': booking.subject,
                'date': booking.start_time.strftime('%d/%m/%Y'),
                'time': booking.start_time.strftime('%H:%M'),
                'duration': booking.duration_hours,
                'booking_id': booking.id,
                'platform_url': os.getenv('FRONTEND_URL', 'http://localhost:3000')
            }
            
            # Email a studente
            await self._send_email(
                to_email=student.user.email,
                to_name=f"{student.first_name} {student.last_name}",
                template_id=self.templates['booking_confirmed'],
                template_data=template_data,
                subject=f"✅ Lezione confermata - {booking.subject}"
            )
            
            # Email a tutor
            await self._send_email(
                to_email=tutor.user.email,
                to_name=f"{tutor.first_name} {tutor.last_name}",
                template_id=self.templates['booking_confirmed'],
                template_data=template_data,
                subject=f"✅ Lezione confermata - {booking.subject}"
            )
            
            print(f"✅ Booking confirmation emails sent for booking #{booking.id}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending booking confirmation: {e}")
            return False

    async def send_booking_cancelled(self, booking: Booking, db: Session, reason: str = "") -> bool:
        """📧 Email cancellazione booking"""
        try:
            student = db.query(Student).filter(Student.id == booking.student_id).first()
            tutor = db.query(Tutor).filter(Tutor.id == booking.tutor_id).first()
            
            template_data = {
                'student_name': f"{student.first_name} {student.last_name}",
                'tutor_name': f"{tutor.first_name} {tutor.last_name}",
                'subject': booking.subject,
                'date': booking.start_time.strftime('%d/%m/%Y'),
                'time': booking.start_time.strftime('%H:%M'),
                'reason': reason or "Cancellazione richiesta",
                'booking_id': booking.id,
                'platform_url': os.getenv('FRONTEND_URL', 'http://localhost:3000')
            }
            
            # Email a studente e tutor
            recipients = [
                (student.user.email, f"{student.first_name} {student.last_name}"),
                (tutor.user.email, f"{tutor.first_name} {tutor.last_name}")
            ]
            
            for email, name in recipients:
                await self._send_email(
                    to_email=email,
                    to_name=name,
                    template_id=self.templates['booking_cancelled'],
                    template_data=template_data,
                    subject=f"❌ Lezione cancellata - {booking.subject}"
                )
            
            print(f"✅ Booking cancellation emails sent for booking #{booking.id}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending booking cancellation: {e}")
            return False

    async def send_booking_rescheduled(self, booking: Booking, db: Session, 
                                     old_start_time: datetime, reason: str = "") -> bool:
        """📧 Email spostamento booking"""
        try:
            student = db.query(Student).filter(Student.id == booking.student_id).first()
            tutor = db.query(Tutor).filter(Tutor.id == booking.tutor_id).first()
            
            template_data = {
                'student_name': f"{student.first_name} {student.last_name}",
                'tutor_name': f"{tutor.first_name} {tutor.last_name}",
                'subject': booking.subject,
                'old_date': old_start_time.strftime('%d/%m/%Y'),
                'old_time': old_start_time.strftime('%H:%M'),
                'new_date': booking.start_time.strftime('%d/%m/%Y'),
                'new_time': booking.start_time.strftime('%H:%M'),
                'reason': reason or "Richiesta di modifica orario",
                'booking_id': booking.id,
                'platform_url': os.getenv('FRONTEND_URL', 'http://localhost:3000')
            }
            
            recipients = [
                (student.user.email, f"{student.first_name} {student.last_name}"),
                (tutor.user.email, f"{tutor.first_name} {tutor.last_name}")
            ]
            
            for email, name in recipients:
                await self._send_email(
                    to_email=email,
                    to_name=name,
                    template_id=self.templates['booking_rescheduled'],
                    template_data=template_data,
                    subject=f"📅 Lezione spostata - {booking.subject}"
                )
            
            print(f"✅ Booking rescheduled emails sent for booking #{booking.id}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending booking reschedule: {e}")
            return False

    async def send_package_assigned(self, assignment_id: int, db: Session) -> bool:
        """📧 Email assegnazione pacchetto da admin"""
        try:
            from app.admin.models import AdminPackageAssignment
            
            assignment = db.query(AdminPackageAssignment).filter(
                AdminPackageAssignment.id == assignment_id
            ).first()
            
            if not assignment:
                return False
            
            student = assignment.student
            tutor = assignment.tutor
            package = assignment.package
            
            template_data = {
                'student_name': f"{student.first_name} {student.last_name}",
                'tutor_name': f"{tutor.first_name} {tutor.last_name}",
                'package_name': assignment.custom_name or package.name,
                'total_hours': assignment.custom_total_hours or package.total_hours,
                'price': float(assignment.custom_price or package.price),
                'expiry_date': assignment.custom_expiry_date.strftime('%d/%m/%Y') if assignment.custom_expiry_date else "Da definire",
                'admin_notes': assignment.admin_notes or "",
                'platform_url': os.getenv('FRONTEND_URL', 'http://localhost:3000')
            }
            
            # Email a studente
            await self._send_email(
                to_email=student.user.email,
                to_name=f"{student.first_name} {student.last_name}",
                template_id=self.templates['package_assigned'],
                template_data=template_data,
                subject=f"🎁 Nuovo pacchetto assegnato - {package.name}"
            )
            
            # Email a tutor (informativa)
            await self._send_email(
                to_email=tutor.user.email,
                to_name=f"{tutor.first_name} {tutor.last_name}",
                template_id=self.templates['package_assigned'],
                template_data=template_data,
                subject=f"👨‍🏫 Nuovo studente assegnato - {package.name}"
            )
            
            print(f"✅ Package assignment emails sent for assignment #{assignment_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending package assignment: {e}")
            return False

    async def _send_email(self, to_email: str, to_name: str, template_id: str, 
                         template_data: Dict, subject: str) -> bool:
        """🔧 Helper method per invio email singola"""
        if not self.client:
            print(f"⚠️ SendGrid not configured, would send: {subject} to {to_email}")
            return False
            
        try:
            message = Mail()
            message.from_email = (self.from_email, self.from_name)
            message.to = [(to_email, to_name)]
            message.subject = subject
            message.template_id = template_id
            message.dynamic_template_data = template_data
            
            response = self.client.send(message)
            
            if response.status_code == 202:
                print(f"✅ Email sent successfully to {to_email}")
                return True
            else:
                print(f"❌ SendGrid error {response.status_code}: {response.body}")
                return False
                
        except Exception as e:
            print(f"❌ SendGrid send error: {e}")
            return False


# Instance globale del servizio
email_service = EmailService()


# ================================
# TRIGGER FUNCTIONS
# ================================

async def trigger_booking_confirmed(booking_id: int, db: Session):
    """🎯 Trigger per conferma booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        await email_service.send_booking_confirmed(booking, db)

async def trigger_booking_cancelled(booking_id: int, db: Session, reason: str = ""):
    """🎯 Trigger per cancellazione booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        await email_service.send_booking_cancelled(booking, db, reason)

async def trigger_booking_rescheduled(booking_id: int, db: Session, 
                                    old_start_time: datetime, reason: str = ""):
    """🎯 Trigger per spostamento booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking:
        await email_service.send_booking_rescheduled(booking, db, old_start_time, reason)

async def trigger_package_assigned(assignment_id: int, db: Session):
    """🎯 Trigger per assegnazione pacchetto"""
    await email_service.send_package_assigned(assignment_id, db)