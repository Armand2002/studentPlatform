"""
Users routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users import models, schemas, services
from app.users.models import UserRole

router = APIRouter()

# Student routes
@router.post("/students", response_model=schemas.Student, tags=["Students"])
async def create_student(
    student_data: schemas.StudentCreate,
    db: Session = Depends(get_db)
):
    """Create a new student"""
    try:
        return await services.UserService.create_student(db, student_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/students", response_model=List[schemas.Student], tags=["Students"])
async def get_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all students (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return await services.UserService.get_all_students(db, skip, limit)

@router.get("/students/{student_id}", response_model=schemas.StudentWithUser, tags=["Students"])
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get student by ID"""
    # Students can only see their own profile, admins can see all
    if current_user.role == UserRole.STUDENT:
        student = await services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    student = await services.UserService.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student

@router.put("/students/{student_id}", response_model=schemas.Student, tags=["Students"])
async def update_student(
    student_id: int,
    student_data: schemas.StudentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update student information"""
    # Students can only update their own profile, admins can update all
    if current_user.role == UserRole.STUDENT:
        student = await services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    student = await services.UserService.update_student(db, student_id, student_data)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student

@router.delete("/students/{student_id}", tags=["Students"])
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete student (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = await services.UserService.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {"message": "Student deleted successfully"}

# Tutor routes
@router.post("/tutors", response_model=schemas.Tutor, tags=["Tutors"])
async def create_tutor(
    tutor_data: schemas.TutorCreate,
    db: Session = Depends(get_db)
):
    """Create a new tutor"""
    try:
        return await services.UserService.create_tutor(db, tutor_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tutors", response_model=List[schemas.Tutor], tags=["Tutors"])
async def get_tutors(
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all tutors or available tutors only"""
    if available_only:
        return await services.UserService.get_available_tutors(db, skip, limit)
    return await services.UserService.get_all_tutors(db, skip, limit)

@router.get("/tutors/{tutor_id}", response_model=schemas.TutorWithUser, tags=["Tutors"])
async def get_tutor(
    tutor_id: int,
    db: Session = Depends(get_db)
):
    """Get tutor by ID"""
    tutor = await services.UserService.get_tutor_by_id(db, tutor_id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    return tutor

@router.put("/tutors/{tutor_id}", response_model=schemas.Tutor, tags=["Tutors"])
async def update_tutor(
    tutor_id: int,
    tutor_data: schemas.TutorUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update tutor information"""
    # Tutors can only update their own profile, admins can update all
    if current_user.role == UserRole.TUTOR:
        tutor = await services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    tutor = await services.UserService.update_tutor(db, tutor_id, tutor_data)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    return tutor

@router.delete("/tutors/{tutor_id}", tags=["Tutors"])
async def delete_tutor(
    tutor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete tutor (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = await services.UserService.delete_tutor(db, tutor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    return {"message": "Tutor deleted successfully"}

# Current user profile
@router.get("/me", response_model=schemas.User, tags=["Profile"])
async def get_current_user_profile(
    current_user: models.User = Depends(get_current_user)
):
    """Get current user profile"""
    return current_user

@router.get("/me/student", response_model=schemas.Student, tags=["Profile"])
async def get_current_student_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get current student profile"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Student access required")
    
    student = await services.UserService.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return student

@router.get("/me/tutor", response_model=schemas.Tutor, tags=["Profile"])
async def get_current_tutor_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get current tutor profile"""
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Tutor access required")
    
    tutor = await services.UserService.get_tutor_by_user_id(db, current_user.id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
    
    return tutor

@router.post("/me/tutor", response_model=schemas.Tutor, tags=["Profile"], status_code=status.HTTP_201_CREATED)
async def create_current_tutor_profile(
    payload: schemas.TutorSelfCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create tutor profile for the current authenticated user if missing.
    Allowed for users with role student or tutor.
    """
    if current_user.role not in [UserRole.STUDENT, UserRole.TUTOR]:
        raise HTTPException(status_code=403, detail="Only students or tutors can create tutor profile")

    # If profile already exists return it
    existing = await services.UserService.get_tutor_by_user_id(db, current_user.id)
    if existing:
        return existing

    tutor = await services.UserService.create_tutor_for_user(db, current_user.id, payload)
    if not tutor:
        raise HTTPException(status_code=400, detail="Unable to create tutor profile")
    return tutor

@router.get("/tutors/me/students", response_model=List[schemas.StudentWithUser], tags=["Tutors"])
async def get_my_assigned_students(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get students assigned to the current tutor via bookings"""
    # Verifica che l'utente sia un tutor
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Access denied. Only tutors can access this endpoint")
    
    # Ottieni il tutor dal current_user
    tutor = await services.UserService.get_tutor_by_user_id(db, current_user.id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
    
    # Ottieni gli studenti assegnati tramite i bookings
    assigned_students = await services.UserService.get_tutor_assigned_students(db, tutor.id)
    return assigned_students