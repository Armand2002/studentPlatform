"""
Payments routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user

router = APIRouter()

# TODO: Add payments routes here
