"""
WebSocket notification routes
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import HTTPBearer
import logging
import asyncio

from app.auth.dependencies import get_current_user, get_current_user_ws
from app.core.models import User
from .service import notification_manager, start_ping_task
from . import schemas

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

# Flag to track if ping task is running
ping_task_started = False


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
):
    """WebSocket endpoint for real-time notifications"""
    global ping_task_started
    
    try:
        # Get user from token
        user = get_current_user_ws(token)
        if not user:
            await websocket.close(code=4001, reason="Unauthorized")
            return
        
        # Connect user
        await notification_manager.connect(websocket, user.id)
        
        # Start ping task if not already running
        if not ping_task_started:
            ping_task = asyncio.create_task(start_ping_task())
            ping_task_started = True
        
        # Listen for messages
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                
                # Parse message
                try:
                    message = schemas.WebSocketMessage.parse_raw(data)
                    
                    # Handle different message types
                    if message.type == "ping":
                        # Respond with pong
                        pong_message = schemas.WebSocketMessage(type="pong")
                        await websocket.send_text(pong_message.json())
                    
                    # Add more message types as needed
                    
                except Exception as e:
                    logger.error(f"Error parsing WebSocket message: {e}")
                    
        except WebSocketDisconnect:
            pass
            
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=4000, reason="Server error")
    
    finally:
        # Disconnect user
        if 'user' in locals():
            notification_manager.disconnect(websocket, user.id)


@router.get("/connections", tags=["Notifications"])
async def get_connection_stats(
    current_user: User = Depends(get_current_user)
):
    """Get WebSocket connection statistics (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return {
        "connected_users": notification_manager.get_connected_users(),
        "total_connections": notification_manager.get_connection_count(),
        "recent_notifications": len(notification_manager.recent_notifications)
    }


@router.post("/send", tags=["Notifications"])
async def send_notification(
    notification_data: schemas.NotificationCreate,
    target_user_id: int = None,
    target_role: str = None,
    current_user: User = Depends(get_current_user)
):
    """Send notification (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if target_user_id:
        # Send to specific user
        await notification_manager.send_notification_to_user(target_user_id, notification_data)
        return {"message": f"Notification sent to user {target_user_id}"}
    
    elif target_role:
        # Send to all users with role (would need user role mapping)
        # For now, just send to all
        await notification_manager.send_notification_to_all(notification_data)
        return {"message": f"Notification sent to all users with role {target_role}"}
    
    else:
        # Send to all users
        await notification_manager.send_notification_to_all(notification_data)
        return {"message": "Notification sent to all users"}


@router.post("/test", tags=["Notifications"])
async def test_notification(
    current_user: User = Depends(get_current_user)
):
    """Send test notification to current user"""
    test_notification = schemas.NotificationCreate(
        type="info",
        title="Test Notification",
        message="This is a test notification to verify WebSocket integration.",
        action=schemas.NotificationAction(
            label="Dashboard",
            href="/dashboard"
        )
    )
    
    await notification_manager.send_notification_to_user(current_user.id, test_notification)
    
    return {"message": "Test notification sent"}
