"""Admin routes for package assignments and payments"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import UserRole, User
from app.admin import schemas, services, models
from app.packages import services as package_services, schemas as package_schemas
from app.bookings import services as booking_services, schemas as booking_schemas
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
		assignment = services.AdminPackageService.create_assignment(db, assignment_data, admin_user.id)
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
		payment = services.AdminPaymentService.record_payment(db, payment_data, admin_user.id)
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
		payment = services.AdminPaymentService.confirm_payment(db, payment_id, admin_user.id)
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


@router.post("/packages", response_model=package_schemas.Package)
async def admin_create_package(
	package_data: package_schemas.PackageCreate,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Create packages (Admin exclusive) - Only admins can create packages for tutors"""
	# package_data must include tutor_id (admin selects a tutor)
	# This is now the ONLY way to create packages in the system
	try:
		return await package_services.PackageService.create_package(db, package_data)
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e))


@router.put("/packages/{package_id}", response_model=package_schemas.Package)
async def admin_update_package(
	package_id: int,
	package_data: package_schemas.PackageUpdate,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Update package (Admin exclusive)"""
	try:
		return await package_services.PackageService.update_package(db, package_id, package_data)
	except ValueError as e:
		raise HTTPException(status_code=404, detail=str(e))


@router.get("/packages/{package_id}/assignments")
async def get_package_assignments(
	package_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Get all assignments for a specific package"""
	try:
		assignments = db.query(models.AdminPackageAssignment).filter(
			models.AdminPackageAssignment.package_id == package_id
		).all()
		
		# Transform to include student details
		result = []
		for assignment in assignments:
			result.append({
				"id": assignment.id,
				"student": {
					"id": assignment.student.id,
					"first_name": assignment.student.first_name,
					"last_name": assignment.student.last_name,
					"email": assignment.student.user.email if assignment.student.user else ""
				},
				"assigned_date": assignment.assignment_date.isoformat(),
				"status": assignment.status.value,
				"hours_used": assignment.hours_used,
				"hours_remaining": assignment.hours_remaining,
				"expiry_date": assignment.custom_expiry_date.isoformat() if assignment.custom_expiry_date else None
			})
		
		return result
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))


