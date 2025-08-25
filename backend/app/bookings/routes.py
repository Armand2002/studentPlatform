"""
Bookings routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.models import UserRole
from app.bookings import models, schemas, services
from app.users import services as user_services

router = APIRouter()

# Booking routes
@router.post("/", response_model=schemas.Booking, tags=["Bookings"])
async def create_booking(
    booking_data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new booking (Student only)"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Student access required")
    
    # Verify the student is booking for themselves
    student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
    if not student or student.id != booking_data.student_id:
        raise HTTPException(status_code=403, detail="Can only book for your own account")
    
    try:
        return await services.BookingService.create_booking(db, booking_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.Booking], tags=["Bookings"])
async def get_bookings(
    skip: int = 0,
    limit: int = 100,
    student_id: int = None,
    tutor_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bookings with filters"""
    if student_id:
        # Admin or the student themselves can view specific student bookings
        if current_user.role == UserRole.STUDENT:
            student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
            if not student or student.id != student_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return await services.BookingService.get_student_bookings(db, student_id, skip, limit)
    elif tutor_id:
        # Admin or the tutor themselves can view specific tutor bookings
        if current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor or tutor.id != tutor_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return await services.BookingService.get_tutor_bookings(db, tutor_id, skip, limit)
    else:
        # Users can only see their own bookings
        if current_user.role == UserRole.STUDENT:
            student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
            if not student:
                raise HTTPException(status_code=404, detail="Student profile not found")
            return await services.BookingService.get_student_bookings(db, student.id, skip, limit)
        elif current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor:
                raise HTTPException(status_code=404, detail="Tutor profile not found")
            return await services.BookingService.get_tutor_bookings(db, tutor.id, skip, limit)
        else:
            raise HTTPException(status_code=403, detail="Access denied")

@router.get("/upcoming", response_model=List[schemas.Booking], tags=["Bookings"])
async def get_upcoming_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming bookings for current user; admins see all upcoming."""
    if current_user.role == UserRole.ADMIN:
        return await services.BookingService.get_upcoming_bookings_all(db, skip, limit)
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return await services.BookingService.get_upcoming_bookings(db, student.id, "student", skip, limit)
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor:
            raise HTTPException(status_code=404, detail="Tutor profile not found")
        return await services.BookingService.get_upcoming_bookings(db, tutor.id, "tutor", skip, limit)
    raise HTTPException(status_code=403, detail="Access denied")

@router.get("/completed", response_model=List[schemas.Booking], tags=["Bookings"])
async def get_completed_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get completed bookings for current user; admins see all completed."""
    if current_user.role == UserRole.ADMIN:
        return await services.BookingService.get_completed_bookings_all(db, skip, limit)
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return await services.BookingService.get_completed_bookings(db, student.id, "student", skip, limit)
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor:
            raise HTTPException(status_code=404, detail="Tutor profile not found")
        return await services.BookingService.get_completed_bookings(db, tutor.id, "tutor", skip, limit)
    raise HTTPException(status_code=403, detail="Access denied")

@router.get("/{booking_id}", response_model=schemas.BookingWithDetails, tags=["Bookings"])
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get booking by ID"""
    booking = await services.BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != booking.student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != booking.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return booking

@router.put("/{booking_id}", response_model=schemas.Booking, tags=["Bookings"])
async def update_booking(
    booking_id: int,
    booking_data: schemas.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update booking (Student who created it, Tutor involved, or Admin)"""
    booking = await services.BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != booking.student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != booking.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update booking
    updated_booking = await services.BookingService.update_booking_status(db, booking_id, booking_data.status)
    return updated_booking

@router.post("/{booking_id}/confirm", response_model=schemas.Booking, tags=["Bookings"])
async def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm a booking (Tutor or Admin)"""
    booking = await services.BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != booking.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    confirmed_booking = await services.BookingService.confirm_booking(db, booking_id)
    return confirmed_booking

@router.post("/{booking_id}/complete", response_model=schemas.Booking, tags=["Bookings"])
async def complete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete a booking (Tutor or Admin)"""
    booking = await services.BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != booking.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    completed_booking = await services.BookingService.complete_booking(db, booking_id)
    return completed_booking

@router.post("/{booking_id}/cancel", response_model=schemas.Booking, tags=["Bookings"])
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking (Student who created it, Tutor involved, or Admin)"""
    booking = await services.BookingService.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check permissions
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != booking.student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != booking.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        cancelled_booking = await services.BookingService.cancel_booking(db, booking_id)
        return cancelled_booking
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/pricing/preview", response_model=schemas.BookingWithPricing, tags=["Bookings"])
async def preview_booking_pricing(
    lesson_type: str = "doposcuola",
    subject: str = "Matematica", 
    duration_hours: int = 1,
    tutor_id: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    👁️ ANTEPRIMA PRICING BOOKING - Come Excel preview
    
    Mostra anteprima prezzo booking senza creare la prenotazione.
    Utile per UI real-time che mostra prezzo mentre utente compila form.
    """
    
    from app.pricing.services import PricingService
    
    try:
        # Calcola pricing preview
        pricing_result = await PricingService.preview_lesson_calculation(
            lesson_type=lesson_type,
            subject=subject, 
            duration_hours=duration_hours,
            tutor_id=tutor_id,
            db=db
        )
        
        # Simula booking per response
        mock_booking = {
            "id": 0,  # Mock ID
            "student_id": 0,  # Mock student ID
            "tutor_id": tutor_id,
            "package_purchase_id": 0,  # Mock package ID
            "start_time": "2024-01-01T00:00:00",  # Mock datetime
            "end_time": "2024-01-01T01:00:00",  # Mock datetime
            "duration_hours": duration_hours,
            "subject": subject,
            "notes": None,
            "status": "pending",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00",
            "calculated_duration": duration_hours,
            "calculated_price": pricing_result["final_total_price"],
            "tutor_earnings": pricing_result["tutor_earnings"], 
            "platform_fee": pricing_result["platform_fee"],
            "pricing_rule_applied": pricing_result["applied_rule_name"],
            "pricing_breakdown": pricing_result
        }
        
        return schemas.BookingWithPricing(**mock_booking)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pricing preview error: {str(e)}")
