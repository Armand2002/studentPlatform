"""
Package schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class PackageRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    IN_REVIEW = "in_review"

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

class PackageResourceLinkBase(BaseModel):
    title: str
    url: str
    provider: Optional[str] = None
    is_public: bool = True

class PackageResourceLinkCreate(PackageResourceLinkBase):
    package_id: int

class PackageResourceLinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    provider: Optional[str] = None
    is_public: Optional[bool] = None

class PackageResourceLink(PackageResourceLinkBase):
    id: int
    package_id: int
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
    links: Optional[List[PackageResourceLink]] = None


# Package Request Schemas
class PackageRequestBase(BaseModel):
    requested_name: str
    requested_subject: str
    requested_description: str
    requested_total_hours: int

class PackageRequestCreate(PackageRequestBase):
    pass

class PackageRequest(PackageRequestBase):
    id: int
    tutor_id: int
    status: PackageRequestStatus
    reviewed_by_admin_id: Optional[int] = None
    review_date: Optional[datetime] = None
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_package_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PackageRequestWithTutor(PackageRequest):
    tutor_name: str
    tutor_email: str
