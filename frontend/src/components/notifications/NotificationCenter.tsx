import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, clearNotifications, isConnected } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ora';
    if (minutes < 60) return `${minutes}m fa`;
    if (hours < 24) return `${hours}h fa`;
    return `${days}g fa`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_required':
        return '👤';
      case 'approval_completed':
        return '✅';
      case 'new_booking':
        return '📚';
      case 'system_alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          isConnected 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        disabled={!isConnected}
        title={isConnected ? 'Notifiche' : 'WebSocket disconnesso'}
      >
        <Bell className="h-5 w-5" />
        
        {/* Connection indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Badge 
            variant="danger" 
            className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              Notifiche {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Pulisci
                </Button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nessuna notifica</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Mark as read button */}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 p-1 hover:bg-gray-200 rounded"
                              title="Segna come letto"
                            >
                              <Check className="h-3 w-3 text-green-600" />
                            </button>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length > 20 && (
                  <div className="px-4 py-2 text-center border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Visualizzate le prime 20 notifiche
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Connessione: {isConnected ? '🟢 Online' : '🔴 Offline'}
                </p>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      notifications.forEach(n => {
                        if (!n.read) markAsRead(n.id);
                      });
                    }}
                    className="text-xs"
                  >
                    Segna tutto come letto
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
