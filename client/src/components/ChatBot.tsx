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
  ListItemText,
  ListItemAvatar,
  Chip,
  Fab,
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
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Chat,
  ExpandMore,
  ExpandLess,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'admin' | 'member';
  timestamp: Date;
  senderName: string;
  senderAvatar?: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'admin' | 'manager' | 'member';
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, userRole }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState('');
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

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Hello ${user?.full_name || 'there'}! I'm your AI assistant. I can help you with:
        
• Project management questions
• Task assignments and updates
• Team collaboration
• System navigation
• General queries

How can I assist you today?`,
        sender: 'ai',
        timestamp: new Date(),
        senderName: 'AI Assistant',
        senderAvatar: '🤖',
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      senderName: user?.full_name || 'You',
      senderAvatar: user?.full_name?.charAt(0) || 'U',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      // Generate AI response using local function
      const aiResponse = await generateAIResponse(inputMessage, userRole);
      
      const aiMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        senderName: 'AI Assistant',
        senderAvatar: '🤖',
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
      console.error('AI Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (message: string, role: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = message.toLowerCase();
    
    // AI response logic based on message content and user role
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm here to help you with your project management tasks. As a ${role}, you have access to various features. What would you like to know?`;
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
      if (role === 'admin') {
        return `I can help you manage projects! As an admin, you can:
• Create and edit projects
• Assign team members
• Monitor project progress
• View project analytics

Would you like me to guide you to the Projects section or help with a specific project task?`;
      } else {
        return `I can help you with projects! You can:
• View your assigned projects
• Check project progress
• Update project status
• Collaborate with team members

Would you like me to show you your current projects?`;
      }
    }
    
    if (lowerMessage.includes('task') || lowerMessage.includes('tasks')) {
      if (role === 'admin') {
        return `Task management for admins includes:
• Creating and assigning tasks
• Monitoring task progress
• Reassigning tasks
• Setting priorities and deadlines
• Viewing task analytics

Would you like me to help you with task assignment or monitoring?`;
      } else {
        return `For your tasks, you can:
• View assigned tasks
• Update task status
• Add comments and progress
• Set time estimates
• Mark tasks as complete

Would you like me to show you your current tasks?`;
      }
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('member')) {
      if (role === 'admin') {
        return `Team management features for admins:
• Add/remove team members
• Assign roles and permissions
• Monitor team performance
• View workload distribution
• Manage user accounts

Would you like me to help you with team management?`;
      } else {
        return `You can view team information:
• See team member profiles
• Check who's working on what
• View team workload
• Collaborate with colleagues

Would you like me to show you the team overview?`;
      }
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return `I'm here to help! Here are some things I can assist with:
• Navigation and feature explanations
• Project and task management
• Team collaboration guidance
• System usage tips
• General questions about the platform

What specific area would you like help with?`;
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
      return `The dashboard provides:
• Overview of your projects and tasks
• Quick statistics and progress
• Recent activities
• Important notifications
• Quick access to key features

Would you like me to explain any specific dashboard feature?`;
    }
    
    // Default response
    return `I understand you're asking about "${message}". As a ${role}, you have access to various features in this project management system. Could you be more specific about what you'd like to know? I can help with projects, tasks, team management, or general navigation.`;
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
  };

  const getMessageAlignment = (sender: string) => {
    return sender === 'user' ? 'flex-end' : 'flex-start';
  };

  const getMessageColor = (sender: string) => {
    switch (sender) {
      case 'user':
        return 'primary.main';
      case 'ai':
        return 'success.main';
      case 'admin':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: isMinimized ? 'auto' : '70vh',
          maxHeight: '70vh',
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
            <SmartToy sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">AI Assistant</Typography>
            <Chip 
              label={userRole} 
              size="small" 
              sx={{ ml: 1 }} 
              color={userRole === 'admin' ? 'error' : 'default'}
            />
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
                    alignItems: getMessageAlignment(message.sender),
                    p: 0,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '80%',
                      flexDirection: getMessageAlignment(message.sender) === 'flex-end' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        bgcolor: getMessageColor(message.sender),
                        mr: getMessageAlignment(message.sender) === 'flex-end' ? 0 : 1,
                        ml: getMessageAlignment(message.sender) === 'flex-end' ? 1 : 0,
                      }}
                    >
                      {message.senderAvatar}
                    </Avatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        maxWidth: '100%',
                      }}
                    >
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
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'success.main' }}>
                      🤖
                    </Avatar>
                    <Paper sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2">AI is thinking...</Typography>
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
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    color="primary"
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

export default ChatBot; 