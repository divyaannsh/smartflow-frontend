import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Slide,
  Fade,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  Notifications,
  Close,
  Info,
  Warning,
  CheckCircle,
  Error,
  Person,
  VolumeUp,
} from '@mui/icons-material';
import { notificationManager, UserNotification } from '../services/notificationService';

interface PopupNotificationProps {
  notification: UserNotification;
  onClose: () => void;
  onMarkAsRead: () => void;
}

const PopupNotification: React.FC<PopupNotificationProps> = ({
  notification,
  onClose,
  onMarkAsRead,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Auto-hide after 8 seconds unless hovered
    const timer = setTimeout(() => {
      if (!isHovered) {
        setIsVisible(false);
        setTimeout(onClose, 500); // Wait for animation to complete
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isHovered, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead();
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
      case 'general':
        return <VolumeUp color="info" />;
      case 'personal':
        return <Person color="primary" />;
      default:
        return <Info color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'general':
        return 'info.main';
      case 'personal':
        return 'primary.main';
      default:
        return 'info.main';
    }
  };

  return (
    <Slide direction="left" in={isVisible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          maxWidth: 400,
          minWidth: 300,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Fade in={isVisible}>
          <Card
            elevation={8}
            sx={{
              background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}15, ${getNotificationColor(notification.type)}05)`,
              border: `1px solid ${getNotificationColor(notification.type)}30`,
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <CardContent sx={{ p: 2, pb: '16px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: `${getNotificationColor(notification.type)}20`,
                    color: getNotificationColor(notification.type),
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '0.9rem',
                      }}
                    >
                      {notification.title}
                    </Typography>
                    
                    <IconButton
                      size="small"
                      onClick={handleClose}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                        p: 0.5,
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      mb: 1.5,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {notification.senderName && (
                        <Chip
                          label={notification.senderName}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.75rem',
                            height: 24,
                            borderColor: `${getNotificationColor(notification.type)}40`,
                            color: getNotificationColor(notification.type),
                          }}
                        />
                      )}
                      
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontSize: '0.75rem',
                        }}
                      >
                        {new Date(notification.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    
                    {!notification.read && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={handleMarkAsRead}
                        sx={{
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          color: getNotificationColor(notification.type),
                          '&:hover': {
                            backgroundColor: `${getNotificationColor(notification.type)}15`,
                          },
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Slide>
  );
};

export default PopupNotification;
