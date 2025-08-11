"""
Analytics routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta, date

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User, UserRole, Student, Tutor
from app.packages.models import Package
from app.bookings.models import Booking, BookingStatus
from app.payments.models import Payment

router = APIRouter()


def _require_admin(current_user: User):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")


@router.get("/metrics")
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_tutors = db.query(func.count(Tutor.id)).scalar() or 0
    total_packages = db.query(func.count(Package.id)).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0

    # Completed in last 24h
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)
    completed_24h = (
        db.query(func.count(Booking.id))
        .filter(
            and_(
                Booking.end_time < now,
                Booking.end_time >= last_24h,
                Booking.status == BookingStatus.COMPLETED,
            )
        )
        .scalar()
        or 0
    )

    # Revenue in last 30 days
    last_30d = now - timedelta(days=30)
    revenue_cents_30d = (
        db.query(func.coalesce(func.sum(Payment.amount_cents), 0))
        .filter(and_(Payment.created_at >= last_30d, Payment.status == "succeeded"))
        .scalar()
        or 0
    )

    return {
        "students": total_students,
        "tutors": total_tutors,
        "packages": total_packages,
        "bookings": total_bookings,
        "completed_24h": completed_24h,
        "revenue_cents_30d": revenue_cents_30d,
    }


@router.get("/trends")
async def get_trends(
    days: int = 14,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(current_user)

    days = max(1, min(days, 60))
    today = datetime.utcnow().date()
    start_day = today - timedelta(days=days - 1)

    # Initialize dicts for all days
    labels = []
    completed_map = {}
    upcoming_map = {}
    for i in range(days):
        d = start_day + timedelta(days=i)
        labels.append(d.isoformat())
        completed_map[d] = 0
        upcoming_map[d] = 0

    # Completed bookings grouped by day
    completed_rows = (
        db.query(func.date(Booking.end_time).label("d"), func.count(Booking.id))
        .filter(
            and_(
                func.date(Booking.end_time) >= start_day,
                func.date(Booking.end_time) <= today,
                Booking.status == BookingStatus.COMPLETED,
            )
        )
        .group_by(func.date(Booking.end_time))
        .all()
    )
    for d, c in completed_rows:
        if d in completed_map:
            completed_map[d] = c

    # Upcoming (scheduled) bookings grouped by start day within range
    upcoming_rows = (
        db.query(func.date(Booking.start_time).label("d"), func.count(Booking.id))
        .filter(
            and_(
                func.date(Booking.start_time) >= start_day,
                func.date(Booking.start_time) <= today,
            )
        )
        .group_by(func.date(Booking.start_time))
        .all()
    )
    for d, c in upcoming_rows:
        if d in upcoming_map:
            upcoming_map[d] = c

    completed_series = [completed_map[start_day + timedelta(days=i)] for i in range(days)]
    upcoming_series = [upcoming_map[start_day + timedelta(days=i)] for i in range(days)]

    # Return labels in MM-DD to match FE compact display
    labels_compact = [d[5:] for d in labels]
    return {"labels": labels_compact, "completed": completed_series, "upcoming": upcoming_series}
