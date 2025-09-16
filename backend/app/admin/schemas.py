"""Pydantic schemas for admin package management"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class PaymentMethodEnum(str, Enum):
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CHECK = "check"
    CARD_OFFLINE = "card_offline"
    OTHER = "other"


class PackageAssignmentStatusEnum(str, Enum):
    DRAFT = "draft"
    ASSIGNED = "assigned"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class AdminPackageAssignmentBase(BaseModel):
    student_id: int = Field(..., gt=0)
    tutor_id: int = Field(..., gt=0)
    package_id: int = Field(..., gt=0)
    custom_name: Optional[str] = None
    custom_total_hours: Optional[int] = None
    custom_price: Optional[Decimal] = None
    custom_expiry_date: Optional[date] = None
    admin_notes: Optional[str] = None
    student_notes: Optional[str] = None
    auto_activate_on_payment: bool = Field(default=True)


class AdminPackageAssignmentCreate(AdminPackageAssignmentBase):
    pass


class AdminPackageAssignment(AdminPackageAssignmentBase):
    id: int
    assignment_date: datetime
    status: PackageAssignmentStatusEnum
    hours_used: int
    hours_remaining: int
    activated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    assigned_by_admin_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminPaymentBase(BaseModel):
    package_assignment_id: int = Field(..., gt=0)
    student_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=0)
    payment_method: PaymentMethodEnum
    payment_date: date
    reference_number: Optional[str] = None
    bank_details: Optional[str] = None
    admin_notes: Optional[str] = None


class AdminPaymentCreate(AdminPaymentBase):
    pass


class AdminPayment(AdminPaymentBase):
    id: int
    status: PaymentStatusEnum
    processed_by_admin_id: int
    confirmed_by_admin_id: Optional[int]
    confirmation_date: Optional[datetime]
    receipt_sent: bool
    receipt_sent_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminPaymentWithDetails(AdminPayment):
    student_name: str
    package_name: str
    processed_by_admin_name: str
    confirmed_by_admin_name: Optional[str]
    assignment_status: str
"""Admin Pydantic schemas (defined above)."""
