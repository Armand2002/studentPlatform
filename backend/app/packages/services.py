"""
Packages business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.packages import models, schemas
from app.users.models import Tutor
from typing import List, Optional
from datetime import datetime, date

class PackageService:
    """Service for package management"""
    
    @staticmethod
    async def create_package(db: Session, package_data: schemas.PackageCreate) -> models.Package:
        """Create a new package"""
        package = models.Package(
            tutor_id=package_data.tutor_id,
            name=package_data.name,
            description=package_data.description,
            total_hours=package_data.total_hours,
            price=package_data.price,
            subject=package_data.subject,
            is_active=package_data.is_active
        )
        db.add(package)
        db.commit()
        db.refresh(package)
        return package
    
    @staticmethod
    async def get_package_by_id(db: Session, package_id: int) -> Optional[models.Package]:
        """Get package by ID"""
        return db.query(models.Package).filter(models.Package.id == package_id).first()
    
    @staticmethod
    async def get_packages_by_tutor(db: Session, tutor_id: int, skip: int = 0, limit: int = 100) -> List[models.Package]:
        """Get all packages for a specific tutor"""
        return db.query(models.Package).filter(
            and_(
                models.Package.tutor_id == tutor_id,
                models.Package.is_active == True
            )
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_all_active_packages(db: Session, skip: int = 0, limit: int = 100) -> List[models.Package]:
        """Get all active packages"""
        return db.query(models.Package).filter(
            models.Package.is_active == True
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_packages_by_subject(db: Session, subject: str, skip: int = 0, limit: int = 100) -> List[models.Package]:
        """Get packages by subject"""
        return db.query(models.Package).filter(
            and_(
                models.Package.subject == subject,
                models.Package.is_active == True
            )
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def update_package(db: Session, package_id: int, package_data: schemas.PackageUpdate) -> Optional[models.Package]:
        """Update package information"""
        package = await PackageService.get_package_by_id(db, package_id)
        if not package:
            return None
        
        update_data = package_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(package, field, value)
        
        package.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(package)
        return package
    
    @staticmethod
    async def delete_package(db: Session, package_id: int) -> bool:
        """Delete package (soft delete by setting is_active to False)"""
        package = await PackageService.get_package_by_id(db, package_id)
        if not package:
            return False
        
        package.is_active = False
        package.updated_at = datetime.utcnow()
        db.commit()
        return True
    
    @staticmethod
    async def get_package_with_tutor_info(db: Session, package_id: int) -> Optional[models.Package]:
        """Get package with tutor information"""
        return db.query(models.Package).filter(models.Package.id == package_id).first()

class PackagePurchaseService:
    """Service for package purchase management"""
    
    @staticmethod
    async def create_package_purchase(db: Session, purchase_data: schemas.PackagePurchaseCreate) -> models.PackagePurchase:
        """Create a new package purchase"""
        # Get package to set initial hours_remaining
        package = await PackageService.get_package_by_id(db, purchase_data.package_id)
        if not package:
            raise ValueError("Package not found")
        
        purchase = models.PackagePurchase(
            student_id=purchase_data.student_id,
            package_id=purchase_data.package_id,
            expiry_date=purchase_data.expiry_date,
            hours_remaining=package.total_hours,  # Start with total hours from package
            is_active=purchase_data.is_active
        )
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        return purchase
    
    @staticmethod
    async def get_purchase_by_id(db: Session, purchase_id: int) -> Optional[models.PackagePurchase]:
        """Get package purchase by ID"""
        return db.query(models.PackagePurchase).filter(models.PackagePurchase.id == purchase_id).first()
    
    @staticmethod
    async def get_student_purchases(db: Session, student_id: int, skip: int = 0, limit: int = 100) -> List[models.PackagePurchase]:
        """Get all purchases for a specific student"""
        return db.query(models.PackagePurchase).filter(
            and_(
                models.PackagePurchase.student_id == student_id,
                models.PackagePurchase.is_active == True
            )
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_active_purchases_by_student(db: Session, student_id: int) -> List[models.PackagePurchase]:
        """Get active purchases for a student (not expired and with remaining hours)"""
        today = date.today()
        return db.query(models.PackagePurchase).filter(
            and_(
                models.PackagePurchase.student_id == student_id,
                models.PackagePurchase.is_active == True,
                models.PackagePurchase.expiry_date >= today,
                models.PackagePurchase.hours_remaining > 0
            )
        ).all()
    
    @staticmethod
    async def update_purchase_hours(db: Session, purchase_id: int, hours_used: int) -> Optional[models.PackagePurchase]:
        """Update purchase hours (used when booking a lesson)"""
        purchase = await PackagePurchaseService.get_purchase_by_id(db, purchase_id)
        if not purchase:
            return None
        
        if purchase.hours_remaining < hours_used:
            raise ValueError("Not enough hours remaining")
        
        purchase.hours_used += hours_used
        purchase.hours_remaining -= hours_used
        purchase.updated_at = datetime.utcnow()
        
        # If no hours remaining, deactivate purchase
        if purchase.hours_remaining == 0:
            purchase.is_active = False
        
        db.commit()
        db.refresh(purchase)
        return purchase
    
    @staticmethod
    async def get_purchase_with_details(db: Session, purchase_id: int) -> Optional[models.PackagePurchase]:
        """Get purchase with package details"""
        return db.query(models.PackagePurchase).filter(models.PackagePurchase.id == purchase_id).first()
