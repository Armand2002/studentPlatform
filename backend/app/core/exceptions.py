"""
Custom exception handlers
"""
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

class TutoringException(Exception):
    """Base exception for tutoring platform"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class UserNotFound(TutoringException):
    """User not found exception"""
    def __init__(self):
        super().__init__("User not found", 404)

class BookingNotFound(TutoringException):
    """Booking not found exception"""
    def __init__(self):
        super().__init__("Booking not found", 404)

class InsufficientPermissions(TutoringException):
    """Insufficient permissions exception"""
    def __init__(self):
        super().__init__("Insufficient permissions", 403)

async def tutoring_exception_handler(request: Request, exc: TutoringException):
    """Handle custom tutoring exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message}
    )
