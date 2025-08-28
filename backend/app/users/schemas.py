"""
User schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date
from app.users.models import UserRole

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class StudentBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    institute: str
    class_level: str
    phone_number: str

class TutorBase(BaseModel):
    first_name: str
    last_name: str
    bio: Optional[str] = None
    subjects: Optional[str] = None
    is_available: bool = True

# Create schemas
class UserCreate(UserBase):
    password: str

class StudentCreate(StudentBase):
    user: UserCreate

class TutorCreate(TutorBase):
    user: UserCreate

class TutorSelfCreate(BaseModel):
    """Payload to create a tutor profile for the current authenticated user."""
    first_name: str
    last_name: str
    bio: Optional[str] = None
    subjects: Optional[str] = None
    is_available: bool = True

# Update schemas
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    institute: Optional[str] = None
    class_level: Optional[str] = None
    phone_number: Optional[str] = None

class TutorUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    subjects: Optional[str] = None
    is_available: Optional[bool] = None

# Response schemas
class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Student(StudentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Tutor(TutorBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentWithUser(Student):
    user: User

class TutorWithUser(Tutor):
    user: User
