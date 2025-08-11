"""
Payments models
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount_cents = Column(Integer, nullable=False)
    currency = Column(String(3), nullable=False, default="EUR")
    status = Column(String(20), nullable=False, default="pending")
    provider = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    external_id = Column(String(100), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

