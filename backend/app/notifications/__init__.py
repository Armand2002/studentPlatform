"""
Notifications module
"""
from .routes import router
from .service import notification_manager

__all__ = ["router", "notification_manager"]
