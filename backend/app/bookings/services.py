"""
Booking Services Enhanced - Service potenziato con calcoli automatici
ESTENDE il BookingService esistente mantenendo compatibilità
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.bookings import models, schemas
from app.bookings.auto_calculations import BookingAutoCalculations
from app.packages.services import PackagePurchaseService
from app.slots.models import Slot
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta


class BookingService:
    """
    Base BookingService - API compatibility layer
    Provides basic CRUD operations needed by routes
    """
    
    @staticmethod
    async def get_student_bookings(
        db: Session, 
        student_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[models.Booking]:
        """Get all bookings for a student"""
        return db.query(models.Booking).filter(
            models.Booking.student_id == student_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_tutor_bookings(
        db: Session, 
        tutor_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[models.Booking]:
        """Get all bookings for a tutor"""
        return db.query(models.Booking).filter(
            models.Booking.tutor_id == tutor_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_upcoming_bookings_all(
        db: Session, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[models.Booking]:
        """Get all upcoming bookings (admin only)"""
        now = datetime.utcnow()
        return db.query(models.Booking).filter(
            models.Booking.start_time > now,
            models.Booking.status.in_([models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED])
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_upcoming_bookings(
        db: Session, 
        user_id: int, 
        user_type: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[models.Booking]:
        """Get upcoming bookings for specific user"""
        now = datetime.utcnow()
        query = db.query(models.Booking).filter(
            models.Booking.start_time > now,
            models.Booking.status.in_([models.BookingStatus.PENDING, models.BookingStatus.CONFIRMED])
        )
        
        if user_type == "student":
            query = query.filter(models.Booking.student_id == user_id)
        elif user_type == "tutor":
            query = query.filter(models.Booking.tutor_id == user_id)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_booking_by_id(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Get booking by ID"""
        return db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    @staticmethod
    async def create_booking(
        db: Session, 
        booking_data: schemas.BookingCreate
    ) -> models.Booking:
        """Create a new booking - delegates to enhanced service"""
        return await EnhancedBookingService.create_booking_with_auto_calculations(
            db, booking_data, auto_calculate=True
        )
    
    @staticmethod
    async def cancel_booking(db: Session, booking_id: int) -> Optional[models.Booking]:
        """Cancel a booking - delegates to enhanced service"""
        return await EnhancedBookingService.cancel_booking_with_auto_refund(
            db, booking_id, auto_refund=True
        )


