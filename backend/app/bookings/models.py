"""
Bookings models for tutoring platform
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum, Numeric
from sqlalchemy.orm import relationship, Session
from datetime import datetime
from decimal import Decimal
import enum
from app.core.database import Base

class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)
    package_purchase_id = Column(Integer, ForeignKey("package_purchases.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_hours = Column(Integer, nullable=False)  # Durata in ore
    subject = Column(String, nullable=False)
    notes = Column(Text)  # Note della lezione
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 🆕 NUOVI CAMPI PRICING AUTOMATICI
    calculated_duration = Column(Integer)  # Durata calcolata automaticamente  
    calculated_price = Column(Numeric(10, 2))  # Prezzo calcolato automaticamente
    tutor_earnings = Column(Numeric(10, 2))  # Guadagno tutor (70%)
    platform_fee = Column(Numeric(10, 2))  # Fee piattaforma (30%)
    pricing_rule_applied = Column(String(100))  # Nome regola applicata
    pricing_calculation_id = Column(Integer, ForeignKey("pricing_calculations.id"))  # Riferimento calcolo
    
    # Relationships
    student = relationship("Student", back_populates="bookings")
    tutor = relationship("Tutor", back_populates="bookings")
    package_purchase = relationship("PackagePurchase", back_populates="bookings")
    pricing_calculation = relationship("PricingCalculation", foreign_keys=[pricing_calculation_id])
    
    def auto_calculate_duration(self) -> int:
        """
        🕒 REPLICA EXCEL: =HOUR(END_TIME) - HOUR(START_TIME)
        Calcola durata automaticamente da start/end time
        """
        if self.start_time and self.end_time:
            diff = self.end_time - self.start_time
            hours = int(diff.total_seconds() / 3600)
            return max(1, hours)  # Minimo 1 ora
        return 1
    
    async def auto_calculate_pricing(self, db: Session):
        """
        💰 CALCOLA PRICING AUTOMATICO
        Integra con PricingService per calcoli Excel-like
        """
        from app.pricing.services import PricingService
        
        # Calcola durata se non presente
        if not self.calculated_duration:
            self.calculated_duration = self.auto_calculate_duration()
        
        # Calcola pricing automatico
        try:
            pricing_result = await PricingService.calculate_lesson_price(
                lesson_type="doposcuola",  # Default, poi miglioriamo
                subject=self.subject,
                duration_hours=self.calculated_duration,
                tutor_id=self.tutor_id,
                db=db,
                log_calculation=True
            )
            
            # Aggiorna campi calcolati
            self.calculated_price = Decimal(str(pricing_result["final_total_price"]))
            self.tutor_earnings = Decimal(str(pricing_result["tutor_earnings"]))
            self.platform_fee = Decimal(str(pricing_result["platform_fee"]))
            self.pricing_rule_applied = pricing_result["applied_rule_name"]
            
            return pricing_result
            
        except Exception as e:
            # Fallback a calcolo manuale se pricing service fallisce
            print(f"Warning: Pricing calculation failed: {e}")
            # Mantieni comportamento esistente
            return None
