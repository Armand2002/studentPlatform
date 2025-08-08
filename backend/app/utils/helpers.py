"""
Helper functions
"""
from datetime import datetime, timezone
from typing import Optional

def utc_now() -> datetime:
    """Get current UTC datetime"""
    return datetime.now(timezone.utc)

def format_currency(amount: float, currency: str = "EUR") -> str:
    """Format currency amount"""
    return f"{amount:.2f} {currency}"
