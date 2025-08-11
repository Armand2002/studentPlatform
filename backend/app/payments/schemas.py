"""
Payment schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentBase(BaseModel):
    amount_cents: int
    currency: str = "EUR"
    status: str  # pending | succeeded | failed | refunded | canceled
    provider: Optional[str] = None
    description: Optional[str] = None
    external_id: Optional[str] = None


class Payment(PaymentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    status: Optional[str] = None
