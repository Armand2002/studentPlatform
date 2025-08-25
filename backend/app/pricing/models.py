"""
Pricing models - Sistema tariffario intelligente
Replica la logica Excel con flessibilità enterprise
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Numeric, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class LessonType(enum.Enum):
    DOPOSCUOLA = "doposcuola"
    INDIVIDUALE = "individuale" 
    GRUPPO = "gruppo"
    ONLINE = "online"

class PricingRule(Base):
    """
    Regole di pricing - Replica Excel tariffario DOPOSCUOLA
    
    Esempio Excel: DOPOSCUOLA Matematica 1h = €25 (70% tutor)
    """
    __tablename__ = "pricing_rules"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Identificazione regola
    name = Column(String(100), nullable=False, unique=True)  # "DOPOSCUOLA_MATEMATICA_1H"
    
    # Parametri matching (come Excel lookup)
    lesson_type = Column(Enum(LessonType), nullable=False)  # DOPOSCUOLA, INDIVIDUALE
    subject = Column(String(50), nullable=False)  # Matematica, Inglese, etc
    
    # Durata (per matching preciso)
    min_duration = Column(Integer, default=1)  # Durata minima ore
    max_duration = Column(Integer, nullable=True)  # Durata massima ore (NULL = illimitato)
    
    # Pricing core
    base_price_per_hour = Column(Numeric(10, 2), nullable=False)  # Prezzo base orario €25.00
    tutor_percentage = Column(Numeric(5, 4), default=0.7000)  # 70% = 0.7000
    
    # Sconti volume (JSON per flessibilità)
    volume_discounts = Column(JSON, nullable=True)  
    # Esempio: {"4_hours": 0.05, "8_hours": 0.10, "12_hours": 0.15}
    
    # Condizioni applicazione
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=100)  # Per conflitti: più basso = più priorità
    
    # Metadata
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tutor_overrides = relationship("TutorPricingOverride", back_populates="pricing_rule")

    def __repr__(self):
        return f"<PricingRule {self.name}: €{self.base_price_per_hour}/h ({self.tutor_percentage*100}% tutor)>"

class TutorPricingOverride(Base):
    """
    Override prezzi per tutor specifici
    
    Esempio: Mario Rossi per Matematica DOPOSCUOLA = €30/h invece di €25/h
    """
    __tablename__ = "tutor_pricing_overrides"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False, index=True)
    pricing_rule_id = Column(Integer, ForeignKey("pricing_rules.id"), nullable=False, index=True)
    
    # Override values
    custom_price_per_hour = Column(Numeric(10, 2), nullable=True)  # Override prezzo
    custom_tutor_percentage = Column(Numeric(5, 4), nullable=True)  # Override percentuale
    
    # Condizioni
    is_active = Column(Boolean, default=True)
    valid_from = Column(DateTime, nullable=True)  # Validità temporale
    valid_until = Column(DateTime, nullable=True)
    
    # Metadata
    notes = Column(Text, nullable=True)  # Note admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tutor = relationship("Tutor")
    pricing_rule = relationship("PricingRule", back_populates="tutor_overrides")
    
    # Unique constraint: un override per tutor-regola
    __table_args__ = (
        # Index per performance lookup
        {"extend_existing": True}
    )

    def __repr__(self):
        price_info = f"€{self.custom_price_per_hour}/h" if self.custom_price_per_hour else f"{self.custom_tutor_percentage*100}%"
        return f"<TutorOverride Tutor#{self.tutor_id} Rule#{self.pricing_rule_id}: {price_info}>"

class PricingCalculation(Base):
    """
    Log dei calcoli pricing per audit/debug
    Tiene traccia di ogni calcolo fatto per booking
    """
    __tablename__ = "pricing_calculations"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Reference
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    
    # Input parameters
    lesson_type = Column(String(20), nullable=False)
    subject = Column(String(50), nullable=False)
    duration_hours = Column(Integer, nullable=False)
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)
    
    # Applied rule
    applied_pricing_rule_id = Column(Integer, ForeignKey("pricing_rules.id"), nullable=True)
    applied_override_id = Column(Integer, ForeignKey("tutor_pricing_overrides.id"), nullable=True)
    
    # Calculation results
    base_price_per_hour = Column(Numeric(10, 2), nullable=False)
    total_base_price = Column(Numeric(10, 2), nullable=False)
    volume_discount_rate = Column(Numeric(5, 4), default=0.0000)
    final_total_price = Column(Numeric(10, 2), nullable=False)
    tutor_earnings = Column(Numeric(10, 2), nullable=False)
    platform_fee = Column(Numeric(10, 2), nullable=False)
    tutor_percentage_applied = Column(Numeric(5, 4), nullable=False)
    
    # Metadata
    calculation_timestamp = Column(DateTime, default=datetime.utcnow)
    calculation_notes = Column(Text, nullable=True)
    
    # Relationships
    booking = relationship("Booking", foreign_keys=[booking_id])
    applied_rule = relationship("PricingRule")
    applied_override = relationship("TutorPricingOverride")

    def __repr__(self):
        return f"<PricingCalc Booking#{self.booking_id}: €{self.final_total_price} (€{self.tutor_earnings} tutor)>"