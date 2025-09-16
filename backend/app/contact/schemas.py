"""
Contact form schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    timestamp: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ContactResponse(BaseModel):
    success: bool
    message: str
    reference_id: Optional[str] = None
