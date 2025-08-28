"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth import schemas, services
from app.auth.dependencies import get_current_user
from app.users.models import UserRole
from app.auth.dependencies import get_current_user

router = APIRouter()

from fastapi import Body
from pydantic import ValidationError

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Register a new user with complete profile (role-based schema validation)"""
    try:
        role = data.get("role")
        if role == UserRole.STUDENT or role == "student":
            registration_data = schemas.StudentRegistration(**data)
        elif role == UserRole.TUTOR or role == "tutor":
            registration_data = schemas.TutorRegistration(**data)
        else:
            raise HTTPException(status_code=422, detail="Invalid role")

        user = services.create_user_with_profile(db, registration_data)
        tokens = services.authenticate_user(db, user.email, registration_data.password)
        return tokens
    except ValidationError as ve:
        raise HTTPException(status_code=422, detail=ve.errors())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Temporary: print exception to logs to aid debugging in smoke tests
        import traceback
        print('Registration exception:', e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=schemas.Token)
async def login_user(
    form_data: schemas.LoginForm,
    db: Session = Depends(get_db)
):
    """Login user and return tokens"""
    try:
        tokens = services.authenticate_user(db, form_data.username, form_data.password)
        return tokens
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    try:
        tokens = services.refresh_access_token(db, refresh_token)
        return tokens
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@router.post("/logout", response_model=None)
async def logout_user(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Logout user"""
    services.logout_user(db, current_user.id)
    return {"message": "Successfully logged out"}

@router.post("/password-reset-request", response_model=None)
def request_password_reset(request: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """Request password reset"""
    return services.request_password_reset(db, request.email)

@router.post("/password-reset", response_model=None)
def reset_password(reset_data: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Reset password with token"""
    return services.reset_password(db, reset_data.token, reset_data.new_password)

@router.get("/me", response_model=schemas.User)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    # Convert SQLAlchemy user to Pydantic schema
    return schemas.User(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )
