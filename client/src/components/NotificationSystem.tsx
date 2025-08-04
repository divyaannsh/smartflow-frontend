import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Notifications,
  Assignment,
  Schedule,
  Warning,
  CheckCircle,
  Error,
  Info,
  MoreVert,
} from '@mui/icons-material';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: number) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    handleClose();
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    handleClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
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

  const unreadCount = localNotifications.filter(n => !n.read).length;

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {localNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          localNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.read ? 'normal' : 'bold',
                        flex: 1,
                      }}
                    >
                      {notification.title}
                    </Typography>
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
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {notification.user && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{ width: 16, height: 16, fontSize: '0.75rem' }}
                          >
                            {notification.user.avatar || notification.user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {notification.user.name}
                          </Typography>
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {notification.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}

        {localNotifications.length > 0 && (
          <>
            <Divider />
            <MenuItem>
              <Typography variant="body2" color="primary" textAlign="center" sx={{ width: '100%' }}>
                View all notifications
              </Typography>
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default NotificationSystem; 