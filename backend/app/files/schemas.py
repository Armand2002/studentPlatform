"""
File schemas for request/response validation
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base schemas
class FileBase(BaseModel):
    subject: str
    description: Optional[str] = None
    is_public: bool = False

# Create schemas
class FileCreate(FileBase):
    pass

# Update schemas
class FileUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

# Response schemas
class File(FileBase):
    id: int
    tutor_id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FileWithTutor(File):
    tutor_name: str
