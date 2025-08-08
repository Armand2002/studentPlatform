"""
Slot schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time

# Base schemas
class SlotBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    is_available: bool = True

# Create schemas
class SlotCreate(SlotBase):
    tutor_id: int

class MultipleSlotsCreate(BaseModel):
    tutor_id: int
    start_date: date
    end_date: date
    start_time: time
    end_time: time
    days_of_week: Optional[List[int]] = None  # 0=Monday, 6=Sunday

# Update schemas
class SlotUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_available: Optional[bool] = None

# Response schemas
class Slot(SlotBase):
    id: int
    tutor_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SlotWithTutor(Slot):
    tutor_name: str
