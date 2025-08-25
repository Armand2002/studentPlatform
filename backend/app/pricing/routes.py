"""
Pricing routes - API endpoints per sistema tariffario
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User, UserRole
from app.pricing import models, schemas, services


router = APIRouter(tags=["Pricing"])

# ================================
# PRICING CALCULATIONS 
# ================================

@router.post("/calculate", response_model=schemas.PricingCalculationResponse)
async def calculate_lesson_price(
    calculation_request: schemas.PricingCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🎯 CALCOLA PREZZO LEZIONE - Replica Excel XLOOKUP
    
    Calcola automaticamente prezzo, split tutor/piattaforma, sconti volume.
    Equivalente Excel: =XLOOKUP(TIPOLOGIA+MATERIA, Tariffe[], Prezzi[])
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Admin or tutor access required")
    
    try:
        result = await services.PricingService.calculate_lesson_price(
            lesson_type=calculation_request.lesson_type.value,
            subject=calculation_request.subject,
            duration_hours=calculation_request.duration_hours,
            tutor_id=calculation_request.tutor_id,
            db=db,
            log_calculation=True
        )
        return schemas.PricingCalculationResponse(**result)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@router.post("/preview", response_model=schemas.PricingCalculationResponse)
async def preview_lesson_price(
    preview_request: schemas.PricingPreviewRequest,
    db: Session = Depends(get_db)
):
    """
    👁️ ANTEPRIMA PREZZO - Senza log, per UI real-time
    
    Mostra anteprima calcolo senza salvare nel database.
    Utile per form dinamici che mostrano prezzo mentre l'utente digita.
    """
    try:
        result = await services.PricingService.preview_lesson_calculation(
            lesson_type=preview_request.lesson_type.value,
            subject=preview_request.subject,
            duration_hours=preview_request.duration_hours,
            tutor_id=preview_request.tutor_id,
            db=db
        )
        return schemas.PricingCalculationResponse(**result)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview error: {str(e)}")


# ================================
# PRICING RULES MANAGEMENT
# ================================

@router.get("/rules", response_model=schemas.PricingRuleListResponse)
async def list_pricing_rules(
    lesson_type: Optional[str] = Query(None, description="Filter by lesson type"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    active_only: bool = Query(True, description="Show only active rules"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(100, ge=1, le=500, description="Pagination limit"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📋 LISTA REGOLE PRICING - Come Excel tabella tariffe
    
    Mostra tutte le regole tariffarie con filtri.
    Equivalente a visualizzare tabella "Tariffe DOPOSCUOLA" in Excel.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Admin or tutor access required")
    
    try:
        rules = await services.PricingService.get_pricing_rules(
            db=db,
            lesson_type=lesson_type,
            subject=subject,
            active_only=active_only,
            skip=skip,
            limit=limit
        )
        
        # Count total per pagination
        total_query = db.query(models.PricingRule)
        if active_only:
            total_query = total_query.filter(models.PricingRule.is_active == True)
        if lesson_type:
            try:
                lesson_type_enum = models.LessonType(lesson_type.lower())
                total_query = total_query.filter(models.PricingRule.lesson_type == lesson_type_enum)
            except ValueError:
                pass
        if subject:
            total_query = total_query.filter(models.PricingRule.subject == subject)
        
        total = total_query.count()
        
        return schemas.PricingRuleListResponse(total=total, items=rules)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rules: {str(e)}")

@router.post("/rules", response_model=schemas.PricingRule, status_code=status.HTTP_201_CREATED)
async def create_pricing_rule(
    rule_data: schemas.PricingRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ➕ CREA REGOLA PRICING - Aggiungi nuova tariffa
    
    Crea nuova regola tariffaria.
    Equivalente ad aggiungere riga nella tabella Excel "Tariffe DOPOSCUOLA".
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check uniqueness
    existing = db.query(models.PricingRule).filter(models.PricingRule.name == rule_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Pricing rule name already exists: {rule_data.name}")
    
    try:
        new_rule = models.PricingRule(
            name=rule_data.name,
            lesson_type=rule_data.lesson_type,
            subject=rule_data.subject,
            min_duration=rule_data.min_duration,
            max_duration=rule_data.max_duration,
            base_price_per_hour=rule_data.base_price_per_hour,
            tutor_percentage=rule_data.tutor_percentage,
            volume_discounts=rule_data.volume_discounts,
            is_active=rule_data.is_active,
            priority=rule_data.priority,
            description=rule_data.description
        )
        
        db.add(new_rule)
        db.commit()
        db.refresh(new_rule)
        
        return new_rule
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating rule: {str(e)}")

@router.get("/rules/{rule_id}", response_model=schemas.PricingRule)
async def get_pricing_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🔍 DETTAGLI REGOLA PRICING - Visualizza singola tariffa
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Admin or tutor access required")
    
    rule = db.query(models.PricingRule).filter(models.PricingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    
    return rule

@router.put("/rules/{rule_id}", response_model=schemas.PricingRule)
async def update_pricing_rule(
    rule_id: int,
    rule_data: schemas.PricingRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ✏️ AGGIORNA REGOLA PRICING - Modifica tariffa esistente
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rule = db.query(models.PricingRule).filter(models.PricingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    
    # Check name uniqueness if changing
    if rule_data.name and rule_data.name != rule.name:
        existing = db.query(models.PricingRule).filter(
            models.PricingRule.name == rule_data.name,
            models.PricingRule.id != rule_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Pricing rule name already exists: {rule_data.name}")
    
    try:
        # Update fields
        update_data = rule_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rule, field, value)
        
        rule.updated_at = models.datetime.utcnow()
        db.commit()
        db.refresh(rule)
        
        return rule
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating rule: {str(e)}")

@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pricing_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    🗑️ ELIMINA REGOLA PRICING - Rimuovi tariffa
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    rule = db.query(models.PricingRule).filter(models.PricingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    
    try:
        # Soft delete: disattiva invece di eliminare
        rule.is_active = False
        rule.updated_at = models.datetime.utcnow()
        db.commit()
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting rule: {str(e)}")


# ================================
# TUTOR OVERRIDES MANAGEMENT
# ================================

@router.get("/tutors/{tutor_id}/overrides", response_model=schemas.TutorPricingOverrideListResponse)
async def list_tutor_overrides(
    tutor_id: int,
    active_only: bool = Query(True, description="Show only active overrides"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📋 LISTA OVERRIDE TUTOR - Prezzi personalizzati per tutor
    
    Mostra tutte le personalizzazioni pricing per un tutor specifico.
    """
    if current_user.role != UserRole.ADMIN:
        # Tutor can only see their own overrides  
        if current_user.role == UserRole.TUTOR:
            from app.users import services as user_services
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor or tutor.id != tutor_id:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            raise HTTPException(status_code=403, detail="Admin or owner access required")
    
    try:
        query = db.query(models.TutorPricingOverride).filter(
            models.TutorPricingOverride.tutor_id == tutor_id
        )
        
        if active_only:
            query = query.filter(models.TutorPricingOverride.is_active == True)
        
        total = query.count()
        overrides = query.offset(skip).limit(limit).all()
        
        return schemas.TutorPricingOverrideListResponse(total=total, items=overrides)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overrides: {str(e)}")