class EnhancedBookingService:
    """
    Service booking potenziato con calcoli automatici Excel-like
    
    ESTENDE BookingService esistente senza romper compatibilità
    Aggiunge automazioni intelligenti e validazioni business
    """
    
    @staticmethod
    async def create_booking_with_auto_calculations(
        db: Session, 
        booking_data: schemas.BookingCreate,
        lesson_type_hint: Optional[str] = None,
        auto_calculate: bool = True
    ) -> models.Booking:
        """
        🚀 CREA BOOKING CON CALCOLI AUTOMATICI
        
        Versione potenziata di create_booking che:
        1. Mantiene tutta la logica esistente
        2. Aggiunge calcoli automatici Excel-like  
        3. Validazioni business intelligenti
        4. Auto-aggiornamento package
        """
        
        # ✅ STEP 1: Validazioni esistenti (mantieni logica)
        purchase = await PackagePurchaseService.get_purchase_by_id(db, booking_data.package_purchase_id)
        if not purchase:
            raise ValueError("Package purchase not found")
        
        if purchase.hours_remaining < booking_data.duration_hours:
            raise ValueError("Not enough hours remaining in package")
        
        if not await EnhancedBookingService.is_slot_available(
            db, booking_data.tutor_id, booking_data.start_time, booking_data.end_time
        ):
            raise ValueError("Time slot not available")
        
        # ✅ STEP 2: Crea booking (logica esistente)  
        booking = models.Booking(
            student_id=booking_data.student_id,
            tutor_id=booking_data.tutor_id,
            package_purchase_id=booking_data.package_purchase_id,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            duration_hours=booking_data.duration_hours,  # Input manuale come backup
            subject=booking_data.subject,
            notes=booking_data.notes
        )
        
        # 🆕 STEP 3: Calcoli automatici (NUOVO!)
        if auto_calculate:
            try:
                # Auto-calcola durata (Excel HOUR formula)
                booking.calculated_duration = BookingAutoCalculations.auto_calculate_duration(
                    booking.start_time, booking.end_time
                )
                
                # Auto-calcola pricing (Excel XLOOKUP replica)
                pricing_result = await BookingAutoCalculations.auto_calculate_pricing(
                    booking, db, lesson_type_hint
                )
                
                # Validazioni business (Excel conditional logic)
                validation_result = BookingAutoCalculations.validate_booking_logic(booking, db)
                
                if not validation_result["is_valid"]:
                    raise ValueError(f"Booking validation failed: {', '.join(validation_result['errors'])}")
                
                # Log warnings se presenti
                if validation_result["warnings"]:
                    print(f"⚠️ Booking warnings: {', '.join(validation_result['warnings'])}")
                
                print(f"✅ Auto-calculations complete: {booking.calculated_duration}h @ €{booking.calculated_price}")
                
            except Exception as e:
                print(f"⚠️ Auto-calculation failed, using manual inputs: {e}")
                # Fallback: usa valori manuali se auto-calcolo fallisce
        
        # ✅ STEP 4: Salva booking
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # 🆕 STEP 5: Auto-aggiorna package con ore calcolate (NUOVO!)
        hours_to_consume = booking.calculated_duration or booking.duration_hours
        await BookingAutoCalculations.auto_update_package_consumption(
            booking, db, operation="consume"
        )
        
        print(f"📦 Package updated: consumed {hours_to_consume}h from purchase #{booking.package_purchase_id}")
        
        return booking
    
    @staticmethod
    async def cancel_booking_with_auto_refund(
        db: Session, 
        booking_id: int,
        auto_refund: bool = True
    ) -> Optional[models.Booking]:
        """
        ❌ CANCELLA BOOKING CON RIMBORSO AUTOMATICO
        
        Versione intelligente di cancel_booking che:
        - Calcola rimborso ore automatico
        - Gestisce logiche temporali (rimborso parziale se troppo tardi)
        - Aggiorna package automaticamente
        """
        
        booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
        if not booking:
            return None
        
        if booking.status in [models.BookingStatus.COMPLETED, models.BookingStatus.CANCELLED]:
            raise ValueError("Cannot cancel completed or already cancelled booking")
        
        # 🆕 Logica rimborso intelligente
        if auto_refund:
            refund_policy = EnhancedBookingService._calculate_refund_policy(booking)
            
            if refund_policy["can_refund"]:
                # Rimborsa ore al package (Excel addizione automatica)
                hours_to_refund = int(booking.calculated_duration or booking.duration_hours * refund_policy["refund_percentage"])
                
                await BookingAutoCalculations.auto_update_package_consumption(
                    booking, db, operation="refund"
                )
                
                print(f"💰 Auto-refund: {hours_to_refund}h refunded to package")
            else:
                print(f"❌ No refund: {refund_policy['reason']}")
        
        # Aggiorna stato
        booking.status = models.BookingStatus.CANCELLED
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        
        return booking
    
    @staticmethod
    def _calculate_refund_policy(booking: models.Booking) -> Dict[str, Any]:
        """
        💰 CALCOLA POLICY RIMBORSO
        
        Logica business per rimborsi basata su timing:
        - >24h prima: rimborso 100%
        - 24-2h prima: rimborso 50% 
        - <2h prima: no rimborso
        """
        
        now = datetime.utcnow()
        hours_until_lesson = (booking.start_time - now).total_seconds() / 3600
        
        if hours_until_lesson > 24:
            return {
                "can_refund": True,
                "refund_percentage": 1.0,
                "reason": "Cancelled >24h in advance"
            }
        elif hours_until_lesson > 2:
            return {
                "can_refund": True, 
                "refund_percentage": 0.5,
                "reason": "Cancelled 2-24h in advance (partial refund)"
            }
        else:
            return {
                "can_refund": False,
                "refund_percentage": 0.0,
                "reason": "Cancelled <2h in advance (no refund policy)"
            }
    
    @staticmethod
    async def complete_booking_with_auto_calculations(
        db: Session,
        booking_id: int,
        actual_duration: Optional[int] = None,
        auto_adjust: bool = True
    ) -> Optional[models.Booking]:
        """
        ✅ COMPLETA BOOKING CON CALCOLI AUTOMATICI
        
        Completa booking con possibile aggiustamento durata effettiva:
        - Se durata diversa da pianificata, ricalcola pricing
        - Aggiorna package consumption di conseguenza  
        - Aggiorna earnings tutor se pricing cambia
        """
        
        booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
        if not booking:
            return None
        
        # 🆕 Auto-aggiustamento se durata effettiva diversa
        if actual_duration and actual_duration != booking.calculated_duration and auto_adjust:
            
            print(f"⚙️ Adjusting booking: planned {booking.calculated_duration}h -> actual {actual_duration}h")
            
            # Ricalcola pricing con durata effettiva
            original_duration = booking.calculated_duration
            booking.calculated_duration = actual_duration
            
            await BookingAutoCalculations.auto_calculate_pricing(booking, db)
            
            # Aggiusta consumo package
            hours_difference = actual_duration - (original_duration or booking.duration_hours)
            if hours_difference != 0:
                # TODO: Implementare aggiustamento package per differenze durata
                print(f"📊 Duration adjustment: {'+' if hours_difference > 0 else ''}{hours_difference}h")
        
        # Completa booking
        booking.status = models.BookingStatus.COMPLETED
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)
        
        return booking
    
    @staticmethod
    async def get_booking_analytics(
        db: Session,
        student_id: Optional[int] = None,
        tutor_id: Optional[int] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        📊 ANALYTICS BOOKING AVANZATI
        
        Replica Excel SUMIF, COUNTIF, PIVOT table logic:
        - Revenue totale e per periodo
        - Metriche tutor performance  
        - Trend completamenti
        - Efficiency ratios
        """
        
        # Query base
        query = db.query(models.Booking)
        
        # Filtri
        if student_id:
            query = query.filter(models.Booking.student_id == student_id)
        if tutor_id:
            query = query.filter(models.Booking.tutor_id == tutor_id)
        if date_from:
            query = query.filter(models.Booking.start_time >= date_from)
        if date_to:
            query = query.filter(models.Booking.start_time <= date_to)
        
        bookings = query.all()
        
        # Usa utility per calcoli metriche
        from app.bookings.auto_calculations import calculate_booking_metrics
        base_metrics = calculate_booking_metrics(bookings)
        
        # Calcoli aggiuntivi
        enhanced_metrics = {
            **base_metrics,
            "avg_price_per_hour": (
                base_metrics["total_revenue"] / base_metrics["total_hours"] 
                if base_metrics["total_hours"] > 0 else 0
            ),
            "tutor_earnings_percentage": (
                base_metrics["total_tutor_earnings"] / base_metrics["total_revenue"] * 100
                if base_metrics["total_revenue"] > 0 else 0
            ),
            "platform_margin": (
                base_metrics["total_platform_fees"] / base_metrics["total_revenue"] * 100
                if base_metrics["total_revenue"] > 0 else 0
            )
        }
        
        return enhanced_metrics
    
    @staticmethod
    async def is_slot_available(db: Session, tutor_id: int, start_time: datetime, end_time: datetime) -> bool:
        """
        🕐 CHECK SLOT AVAILABILITY
        Mantiene logica esistente per compatibilità
        """
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
    async def bulk_recalculate_bookings(
        db: Session,
        booking_ids: List[int],
        recalculate_pricing: bool = True,
        recalculate_duration: bool = False
    ) -> Dict[str, Any]:
        """
        📦 BULK RICALCOLO BOOKING
        
        Ricalcola pricing/durata per multiple booking in batch:
        - Utile per aggiornamenti regole pricing
        - Migrazioni dati
        - Correzioni massive
        """
        
        results = {
            "processed": 0,
            "updated": 0,
            "errors": [],
            "summary": {}
        }
        
        for booking_id in booking_ids:
            try:
                booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
                if not booking:
                    results["errors"].append(f"Booking {booking_id} not found")
                    continue
                
                results["processed"] += 1
                updated = False
                
                # Ricalcola durata se richiesto
                if recalculate_duration and booking.start_time and booking.end_time:
                    old_duration = booking.calculated_duration
                    booking.calculated_duration = BookingAutoCalculations.auto_calculate_duration(
                        booking.start_time, booking.end_time
                    )
                    
                    if old_duration != booking.calculated_duration:
                        updated = True
                        print(f"📏 Booking {booking_id}: duration {old_duration}h -> {booking.calculated_duration}h")
                
                # Ricalcola pricing se richiesto
                if recalculate_pricing:
                    old_price = booking.calculated_price
                    await BookingAutoCalculations.auto_calculate_pricing(booking, db)
                    
                    if old_price != booking.calculated_price:
                        updated = True
                        print(f"💰 Booking {booking_id}: price €{old_price} -> €{booking.calculated_price}")
                
                if updated:
                    results["updated"] += 1
                    booking.updated_at = datetime.utcnow()
                
            except Exception as e:
                results["errors"].append(f"Booking {booking_id}: {str(e)}")
        
        # Commit tutte le modifiche insieme
        db.commit()
        
        results["summary"] = {
            "success_rate": round(results["updated"] / results["processed"] * 100, 1) if results["processed"] > 0 else 0,
            "error_rate": round(len(results["errors"]) / results["processed"] * 100, 1) if results["processed"] > 0 else 0
        }
        
        return results