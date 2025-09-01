"""
Import all models to make them available for migrations
"""
# Import only from users module to avoid conflicts
from app.users.models import User, Student, Tutor, UserSession, PasswordReset, UserRole
from app.packages.models import Package, PackagePurchase
from app.bookings.models import Booking, BookingStatus
from app.slots.models import Slot
# `app.files` removed; file-related models are archived. If reintroducing files, re-add import here.
from app.payments.models import Payment
from app.pricing.models import PricingRule, TutorPricingOverride, PricingCalculation, LessonType  # 🆕 NUOVO

# This file ensures all models are imported and available for Alembic migrations 