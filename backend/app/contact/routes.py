"""
Contact form routes
"""
from fastapi import APIRouter
from datetime import datetime
import uuid

from . import schemas


router = APIRouter()


@router.post("/", response_model=schemas.ContactResponse, tags=["Contact"])
async def submit_contact_form(
    contact_data: schemas.ContactRequest
):
    """Submit contact form"""
    # Generate reference ID for tracking
    reference_id = f"CONTACT_{uuid.uuid4().hex[:8].upper()}"
    
    # Log contact form submission
    print(f"📧 Contact form submitted:")
    print(f"   Reference: {reference_id}")
    print(f"   From: {contact_data.name} <{contact_data.email}>")
    print(f"   Subject: {contact_data.subject}")
    print(f"   Message: {contact_data.message[:100]}...")
    print(f"   Timestamp: {contact_data.timestamp or datetime.now()}")
    
    # TODO: In production, integrate with email service (SendGrid, etc.)
    # TODO: Store in database for admin review
    # TODO: Send auto-reply to user
    # TODO: Notify admin team
    
    return schemas.ContactResponse(
        success=True,
        message="Messaggio ricevuto correttamente. Ti risponderemo al più presto!",
        reference_id=reference_id
    )


@router.get("/health", tags=["Contact"])
async def contact_health():
    """Health check for contact service"""
    return {"status": "ok", "service": "contact"}
