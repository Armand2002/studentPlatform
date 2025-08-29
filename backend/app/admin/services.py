from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from app.admin import models, schemas
from app.packages.models import Package


class AdminPackageService:
    @staticmethod
    def create_assignment(db: Session, data: schemas.AdminPackageAssignmentCreate, admin_id: int) -> models.AdminPackageAssignment:
        # basic validations
        pkg = db.get(Package, data.package_id)
        if not pkg:
            raise ValueError("Package not found")

        # create assignment
        assignment = models.AdminPackageAssignment(
            student_id=data.student_id,
            tutor_id=data.tutor_id,
            package_id=data.package_id,
            assigned_by_admin_id=admin_id,
            custom_price=getattr(data, "custom_price", None),
            custom_total_hours=getattr(data, "custom_total_hours", None),
            status=models.PackageAssignmentStatus.ASSIGNED,
            hours_remaining=(getattr(data, "custom_total_hours", None) or getattr(pkg, "total_hours", None) or 0),
            auto_activate_on_payment=getattr(data, "auto_activate_on_payment", True),
        )
        db.add(assignment)
        db.flush()
        db.commit()
        db.refresh(assignment)
        return assignment


class AdminPaymentService:
    @staticmethod
    def record_payment(db: Session, data: schemas.AdminPaymentCreate, admin_id: int) -> models.AdminPayment:
        # ensure assignment exists
        assignment = db.get(models.AdminPackageAssignment, data.package_assignment_id)
        if not assignment:
            raise ValueError("Assignment not found")

        # normalize payment_method to models.PaymentMethod enum
        pm = data.payment_method
        try:
            if not isinstance(pm, models.PaymentMethod):
                pm = models.PaymentMethod(pm)
        except Exception:
            try:
                pm = models.PaymentMethod[pm.upper()]
            except Exception:
                raise ValueError("Invalid payment method")

        payment = models.AdminPayment(
            package_assignment_id=data.package_assignment_id,
            student_id=data.student_id,
            processed_by_admin_id=admin_id,
            amount=getattr(data, "amount", None),
            payment_method=pm,
            payment_date=getattr(data, "payment_date", None),
            status=models.PaymentStatus.PENDING,
            reference_number=getattr(data, "reference_number", None),
        )
        db.add(payment)
        db.flush()
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            ref = getattr(payment, "reference_number", None)
            if ref:
                same_ref = db.execute(
                    select(models.AdminPayment).where(
                        models.AdminPayment.reference_number == ref,
                        models.AdminPayment.status == models.PaymentStatus.COMPLETED,
                    )
                ).scalars().first()
                if same_ref:
                    return same_ref
            raise

        # return a session-bound payment
        return db.get(models.AdminPayment, payment.id)

    @staticmethod
    def confirm_payment(db: Session, payment_id: int, admin_id: int) -> models.AdminPayment:
        # Use a transaction and try to acquire row-level locks when supported
        bind = db.get_bind()
        dialect = getattr(bind, "dialect", None)
        dialect_name = getattr(dialect, "name", None)

        # Select payment with FOR UPDATE when DB supports it
        if dialect_name and dialect_name != "sqlite":
            stmt = select(models.AdminPayment).where(models.AdminPayment.id == payment_id).with_for_update()
        else:
            stmt = select(models.AdminPayment).where(models.AdminPayment.id == payment_id)

        result = db.execute(stmt).scalars().first()
        payment = result
        if not payment:
            raise ValueError("Payment not found")

        # Idempotency: if already completed, return current record
        if payment.status == models.PaymentStatus.COMPLETED:
            return payment

        # If reference_number is provided, ensure no other completed payment exists with same reference
        if getattr(payment, "reference_number", None):
            same_ref = db.execute(
                select(models.AdminPayment).where(
                    models.AdminPayment.reference_number == payment.reference_number,
                    models.AdminPayment.status == models.PaymentStatus.COMPLETED,
                )
            ).scalars().first()
            if same_ref:
                return same_ref

        # Lock assignment as well (if supported) to avoid concurrent activation
        assignment = None
        if payment.package_assignment_id is not None:
            if dialect_name and dialect_name != "sqlite":
                stmt_a = select(models.AdminPackageAssignment).where(
                    models.AdminPackageAssignment.id == payment.package_assignment_id
                ).with_for_update()
            else:
                stmt_a = select(models.AdminPackageAssignment).where(
                    models.AdminPackageAssignment.id == payment.package_assignment_id
                )
            assignment = db.execute(stmt_a).scalars().first()

        # Apply state changes atomically
        payment.status = models.PaymentStatus.COMPLETED
        payment.confirmation_date = datetime.now(timezone.utc)
        payment.confirmed_by_admin_id = admin_id
        db.add(payment)

        if assignment and assignment.auto_activate_on_payment:
            assignment.status = models.PackageAssignmentStatus.ACTIVE
            db.add(assignment)

        db.commit()
        # After commit, return a session-bound instance
        return db.get(models.AdminPayment, payment.id)

