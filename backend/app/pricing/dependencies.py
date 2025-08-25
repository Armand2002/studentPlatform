"""
Pricing module dependencies
"""
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User, UserRole

def require_pricing_access(current_user: User = Depends(get_current_user)):
    """Require admin or tutor access for pricing operations"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Pricing access requires admin or tutor role")
    return current_user

def require_pricing_admin(current_user: User = Depends(get_current_user)):
    """Require admin access for pricing management"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Pricing management requires admin role")
    return current_user
