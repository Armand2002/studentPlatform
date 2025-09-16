"""
Booking Auto Calculations - Replica Excel automazioni
Calcoli automatici per durata, prezzo, split tutor/piattaforma
"""
from sqlalchemy.orm import Session
from sqlalchemy import event
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Dict, Any

from app.bookings import models
from app.pricing.services import PricingService
from app.core.database import Base


class BookingAutoCalculations:
    """
    Service per calcoli automatici booking
    Replica tutte le formule Excel in tempo reale
    """
    
    @staticmethod
    def auto_calculate_duration(start_time: datetime, end_time: datetime) -> int:
        """
        🕒 REPLICA EXCEL: =HOUR(END_TIME) - HOUR(START_TIME)
        
        Calcola durata automatica da orari start/end
        Con validazioni e arrotondamenti intelligenti
        """
        if not start_time or not end_time:
            return 1
            
        if end_time <= start_time:
            raise ValueError("End time must be after start time")
        
        # Calcola differenza in ore
        diff = end_time - start_time
        total_seconds = diff.total_seconds()
        
        # Converti in ore con arrotondamento intelligente
        hours_exact = total_seconds / 3600
        
        # Arrotondamento logico:
        # - <= 15 min extra: arrotonda per difetto  
        # - > 15 min extra: arrotonda per eccesso
        # - Minimo 1 ora sempre
        if hours_exact <= 1.25:  # 1h 15min
            return 1
        elif hours_exact <= 2.25:  # 2h 15min
            return 2
        else:
            # Arrotonda ai 30 minuti più vicini
            return max(1, round(hours_exact * 2) / 2)
    
    @staticmethod
    async def auto_calculate_pricing(
        booking: models.Booking, 
        db: Session,
        lesson_type_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        💰 CALCOLA PRICING AUTOMATICO
        
        Integrazione completa con PricingService
        Replica Excel XLOOKUP + VLOOKUP + formule complesse
        """
        
        # Determina lesson_type automatico se non specificato
        lesson_type = lesson_type_override or BookingAutoCalculations._infer_lesson_type(booking, db)
        
        try:
            # Usa PricingService per calcoli Excel-like  
            pricing_result = await PricingService.calculate_lesson_price(
                lesson_type=lesson_type,
                subject=booking.subject,
                duration_hours=booking.calculated_duration,
                tutor_id=booking.tutor_id,
                db=db,
                log_calculation=True
            )
            
            # Aggiorna booking con risultati
            booking.calculated_price = Decimal(str(pricing_result["final_total_price"]))
            booking.tutor_earnings = Decimal(str(pricing_result["tutor_earnings"]))
            booking.platform_fee = Decimal(str(pricing_result["platform_fee"]))
            booking.pricing_rule_applied = pricing_result.get("applied_rule_name", "AUTO")
            
            return {
                "success": True,
                "pricing_result": pricing_result,
                "auto_calculated": True
            }
            
        except Exception as e:
            # Fallback a calcolo base se pricing service fallisce
            return await BookingAutoCalculations._fallback_pricing_calculation(booking, db, str(e))
    
    @staticmethod
    def _infer_lesson_type(booking: models.Booking, db: Session) -> str:
        """
        🎯 INFERENZA AUTOMATICA LESSON TYPE
        
        Deduce tipologia lezione da contesto:
        - Package acquistato dallo studente
        - Orario della lezione
        - Storico lezioni simili
        """
        
        # Logica 1: Deduce da package acquistato
        if hasattr(booking, 'package_purchase') and booking.package_purchase:
            package_name = booking.package_purchase.package.name.upper()
            
            if "INDIVIDUALE" in package_name:
                return "individuale"
            elif "GRUPPO" in package_name:
                return "gruppo"
            elif "DOPOSCUOLA" in package_name:
                return "doposcuola"
        
        # Logica 2: Deduce da orario (doposcuola = pomeriggio)
        if booking.start_time:
            hour = booking.start_time.hour
            if 14 <= hour <= 19:  # 14:00-19:00 = doposcuola
                return "doposcuola"
            elif 8 <= hour <= 13:  # 08:00-13:00 = individuale mattina
                return "individuale"
        
        # Logica 3: Default sicuro
        return "doposcuola"
    
    @staticmethod
    async def _fallback_pricing_calculation(
        booking: models.Booking, 
        db: Session, 
        error_msg: str
    ) -> Dict[str, Any]:
        """
        🛡️ FALLBACK PRICING CALCULATION
        
        Calcolo base se sistema pricing avanzato non disponibile
        Mantiene funzionalità anche senza regole configurate
        """
        
        # Prezzi base fallback (da configurazione o default)
        base_rates = {
            "doposcuola": Decimal("25.00"),
            "individuale": Decimal("35.00"), 
            "gruppo": Decimal("18.00"),
            "online": Decimal("30.00")
        }
        
        # Inferisci lesson type
        lesson_type = BookingAutoCalculations._infer_lesson_type(booking, db)
        base_price_per_hour = base_rates.get(lesson_type, Decimal("25.00"))
        
        # Calcoli base
        total_price = base_price_per_hour * booking.calculated_duration
        tutor_percentage = Decimal("0.70")  # 70% default
        tutor_earnings = total_price * tutor_percentage
        platform_fee = total_price - tutor_earnings
        
        # Aggiorna booking
        booking.calculated_price = total_price
        booking.tutor_earnings = tutor_earnings
        booking.platform_fee = platform_fee
        booking.pricing_rule_applied = f"FALLBACK_{lesson_type.upper()}"
        
        return {
            "success": True, 
            "pricing_result": {
                "final_total_price": float(total_price),
                "tutor_earnings": float(tutor_earnings),
                "platform_fee": float(platform_fee),
                "applied_rule_name": f"FALLBACK_{lesson_type.upper()}"
            },
            "auto_calculated": False,
            "fallback_reason": error_msg
        }
    
    @staticmethod
    async def auto_update_package_consumption(
        booking: models.Booking,
        db: Session,
        operation: str = "consume"  # "consume" o "refund"
    ):
        """
        📦 AGGIORNAMENTO AUTOMATICO PACKAGE
        
        Replica Excel logica di consumo/rimborso ore pacchetto
        - consume: Sottrae ore dal pacchetto (booking confermato)
        - refund: Rimborsa ore al pacchetto (booking cancellato)
        """
        
        if not booking.package_purchase_id:
            return
        
        from app.packages.models import PackagePurchase
        
        purchase = db.query(PackagePurchase).filter(
            PackagePurchase.id == booking.package_purchase_id
        ).first()
        
        if not purchase:
            return
        
        hours_to_process = booking.calculated_duration or booking.duration_hours
        
        if operation == "consume":
            # Consuma ore (come Excel sottrazione automatica)
            if purchase.hours_remaining >= hours_to_process:
                purchase.hours_used += hours_to_process
                purchase.hours_remaining -= hours_to_process

                # Auto-disattiva se finite le ore
                if purchase.hours_remaining <= 0:
                    purchase.is_active = False

                # Also apply consumption to any linked admin assignment
                BookingAutoCalculations._consume_admin_assignment_hours(
                    db=db,
                    purchase=purchase,
                    booking=booking,
                    hours_to_consume=hours_to_process,
                )
                    
        elif operation == "refund":
            # Rimborsa ore (come Excel addizione automatica)
            purchase.hours_used = max(0, purchase.hours_used - hours_to_process)
            purchase.hours_remaining += hours_to_process
            
            # Riattiva se torna ad avere ore
            if purchase.hours_remaining > 0 and not purchase.is_active:
                purchase.is_active = True
        
        purchase.updated_at = datetime.now(timezone.utc)
        db.commit()

    @staticmethod
    def _consume_admin_assignment_hours(db: Session, purchase, booking: models.Booking, hours_to_consume: int):
        """Try to find an ACTIVE AdminPackageAssignment corresponding to this purchase and deduct hours.

        Matching is done by student_id, tutor_id and package_id. If assignment hours reach 0, mark completed.
        """
        try:
            from app.admin import models as admin_models
        except Exception:
            return

        assignment = db.query(admin_models.AdminPackageAssignment).filter(
            admin_models.AdminPackageAssignment.student_id == purchase.student_id,
            admin_models.AdminPackageAssignment.tutor_id == booking.tutor_id,
            admin_models.AdminPackageAssignment.package_id == purchase.package_id,
            admin_models.AdminPackageAssignment.status == admin_models.PackageAssignmentStatus.ACTIVE,
        ).first()

        if not assignment:
            return

        assignment.hours_used = (assignment.hours_used or 0) + hours_to_consume
        assignment.hours_remaining = max(0, (assignment.hours_remaining or 0) - hours_to_consume)
        if assignment.hours_remaining <= 0:
            assignment.status = admin_models.PackageAssignmentStatus.COMPLETED
            assignment.completed_at = datetime.now(timezone.utc)
        db.add(assignment)
    
    @staticmethod
    def validate_booking_logic(booking: models.Booking, db: Session) -> Dict[str, Any]:
        """
        ✅ VALIDAZIONI BUSINESS LOGIC
        
        Replica Excel validazioni condizionali:
        - Orari logici 
        - Disponibilità pacchetto
        - Slot tutor disponibili
        - Limiti business
        """
        
        errors = []
        warnings = []
        
        # Validazione 1: Durata ragionevole
        if booking.calculated_duration and booking.calculated_duration > 8:
            errors.append("Booking duration cannot exceed 8 hours")
        elif booking.calculated_duration and booking.calculated_duration < 1:
            errors.append("Booking duration must be at least 1 hour")
            
        # Validazione 2: Orari business
        if booking.start_time:
            hour = booking.start_time.hour
            if hour < 7 or hour > 22:
                warnings.append("Booking outside normal business hours (7:00-22:00)")
        
        # Validazione 3: Weekend premium
        if booking.start_time and booking.start_time.weekday() >= 5:  # Sabato/Domenica
            warnings.append("Weekend booking - premium rates may apply")
        
        # Validazione 4: Prezzo ragionevole
        if booking.calculated_price:
            if booking.calculated_price > Decimal("500.00"):
                warnings.append("High booking price - please verify calculation")
            elif booking.calculated_price < Decimal("10.00"):
                warnings.append("Low booking price - please verify calculation")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "auto_validated": True
        }


# ================================
# SQLALCHEMY EVENT LISTENERS
# ================================

@event.listens_for(models.Booking, 'before_insert')
def booking_before_insert(mapper, connection, booking):
    """
    🎣 AUTO-TRIGGER BEFORE INSERT
    
    Calcola automaticamente durata prima del salvataggio
    Come Excel formula che si aggiorna quando cambi celle
    """
    if booking.start_time and booking.end_time:
        booking.calculated_duration = BookingAutoCalculations.auto_calculate_duration(
            booking.start_time, booking.end_time
        )

@event.listens_for(models.Booking, 'before_update') 
def booking_before_update(mapper, connection, booking):
    """
    🎣 AUTO-TRIGGER BEFORE UPDATE
    
    Ricalcola durata se cambiano gli orari
    """
    if booking.start_time and booking.end_time:
        new_duration = BookingAutoCalculations.auto_calculate_duration(
            booking.start_time, booking.end_time
        )
        
        # Solo se cambiata, per evitare loop
        if new_duration != booking.calculated_duration:
            booking.calculated_duration = new_duration


# ================================
# UTILITY FUNCTIONS
# ================================

def format_booking_summary(booking: models.Booking) -> str:
    """
    📋 FORMAT BOOKING SUMMARY
    
    Crea riassunto booking come Excel concatenazione testi
    """
    summary_parts = [
        f"📅 {booking.start_time.strftime('%Y-%m-%d %H:%M')}",
        f"🎓 {booking.subject}",
        f"⏱️ {booking.calculated_duration or booking.duration_hours}h"
    ]
    
    if booking.calculated_price:
        summary_parts.append(f"💰 €{booking.calculated_price}")
    
    if booking.pricing_rule_applied:
        summary_parts.append(f"📋 {booking.pricing_rule_applied}")
    
    return " | ".join(summary_parts)

def calculate_booking_metrics(bookings: list) -> Dict[str, Any]:
    """
    📊 CALCOLI METRICHE BOOKING
    
    Replica Excel SUMIF, COUNTIF, AVERAGE per booking
    """
    if not bookings:
        return {"total_bookings": 0}
    
    # Filtri e conteggi
    completed = [b for b in bookings if b.status == models.BookingStatus.COMPLETED]
    pending = [b for b in bookings if b.status == models.BookingStatus.PENDING]
    cancelled = [b for b in bookings if b.status == models.BookingStatus.CANCELLED]
    
    # Calcoli finanziari  
    total_revenue = sum(b.calculated_price or Decimal("0") for b in completed)
    total_tutor_earnings = sum(b.tutor_earnings or Decimal("0") for b in completed)
    total_platform_fees = sum(b.platform_fee or Decimal("0") for b in completed)
    
    # Calcoli temporali
    total_hours = sum(b.calculated_duration or b.duration_hours or 0 for b in completed)
    avg_duration = total_hours / len(completed) if completed else 0
    
    return {
        "total_bookings": len(bookings),
        "completed": len(completed),
        "pending": len(pending), 
        "cancelled": len(cancelled),
        "total_revenue": float(total_revenue),
        "total_tutor_earnings": float(total_tutor_earnings),
        "total_platform_fees": float(total_platform_fees),
        "total_hours": total_hours,
        "avg_duration": round(avg_duration, 2),
        "completion_rate": round(len(completed) / len(bookings) * 100, 1) if bookings else 0
    }