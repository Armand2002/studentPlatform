"""
Files business logic
"""
import os
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.files import models
from app.core.config import settings
from typing import List, Optional
from datetime import datetime
import mimetypes

class FileService:
    """Service for file management"""
    
    @staticmethod
    async def create_file_record(db: Session, tutor_id: int, original_filename: str, 
                               file_path: str, file_size: int, subject: str, 
                               description: str = None, is_public: bool = False) -> models.File:
        """Create a file record in database"""
        mime_type, _ = mimetypes.guess_type(original_filename)
        if not mime_type:
            mime_type = "application/octet-stream"
        
        file_record = models.File(
            tutor_id=tutor_id,
            filename=os.path.basename(file_path),
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            subject=subject,
            description=description,
            is_public=is_public
        )
        db.add(file_record)
        db.commit()
        db.refresh(file_record)
        return file_record
    
    @staticmethod
    async def get_file_by_id(db: Session, file_id: int) -> Optional[models.File]:
        """Get file by ID"""
        return db.query(models.File).filter(models.File.id == file_id).first()
    
    @staticmethod
    async def get_tutor_files(db: Session, tutor_id: int, skip: int = 0, limit: int = 100) -> List[models.File]:
        """Get all files for a specific tutor"""
        return db.query(models.File).filter(
            models.File.tutor_id == tutor_id
        ).order_by(models.File.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_public_files_by_subject(db: Session, subject: str, skip: int = 0, limit: int = 100) -> List[models.File]:
        """Get public files by subject"""
        return db.query(models.File).filter(
            and_(
                models.File.subject == subject,
                models.File.is_public == True
            )
        ).order_by(models.File.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_files_by_subject(db: Session, subject: str, skip: int = 0, limit: int = 100) -> List[models.File]:
        """Get all files by subject (for tutors)"""
        return db.query(models.File).filter(
            models.File.subject == subject
        ).order_by(models.File.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    async def update_file(db: Session, file_id: int, subject: str = None, 
                         description: str = None, is_public: bool = None) -> Optional[models.File]:
        """Update file information"""
        file_record = await FileService.get_file_by_id(db, file_id)
        if not file_record:
            return None
        
        if subject is not None:
            file_record.subject = subject
        if description is not None:
            file_record.description = description
        if is_public is not None:
            file_record.is_public = is_public
        
        file_record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(file_record)
        return file_record
    
    @staticmethod
    async def delete_file(db: Session, file_id: int) -> bool:
        """Delete file record and physical file"""
        file_record = await FileService.get_file_by_id(db, file_id)
        if not file_record:
            return False
        
        # Delete physical file
        try:
            if os.path.exists(file_record.file_path):
                os.remove(file_record.file_path)
        except OSError:
            pass  # File might not exist
        
        # Delete database record
        db.delete(file_record)
        db.commit()
        return True
    
    @staticmethod
    async def get_file_path(file_record: models.File) -> str:
        """Get full file path"""
        return file_record.file_path
    
    @staticmethod
    async def is_file_accessible(file_record: models.File, user_id: int, user_role: str) -> bool:
        """Check if user can access the file"""
        # Public files are accessible to everyone
        if file_record.is_public:
            return True
        
        # Tutors can access their own files
        if user_role == "tutor" and file_record.tutor_id == user_id:
            return True
        
        # Admins can access all files
        if user_role == "admin":
            return True
        
        return False
    
    @staticmethod
    async def generate_unique_filename(original_filename: str) -> str:
        """Generate unique filename to avoid conflicts"""
        name, ext = os.path.splitext(original_filename)
        unique_id = str(uuid.uuid4())[:8]
        return f"{name}_{unique_id}{ext}"
    
    @staticmethod
    async def get_upload_directory() -> str:
        """Get upload directory path"""
        upload_dir = os.path.join(settings.UPLOAD_DIR, "tutoring")
        os.makedirs(upload_dir, exist_ok=True)
        return upload_dir
    
    @staticmethod
    async def validate_file_type(filename: str) -> bool:
        """Validate file type based on extension"""
        _, ext = os.path.splitext(filename.lower())
        return ext in settings.ALLOWED_FILE_TYPES
    
    @staticmethod
    async def validate_file_size(file_size: int) -> bool:
        """Validate file size"""
        return file_size <= settings.MAX_FILE_SIZE
