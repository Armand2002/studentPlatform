"""
Slots routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.models import UserRole
from app.slots import models, schemas, services
from app.users import services as user_services

router = APIRouter()

# Slot routes
@router.post("/", response_model=schemas.Slot, tags=["Slots"])
async def create_slot(
    slot_data: schemas.SlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new slot (Tutor only)"""
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Tutor access required")
    
    # Verify the tutor is creating slot for themselves
    tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
    if not tutor or tutor.id != slot_data.tutor_id:
        raise HTTPException(status_code=403, detail="Can only create slots for your own account")
    
    return await services.SlotService.create_slot(
        db, slot_data.tutor_id, slot_data.date, slot_data.start_time, slot_data.end_time
    )

@router.post("/multiple", response_model=List[schemas.Slot], tags=["Slots"])
async def create_multiple_slots(
    slots_data: schemas.MultipleSlotsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create multiple slots for a date range (Tutor only)"""
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Tutor access required")
    
    # Verify the tutor is creating slots for themselves
    tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
    if not tutor or tutor.id != slots_data.tutor_id:
        raise HTTPException(status_code=403, detail="Can only create slots for your own account")
    
    return await services.SlotService.create_multiple_slots(
        db, slots_data.tutor_id, slots_data.start_date, slots_data.end_date,
        slots_data.start_time, slots_data.end_time, slots_data.days_of_week
    )

@router.get("/", response_model=List[schemas.Slot], tags=["Slots"])
async def get_slots(
    tutor_id: int = None,
    slot_date: date = None,
    available_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get slots with filters"""
    if tutor_id:
        # Check permissions
        if current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor or tutor.id != tutor_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if available_only:
            return await services.SlotService.get_available_slots(db, tutor_id, slot_date)
        else:
            return await services.SlotService.get_tutor_slots(db, tutor_id, slot_date, skip, limit)
    else:
        # Users can only see their own slots
        if current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor:
                raise HTTPException(status_code=404, detail="Tutor profile not found")
            
            if available_only:
                return await services.SlotService.get_available_slots(db, tutor.id, slot_date)
            else:
                return await services.SlotService.get_tutor_slots(db, tutor.id, slot_date, skip, limit)
        else:
            raise HTTPException(status_code=403, detail="Access denied")

@router.get("/available", response_model=List[schemas.Slot], tags=["Slots"])
async def get_available_slots(
    tutor_id: int,
    slot_date: date = None,
    db: Session = Depends(get_db)
):
    """Get available slots for a tutor (public endpoint)"""
    return await services.SlotService.get_available_slots(db, tutor_id, slot_date)

@router.get("/{slot_id}", response_model=schemas.Slot, tags=["Slots"])
async def get_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get slot by ID"""
    slot = await services.SlotService.get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != slot.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return slot

@router.put("/{slot_id}", response_model=schemas.Slot, tags=["Slots"])
async def update_slot(
    slot_id: int,
    slot_data: schemas.SlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update slot (Tutor who created it or Admin)"""
    slot = await services.SlotService.get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != slot.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update slot
    if slot_data.start_time is not None:
        slot.start_time = slot_data.start_time
    if slot_data.end_time is not None:
        slot.end_time = slot_data.end_time
    if slot_data.is_available is not None:
        slot.is_available = slot_data.is_available
    
    slot.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(slot)
    return slot

@router.delete("/{slot_id}", tags=["Slots"])
async def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete slot (Tutor who created it or Admin)"""
    slot = await services.SlotService.get_slot_by_id(db, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != slot.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = await services.SlotService.delete_slot(db, slot_id)
    if not success:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    return {"message": "Slot deleted successfully"}

@router.delete("/tutor/{tutor_id}/date/{slot_date}", tags=["Slots"])
async def delete_tutor_slots_by_date(
    tutor_id: int,
    slot_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete all slots for a tutor on a specific date (Tutor or Admin)"""
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    deleted_count = await services.SlotService.delete_tutor_slots_by_date(db, tutor_id, slot_date)
    return {"message": f"Deleted {deleted_count} slots"}
