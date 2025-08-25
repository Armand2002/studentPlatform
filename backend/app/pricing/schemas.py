"""
Pricing schemas - Pydantic per validazione API
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List
from datetime import datetime
from decimal import Decimal
from app.pricing.models import LessonType


# ================================
# PRICING RULE SCHEMAS
# ================================

class PricingRuleBase(BaseModel):
    """Base schema per regole pricing"""
    name: str = Field(..., min_length=3, max_length=100, description="Nome univoco regola")
    lesson_type: LessonType = Field(..., description="Tipologia lezione") 
    subject: str = Field(..., min_length=2, max_length=50, description="Materia")
    min_duration: int = Field(default=1, ge=1, le=24, description="Durata minima ore")
    max_duration: Optional[int] = Field(None, ge=1, le=24, description="Durata massima ore")
    base_price_per_hour: Decimal = Field(..., gt=0, le=500, description="Prezzo base orario €")
    tutor_percentage: Decimal = Field(default=0.7, gt=0, le=1, description="Percentuale tutor (0.7 = 70%)")
    volume_discounts: Optional[Dict[str, float]] = Field(None, description="Sconti volume")
    is_active: bool = Field(default=True, description="Regola attiva")
    priority: int = Field(default=100, ge=1, le=1000, description="Priorità (più basso = più priorità)")
    description: Optional[str] = Field(None, max_length=500, description="Descrizione")
    
    @field_validator('volume_discounts')
    @classmethod
    def validate_volume_discounts(cls, v):
        if v is None:
            return v
        
        # Valida formato sconti
        for threshold, discount in v.items():
            if not threshold.isdigit():
                raise ValueError(f"Volume threshold must be numeric: {threshold}")
            if not isinstance(discount, (int, float)) or discount < 0 or discount > 0.5:
                raise ValueError(f"Discount must be between 0-0.5 (50%): {discount}")
        
        return v

class PricingRuleCreate(PricingRuleBase):
    """Schema per creazione regola pricing"""
    pass

class PricingRuleUpdate(BaseModel):
    """Schema per aggiornamento regola pricing"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    lesson_type: Optional[LessonType] = None
    subject: Optional[str] = Field(None, min_length=2, max_length=50)
    min_duration: Optional[int] = Field(None, ge=1, le=24)
    max_duration: Optional[int] = Field(None, ge=1, le=24)
    base_price_per_hour: Optional[Decimal] = Field(None, gt=0, le=500)
    tutor_percentage: Optional[Decimal] = Field(None, gt=0, le=1)
    volume_discounts: Optional[Dict[str, float]] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1, le=1000)
    description: Optional[str] = Field(None, max_length=500)

class PricingRule(PricingRuleBase):
    """Schema response regola pricing"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ================================
# TUTOR OVERRIDE SCHEMAS  
# ================================

class TutorPricingOverrideBase(BaseModel):
    """Base schema per override tutor"""
    tutor_id: int = Field(..., gt=0, description="ID tutor")
    pricing_rule_id: int = Field(..., gt=0, description="ID regola pricing")
    custom_price_per_hour: Optional[Decimal] = Field(None, gt=0, le=500, description="Prezzo custom orario €")
    custom_tutor_percentage: Optional[Decimal] = Field(None, gt=0, le=1, description="Percentuale custom tutor")
    is_active: bool = Field(default=True, description="Override attivo")
    valid_from: Optional[datetime] = Field(None, description="Valido da")
    valid_until: Optional[datetime] = Field(None, description="Valido fino")
    notes: Optional[str] = Field(None, max_length=500, description="Note admin")
    
    @field_validator('custom_tutor_percentage', 'custom_price_per_hour')
    @classmethod
    def at_least_one_custom_field(cls, v, values):
        # Almeno un campo custom deve essere specificato
        return v

class TutorPricingOverrideCreate(TutorPricingOverrideBase):
    """Schema per creazione override tutor"""
    pass

class TutorPricingOverrideUpdate(BaseModel):
    """Schema per aggiornamento override tutor"""
    custom_price_per_hour: Optional[Decimal] = Field(None, gt=0, le=500)
    custom_tutor_percentage: Optional[Decimal] = Field(None, gt=0, le=1)
    is_active: Optional[bool] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

class TutorPricingOverride(TutorPricingOverrideBase):
    """Schema response override tutor"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ================================
