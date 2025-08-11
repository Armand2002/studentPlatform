"""
Packages models for tutoring platform
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Package(Base):
    __tablename__ = "packages"
    
    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("tutors.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    total_hours = Column(Integer, nullable=False)  # Numero totale di ore
    price = Column(Numeric(10, 2), nullable=False)  # Prezzo del pacchetto
    subject = Column(String, nullable=False)  # Materia
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tutor = relationship("Tutor", back_populates="packages")
    purchases = relationship("PackagePurchase", back_populates="package")
    links = relationship("PackageResourceLink", back_populates="package", cascade="all, delete-orphan")

class PackagePurchase(Base):
    __tablename__ = "package_purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(Date, nullable=False)  # Data di scadenza del pacchetto
    hours_used = Column(Integer, default=0)  # Ore utilizzate
    hours_remaining = Column(Integer, nullable=False)  # Ore rimanenti
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    student = relationship("Student", back_populates="package_purchases")
    package = relationship("Package", back_populates="purchases")
    bookings = relationship("Booking", back_populates="package_purchase")


class PackageResourceLink(Base):
    __tablename__ = "package_resource_links"

    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    url = Column(Text, nullable=False)
    provider = Column(String, nullable=True)  # onedrive, google, dropbox, mega, wetransfer, other
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    package = relationship("Package", back_populates="links")
