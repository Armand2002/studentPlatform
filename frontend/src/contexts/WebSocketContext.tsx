// WebSocket context per notifiche real-time
import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';

interface NotificationData {
  id: string;
  type: 'approval_required' | 'approval_completed' | 'new_booking' | 'system_alert';
  title: string;
  message: string;
  userId?: number;
  timestamp: number;
  read: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  notifications: NotificationData[];
  sendMessage: (message: any) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  readonly children: ReactNode;
  readonly enabled?: boolean;
}

export function WebSocketProvider({ children, enabled = true }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const addNotification = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  }, []);

  const handleApprovalUpdate = useCallback((payload: any) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('approval_update', { detail: payload }));
    }
  }, []);

  const handleSystemMessage = useCallback((payload: any) => {
    console.log('System message:', payload);
    addNotification({
      type: 'system_alert',
      title: 'Sistema',
      message: payload.message,
    });
  }, [addNotification]);

  const handleMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'notification':
        addNotification(data.payload);
        break;
      case 'approval_update':
        handleApprovalUpdate(data.payload);
        break;
      case 'system_message':
        handleSystemMessage(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }, [addNotification, handleApprovalUpdate, handleSystemMessage]);

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.log('No access token available for WebSocket connection');
        return;
      }

      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);

        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [enabled, handleMessage, reconnectAttempts, maxReconnectAttempts]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, [socket, isConnected]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [enabled, connect]);

  // Reconnect logic
  useEffect(() => {
    if (reconnectAttempts > 0 && reconnectAttempts <= maxReconnectAttempts) {
      const timer = setTimeout(connect, reconnectDelay);
      return () => clearTimeout(timer);
    }
  }, [reconnectAttempts, connect, maxReconnectAttempts]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const value = useMemo(() => ({
    isConnected,
    notifications,
    sendMessage,
    markAsRead,
    clearNotifications,
    unreadCount,
  }), [isConnected, notifications, sendMessage, markAsRead, clearNotifications, unreadCount]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

// Hook per invalidare cache quando arrivano updates
export function useRealtimeUpdates() {
  useEffect(() => {
    const handleApprovalUpdate = () => {
      // Invalida cache delle approvazioni
      if (typeof window !== 'undefined') {
        const cacheEvent = new CustomEvent('invalidate_cache', { 
          detail: { pattern: 'admin/pending-approvals' } 
        });
        window.dispatchEvent(cacheEvent);
      }
    };

    window.addEventListener('approval_update', handleApprovalUpdate);
    return () => window.removeEventListener('approval_update', handleApprovalUpdate);
  }, []);
}
