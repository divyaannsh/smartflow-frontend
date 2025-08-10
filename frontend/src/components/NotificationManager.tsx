import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import PopupNotification from './PopupNotification';
import { notificationManager, UserNotification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationManagerProps {
  children?: React.ReactNode;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [popupNotifications, setPopupNotifications] = useState<UserNotification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const notificationQueueRef = useRef<UserNotification[]>([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to notification changes
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Load initial notifications
    setNotifications(notificationManager.getNotifications());

    // Connect to SSE for real-time notifications
    connectToSSE();

    return () => {
      unsubscribe();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user]);

  const connectToSSE = async () => {
    try {
      const apiModule = await import('../services/apiService');
      const baseURL = (apiModule as any).default.defaults.baseURL?.replace(/\/api$/, '') || '';
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Get token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for SSE connection');
        return;
      }

      eventSourceRef.current = new EventSource(`${baseURL}/api/notifications/stream?token=${encodeURIComponent(token)}`);
      
      eventSourceRef.current.addEventListener('notification', (e: MessageEvent) => {
        try {
          const notificationData = JSON.parse(e.data);
          
          // Create a new notification object
          const newNotification: UserNotification = {
            id: notificationData.id.toString(),
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            read: false,
            timestamp: new Date(notificationData.timestamp || Date.now()),
            senderName: notificationData.senderName,
          };

          // Add to notification manager
          notificationManager.addNotification(newNotification);
          
          // Add to popup queue
          addToPopupQueue(newNotification);
          
        } catch (error) {
          console.error('Error parsing notification data:', error);
        }
      });

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectToSSE();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Failed to connect to SSE:', error);
    }
  };

  const addToPopupQueue = (notification: UserNotification) => {
    notificationQueueRef.current.push(notification);
    
    if (!isProcessingRef.current) {
      processNotificationQueue();
    }
  };

  const processNotificationQueue = () => {
    if (notificationQueueRef.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    const notification = notificationQueueRef.current.shift()!;
    
    // Add to popup notifications
    setPopupNotifications(prev => [...prev, notification]);
    
    // Process next notification after a delay
    setTimeout(() => {
      processNotificationQueue();
    }, 1000); // 1 second delay between notifications
  };

  const removePopupNotification = (notificationId: string) => {
    setPopupNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationManager.markAsRead(notificationId);
  };

  // Play notification sound for new notifications
  useEffect(() => {
    if (popupNotifications.length > 0) {
      // You can add sound here if needed
      // const audio = new Audio('/notification-sound.mp3');
      // audio.play().catch(() => {});
    }
  }, [popupNotifications.length]);

  return (
    <>
      {children}
      
      {/* Popup Notifications */}
      <Box sx={{ position: 'fixed', top: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
        {popupNotifications.map((notification, index) => (
          <Box
            key={notification.id}
            sx={{
              position: 'relative',
              pointerEvents: 'auto',
              mb: index > 0 ? 1 : 0,
            }}
          >
            <PopupNotification
              notification={notification}
              onClose={() => removePopupNotification(notification.id)}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
            />
          </Box>
        ))}
      </Box>
    </>
  );
};

export default NotificationManager;
