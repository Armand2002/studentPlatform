"""
Payments routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.models import UserRole
from app.payments import models, schemas, services

router = APIRouter()
ADMIN_REQUIRED = "Admin access required"


@router.get("/", response_model=List[schemas.Payment], tags=["Payments"])
async def list_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ADMIN_REQUIRED)
    return await services.PaymentService.list(db, skip, limit)

# Support path without trailing slash to avoid redirect issues
@router.get("", response_model=List[schemas.Payment], tags=["Payments"], include_in_schema=False)
async def list_payments_no_slash(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ADMIN_REQUIRED)
    return await services.PaymentService.list(db, skip, limit)


@router.post("/", response_model=schemas.Payment, tags=["Payments"])
async def create_payment(
    amount_cents: int,
    currency: str = "EUR",
    provider: str = None,
    description: str = None,
    external_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admin can create records; tutors/students could create intent in future
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ADMIN_REQUIRED)
    return await services.PaymentService.create(db, current_user.id, amount_cents, currency, provider, description, external_id)

@router.post("", response_model=schemas.Payment, tags=["Payments"], include_in_schema=False)
async def create_payment_no_slash(
    amount_cents: int,
    currency: str = "EUR",
    provider: str = None,
    description: str = None,
    external_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ADMIN_REQUIRED)
    return await services.PaymentService.create(db, current_user.id, amount_cents, currency, provider, description, external_id)


@router.put("/{payment_id}", response_model=schemas.Payment, tags=["Payments"])
async def update_payment_status(
    payment_id: int,
    data: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ADMIN_REQUIRED)
    if data.status is None:
        raise HTTPException(status_code=400, detail="Status required")
    obj = await services.PaymentService.update_status(db, payment_id, data.status)
    if not obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    return obj

