"""Admin routes for package assignments and payments"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import UserRole, User
from app.admin import schemas, services, models
from app.services.email_service import trigger_package_assigned

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(user=Depends(get_current_user)):
	if getattr(user, "role", None) != UserRole.ADMIN:
		raise HTTPException(status_code=403, detail="Admin access required")
	return user


@router.post("/package-assignments", response_model=schemas.AdminPackageAssignment)
async def create_package_assignment(
	assignment_data: schemas.AdminPackageAssignmentCreate,
	background_tasks: BackgroundTasks,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	try:
		assignment = await services.AdminPackageService.create_assignment(db, assignment_data, admin_user.id)
	except ValueError as exc:
		raise HTTPException(status_code=404, detail=str(exc))
	# schedule email in the background (non-blocking)
	try:
		background_tasks.add_task(trigger_package_assigned, assignment.id, db)
	except Exception:
		pass
	return assignment


@router.post("/payments", response_model=schemas.AdminPayment)
async def record_payment(
	payment_data: schemas.AdminPaymentCreate,
	background_tasks: BackgroundTasks,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	try:
		payment = await services.AdminPaymentService.record_payment(db, payment_data, admin_user.id)
	except ValueError as exc:
		raise HTTPException(status_code=404, detail=str(exc))
	# schedule receipt email in background if needed
	return payment


@router.put("/payments/{payment_id}/confirm")
async def confirm_payment(
	payment_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	try:
		payment = await services.AdminPaymentService.confirm_payment(db, payment_id, admin_user.id)
	except ValueError as exc:
		raise HTTPException(status_code=404, detail=str(exc))
	return {"message": "Payment confirmed", "payment": payment}


@router.get("/package-assignments")
async def list_package_assignments(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
	assignments = db.query(models.AdminPackageAssignment).all()
	return assignments


@router.get("/payments")
async def list_payments(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
	payments = db.query(models.AdminPayment).all()
	return payments


@router.get("/users")
async def list_users(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
	"""Get all users for admin dashboard"""
	users = db.query(User).all()
	return users


@router.put("/users/{user_id}/approve")
async def approve_user(
	user_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Approve a user (mainly for tutors)"""
	user = db.query(User).filter(User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	
	user.is_verified = True
	user.is_active = True
	db.commit()
	db.refresh(user)
	
	return {"message": "User approved successfully", "user": user}


@router.put("/users/{user_id}/reject")
async def reject_user(
	user_id: int,
	reason: str = "Non specificato",
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Reject a user application"""
	user = db.query(User).filter(User.id == user_id).first()
	if not user:
		raise HTTPException(status_code=404, detail="User not found")
	
	user.is_verified = False
	user.is_active = False
	db.commit()
	db.refresh(user)
	
	return {"message": "User rejected", "reason": reason}


@router.get("/pending-approvals")
async def get_pending_approvals(db: Session = Depends(get_db), admin_user=Depends(require_admin)):
	"""Get all users pending approval (mainly tutors)"""
	from app.users.models import Tutor
	
	pending_tutors = db.query(User).join(Tutor).filter(
		User.role == UserRole.TUTOR,
		User.is_verified == False,
		User.is_active == True
	).all()
	
	return pending_tutors


@router.get("/reports/overview")
async def get_reports_overview(
	days: int = 30,
	db: Session = Depends(get_db), 
	admin_user=Depends(require_admin)
):
	"""Get comprehensive report data"""
	from datetime import datetime, timedelta
	from sqlalchemy import func, and_
	from app.packages.models import Package
	from app.bookings.models import Booking, BookingStatus
	from app.payments.models import Payment
	
	end_date = datetime.utcnow()
	start_date = end_date - timedelta(days=days)
	
	# Revenue in period
	total_revenue = db.query(func.coalesce(func.sum(Payment.amount_cents), 0)).filter(
		and_(Payment.created_at >= start_date, Payment.status == "succeeded")
	).scalar() or 0
	
	# Bookings stats
	total_bookings = db.query(func.count(Booking.id)).filter(
		Booking.created_at >= start_date
	).scalar() or 0
	
	completed_bookings = db.query(func.count(Booking.id)).filter(
		and_(
			Booking.created_at >= start_date,
			Booking.status == BookingStatus.COMPLETED
		)
	).scalar() or 0
	
	# Active users
	active_users = db.query(func.count(User.id)).filter(
		User.is_active == True
	).scalar() or 0
	
	return {
		"period_days": days,
		"total_revenue_cents": total_revenue,
		"total_bookings": total_bookings,
		"completed_bookings": completed_bookings,
		"completion_rate": (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0,
		"active_users": active_users,
		"period_start": start_date.isoformat(),
		"period_end": end_date.isoformat()
	}


@router.get("/settings")
async def get_system_settings(admin_user=Depends(require_admin)):
	"""Get system settings"""
	# In futuro questo potrebbe leggere da una tabella settings
	return {
		"maintenance_mode": False,
		"registration_enabled": True,
		"email_notifications": True,
		"max_file_size_mb": 10,
		"session_timeout_minutes": 30
	}


@router.put("/settings")
async def update_system_settings(
	settings: dict,
	admin_user=Depends(require_admin)
):
	"""Update system settings"""
	# In futuro questo salverebbe in una tabella settings
	return {"message": "Settings updated successfully", "settings": settings}

