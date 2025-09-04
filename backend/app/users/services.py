"""
Users business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.users import models, schemas
from app.core.security import get_password_hash  # Use core security instead
from typing import List, Optional
from datetime import datetime

class UserService:
    """Service for user management"""
    
    @staticmethod
    async def create_student(db: Session, student_data: schemas.StudentCreate) -> models.Student:
        """Create a new student with user account"""
        # Create user first
        hashed_password = get_password_hash(student_data.user.password)
        user = models.User(
            email=student_data.user.email,
            hashed_password=hashed_password,
            role=models.UserRole.STUDENT
        )
        db.add(user)
        db.flush()  # Get the user ID
        
        # Create student profile
        student = models.Student(
            user_id=user.id,
            first_name=student_data.first_name,
            last_name=student_data.last_name,
            date_of_birth=student_data.date_of_birth,
            institute=student_data.institute,
            class_level=student_data.class_level,
            phone_number=student_data.phone_number
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student
    
    @staticmethod
    async def create_tutor(db: Session, tutor_data: schemas.TutorCreate) -> models.Tutor:
        """Create a new tutor with user account"""
        # Create user first
        hashed_password = get_password_hash(tutor_data.user.password)
        user = models.User(
            email=tutor_data.user.email,
            hashed_password=hashed_password,
            role=models.UserRole.TUTOR
        )
        db.add(user)
        db.flush()  # Get the user ID
        
        # Create tutor profile
        tutor = models.Tutor(
            user_id=user.id,
            first_name=tutor_data.first_name,
            last_name=tutor_data.last_name,
            bio=tutor_data.bio,
            subjects=tutor_data.subjects,
            is_available=tutor_data.is_available
        )
        db.add(tutor)
        db.commit()
        db.refresh(tutor)
        return tutor

    @staticmethod
    async def create_tutor_for_user(db: Session, user_id: int, payload: schemas.TutorSelfCreate) -> models.Tutor:
        """Create a tutor profile for an existing authenticated user.
        Fails if the user already has a tutor profile or role mismatch.
        """
        # Ensure user exists
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return None

        # If user has student role, allow upgrading role to tutor
        if user.role not in [models.UserRole.TUTOR, models.UserRole.STUDENT]:
            # Admins should not have tutor profile
            return None

        existing = db.query(models.Tutor).filter(models.Tutor.user_id == user_id).first()
        if existing:
            return existing

        # If not already tutor, set role to tutor
        if user.role != models.UserRole.TUTOR:
            user.role = models.UserRole.TUTOR

        tutor = models.Tutor(
            user_id=user.id,
            first_name=payload.first_name,
            last_name=payload.last_name,
            bio=payload.bio,
            subjects=payload.subjects,
            is_available=payload.is_available,
        )
        db.add(tutor)
        db.commit()
        db.refresh(tutor)
        return tutor

    @staticmethod
    async def get_student_by_id(db: Session, student_id: int) -> Optional[models.Student]:
        """Get student by ID"""
        return db.query(models.Student).filter(models.Student.id == student_id).first()
    
    @staticmethod
    async def get_student_by_user_id(db: Session, user_id: int) -> Optional[models.Student]:
        """Get student by user ID"""
        return db.query(models.Student).filter(models.Student.user_id == user_id).first()
    
    @staticmethod
    async def get_tutor_by_id(db: Session, tutor_id: int) -> Optional[models.Tutor]:
        """Get tutor by ID"""
        return db.query(models.Tutor).filter(models.Tutor.id == tutor_id).first()
    
    @staticmethod
    async def get_tutor_by_user_id(db: Session, user_id: int) -> Optional[models.Tutor]:
        """Get tutor by user ID"""
        return db.query(models.Tutor).filter(models.Tutor.user_id == user_id).first()
    
    @staticmethod
    async def get_all_students(db: Session, skip: int = 0, limit: int = 100) -> List[models.Student]:
        """Get all students with pagination"""
        return db.query(models.Student).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_all_tutors(db: Session, skip: int = 0, limit: int = 100) -> List[models.Tutor]:
        """Get all tutors with pagination"""
        return db.query(models.Tutor).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_available_tutors(db: Session, skip: int = 0, limit: int = 100) -> List[models.Tutor]:
        """Get all available tutors"""
        return db.query(models.Tutor).filter(models.Tutor.is_available == True).offset(skip).limit(limit).all()
    
    @staticmethod
    async def update_student(db: Session, student_id: int, student_data: schemas.StudentUpdate) -> Optional[models.Student]:
        """Update student information"""
        student = await UserService.get_student_by_id(db, student_id)
        if not student:
            return None
        
        update_data = student_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(student, field, value)
        
        student.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(student)
        return student
    
    @staticmethod
    async def update_tutor(db: Session, tutor_id: int, tutor_data: schemas.TutorUpdate) -> Optional[models.Tutor]:
        """Update tutor information"""
        tutor = await UserService.get_tutor_by_id(db, tutor_id)
        if not tutor:
            return None
        
        update_data = tutor_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tutor, field, value)
        
        tutor.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(tutor)
        return tutor
    
    @staticmethod
    async def delete_student(db: Session, student_id: int) -> bool:
        """Delete student and associated user"""
        student = await UserService.get_student_by_id(db, student_id)
        if not student:
            return False
        
        # Delete associated user
        user = db.query(models.User).filter(models.User.id == student.user_id).first()
        if user:
            db.delete(user)
        
        db.delete(student)
        db.commit()
        return True
    
    @staticmethod
    async def delete_tutor(db: Session, tutor_id: int) -> bool:
        """Delete tutor and associated user"""
        tutor = await UserService.get_tutor_by_id(db, tutor_id)
        if not tutor:
            return False
        
        # Delete associated user
        user = db.query(models.User).filter(models.User.id == tutor.user_id).first()
        if user:
            db.delete(user)
        
        db.delete(tutor)
        db.commit()
        return True
    
    @staticmethod
    async def get_student_with_user(db: Session, student_id: int) -> Optional[models.Student]:
        """Get student with user information"""
        return db.query(models.Student).filter(models.Student.id == student_id).first()
    
    @staticmethod
    async def get_tutor_with_user(db: Session, tutor_id: int) -> Optional[models.Tutor]:
        """Get tutor with user information"""
        return db.query(models.Tutor).filter(models.Tutor.id == tutor_id).first()
    
    @staticmethod
    async def get_tutor_assigned_students(db: Session, tutor_id: int) -> List[models.Student]:
        """Get students assigned to a specific tutor via bookings"""
        from app.bookings.models import Booking
        
        # Query per trovare tutti gli studenti che hanno booking con questo tutor
        students = db.query(models.Student).join(
            Booking, models.Student.id == Booking.student_id
        ).filter(
            Booking.tutor_id == tutor_id
        ).distinct().all()
        
        return students
