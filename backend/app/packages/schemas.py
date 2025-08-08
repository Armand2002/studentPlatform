"""
Package schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

# Base schemas
class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    total_hours: int
    price: Decimal
    subject: str
    is_active: bool = True

class PackagePurchaseBase(BaseModel):
    expiry_date: date
    hours_remaining: int
    is_active: bool = True

# Create schemas
class PackageCreate(PackageBase):
    tutor_id: int

class PackagePurchaseCreate(PackagePurchaseBase):
    student_id: int
    package_id: int

# Update schemas
class PackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_hours: Optional[int] = None
    price: Optional[Decimal] = None
    subject: Optional[str] = None
    is_active: Optional[bool] = None

class PackagePurchaseUpdate(BaseModel):
    hours_used: Optional[int] = None
    hours_remaining: Optional[int] = None
    is_active: Optional[bool] = None

# Response schemas
class Package(PackageBase):
    id: int
    tutor_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PackagePurchase(PackagePurchaseBase):
    id: int
    student_id: int
    package_id: int
    purchase_date: datetime
    hours_used: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PackageWithTutor(Package):
    tutor_name: str

class PackagePurchaseWithDetails(PackagePurchase):
    package: Package
