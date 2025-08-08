"""
Authentication models
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

# Authentication models are now in users.models to avoid duplication
# This file can be used for auth-specific models in the future
