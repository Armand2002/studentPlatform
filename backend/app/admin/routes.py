"""Admin routes for package assignments and payments"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import UserRole
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

