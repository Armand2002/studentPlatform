from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime, date
from app.users.models import UserRole

# ================================
# LOGIN SCHEMAS
# ================================

class LoginForm(BaseModel):
    """Login form schema - matches OAuth2PasswordRequestForm"""
    username: EmailStr  # We use email as username
    password: str

# ================================
# REGISTRATION SCHEMAS (MISSING!)
# ================================

class StudentRegistration(BaseModel):
    """Schema per registrazione studente completa"""
    # User data
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = Field(default=UserRole.STUDENT)
    
    # Student profile data
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    date_of_birth: str  # Will be converted to date in service
    institute: str = Field(..., min_length=2, max_length=100)
    class_level: str = Field(..., min_length=1, max_length=20)
    address: str = Field(..., min_length=5, max_length=500)
    phone_number: str = Field(..., regex=r"^\+?[1-9]\d{1,14}$")
    
    @field_validator('date_of_birth')
    @classmethod
    def validate_date_format(cls, v):
        """Validate date format YYYY-MM-DD"""
        from datetime import datetime
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

class TutorRegistration(BaseModel):
    """Schema per registrazione tutor completa"""
    # User data
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole = Field(default=UserRole.TUTOR)
    
    # Tutor profile data
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=1000)
    subjects: str = Field(..., min_length=2, max_length=200)
    hourly_rate: int = Field(..., gt=0, le=200)
    is_available: bool = Field(default=True)

# ================================
# USER SCHEMAS
# ================================

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ================================
# TOKEN SCHEMAS
# ================================

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

# ================================
# PASSWORD RESET SCHEMAS
# ================================

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

# ================================
# RESPONSE SCHEMAS
# ================================

class RegistrationResponse(BaseModel):
    """Response after successful registration"""
    message: str = "Registration successful"
    user_id: int
    email: str
    role: UserRole
    access_token: str
    refresh_token: str
    token_type: str = "bearer"