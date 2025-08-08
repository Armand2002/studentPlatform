"""
Authentication business logic
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta

# Import all models to ensure relationships are resolved
from app.core import models  # This imports all models first
from app.users import models as user_models  # Use models from users module
from app.auth import schemas
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
import secrets

def create_user(db: Session, user_data: schemas.UserCreate) -> user_models.User:
    """Create a new user"""
    # Check if user exists
    existing_user = db.query(user_models.User).filter(user_models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = user_models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role  # Add role from schema
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> schemas.Token:
    """Authenticate user and return tokens"""
    user = db.query(user_models.User).filter(user_models.User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is not active")
    
    # Create tokens
    access_token = create_access_token(
        subject=user.email,
        data={"email": user.email, "role": user.role.value, "user_id": user.id}
    )
    refresh_token = secrets.token_urlsafe(32)
    
    # Save refresh token
    session = user_models.UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session)
    db.commit()
    
    return schemas.Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

def logout_user(db: Session, user_id: int):
    """Logout user by removing active sessions"""
    # Remove all active sessions for the user
    db.query(user_models.UserSession).filter(
        user_models.UserSession.user_id == user_id
    ).delete()
    db.commit()
    return {"message": "Successfully logged out"}

def refresh_access_token(db: Session, refresh_token: str):
    """Refresh access token using refresh token"""
    # Find valid refresh token
    session = db.query(user_models.UserSession).filter(
        user_models.UserSession.refresh_token == refresh_token,
        user_models.UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Get user
    user = db.query(user_models.User).filter(user_models.User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create new access token
    access_token = create_access_token(
        subject=user.email,
        data={"email": user.email, "role": user.role.value, "user_id": user.id}
    )
    
    return schemas.Token(
        access_token=access_token,
        refresh_token=refresh_token
    )

def request_password_reset(db: Session, email: str):
    """Request password reset"""
    user = db.query(user_models.User).filter(user_models.User.email == email).first()
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, password reset link sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Save reset token
    reset = user_models.PasswordReset(
        user_id=user.id,
        token=reset_token,
        expires_at=datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    )
    db.add(reset)
    db.commit()
    
    # TODO: Send email with reset link
    return {"message": "Password reset link sent to email"}

def reset_password(db: Session, token: str, new_password: str):
    """Reset password with token"""
    # Find valid reset token
    reset = db.query(user_models.PasswordReset).filter(
        user_models.PasswordReset.token == token,
        user_models.PasswordReset.expires_at > datetime.utcnow(),
        user_models.PasswordReset.used == False
    ).first()
    
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Get user
    user = db.query(user_models.User).filter(user_models.User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    
    # Mark reset token as used
    reset.used = True
    
    db.commit()
    
    return {"message": "Password successfully reset"}

# Additional service functions would go here...