@router.post("/tutors/{tutor_id}/overrides", response_model=schemas.TutorPricingOverride, status_code=status.HTTP_201_CREATED)
async def create_tutor_override(
    tutor_id: int,
    override_data: schemas.TutorPricingOverrideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ➕ CREA OVERRIDE TUTOR - Prezzo personalizzato per tutor
    
    Crea pricing personalizzato per tutor specifico.
    Esempio: Mario Rossi per Matematica DOPOSCUOLA = €30/h invece di €25/h
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate tutor exists
    from app.users.models import Tutor
    tutor = db.query(Tutor).filter(Tutor.id == tutor_id).first()
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    # Validate pricing rule exists
    rule = db.query(models.PricingRule).filter(models.PricingRule.id == override_data.pricing_rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Pricing rule not found")
    
    # Check existing override
    existing = db.query(models.TutorPricingOverride).filter(
        models.TutorPricingOverride.tutor_id == tutor_id,
        models.TutorPricingOverride.pricing_rule_id == override_data.pricing_rule_id,
        models.TutorPricingOverride.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Active override already exists for this tutor-rule combination")
    
    try:
        new_override = models.TutorPricingOverride(
            tutor_id=tutor_id,
            pricing_rule_id=override_data.pricing_rule_id,
            custom_price_per_hour=override_data.custom_price_per_hour,
            custom_tutor_percentage=override_data.custom_tutor_percentage,
            is_active=override_data.is_active,
            valid_from=override_data.valid_from,
            valid_until=override_data.valid_until,
            notes=override_data.notes
        )
        
        db.add(new_override)
        db.commit()
        db.refresh(new_override)
        
        return new_override
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating override: {str(e)}")


# ================================
# BULK OPERATIONS
# ================================

@router.post("/rules/bulk", response_model=schemas.BulkPricingRuleResponse)
async def create_bulk_pricing_rules(
    bulk_data: schemas.BulkPricingRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📦 CREAZIONE BULK REGOLE - Import massivo tariffe
    
    Crea multiple regole pricing in una volta.
    Utile per importare tariffario completo da Excel.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    created_ids = []
    errors = []
    
    try:
        for i, rule_data in enumerate(bulk_data.rules):
            try:
                # Check uniqueness
                existing = db.query(models.PricingRule).filter(models.PricingRule.name == rule_data.name).first()
                if existing:
                    errors.append(f"Rule {i+1}: Name already exists: {rule_data.name}")
                    continue
                
                new_rule = models.PricingRule(
                    name=rule_data.name,
                    lesson_type=rule_data.lesson_type,
                    subject=rule_data.subject,
                    min_duration=rule_data.min_duration,
                    max_duration=rule_data.max_duration,
                    base_price_per_hour=rule_data.base_price_per_hour,
                    tutor_percentage=rule_data.tutor_percentage,
                    volume_discounts=rule_data.volume_discounts,
                    is_active=rule_data.is_active,
                    priority=rule_data.priority,
                    description=rule_data.description
                )
                
                db.add(new_rule)
                db.flush()  # Get ID without committing
                created_ids.append(new_rule.id)
                
            except Exception as e:
                errors.append(f"Rule {i+1}: {str(e)}")
        
        db.commit()
        
        return schemas.BulkPricingRuleResponse(
            created_count=len(created_ids),
            created_ids=created_ids,
            errors=errors
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk creation error: {str(e)}")


# ================================
# UTILITY ENDPOINTS
# ================================

@router.get("/subjects")
async def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📚 LISTA MATERIE - Tutte le materie disponibili
    
    Ritorna lista unica di tutte le materie configurate nelle regole pricing.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Admin or tutor access required")
    
    subjects = db.query(models.PricingRule.subject).filter(
        models.PricingRule.is_active == True
    ).distinct().all()
    
    return {"subjects": [s[0] for s in subjects]}

@router.get("/lesson-types")
async def list_lesson_types():
    """
    🎯 LISTA TIPOLOGIE LEZIONE - Enum disponibili
    
    Ritorna tutte le tipologie di lezione supportate.
    """
    return {"lesson_types": [{"value": lt.value, "label": lt.value.title()} for lt in models.LessonType]}