# CALCULATION SCHEMAS
# ================================

class PricingCalculationRequest(BaseModel):
    """Schema per richiesta calcolo pricing"""
    lesson_type: LessonType = Field(..., description="Tipologia lezione")
    subject: str = Field(..., min_length=2, max_length=50, description="Materia")
    duration_hours: int = Field(..., ge=1, le=24, description="Durata ore")
    tutor_id: int = Field(..., gt=0, description="ID tutor")

class PricingCalculationResponse(BaseModel):
    """Schema response calcolo pricing"""
    # Input parameters
    lesson_type: str
    subject: str
    duration_hours: int
    tutor_id: int
    
    # Applied rules
    applied_rule_id: Optional[int]
    applied_rule_name: Optional[str]
    applied_override_id: Optional[int]
    
    # Pricing breakdown
    base_price_per_hour: float = Field(..., description="Prezzo base orario €")
    total_base_price: float = Field(..., description="Prezzo totale base €")
    volume_discount_rate: float = Field(..., description="Tasso sconto volume (0.1 = 10%)")
    discount_amount: float = Field(..., description="Importo sconto €")
    final_total_price: float = Field(..., description="Prezzo finale totale €")
    
    # Split calculation
    tutor_percentage: float = Field(..., description="Percentuale tutor applicata")
    tutor_earnings: float = Field(..., description="Guadagno tutor €")
    platform_fee: float = Field(..., description="Fee piattaforma €")
    
    # Metadata
    calculation_timestamp: str = Field(..., description="Timestamp calcolo ISO")
    has_override: bool = Field(..., description="Se applicato override tutor")
    has_volume_discount: bool = Field(..., description="Se applicato sconto volume")

class PricingPreviewRequest(BaseModel):
    """Schema per anteprima pricing (senza log)"""
    lesson_type: LessonType
    subject: str = Field(..., min_length=2, max_length=50)
    duration_hours: int = Field(..., ge=1, le=24)
    tutor_id: int = Field(..., gt=0)


# ================================
# LIST/FILTER SCHEMAS
# ================================

class PricingRuleListResponse(BaseModel):
    """Schema response lista regole pricing"""
    total: int
    items: List[PricingRule]
    
class TutorPricingOverrideListResponse(BaseModel):
    """Schema response lista override tutor"""
    total: int
    items: List[TutorPricingOverride]

class PricingRuleFilters(BaseModel):
    """Schema filtri per lista regole pricing"""
    lesson_type: Optional[str] = Field(None, description="Filtra per tipologia")
    subject: Optional[str] = Field(None, description="Filtra per materia")
    active_only: bool = Field(default=True, description="Solo regole attive")
    skip: int = Field(default=0, ge=0, description="Offset paginazione")
    limit: int = Field(default=100, ge=1, le=500, description="Limite paginazione")


# ================================
# BULK OPERATIONS SCHEMAS
# ================================

class BulkPricingRuleCreate(BaseModel):
    """Schema per creazione bulk regole pricing"""
    rules: List[PricingRuleCreate] = Field(..., min_items=1, max_items=50, description="Lista regole da creare")

class BulkPricingRuleResponse(BaseModel):
    """Schema response creazione bulk"""
    created_count: int = Field(..., description="Numero regole create")
    created_ids: List[int] = Field(..., description="ID regole create")
    errors: List[str] = Field(default_factory=list, description="Errori eventuali")


# ================================
# MIGRATION/IMPORT SCHEMAS
# ================================

class ExcelPricingImport(BaseModel):
    """Schema per import tariffario da Excel"""
    excel_rules: List[Dict] = Field(..., description="Regole estratte da Excel")
    overwrite_existing: bool = Field(default=False, description="Sovrascrivere esistenti")
    dry_run: bool = Field(default=True, description="Simulazione import")

class ExcelPricingImportResponse(BaseModel):
    """Schema response import Excel"""
    processed_count: int
    created_count: int
    updated_count: int
    skipped_count: int
    errors: List[str] = Field(default_factory=list)
    preview_rules: List[PricingRule] = Field(default_factory=list, description="Anteprima prime 5 regole")