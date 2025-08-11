"""
Payment services
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.payments import models, schemas


class PaymentService:
    @staticmethod
    async def create(db: Session, user_id: int, amount_cents: int, currency: str = "EUR", provider: Optional[str] = None, description: Optional[str] = None, external_id: Optional[str] = None) -> models.Payment:
        payment = models.Payment(
            user_id=user_id,
            amount_cents=amount_cents,
            currency=currency,
            status="pending",
            provider=provider,
            description=description,
            external_id=external_id,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    @staticmethod
    async def list(db: Session, skip: int = 0, limit: int = 100) -> List[models.Payment]:
        return db.query(models.Payment).order_by(models.Payment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    async def get_by_id(db: Session, payment_id: int) -> Optional[models.Payment]:
        return db.query(models.Payment).filter(models.Payment.id == payment_id).first()

    @staticmethod
    async def update_status(db: Session, payment_id: int, status: str) -> Optional[models.Payment]:
        obj = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
        if not obj:
            return None
        obj.status = status
        db.commit()
        db.refresh(obj)
        return obj

"""
Additional payment business logic could be added here (providers integration, webhooks)
"""
