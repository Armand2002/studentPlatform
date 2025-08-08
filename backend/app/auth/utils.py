"""
Authentication utilities
"""
import secrets
import string
from datetime import datetime, timedelta

def generate_verification_token() -> str:
    """Generate a secure verification token"""
    return secrets.token_urlsafe(32)

def generate_password_reset_token() -> str:
    """Generate a secure password reset token"""
    return secrets.token_urlsafe(32)

def is_token_expired(expires_at: datetime) -> bool:
    """Check if token is expired"""
    return datetime.utcnow() > expires_at

def generate_random_password(length: int = 12) -> str:
    """Generate a random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))
