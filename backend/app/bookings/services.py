"""
Bookings business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.bookings import models, schemas
from app.packages.services import PackagePurchaseService
from app.slots.models import Slot
from typing import List, Optional
from datetime import datetime, timedelta

class BookingService:
    """Service for booking management"""
    
    @staticmethod
    async def create_booking(db: Session, booking_data: schemas.BookingCreate) -> models.Booking:
        """Create a new booking"""
        # Validate that the student has enough hours in the package
        purchase = await PackagePurchaseService.get_purchase_by_id(db, booking_data.package_purchase_id)
        if not purchase:
            raise ValueError("Package purchase not found")
        
        if purchase.hours_remaining < booking_data.duration_hours:
            raise ValueError("Not enough hours remaining in package")
        
        # Check if the time slot is available
        if not await BookingService.is_slot_available(db, booking_data.tutor_id, booking_data.start_time, booking_data.end_time):
            raise ValueError("Time slot not available")
        
        # Create booking
        booking = models.Booking(
            student_id=booking_data.student_id,
            tutor_id=booking_data.tutor_id,
            package_purchase_id=booking_data.package_purchase_id,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            duration_hours=booking_data.duration_hours,
            subject=booking_data.subject,
            notes=booking_data.notes
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # Update package purchase hours
        await PackagePurchaseService.update_purchase_hours(db, booking_data.package_purchase_id, booking_data.duration_hours)
        
        return booking
    
    @staticmethod
    async def get_booking_by_id(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Get booking by ID"""
        return db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    @staticmethod
    async def get_student_bookings(db: Session, student_id: int, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get all bookings for a specific student"""
        return db.query(models.Booking).filter(
            models.Booking.student_id == student_id
        ).order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_tutor_bookings(db: Session, tutor_id: int, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get all bookings for a specific tutor"""
        return db.query(models.Booking).filter(
            models.Booking.tutor_id == tutor_id
        ).order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_upcoming_bookings(db: Session, user_id: int, user_role: str, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get upcoming bookings for a user (student or tutor)"""
        now = datetime.utcnow()
        query = db.query(models.Booking).filter(models.Booking.start_time >= now)
        
        if user_role == "student":
            query = query.filter(models.Booking.student_id == user_id)
        elif user_role == "tutor":
            query = query.filter(models.Booking.tutor_id == user_id)
        
        return query.order_by(models.Booking.start_time.asc()).offset(skip).limit(limit).all()

    @staticmethod
    async def get_upcoming_bookings_all(db: Session, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get upcoming bookings for all users (admin only)."""
        now = datetime.utcnow()
        return db.query(models.Booking).filter(
            models.Booking.start_time >= now
        ).order_by(models.Booking.start_time.asc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_completed_bookings(db: Session, user_id: int, user_role: str, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get completed bookings for a user"""
        now = datetime.utcnow()
        query = db.query(models.Booking).filter(
            and_(
                models.Booking.end_time < now,
                models.Booking.status == models.BookingStatus.COMPLETED
            )
        )
        
        if user_role == "student":
            query = query.filter(models.Booking.student_id == user_id)
        elif user_role == "tutor":
            query = query.filter(models.Booking.tutor_id == user_id)
        
        return query.order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()

    @staticmethod
    async def get_completed_bookings_all(db: Session, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get completed bookings for all users (admin only)."""
        now = datetime.utcnow()
        return db.query(models.Booking).filter(
            and_(
                models.Booking.end_time < now,
                models.Booking.status == models.BookingStatus.COMPLETED
            )
        ).order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()

    @staticmethod
    async def get_all_bookings(db: Session, skip: int = 0, limit: int = 100) -> List[models.Booking]:
        """Get all bookings (admin only)."""
        return db.query(models.Booking).order_by(models.Booking.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def update_booking_status(db: Session, booking_id: int, status: models.BookingStatus) -> Optional[models.Booking]:
        """Update booking status"""
        booking = await BookingService.get_booking_by_id(db, booking_id)
        if not booking:
            return None
        
        booking.status = status
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    async def cancel_booking(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Cancel a booking and refund hours"""
        booking = await BookingService.get_booking_by_id(db, booking_id)
        if not booking:
            return None
        
        if booking.status in [models.BookingStatus.COMPLETED, models.BookingStatus.CANCELLED]:
            raise ValueError("Cannot cancel completed or already cancelled booking")
        
        # Refund hours to package purchase
        purchase = await PackagePurchaseService.get_purchase_by_id(db, booking.package_purchase_id)
        if purchase:
            purchase.hours_used -= booking.duration_hours
            purchase.hours_remaining += booking.duration_hours
            purchase.updated_at = datetime.utcnow()
            if not purchase.is_active and purchase.hours_remaining > 0:
                purchase.is_active = True
        
        booking.status = models.BookingStatus.CANCELLED
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        return booking
    
    @staticmethod
    async def complete_booking(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Mark booking as completed"""
        return await BookingService.update_booking_status(db, booking_id, models.BookingStatus.COMPLETED)
    
    @staticmethod
    async def confirm_booking(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Confirm a booking"""
        return await BookingService.update_booking_status(db, booking_id, models.BookingStatus.CONFIRMED)
    
    @staticmethod
    async def is_slot_available(db: Session, tutor_id: int, start_time: datetime, end_time: datetime) -> bool:
        """Check if a time slot is available for booking"""
        # Check for overlapping bookings
        overlapping_booking = db.query(models.Booking).filter(
            and_(
                models.Booking.tutor_id == tutor_id,
                models.Booking.status.in_([models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED]),
                models.Booking.start_time < end_time,
                models.Booking.end_time > start_time
            )
        ).first()
        
        if overlapping_booking:
            return False
        
        # Check if the tutor has available slots
        date = start_time.date()
        start_time_only = start_time.time()
        end_time_only = end_time.time()
        
        available_slot = db.query(Slot).filter(
            and_(
                Slot.tutor_id == tutor_id,
                Slot.date == date,
                Slot.start_time <= start_time_only,
                Slot.end_time >= end_time_only,
                Slot.is_available == True
            )
        ).first()
        
        return available_slot is not None
    
    @staticmethod
    async def get_booking_with_details(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Get booking with student, tutor, and package details"""
        return db.query(models.Booking).filter(models.Booking.id == booking_id).first()
