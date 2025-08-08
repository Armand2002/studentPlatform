"""
Slots business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.slots import models
from typing import List, Optional
from datetime import datetime, date, time, timedelta

class SlotService:
    """Service for slot management"""
    
    @staticmethod
    async def create_slot(db: Session, tutor_id: int, slot_date: date, start_time: time, end_time: time) -> models.Slot:
        """Create a new slot for a tutor"""
        slot = models.Slot(
            tutor_id=tutor_id,
            date=slot_date,
            start_time=start_time,
            end_time=end_time,
            is_available=True
        )
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return slot
    
    @staticmethod
    async def create_multiple_slots(db: Session, tutor_id: int, start_date: date, end_date: date, 
                                  start_time: time, end_time: time, days_of_week: List[int] = None) -> List[models.Slot]:
        """Create multiple slots for a tutor over a date range"""
        slots = []
        current_date = start_date
        
        while current_date <= end_date:
            # Check if this day of week should have slots (0=Monday, 6=Sunday)
            day_of_week = current_date.weekday()
            if days_of_week is None or day_of_week in days_of_week:
                slot = models.Slot(
                    tutor_id=tutor_id,
                    date=current_date,
                    start_time=start_time,
                    end_time=end_time,
                    is_available=True
                )
                db.add(slot)
                slots.append(slot)
            
            current_date += timedelta(days=1)
        
        db.commit()
        for slot in slots:
            db.refresh(slot)
        
        return slots
    
    @staticmethod
    async def get_slot_by_id(db: Session, slot_id: int) -> Optional[models.Slot]:
        """Get slot by ID"""
        return db.query(models.Slot).filter(models.Slot.id == slot_id).first()
    
    @staticmethod
    async def get_tutor_slots(db: Session, tutor_id: int, slot_date: date = None, skip: int = 0, limit: int = 100) -> List[models.Slot]:
        """Get slots for a specific tutor"""
        query = db.query(models.Slot).filter(models.Slot.tutor_id == tutor_id)
        
        if slot_date:
            query = query.filter(models.Slot.date == slot_date)
        
        return query.order_by(models.Slot.date.asc(), models.Slot.start_time.asc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_available_slots(db: Session, tutor_id: int, slot_date: date = None) -> List[models.Slot]:
        """Get available slots for a tutor"""
        query = db.query(models.Slot).filter(
            and_(
                models.Slot.tutor_id == tutor_id,
                models.Slot.is_available == True
            )
        )
        
        if slot_date:
            query = query.filter(models.Slot.date == slot_date)
        
        return query.order_by(models.Slot.date.asc(), models.Slot.start_time.asc()).all()
    
    @staticmethod
    async def get_slots_by_date_range(db: Session, tutor_id: int, start_date: date, end_date: date) -> List[models.Slot]:
        """Get slots for a tutor within a date range"""
        return db.query(models.Slot).filter(
            and_(
                models.Slot.tutor_id == tutor_id,
                models.Slot.date >= start_date,
                models.Slot.date <= end_date
            )
        ).order_by(models.Slot.date.asc(), models.Slot.start_time.asc()).all()
    
    @staticmethod
    async def update_slot_availability(db: Session, slot_id: int, is_available: bool) -> Optional[models.Slot]:
        """Update slot availability"""
        slot = await SlotService.get_slot_by_id(db, slot_id)
        if not slot:
            return None
        
        slot.is_available = is_available
        slot.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(slot)
        return slot
    
    @staticmethod
    async def delete_slot(db: Session, slot_id: int) -> bool:
        """Delete a slot"""
        slot = await SlotService.get_slot_by_id(db, slot_id)
        if not slot:
            return False
        
        db.delete(slot)
        db.commit()
        return True
    
    @staticmethod
    async def delete_tutor_slots_by_date(db: Session, tutor_id: int, slot_date: date) -> int:
        """Delete all slots for a tutor on a specific date"""
        result = db.query(models.Slot).filter(
            and_(
                models.Slot.tutor_id == tutor_id,
                models.Slot.date == slot_date
            )
        ).delete()
        db.commit()
        return result
    
    @staticmethod
    async def get_slots_for_booking(db: Session, tutor_id: int, booking_date: date, 
                                  duration_hours: int) -> List[models.Slot]:
        """Get available slots that can accommodate a booking of specified duration"""
        available_slots = await SlotService.get_available_slots(db, tutor_id, booking_date)
        suitable_slots = []
        
        for slot in available_slots:
            # Calculate if slot can accommodate the booking duration
            slot_duration = (slot.end_time.hour - slot.start_time.hour) + \
                           (slot.end_time.minute - slot.start_time.minute) / 60
            
            if slot_duration >= duration_hours:
                suitable_slots.append(slot)
        
        return suitable_slots
