"""
Authentication business logic
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from app.users import models  # Use models from users module
from app.auth import schemas
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
import secrets

async def create_user(db: Session, user_data: schemas.UserCreate) -> models.User:
    """Create a new user"""
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role  # Add role from schema
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

async def authenticate_user(db: Session, email: str, password: str) -> schemas.Token:
    """Authenticate user and return tokens"""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is not active")
    
    # Create tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = secrets.token_urlsafe(32)
    
    # Save refresh token
    session = models.UserSession(
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

# Additional service functions would go here...