@router.get("/packages/{package_id}/stats")
async def get_package_stats(
	package_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Get statistics for a specific package"""
	try:
		# Get assignments
		assignments = db.query(models.AdminPackageAssignment).filter(
			models.AdminPackageAssignment.package_id == package_id
		).all()
		
		# Get package
		from app.packages import models as package_models
		package = db.query(package_models.Package).filter(
			package_models.Package.id == package_id
		).first()
		
		if not package:
			raise ValueError("Package not found")
		
		# Calculate stats
		total_assignments = len(assignments)
		active_assignments = len([a for a in assignments if a.status.value == 'active'])
		total_hours_used = sum(a.hours_used for a in assignments)
		total_revenue = sum(a.custom_price or package.price for a in assignments)
		
		# Calculate completion rate
		total_possible_hours = total_assignments * package.total_hours
		avg_completion_rate = (total_hours_used / total_possible_hours * 100) if total_possible_hours > 0 else 0
		
		return {
			"total_assignments": total_assignments,
			"active_assignments": active_assignments,
			"total_hours_used": total_hours_used,
			"total_revenue": float(total_revenue),
			"avg_completion_rate": avg_completion_rate
		}
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))


@router.delete("/package-assignments/{assignment_id}")
async def delete_package_assignment(
	assignment_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin),
):
	"""Delete a package assignment"""
	try:
		assignment = db.query(models.AdminPackageAssignment).filter(
			models.AdminPackageAssignment.id == assignment_id
		).first()
		
		if not assignment:
			raise HTTPException(status_code=404, detail="Assignment not found")
		
		# Use raw SQL to delete payments first to avoid SQLAlchemy relationship issues
		db.execute(
			text("DELETE FROM admin_payments WHERE package_assignment_id = :assignment_id"),
			{"assignment_id": assignment_id}
		)
		
		# Then delete the assignment
		db.execute(
			text("DELETE FROM admin_package_assignments WHERE id = :assignment_id"),
			{"assignment_id": assignment_id}
		)
		
		db.commit()
		
		return {"message": "Assignment deleted successfully"}
	except Exception as e:
		db.rollback()
		raise HTTPException(status_code=500, detail=str(e))


@router.get("/package-requests", tags=["Admin"])
async def get_package_requests(
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Get all pending package requests from tutors"""
	try:
		requests = await package_services.PackageRequestService.get_pending_requests(db)
		
		# Transform to include tutor details with safe access
		result = []
		for request in requests:
			try:
				# Get tutor details safely
				from app.users import models as user_models
				tutor = db.query(user_models.Tutor).filter(user_models.Tutor.id == request.tutor_id).first()
				
				# Get user details safely
				user = None
				if tutor:
					user = db.query(user_models.User).filter(user_models.User.id == tutor.user_id).first()
				
				result.append({
					"id": str(request.id),
					"name": request.requested_name,
					"subject": request.requested_subject,
					"description": request.requested_description,
					"total_hours": request.requested_total_hours,
					"status": request.status.value if hasattr(request.status, 'value') else str(request.status),
					"tutor_name": f"{tutor.first_name} {tutor.last_name}" if tutor else "Unknown",
					"tutor_email": user.email if user else "Unknown",
					"requested_at": request.created_at.isoformat() if request.created_at else "",
					"admin_notes": request.admin_notes or ""
				})
			except Exception as inner_e:
				# Skip problematic records instead of failing entirely
				print(f"Skipping problematic package request {request.id}: {inner_e}")
				continue
		
		return result
	except Exception as e:
		# Fallback to empty list if there's any issue
		print(f"Package requests error: {e}")
		return []


@router.post("/package-requests/{request_id}/approve", tags=["Admin"])
async def approve_package_request(
	request_id: int,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Approve a package request and create the package"""
	try:
		request = await package_services.PackageRequestService.approve_request(
			db, request_id, admin_user.id
		)
		return {
			"message": "Package request approved and package created successfully",
			"request": request,
			"package_id": request.created_package_id
		}
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e))


@router.post("/package-requests/{request_id}/reject", tags=["Admin"])
async def reject_package_request(
	request_id: int,
	rejection_data: dict,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Reject a package request with reason"""
	try:
		reason = rejection_data.get("reason", "No reason provided")
		request = await package_services.PackageRequestService.reject_request(
			db, request_id, admin_user.id, reason
		)
		return {
			"message": "Package request rejected",
			"request": request,
			"reason": reason
		}
	except ValueError as e:
		raise HTTPException(status_code=400, detail=str(e))


@router.get("/lessons", tags=["Admin"])
async def get_all_lessons(
	skip: int = 0,
	limit: int = 100,
	status: str = None,
	student_id: int = None,
	tutor_id: int = None,
	subject: str = None,
	date_from: str = None,
	date_to: str = None,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Get all lessons/bookings with comprehensive filters (Admin only)"""
	try:
		from app.bookings.models import Booking, BookingStatus
		
		# Build query with filters
		query = db.query(Booking)
		
		# Status filter
		if status and status != 'all':
			if status == 'pending':
				query = query.filter(Booking.status == BookingStatus.PENDING)
			elif status == 'confirmed':
				query = query.filter(Booking.status == BookingStatus.CONFIRMED)
			elif status == 'completed':
				query = query.filter(Booking.status == BookingStatus.COMPLETED)
			elif status == 'cancelled':
				query = query.filter(Booking.status == BookingStatus.CANCELLED)
		
		# Student filter
		if student_id:
			query = query.filter(Booking.student_id == student_id)
		
		# Tutor filter
		if tutor_id:
			query = query.filter(Booking.tutor_id == tutor_id)
		
		# Subject filter
		if subject:
			query = query.filter(Booking.subject.ilike(f"%{subject}%"))
		
		# Date range filter
		if date_from:
			from datetime import datetime
			date_from_dt = datetime.fromisoformat(date_from)
			query = query.filter(Booking.start_time >= date_from_dt)
		
		if date_to:
			from datetime import datetime
			date_to_dt = datetime.fromisoformat(date_to)
			query = query.filter(Booking.start_time <= date_to_dt)
		
		# Order by start time (newest first)
		query = query.order_by(Booking.start_time.desc())
		
		# Apply pagination
		bookings = query.offset(skip).limit(limit).all()
		
		return bookings
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error fetching lessons: {str(e)}")


@router.get("/lessons/stats", tags=["Admin"])
async def get_lessons_stats(
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Get comprehensive lesson statistics (Admin only)"""
	try:
		from sqlalchemy import func
		from app.bookings.models import Booking, BookingStatus
		
		# Basic counts
		total_lessons = db.query(func.count(Booking.id)).scalar()
		pending_lessons = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.PENDING).scalar()
		confirmed_lessons = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.CONFIRMED).scalar()
		completed_lessons = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.COMPLETED).scalar()
		cancelled_lessons = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.CANCELLED).scalar()
		
		# Revenue calculations
		completed_revenue = db.query(func.sum(Booking.calculated_price)).filter(
			Booking.status == BookingStatus.COMPLETED,
			Booking.calculated_price.isnot(None)
		).scalar() or 0
		
		# Today's lessons
		from datetime import date
		today = date.today()
		today_lessons = db.query(func.count(Booking.id)).filter(
			func.date(Booking.start_time) == today
		).scalar()
		
		# This week's lessons
		from datetime import datetime, timedelta
		week_start = datetime.now() - timedelta(days=datetime.now().weekday())
		week_lessons = db.query(func.count(Booking.id)).filter(
			Booking.start_time >= week_start
		).scalar()
		
		return {
			"total_lessons": total_lessons,
			"pending_lessons": pending_lessons,
			"confirmed_lessons": confirmed_lessons,
			"completed_lessons": completed_lessons,
			"cancelled_lessons": cancelled_lessons,
			"completed_revenue": float(completed_revenue),
			"today_lessons": today_lessons,
			"week_lessons": week_lessons,
			"completion_rate": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
			"cancellation_rate": (cancelled_lessons / total_lessons * 100) if total_lessons > 0 else 0
		}
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error fetching lesson stats: {str(e)}")


