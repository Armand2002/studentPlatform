"""
Notification schemas
"""
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class NotificationBase(BaseModel):
    """Base notification model"""
    type: Literal['info', 'success', 'warning', 'error'] = 'info'
    title: str
    message: str


class NotificationAction(BaseModel):
    """Notification action"""
    label: str
    href: str


class NotificationCreate(NotificationBase):
    """Create notification"""
    action: Optional[NotificationAction] = None


class NotificationResponse(NotificationBase):
    """Notification response"""
    id: str
    timestamp: datetime
    read: bool = False
    action: Optional[NotificationAction] = None

    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    """Update notification"""
    read: bool


class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    type: Literal['notification', 'ping', 'pong'] = 'notification'
    data: Optional[dict] = None
