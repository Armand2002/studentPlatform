"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth import schemas, services
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    return services.create_user(db, user_data)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user and return tokens"""
    return services.authenticate_user(db, form_data.username, form_data.password)

@router.post("/refresh", response_model=schemas.Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token"""
    return services.refresh_access_token(db, refresh_token)

@router.post("/logout")
def logout(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Logout user"""
    return services.logout_user(db, current_user.id)

@router.post("/password-reset-request")
def request_password_reset(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    return services.request_password_reset(db, request.email)

@router.post("/password-reset")
def reset_password(reset_data: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token"""
    return services.reset_password(db, reset_data.token, reset_data.new_password)

@router.get("/me", response_model=schemas.User)
def get_current_user_info(current_user: schemas.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user
