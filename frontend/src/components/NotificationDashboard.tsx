import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Warning,
  Error,
  Info,
  ExpandMore,
  ExpandLess,
  Clear,
  MarkEmailRead,
} from '@mui/icons-material';
import { notificationManager, UserNotification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface NotificationDashboardProps {
  maxNotifications?: number;
  showUnreadOnly?: boolean;
}

const NotificationDashboard: React.FC<NotificationDashboardProps> = ({
  maxNotifications = 5,
  showUnreadOnly = false,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Load server notifications once on mount
    (async () => {
      try {
        const apiModule = await import('../services/apiService');
        const res = await (apiModule as any).default.get('/notifications');
        const serverNotifs: UserNotification[] = res.data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          timestamp: new Date(n.timestamp),
          senderName: n.senderName,
        }));
        // Merge server notifications into local manager for unified display
        serverNotifs.forEach((n) => {
          notificationManager.addNotification({
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            senderName: n.senderName,
            timestamp: n.timestamp,
          });
        });
      } catch {}
    })();

    // Subscribe to notification changes
    const unsubscribe = notificationManager.subscribe((allNotifications) => {
      const filtered = showUnreadOnly 
        ? allNotifications.filter(n => !n.read)
        : allNotifications;
      const sorted = [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(sorted.slice(0, maxNotifications));
    });

    // Connect SSE for real-time updates
    let eventSource: EventSource | null = null;
    (async () => {
      try {
        const apiModule = await import('../services/apiService');
        const baseURL = (apiModule as any).default.defaults.baseURL?.replace(/\/api$/, '') || '';
        eventSource = new EventSource(`${baseURL}/api/notifications/stream`);
        eventSource.addEventListener('notification', (e: MessageEvent) => {
          try {
            const n = JSON.parse(e.data);
            notificationManager.addNotification({
              title: n.title,
              message: n.message,
              type: n.type,
              read: false,
              senderName: n.senderName,
            });
          } catch {}
        });
      } catch {}
    })();

    // Initial sync from local
    const allNotifications = notificationManager.getNotifications();
    const filtered = showUnreadOnly 
      ? allNotifications.filter(n => !n.read)
      : allNotifications;
    const sorted = [...filtered].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(sorted.slice(0, maxNotifications));

    return () => {
      unsubscribe();
      if (eventSource) eventSource.close();
    };
  }, [maxNotifications, showUnreadOnly]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationManager.markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    notificationManager.deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'general':
        return <Notifications color="info" />;
      default:
        return <Info color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsActive sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Recent Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  size="small"
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Box>
          <Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkEmailRead />}
                onClick={handleMarkAllAsRead}
                sx={{ mr: 1 }}
              >
                Mark all read
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded || notifications.length <= 3}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  disableTypography
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 'normal' : 'bold',
                          flex: 1,
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {notification.type === 'personal' && (
                        <Chip size="small" label="Personal" color="primary" variant="outlined" />
                      )}
                      {notification.type === 'general' && (
                        <Chip size="small" label="General" color="info" variant="outlined" />
                      )}
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography component="span" variant="body2" color="text.secondary" display="block">
                        {notification.message}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        {notification.senderName && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              sx={{ width: 16, height: 16, fontSize: '0.75rem' }}
                            >
                              {notification.senderName.charAt(0)}
                            </Avatar>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {notification.senderName}
                            </Typography>
                          </Box>
                        )}
                        <Typography component="span" variant="caption" color="text.secondary">
                          {notification.timestamp.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <Box>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{ mr: 1 }}
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {!expanded && notifications.length > 3 && (
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Click to see {notifications.length - 3} more notifications
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationDashboard;

// Ensure this file is treated as a module
export {}; 