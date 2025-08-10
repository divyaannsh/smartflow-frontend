import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send,
  Person,
  AdminPanelSettings,
  Chat as ChatIcon,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/apiService';
import { User } from '../types';
// import { simulateAdminMessage } from '../services/notificationService'; // Temporarily disabled
// import { notificationService } from '../services/notificationService'; // Temporarily disabled

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
  timestamp: Date;
  channel: string;
}

const TeamChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', name: 'General', icon: '💬' },
    { id: 'ai-assistant', name: 'AI Assistant', icon: '🤖' },
    { id: 'admin', name: 'Admin Only', icon: '👑' }
  ];

  useEffect(() => {
    loadUsers();
    // Load some sample messages
    setMessages([
      {
        id: '1',
        content: 'Welcome to SmartFlow AI team chat! 👋',
        sender: { id: 0, name: 'System', role: 'system' },
        timestamp: new Date(),
        channel: 'general'
      }
    ]);
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await usersService.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '' && user) {
      const newMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: inputMessage,
        sender: {
          id: user.id,
          name: user.full_name,
          role: user.role
        },
        timestamp: new Date(),
        channel: selectedChannel
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');

      // Simulate AI response for AI Assistant channel
      if (selectedChannel === 'ai-assistant') {
        setTimeout(() => {
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: generateAIResponse(inputMessage),
            sender: {
              id: 999,
              name: 'AI Assistant',
              role: 'ai'
            },
            timestamp: new Date(),
            channel: selectedChannel
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      } else {
        // Simulate admin message for local notification
        // simulateAdminMessage(inputMessage, user.id, user.full_name); // Temporarily disabled
      }
      
      // Email notification temporarily disabled
      // if (user.role === 'admin' && selectedChannel === 'general') {
      //   try {
      //     const allUserIds = users.map(u => u.id).filter(id => id !== user.id);
      //     if (allUserIds.length > 0) {
      //       await notificationService.sendAdminMessageEmail(
      //         `Admin Message - ${selectedChannel}`,
      //         inputMessage,
      //         allUserIds
      //       );
      //       console.log('Admin message email sent successfully');
      //     }
      //   } catch (emailError) {
      //     console.error('Failed to send admin message email:', emailError);
      //   }
      // }
    }
  };

  const generateAIResponse = (message: string): string => {
    const responses = [
      "I understand you're asking about that. Let me help you with that.",
      "That's a great question! Here's what I can tell you about that.",
      "I'm here to help! Could you provide more details about that?",
      "Based on your question, I think the best approach would be...",
      "I'm processing your request. Here's what I found..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const filteredMessages = messages.filter(msg => msg.channel === selectedChannel);

  const canAccessChannel = (channelId: string) => {
    if (channelId === 'admin') {
      return user?.role === 'admin';
    }
    return true;
  };

  return (
    <Paper elevation={3} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
        <ChatIcon color="primary" />
        <Typography variant="h6">Team Chat</Typography>
        <Box sx={{ ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              label="Channel"
            >
              {channels.map((channel) => (
                <MenuItem 
                  key={channel.id} 
                  value={channel.id}
                  disabled={!canAccessChannel(channel.id)}
                >
                  {channel.icon} {channel.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {filteredMessages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {message.sender.role === 'admin' ? <AdminPanelSettings /> : <Person />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {message.sender.name}
                  </Typography>
                  <Chip 
                    label={message.sender.role} 
                    size="small" 
                    color={message.sender.role === 'admin' ? 'primary' : 'default'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {message.content}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Send />}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TeamChat; 