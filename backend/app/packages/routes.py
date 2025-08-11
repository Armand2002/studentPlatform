"""
Packages routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.models import UserRole
from app.packages import models, schemas, services
from app.users import services as user_services

router = APIRouter()

# Package routes
@router.post("/", response_model=schemas.Package, tags=["Packages"])
async def create_package(
    package_data: schemas.PackageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new package (Tutor only)"""
    if current_user.role != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Tutor access required")
    
    try:
        return await services.PackageService.create_package(db, package_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.Package], tags=["Packages"])
async def get_packages(
    skip: int = 0,
    limit: int = 100,
    subject: str = None,
    tutor_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all active packages with optional filters"""
    if subject:
        return await services.PackageService.get_packages_by_subject(db, subject, skip, limit)
    elif tutor_id:
        return await services.PackageService.get_packages_by_tutor(db, tutor_id, skip, limit)
    else:
        return await services.PackageService.get_all_active_packages(db, skip, limit)

@router.get("/{package_id}", response_model=schemas.Package, tags=["Packages"])
async def get_package(
    package_id: int,
    db: Session = Depends(get_db)
):
    """Get package by ID"""
    package = await services.PackageService.get_package_by_id(db, package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    return package

@router.put("/{package_id}", response_model=schemas.Package, tags=["Packages"])
async def update_package(
    package_id: int,
    package_data: schemas.PackageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update package (Tutor who created it or Admin)"""
    package = await services.PackageService.get_package_by_id(db, package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != package.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    updated_package = await services.PackageService.update_package(db, package_id, package_data)
    return updated_package

@router.delete("/{package_id}", tags=["Packages"])
async def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete package (Tutor who created it or Admin)"""
    package = await services.PackageService.get_package_by_id(db, package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Check permissions
    if current_user.role == UserRole.TUTOR:
        tutor = await user_services.UserService.get_tutor_by_user_id(db, current_user.id)
        if not tutor or tutor.id != package.tutor_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    success = await services.PackageService.delete_package(db, package_id)
    return {"message": "Package deleted successfully"}

# Package Purchase routes
@router.post("/purchases", response_model=schemas.PackagePurchase, tags=["Package Purchases"])
async def create_package_purchase(
    purchase_data: schemas.PackagePurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a package (Student only)"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Student access required")
    
    try:
        return await services.PackagePurchaseService.create_package_purchase(db, purchase_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/purchases", response_model=List[schemas.PackagePurchase], tags=["Package Purchases"])
async def get_package_purchases(
    skip: int = 0,
    limit: int = 100,
    student_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get package purchases"""
    if student_id:
        # Admin or the student themselves can view specific student purchases
        if current_user.role == UserRole.STUDENT:
            student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
            if not student or student.id != student_id:
                raise HTTPException(status_code=403, detail="Access denied")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return await services.PackagePurchaseService.get_student_purchases(db, student_id, skip, limit)
    else:
        # Students can only see their own purchases
        if current_user.role == UserRole.STUDENT:
            student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
            if not student:
                raise HTTPException(status_code=404, detail="Student profile not found")
            return await services.PackagePurchaseService.get_student_purchases(db, student.id, skip, limit)
        else:
            raise HTTPException(status_code=403, detail="Access denied")

@router.get("/purchases/active", response_model=List[schemas.PackagePurchase], tags=["Package Purchases"])
async def get_active_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get active package purchases for current student"""
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Student access required")
    
    student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    return await services.PackagePurchaseService.get_active_purchases_by_student(db, student.id)

@router.get("/purchases/{purchase_id}", response_model=schemas.PackagePurchaseWithDetails, tags=["Package Purchases"])
async def get_package_purchase(
    purchase_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get package purchase by ID"""
    purchase = await services.PackagePurchaseService.get_purchase_by_id(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Package purchase not found")
    
    # Check permissions
    if current_user.role == UserRole.STUDENT:
        student = await user_services.UserService.get_student_by_user_id(db, current_user.id)
        if not student or student.id != purchase.student_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return purchase
