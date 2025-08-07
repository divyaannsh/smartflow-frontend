import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Send,
  Group,
  Person,
  Close,
  Chat,
  ExpandMore,
  ExpandLess,
  Refresh,
  Settings,
  EmojiEmotions,
  AdminPanelSettings,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/apiService';
import { User } from '../types';
import { simulateAdminMessage } from '../services/notificationService';
import { notificationService } from '../services/notificationService';

interface ChatMessage {
  id: string;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface TeamChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamChat: React.FC<TeamChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [isAdminMessage, setIsAdminMessage] = useState(false);
  const [adminMessageType, setAdminMessageType] = useState<'general' | 'announcement' | 'urgent'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Load users and initialize chat
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      initializeChat();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const usersData = await usersService.getAll();
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const initializeChat = () => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Welcome to the team chat! This is a space for team collaboration and communication.`,
        senderId: 0,
        senderName: 'System',
        senderAvatar: '🔔',
        timestamp: new Date(),
        isSystem: true,
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      senderId: user.id,
      senderName: user.full_name,
      senderAvatar: user.full_name.charAt(0),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate sending message to server
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If admin sends message in general channel, send notifications to all users
      if (user.role === 'admin' && selectedChannel === 'general') {
        // Send notification to all users (except admin)
        const targetUsers = users.filter(u => u.id !== user.id).map(u => u.id);
        
        // Simulate admin message notification
        simulateAdminMessage(
          inputMessage,
          user.id,
          user.full_name,
          targetUsers
        );

        // Add system message to chat
        const systemMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `📢 Admin message sent to ${targetUsers.length} users as notification`,
          senderId: 0,
          senderName: 'System',
          senderAvatar: '🔔',
          timestamp: new Date(),
          isSystem: true,
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, systemMessage]);
        }, 1000);

        // If admin sends message in general channel, send email notification
        if (user.role === 'admin' && selectedChannel === 'general') {
          try {
            // Get all user IDs for email notification
            const allUserIds = users.map(u => u.id).filter(id => id !== user.id);
            
            if (allUserIds.length > 0) {
              await notificationService.sendAdminMessageEmail(
                `Admin Message - ${selectedChannel}`,
                inputMessage,
                allUserIds
              );
              console.log('Admin message email sent successfully');
            }
          } catch (emailError) {
            console.error('Failed to send admin message email:', emailError);
            // Don't fail the chat message if email fails
          }
        }
      }
      
      // If this is an admin message, send notifications to users
      if (isAdminMessage && user.role === 'admin') {
        // Send notification to all users (except admin)
        const targetUsers = users.filter(u => u.id !== user.id).map(u => u.id);
        
        // Simulate admin message notification
        simulateAdminMessage(
          inputMessage,
          user.id,
          user.full_name,
          targetUsers
        );

        // Add system message to chat
        const systemMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `📢 Admin message sent to ${targetUsers.length} users`,
          senderId: 0,
          senderName: 'System',
          senderAvatar: '🔔',
          timestamp: new Date(),
          isSystem: true,
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, systemMessage]);
        }, 1000);
      }
      
      // Simulate other users responding (for demo purposes)
      if (Math.random() > 0.7 && !isAdminMessage && user.role !== 'admin') {
        const otherUsers = users.filter(u => u.id !== user.id);
        if (otherUsers.length > 0) {
          const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
          const responseMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: generateRandomResponse(inputMessage),
            senderId: randomUser.id,
            senderName: randomUser.full_name,
            senderAvatar: randomUser.full_name.charAt(0),
            timestamp: new Date(),
          };
          
          setTimeout(() => {
            setMessages(prev => [...prev, responseMessage]);
          }, 1000 + Math.random() * 2000);
        }
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
      setIsAdminMessage(false); // Reset admin message mode
    }
  };

  const generateRandomResponse = (message: string): string => {
    const responses = [
      "That's a great point!",
      "I agree with that.",
      "Thanks for sharing!",
      "Let me think about that...",
      "Interesting perspective!",
      "I'll look into that.",
      "Good idea!",
      "We should discuss this further.",
      "I'm on it!",
      "Thanks for the update!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    initializeChat();
  };

  const getMessageAlignment = (senderId: number) => {
    return senderId === user?.id ? 'flex-end' : 'flex-start';
  };

  const getMessageColor = (senderId: number, isSystem?: boolean) => {
    if (isSystem) return 'warning.main';
    if (senderId === user?.id) return 'primary.main';
    return 'grey.500';
  };

  const channels = [
    { id: 'general', name: 'General', icon: '💬' },
    { id: 'projects', name: 'Projects', icon: '📁' },
    { id: 'tasks', name: 'Tasks', icon: '✅' },
    { id: 'random', name: 'Random', icon: '🎲' },
  ];

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMinimized ? 'auto' : '80vh',
          maxHeight: '80vh',
          position: 'fixed',
          bottom: 20,
          right: 20,
          m: 0,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Group sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Team Chat</Typography>
            <FormControl size="small" sx={{ ml: 2, minWidth: 120 }}>
              <Select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                displayEmpty
              >
                {channels.map((channel) => (
                  <MenuItem key={channel.id} value={channel.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 8 }}>{channel.icon}</span>
                      {channel.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Notification indicator for admin in general channel */}
            {user?.role === 'admin' && selectedChannel === 'general' && (
              <Chip
                label="📢 Notifications"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
            
            {/* Admin Message Controls */}
            {user?.role === 'admin' && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isAdminMessage}
                      onChange={(e) => setIsAdminMessage(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminPanelSettings sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption">Admin Message</Typography>
                    </Box>
                  }
                />
                {isAdminMessage && (
                  <FormControl size="small" sx={{ ml: 1, minWidth: 100 }}>
                    <Select
                      value={adminMessageType}
                      onChange={(e) => setAdminMessageType(e.target.value as any)}
                      displayEmpty
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="announcement">Announcement</MenuItem>
                      <MenuItem value="urgent">Urgent</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}
          </Box>
          <Box>
            <Tooltip title="Minimize">
              <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <ExpandMore /> : <ExpandLess />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Chat">
              <IconButton size="small" onClick={clearChat}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton size="small" onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      {!isMinimized && (
        <>
          <DialogContent sx={{ p: 2, pb: 1, flex: 1, overflow: 'auto' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: getMessageAlignment(message.senderId),
                    p: 0,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '80%',
                      flexDirection: getMessageAlignment(message.senderId) === 'flex-end' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        bgcolor: getMessageColor(message.senderId, message.isSystem),
                        mr: getMessageAlignment(message.senderId) === 'flex-end' ? 0 : 1,
                        ml: getMessageAlignment(message.senderId) === 'flex-end' ? 1 : 0,
                      }}
                    >
                      {message.senderAvatar}
                    </Avatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.senderId === user?.id ? 'primary.main' : 'grey.100',
                        color: message.senderId === user?.id ? 'white' : 'text.primary',
                        borderRadius: 2,
                        maxWidth: '100%',
                        border: message.isSystem ? '1px solid #ff9800' : 'none',
                      }}
                    >
                      {!message.isSystem && (
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.7 }}>
                          {message.senderName}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          textAlign: 'right',
                        }}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start', p: 0, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                      {user?.full_name?.charAt(0) || 'U'}
                    </Avatar>
                    <Paper sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          Sending...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </ListItem>
              )}
              <div ref={messagesEndRef} />
            </List>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2, pt: 1 }}>
            <TextField
              ref={inputRef}
              fullWidth
              variant="outlined"
              placeholder={
                isAdminMessage 
                  ? `Send ${adminMessageType} message to all users...` 
                  : user?.role === 'admin' && selectedChannel === 'general'
                  ? "Type message (will send notifications to all users)..."
                  : "Type your message..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderColor: isAdminMessage ? 'warning.main' : 
                              user?.role === 'admin' && selectedChannel === 'general' ? 'info.main' : undefined,
                  '&:hover': {
                    borderColor: isAdminMessage ? 'warning.dark' : 
                                user?.role === 'admin' && selectedChannel === 'general' ? 'info.dark' : undefined,
                  },
                },
              }}
              InputProps={{
                startAdornment: (isAdminMessage || (user?.role === 'admin' && selectedChannel === 'general')) && (
                  <Notifications sx={{ mr: 1, color: isAdminMessage ? 'warning.main' : 'info.main' }} />
                ),
                endAdornment: (
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    color={isAdminMessage ? "warning" : 
                           user?.role === 'admin' && selectedChannel === 'general' ? "info" : "primary"}
                  >
                    <Send />
                  </IconButton>
                ),
              }}
            />
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default TeamChat; 