import React, { useState } from 'react';
import {
  Fab,
  Badge,
  Tooltip,
  Zoom,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  SmartToy,
  Chat,
  Group,
  Forum,
} from '@mui/icons-material';
import ChatBot from './ChatBot';
import TeamChat from './TeamChat';
import { useAuth } from '../contexts/AuthContext';

const ChatButton: React.FC = () => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isTeamChatOpen, setIsTeamChatOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenAIChat = () => {
    setIsAIChatOpen(true);
  };

  const handleCloseAIChat = () => {
    setIsAIChatOpen(false);
  };

  const handleOpenTeamChat = () => {
    setIsTeamChatOpen(true);
  };

  const handleCloseTeamChat = () => {
    setIsTeamChatOpen(false);
  };

  if (!user) return null;

  const actions = [
    {
      icon: <SmartToy />,
      name: 'AI Assistant',
      action: handleOpenAIChat,
      tooltip: 'Chat with AI Assistant',
    },
    {
      icon: <Group />,
      name: 'Team Chat',
      action: handleOpenTeamChat,
      tooltip: 'Chat with Team Members',
    },
  ];

  return (
    <>
      <SpeedDial
        ariaLabel="Chat options"
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.tooltip}
            onClick={action.action}
            sx={{
              bgcolor: action.name === 'AI Assistant' ? 'success.main' : 'info.main',
              '&:hover': {
                bgcolor: action.name === 'AI Assistant' ? 'success.dark' : 'info.dark',
              },
            }}
          />
        ))}
      </SpeedDial>

      <ChatBot
        isOpen={isAIChatOpen}
        onClose={handleCloseAIChat}
        userRole={user.role as 'admin' | 'manager' | 'member'}
      />

      <TeamChat
        isOpen={isTeamChatOpen}
        onClose={handleCloseTeamChat}
      />
    </>
  );
};

export default ChatButton; 