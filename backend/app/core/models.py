"""
Import all models to make them available for migrations
"""
# Import only from users module to avoid conflicts
from app.users.models import User, Student, Tutor, UserSession, PasswordReset, UserRole
from app.packages.models import Package, PackagePurchase
from app.bookings.models import Booking, BookingStatus
from app.slots.models import Slot
from app.files.models import File

# This file ensures all models are imported and available for Alembic migrations 