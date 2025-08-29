"""
Admin models for package assignments and offline payments
"""
from sqlalchemy import (
	Column,
	Integer,
	String,
	DateTime,
	Boolean,
	ForeignKey,
	Text,
	Numeric,
	Date,
)
from sqlalchemy.types import Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class PaymentStatus(enum.Enum):
	PENDING = "pending"
	PARTIAL = "partial"
	COMPLETED = "completed"
	OVERDUE = "overdue"
	CANCELLED = "cancelled"


class PaymentMethod(enum.Enum):
	BANK_TRANSFER = "bank_transfer"
	CASH = "cash"
	CHECK = "check"
	CARD_OFFLINE = "card_offline"
	OTHER = "other"


class PackageAssignmentStatus(enum.Enum):
	DRAFT = "draft"
	ASSIGNED = "assigned"
	ACTIVE = "active"
	SUSPENDED = "suspended"
	COMPLETED = "completed"
	CANCELLED = "cancelled"


class AdminPackageAssignment(Base):
	__tablename__ = "admin_package_assignments"

	id = Column(Integer, primary_key=True, index=True)
	student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
	tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)
	package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
	assigned_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)

	custom_name = Column(String(200), nullable=True)
	custom_total_hours = Column(Integer, nullable=True)
	custom_price = Column(Numeric(10, 2), nullable=True)
	custom_expiry_date = Column(Date, nullable=True)

	assignment_date = Column(DateTime, default=datetime.utcnow)
	# store enum values (e.g. 'assigned') in the DB, not the Python member names ('ASSIGNED')
	status = Column(
		SAEnum(
			PackageAssignmentStatus,
			name='packageassignmentstatus',
			values_callable=lambda enum: [e.value for e in enum],
			native_enum=True,
		),
		default=PackageAssignmentStatus.DRAFT,
	)

	hours_used = Column(Integer, default=0)
	hours_remaining = Column(Integer, nullable=False, default=0)

	admin_notes = Column(Text, nullable=True)
	student_notes = Column(Text, nullable=True)
	auto_activate_on_payment = Column(Boolean, default=True)

	created_at = Column(DateTime, default=datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	# relationships
	student = relationship("Student")
	tutor = relationship("Tutor")
	package = relationship("Package")
	assigned_by = relationship("User", foreign_keys=[assigned_by_admin_id])
	payments = relationship("AdminPayment", back_populates="package_assignment")


class AdminPayment(Base):
	__tablename__ = "admin_payments"

	id = Column(Integer, primary_key=True, index=True)
	package_assignment_id = Column(Integer, ForeignKey("admin_package_assignments.id"), nullable=False)
	student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
	processed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)

	amount = Column(Numeric(10, 2), nullable=False)
	payment_method = Column(
		SAEnum(
			PaymentMethod,
			name='paymentmethod',
			values_callable=lambda enum: [e.value for e in enum],
			native_enum=True,
		),
		nullable=False,
	)
	payment_date = Column(Date, nullable=False)
	status = Column(
		SAEnum(
			PaymentStatus,
			name='paymentstatus',
			values_callable=lambda enum: [e.value for e in enum],
			native_enum=True,
		),
		default=PaymentStatus.PENDING,
	)

	reference_number = Column(String(100), nullable=True)
	bank_details = Column(Text, nullable=True)

	confirmed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
	confirmation_date = Column(DateTime, nullable=True)
	admin_notes = Column(Text, nullable=True)

	receipt_sent = Column(Boolean, default=False)
	receipt_sent_at = Column(DateTime, nullable=True)

	created_at = Column(DateTime, default=datetime.utcnow)
	updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	# relationships
	package_assignment = relationship("AdminPackageAssignment", back_populates="payments")
	student = relationship("Student")
	processed_by = relationship("User", foreign_keys=[processed_by_admin_id])
	confirmed_by = relationship("User", foreign_keys=[confirmed_by_admin_id])

