"""
Authentication dependencies
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db, SessionLocal
from app.core.security import decode_token
from app.users import models  # Use models from users module

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = decode_token(token)
    if email is None:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_user_ws(token: str) -> models.User:
    """Get current user for WebSocket (without Depends)"""
    email = decode_token(token)
    if email is None:
        return None
    
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        return user
    finally:
        db.close()