@router.put("/lessons/{booking_id}/status", tags=["Admin"])
async def update_lesson_status(
	booking_id: int,
	status_data: dict,
	db: Session = Depends(get_db),
	admin_user=Depends(require_admin)
):
	"""Update lesson status (Admin only) - Force status changes"""
	try:
		from app.bookings.models import Booking, BookingStatus
		
		new_status = status_data.get("status")
		admin_notes = status_data.get("admin_notes", "")
		
		if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
			raise HTTPException(status_code=400, detail="Invalid status")
		
		# Get booking
		booking = db.query(Booking).filter(Booking.id == booking_id).first()
		if not booking:
			raise HTTPException(status_code=404, detail="Booking not found")
		
		# Update status (admin override)
		if new_status == "confirmed":
			booking.status = BookingStatus.CONFIRMED
		elif new_status == "completed":
			booking.status = BookingStatus.COMPLETED
		elif new_status == "cancelled":
			booking.status = BookingStatus.CANCELLED
		elif new_status == "pending":
			booking.status = BookingStatus.PENDING
		
		# Add admin note if provided
		if admin_notes:
			current_notes = booking.notes or ""
			booking.notes = f"{current_notes}\n[ADMIN] {admin_notes}".strip()
		
		db.commit()
		db.refresh(booking)
		
		return {
			"message": f"Lesson status updated to {new_status}",
			"booking_id": booking_id,
			"new_status": new_status,
			"updated_by": admin_user.email
		}
		
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error updating lesson status: {str(e)}")

