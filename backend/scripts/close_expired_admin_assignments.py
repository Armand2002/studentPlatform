"""Close expired or fully-used admin package assignments.

Run this script periodically (cron / scheduled task) or from a dockerized management container. It will:
 - Mark ACTIVE assignments as COMPLETED when hours_remaining <= 0
 - Mark ACTIVE assignments as COMPLETED when activated_at <= now - 31 days

Usage: python scripts/close_expired_admin_assignments.py
"""
from datetime import datetime, timedelta, timezone
import logging
import os
import sys

from sqlalchemy import and_
from app.core.database import SessionLocal
from app.admin import models

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

THRESHOLD_DAYS = int(os.environ.get("ADMIN_ASSIGNMENT_CLOSE_DAYS", "31"))


def close_assignments():
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=THRESHOLD_DAYS)

    db = SessionLocal()
    try:
        # Close by hours_remaining <= 0
        q1 = db.query(models.AdminPackageAssignment).filter(
            models.AdminPackageAssignment.status == models.PackageAssignmentStatus.ACTIVE,
            models.AdminPackageAssignment.hours_remaining <= 0,
        )
        to_close_1 = q1.all()

        # Close by activated_at older than cutoff (only if activated_at is set)
        q2 = db.query(models.AdminPackageAssignment).filter(
            models.AdminPackageAssignment.status == models.PackageAssignmentStatus.ACTIVE,
            models.AdminPackageAssignment.activated_at != None,
            models.AdminPackageAssignment.activated_at <= cutoff,
        )
        to_close_2 = q2.all()

        total = 0
        for a in set(to_close_1 + to_close_2):
            a.status = models.PackageAssignmentStatus.COMPLETED
            a.completed_at = now
            db.add(a)
            total += 1

        if total > 0:
            db.commit()
            logger.info(f"Closed {total} admin package assignments (hours/expiry)")
        else:
            logger.info("No admin package assignments to close")

    except Exception:
        logger.exception("Failed while closing admin package assignments")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    close_assignments()
