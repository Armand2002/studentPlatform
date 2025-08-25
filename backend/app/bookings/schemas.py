"""
Booking schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime
from app.bookings.models import BookingStatus

# Base schemas
class BookingBase(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_hours: int
    subject: str
    notes: Optional[str] = None

# Create schemas
class BookingCreate(BookingBase):
    student_id: int
    tutor_id: int
    package_purchase_id: int

# Update schemas
class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_hours: Optional[int] = None
    subject: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[BookingStatus] = None

# Response schemas
class Booking(BookingBase):
    id: int
    student_id: int
    tutor_id: int
    package_purchase_id: int
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
    
    # 🆕 CAMPI PRICING CALCOLATI  
    calculated_duration: Optional[int] = Field(None, description="Durata calcolata automaticamente")
    calculated_price: Optional[float] = Field(None, description="Prezzo calcolato automaticamente €")
    tutor_earnings: Optional[float] = Field(None, description="Guadagno tutor €")
    platform_fee: Optional[float] = Field(None, description="Fee piattaforma €")
    pricing_rule_applied: Optional[str] = Field(None, description="Regola pricing applicata")

    class Config:
        from_attributes = True

class BookingWithDetails(Booking):
    student_name: str
    tutor_name: str
    package_name: str

class BookingWithPricing(Booking):
    """Booking con dettagli pricing completi"""
    pricing_breakdown: Optional[Dict] = Field(None, description="Dettagli calcolo pricing")
