"""
WebSocket notification service
"""
import json
import logging
from datetime import datetime
from typing import List, Dict, Optional
import uuid

from fastapi import WebSocket, WebSocketDisconnect
import asyncio

from . import schemas

logger = logging.getLogger(__name__)


class NotificationManager:
    """Manages WebSocket connections and notifications"""
    
    def __init__(self):
        # Store active connections by user_id
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Store recent notifications for reconnecting users
        self.recent_notifications: Dict[int, List[schemas.NotificationResponse]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept connection and add to active connections"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"WebSocket connected for user {user_id}")
        
        # Send recent notifications to newly connected user
        await self._send_recent_notifications(websocket, user_id)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove connection"""
        if user_id in self.active_connections:
            try:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                logger.info(f"WebSocket disconnected for user {user_id}")
            except ValueError:
                pass
    
    async def send_notification_to_user(
        self, 
        user_id: int, 
        notification: schemas.NotificationCreate
    ):
        """Send notification to specific user"""
        # Create notification response with ID and timestamp
        notification_response = schemas.NotificationResponse(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            **notification.dict()
        )
        
        # Store for recent notifications
        if user_id not in self.recent_notifications:
            self.recent_notifications[user_id] = []
        
        self.recent_notifications[user_id].append(notification_response)
        
        # Keep only last 10 notifications per user
        if len(self.recent_notifications[user_id]) > 10:
            self.recent_notifications[user_id] = self.recent_notifications[user_id][-10:]
        
        # Send to active connections
        if user_id in self.active_connections:
            message = schemas.WebSocketMessage(
                type="notification",
                data=notification_response.dict()
            )
            
            # Send to all connections for this user
            disconnected_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message.json())
                except:
                    disconnected_connections.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected_connections:
                self.disconnect(conn, user_id)
    
    async def send_notification_to_all(self, notification: schemas.NotificationCreate):
        """Send notification to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_notification_to_user(user_id, notification)
    
    async def send_notification_to_role(
        self, 
        role: str, 
        notification: schemas.NotificationCreate,
        user_roles: Dict[int, str]  # user_id -> role mapping
    ):
        """Send notification to all users with specific role"""
        target_users = [user_id for user_id, user_role in user_roles.items() if user_role == role]
        
        for user_id in target_users:
            await self.send_notification_to_user(user_id, notification)
    
    async def _send_recent_notifications(self, websocket: WebSocket, user_id: int):
        """Send recent notifications to newly connected user"""
        if user_id in self.recent_notifications:
            for notification in self.recent_notifications[user_id]:
                message = schemas.WebSocketMessage(
                    type="notification",
                    data=notification.dict()
                )
                try:
                    await websocket.send_text(message.json())
                except:
                    break
    
    async def ping_all(self):
        """Send ping to all connections to keep alive"""
        ping_message = schemas.WebSocketMessage(type="ping")
        
        for user_id in list(self.active_connections.keys()):
            disconnected_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(ping_message.json())
                except:
                    disconnected_connections.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected_connections:
                self.disconnect(conn, user_id)
    
    def get_connected_users(self) -> List[int]:
        """Get list of currently connected user IDs"""
        return list(self.active_connections.keys())
    
    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return sum(len(connections) for connections in self.active_connections.values())


# Global notification manager instance
notification_manager = NotificationManager()


async def start_ping_task():
    """Start background task to ping connections every 30 seconds"""
    while True:
        try:
            await asyncio.sleep(30)  # Ping every 30 seconds
            await notification_manager.ping_all()
        except Exception as e:
            logger.error(f"Error in ping task: {e}")


# Helper functions for common notification scenarios
async def notify_booking_created(user_id: int, booking_id: str):
    """Notify user about new booking"""
    notification = schemas.NotificationCreate(
        type="success",
        title="Prenotazione Confermata",
        message=f"La tua prenotazione #{booking_id} è stata confermata con successo!",
        action=schemas.NotificationAction(
            label="Vedi Dettagli",
            href=f"/dashboard/bookings/{booking_id}"
        )
    )
    await notification_manager.send_notification_to_user(user_id, notification)


async def notify_booking_cancelled(user_id: int, booking_id: str):
    """Notify user about cancelled booking"""
    notification = schemas.NotificationCreate(
        type="warning",
        title="Prenotazione Cancellata",
        message=f"La prenotazione #{booking_id} è stata cancellata.",
        action=schemas.NotificationAction(
            label="Prenota Nuovo",
            href="/dashboard/bookings/new"
        )
    )
    await notification_manager.send_notification_to_user(user_id, notification)


async def notify_payment_received(user_id: int, amount: float):
    """Notify user about payment received"""
    notification = schemas.NotificationCreate(
        type="success",
        title="Pagamento Ricevuto",
        message=f"Abbiamo ricevuto il tuo pagamento di €{amount:.2f}. Grazie!",
        action=schemas.NotificationAction(
            label="Vedi Fattura",
            href="/dashboard/payments"
        )
    )
    await notification_manager.send_notification_to_user(user_id, notification)


async def notify_new_message(user_id: int, from_user: str):
    """Notify user about new message"""
    notification = schemas.NotificationCreate(
        type="info",
        title="Nuovo Messaggio",
        message=f"Hai ricevuto un nuovo messaggio da {from_user}",
        action=schemas.NotificationAction(
            label="Leggi Messaggio",
            href="/dashboard/messages"
        )
    )
    await notification_manager.send_notification_to_user(user_id, notification)


async def notify_system_maintenance():
    """Notify all users about system maintenance"""
    notification = schemas.NotificationCreate(
        type="warning",
        title="Manutenzione Programmata",
        message="Il sistema sarà in manutenzione dalle 02:00 alle 04:00. Potrebbero verificarsi interruzioni del servizio.",
    )
    await notification_manager.send_notification_to_all(notification)
