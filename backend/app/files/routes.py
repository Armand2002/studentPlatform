"""
Files routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.models import UserRole
from app.files import models, schemas, services
from app.users import services as user_services

router = APIRouter()

# File routes
@router.post("/upload", response_model=schemas.File, tags=["Files"])
async def upload_file(
    file: UploadFile = File(...),
    subject: str = None,
    description: str = None,
    is_public: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a file (Tutor only)"""
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Tutor access required")
    
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required")
    
    # Validate file type
    if not await services.FileService.validate_file_type(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Get tutor profile
    tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
    if not tutor:
        raise HTTPException(status_code=404, detail="Tutor profile not found")
    
    # Get upload directory
    upload_dir = await services.FileService.get_upload_directory()
    
    # Generate unique filename
    unique_filename = await services.FileService.generate_unique_filename(file.filename)
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            file_size = len(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Validate file size
    if not await services.FileService.validate_file_size(file_size):
        os.remove(file_path)  # Clean up
        raise HTTPException(status_code=400, detail="File too large")
    
    # Create file record
    try:
        file_record = await services.FileService.create_file_record(
            db, tutor.id, file.filename, file_path, file_size, subject, description, is_public
        )
        return file_record
    except Exception as e:
        os.remove(file_path)  # Clean up
        raise HTTPException(status_code=500, detail=f"Error creating file record: {str(e)}")

@router.get("/", response_model=List[schemas.File], tags=["Files"])
async def get_files(
    subject: str = None,
    tutor_id: int = None,
    public_only: bool = False,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get files with filters"""
    if tutor_id:
        # Check permissions
        if current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor or tutor.id != tutor_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return await services.FileService.get_tutor_files(db, tutor_id, skip, limit)
    elif subject:
        if public_only:
            return await services.FileService.get_public_files_by_subject(db, subject, skip, limit)
        else:
            # Only tutors and admins can see all files by subject
            if current_user.role not in [UserRole.TUTOR, UserRole.ADMIN]:
                raise HTTPException(status_code=403, detail="Access denied")
            return await services.FileService.get_files_by_subject(db, subject, skip, limit)
    else:
        # Users can only see their own files or public files
        if current_user.role == UserRole.TUTOR:
            tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
            if not tutor:
                raise HTTPException(status_code=404, detail="Tutor profile not found")
            return await services.FileService.get_tutor_files(db, tutor.id, skip, limit)
        elif current_user.role == UserRole.STUDENT:
            # Students can only see public files
            if not subject:
                raise HTTPException(status_code=400, detail="Subject is required for students")
            return await services.FileService.get_public_files_by_subject(db, subject, skip, limit)
        else:
            raise HTTPException(status_code=403, detail="Access denied")

@router.get("/public", response_model=List[schemas.File], tags=["Files"])
async def get_public_files(
    subject: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get public files (no authentication required)"""
    if not subject:
        raise HTTPException(status_code=400, detail="Subject is required")
    
    return await services.FileService.get_public_files_by_subject(db, subject, skip, limit)

@router.get("/{file_id}", response_model=schemas.File, tags=["Files"])
async def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get file by ID"""
    file_record = await services.FileService.get_file_by_id(db, file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check access permissions
    if not await services.FileService.is_file_accessible(file_record, current_user.id, current_user.role.value):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return file_record

@router.get("/{file_id}/download", tags=["Files"])
async def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download a file"""
    file_record = await services.FileService.get_file_by_id(db, file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check access permissions
    if not await services.FileService.is_file_accessible(file_record, current_user.id, current_user.role.value):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if file exists
    file_path = await services.FileService.get_file_path(file_record)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=file_record.original_filename,
        media_type=file_record.mime_type
    )

@router.put("/{file_id}", response_model=schemas.File, tags=["Files"])
async def update_file(
    file_id: int,
    file_data: schemas.FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update file information (Tutor who uploaded it or Admin)"""
    file_record = await services.FileService.get_file_by_id(db, file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != file_record.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updated_file = await services.FileService.update_file(
        db, file_id, file_data.subject, file_data.description, file_data.is_public
    )
    return updated_file

@router.delete("/{file_id}", tags=["Files"])
async def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete file (Tutor who uploaded it or Admin)"""
    file_record = await services.FileService.get_file_by_id(db, file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != file_record.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    success = await services.FileService.delete_file(db, file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted successfully"}
