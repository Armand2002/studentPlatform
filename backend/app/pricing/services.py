"""
Pricing services - Business logic per calcoli tariffari
Replica Excel XLOOKUP + VLOOKUP + formule automatiche
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import Dict, Optional, List
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime

from app.pricing import models
from app.pricing.models import LessonType
from app.users.models import Tutor


class PricingService:
    """
    Service principale per calcoli pricing
    Replica la logica Excel con performance ottimizzate
    """
    
    @staticmethod
    async def calculate_lesson_price(
        lesson_type: str,
        subject: str, 
        duration_hours: int,
        tutor_id: int,
        db: Session,
        log_calculation: bool = True
    ) -> Dict:
        """
        🎯 REPLICA EXCEL XLOOKUP: Calcola prezzo automatico
        
        Logica Excel:
        1. XLOOKUP(TIPOLOGIA+MATERIA, TariffeTutor[], PrezzoCustom[])
        2. Se non trovato: XLOOKUP(TIPOLOGIA+MATERIA, TariffeBase[], PrezzoBase[])
        3. Applica sconti volume
        4. Calcola split tutor/piattaforma
        
        Args:
            lesson_type: "doposcuola", "individuale", etc
            subject: "Matematica", "Inglese", etc
            duration_hours: Durata in ore
            tutor_id: ID del tutor
            db: Database session
            log_calculation: Se salvare il log del calcolo
            
        Returns:
            Dict con tutti i dettagli del calcolo
        """
        
        # Validate enum
        try:
            lesson_type_enum = LessonType(lesson_type.lower())
        except ValueError:
            raise ValueError(f"Invalid lesson_type: {lesson_type}. Valid: {[e.value for e in LessonType]}")
        
        # 🔍 STEP 1: Cerca override specifico per questo tutor (priorità massima)
        tutor_override = await PricingService._find_tutor_override(
            db, tutor_id, lesson_type_enum, subject, duration_hours
        )
        
        applied_rule = None
        applied_override = None
        base_price_per_hour = None
        tutor_percentage = None
        
        if tutor_override:
            # Usa override tutor
            applied_override = tutor_override
            applied_rule = tutor_override.pricing_rule
            
            base_price_per_hour = (
                tutor_override.custom_price_per_hour or 
                tutor_override.pricing_rule.base_price_per_hour
            )
            tutor_percentage = (
                tutor_override.custom_tutor_percentage or 
                tutor_override.pricing_rule.tutor_percentage
            )
            
        else:
            # 🔍 STEP 2: Cerca regola generale (XLOOKUP fallback)
            pricing_rule = await PricingService._find_pricing_rule(
                db, lesson_type_enum, subject, duration_hours
            )
            
            if not pricing_rule:
                raise ValueError(
                    f"No pricing rule found for {lesson_type} - {subject} - {duration_hours}h"
                )
            
            applied_rule = pricing_rule
            base_price_per_hour = pricing_rule.base_price_per_hour
            tutor_percentage = pricing_rule.tutor_percentage
        
        # 💰 STEP 3: Calcoli base
        total_base_price = base_price_per_hour * duration_hours
        
        # 📊 STEP 4: Applica sconti volume (come Excel nested IF)
        volume_discount_rate = Decimal('0.0000')
        if applied_rule and applied_rule.volume_discounts:
            volume_discount_rate = PricingService._calculate_volume_discount(
                duration_hours, applied_rule.volume_discounts
            )
        
        # Prezzo finale dopo sconto
        discount_amount = total_base_price * volume_discount_rate
        final_total_price = total_base_price - discount_amount
        
        # 🎯 STEP 5: Split tutor/piattaforma (come Excel percentage calc)
        tutor_earnings = final_total_price * tutor_percentage
        platform_fee = final_total_price - tutor_earnings
        
        # Arrotondamenti a 2 decimali
        final_total_price = final_total_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        tutor_earnings = tutor_earnings.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        platform_fee = platform_fee.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        # 📝 STEP 6: Prepara risultato
        calculation_result = {
            # Input parameters
            "lesson_type": lesson_type,
            "subject": subject,
            "duration_hours": duration_hours,
            "tutor_id": tutor_id,
            
            # Applied rules
            "applied_rule_id": applied_rule.id if applied_rule else None,
            "applied_rule_name": applied_rule.name if applied_rule else None,
            "applied_override_id": applied_override.id if applied_override else None,
            
            # Pricing breakdown
            "base_price_per_hour": float(base_price_per_hour),
            "total_base_price": float(total_base_price),
            "volume_discount_rate": float(volume_discount_rate),
            "discount_amount": float(discount_amount),
            "final_total_price": float(final_total_price),
            
            # Split calculation
            "tutor_percentage": float(tutor_percentage),
            "tutor_earnings": float(tutor_earnings),
            "platform_fee": float(platform_fee),
            
            # Metadata
            "calculation_timestamp": datetime.utcnow().isoformat(),
            "has_override": tutor_override is not None,
            "has_volume_discount": volume_discount_rate > 0
        }
        
        # 🗂️ STEP 7: Log per audit (opzionale)
        if log_calculation:
            await PricingService._log_calculation(db, calculation_result, applied_rule, applied_override)
        
        return calculation_result
    
    @staticmethod
    async def _find_tutor_override(
        db: Session, 
        tutor_id: int, 
        lesson_type_enum: LessonType, 
        subject: str, 
        duration_hours: int
    ) -> Optional[models.TutorPricingOverride]:
        """
        Trova override specifico per tutor
        Equivalente Excel: XLOOKUP specifico per tutor
        """
        now = datetime.utcnow()
        
        override = db.query(models.TutorPricingOverride).join(models.PricingRule).filter(
            and_(
                # Match tutor
                models.TutorPricingOverride.tutor_id == tutor_id,
                models.TutorPricingOverride.is_active == True,
                
                # Match timing
                or_(
                    models.TutorPricingOverride.valid_from.is_(None),
                    models.TutorPricingOverride.valid_from <= now
                ),
                or_(
                    models.TutorPricingOverride.valid_until.is_(None),
                    models.TutorPricingOverride.valid_until >= now
                ),
                
                # Match pricing rule criteria
                models.PricingRule.lesson_type == lesson_type_enum.value,
                models.PricingRule.subject == subject,
                models.PricingRule.is_active == True,
                models.PricingRule.min_duration <= duration_hours,
                or_(
                    models.PricingRule.max_duration.is_(None),
                    models.PricingRule.max_duration >= duration_hours
                )
            )
        ).order_by(models.PricingRule.priority.asc()).first()
        
        return override
    
    @staticmethod
    async def _find_pricing_rule(
        db: Session, 
        lesson_type_enum: LessonType, 
        subject: str, 
        duration_hours: int
    ) -> Optional[models.PricingRule]:
        """
        Trova regola pricing generale
        Equivalente Excel: XLOOKUP generico su tabella tariffe
        """
        rule = db.query(models.PricingRule).filter(
            and_(
                models.PricingRule.lesson_type == lesson_type_enum.value,
                models.PricingRule.subject == subject,
                models.PricingRule.is_active == True,
                models.PricingRule.min_duration <= duration_hours,
                or_(
                    models.PricingRule.max_duration.is_(None),
                    models.PricingRule.max_duration >= duration_hours
                )
            )
        ).order_by(models.PricingRule.priority.asc()).first()
        
        return rule
    
    @staticmethod
    def _calculate_volume_discount(duration_hours: int, volume_discounts: dict) -> Decimal:
        """
        Calcola sconto volume
        Equivalente Excel: nested IF per sconti
        
        volume_discounts esempio: {"4": 0.05, "8": 0.10, "12": 0.15}
        """
        if not volume_discounts:
            return Decimal('0.0000')
        
        # Ordina le soglie dal più alto al più basso
        thresholds = [(int(k), Decimal(str(v))) for k, v in volume_discounts.items()]
        thresholds.sort(key=lambda x: x[0], reverse=True)
        
        # Trova la soglia più alta applicabile
        for threshold_hours, discount_rate in thresholds:
            if duration_hours >= threshold_hours:
                return discount_rate
                
        return Decimal('0.0000')
    
    @staticmethod
    async def _log_calculation(
        db: Session, 
        calculation_result: dict, 
        applied_rule: models.PricingRule = None, 
        applied_override: models.TutorPricingOverride = None
    ):
        """
        Log del calcolo per audit e debug
        """
        log_entry = models.PricingCalculation(
            lesson_type=calculation_result["lesson_type"],
            subject=calculation_result["subject"],
            duration_hours=calculation_result["duration_hours"],
            tutor_id=calculation_result["tutor_id"],
            
            applied_pricing_rule_id=applied_rule.id if applied_rule else None,
            applied_override_id=applied_override.id if applied_override else None,
            
            base_price_per_hour=Decimal(str(calculation_result["base_price_per_hour"])),
            total_base_price=Decimal(str(calculation_result["total_base_price"])),
            volume_discount_rate=Decimal(str(calculation_result["volume_discount_rate"])),
            final_total_price=Decimal(str(calculation_result["final_total_price"])),
            tutor_earnings=Decimal(str(calculation_result["tutor_earnings"])),
            platform_fee=Decimal(str(calculation_result["platform_fee"])),
            tutor_percentage_applied=Decimal(str(calculation_result["tutor_percentage"]))
        )
        
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
    
    @staticmethod
    async def get_pricing_rules(
        db: Session, 
        lesson_type: str = None, 
        subject: str = None,
        active_only: bool = True,
        skip: int = 0, 
        limit: int = 100
    ) -> List[models.PricingRule]:
        """
        Ottieni lista regole pricing con filtri
        """
        query = db.query(models.PricingRule)
        
        if active_only:
            query = query.filter(models.PricingRule.is_active == True)
            
        if lesson_type:
            try:
                lesson_type_enum = LessonType(lesson_type.lower())
                query = query.filter(models.PricingRule.lesson_type == lesson_type_enum)
            except ValueError:
                pass
                
        if subject:
            query = query.filter(models.PricingRule.subject == subject)
        
        return query.order_by(
            models.PricingRule.lesson_type, 
            models.PricingRule.subject,
            models.PricingRule.priority
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def preview_lesson_calculation(
        lesson_type: str,
        subject: str,
        duration_hours: int, 
        tutor_id: int,
        db: Session
    ) -> Dict:
        """
        Preview calcolo senza salvare log
        Utile per UI che mostra anteprima prezzo
        """
        return await PricingService.calculate_lesson_price(
            lesson_type=lesson_type,
            subject=subject, 
            duration_hours=duration_hours,
            tutor_id=tutor_id,
            db=db,
            log_calculation=False
        )