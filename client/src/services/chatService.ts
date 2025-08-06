import api from './apiService';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  channel?: string;
  isSystem?: boolean;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  action?: string;
}

// Chat Service for real-time messaging
export const chatService = {
  // Send a message to the team chat
  async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const response = await api.post('/chat/messages', message);
    return response.data;
  },

  // Get chat messages for a channel
  async getMessages(channel: string = 'general'): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/messages?channel=${channel}`);
    return response.data;
  },

  // Get AI response
  async getAIResponse(message: string, userRole: string, context?: any): Promise<AIResponse> {
    const response = await api.post('/chat/ai', {
      message,
      userRole,
      context,
    });
    return response.data;
  },

  // Get chat channels
  async getChannels(): Promise<{ id: string; name: string; icon: string }[]> {
    const response = await api.get('/chat/channels');
    return response.data;
  },

  // Join a channel
  async joinChannel(channelId: string): Promise<void> {
    await api.post(`/chat/channels/${channelId}/join`);
  },

  // Leave a channel
  async leaveChannel(channelId: string): Promise<void> {
    await api.post(`/chat/channels/${channelId}/leave`);
  },
};

// AI Response Generator (for demo purposes)
export const generateAIResponse = async (
  message: string, 
  userRole: string, 
  context?: any
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const lowerMessage = message.toLowerCase();
  
  // Role-specific responses
  const roleResponses = {
    admin: {
      project: `As an admin, you have full control over projects. You can:
• Create and edit projects
• Assign team members
• Monitor project progress
• View detailed analytics
• Manage project settings

Would you like me to help you with any specific project management task?`,
      task: `Task management for admins includes:
• Creating and assigning tasks
• Monitoring task progress
• Reassigning tasks
• Setting priorities and deadlines
• Viewing task analytics

Would you like me to help you with task assignment or monitoring?`,
      team: `Team management features for admins:
• Add/remove team members
• Assign roles and permissions
• Monitor team performance
• View workload distribution
• Manage user accounts

Would you like me to help you with team management?`,
    },
    manager: {
      project: `As a manager, you can:
• View and update project progress
• Assign tasks to team members
• Monitor project deadlines
• Collaborate with team members
• Report to administrators

Would you like me to help you with project coordination?`,
      task: `For task management, you can:
• Create and assign tasks
• Monitor task progress
• Update task status
• Set priorities
• Track time estimates

Would you like me to help you with task management?`,
      team: `You can manage your team by:
• Viewing team member profiles
• Assigning tasks to members
• Monitoring workload
• Facilitating collaboration
• Reporting team progress

Would you like me to help you with team coordination?`,
    },
    member: {
      project: `You can work with projects by:
• Viewing assigned projects
• Checking project progress
• Updating project status
• Collaborating with team members
• Reporting progress

Would you like me to show you your current projects?`,
      task: `For your tasks, you can:
• View assigned tasks
• Update task status
• Add comments and progress
• Set time estimates
• Mark tasks as complete

Would you like me to show you your current tasks?`,
      team: `You can view team information:
• See team member profiles
• Check who's working on what
• View team workload
• Collaborate with colleagues
• Communicate with team

Would you like me to show you the team overview?`,
    },
  };

  // General responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello! I'm here to help you with your project management tasks. As a ${userRole}, you have access to various features. What would you like to know?`;
  }
  
  if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
    return roleResponses[userRole as keyof typeof roleResponses]?.project || 
           `I can help you with projects! What specific aspect would you like to know about?`;
  }
  
  if (lowerMessage.includes('task') || lowerMessage.includes('tasks')) {
    return roleResponses[userRole as keyof typeof roleResponses]?.task || 
           `I can help you with task management! What would you like to know?`;
  }
  
  if (lowerMessage.includes('team') || lowerMessage.includes('member')) {
    return roleResponses[userRole as keyof typeof roleResponses]?.team || 
           `I can help you with team collaboration! What would you like to know?`;
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
  
  if (lowerMessage.includes('chat') || lowerMessage.includes('message')) {
    return `You can use the team chat to:
• Communicate with team members
• Share updates and progress
• Ask questions
• Collaborate on projects
• Stay connected with the team

The team chat is available in different channels for different topics.`;
  }
  
  // Default response
  return `I understand you're asking about "${message}". As a ${userRole}, you have access to various features in this project management system. Could you be more specific about what you'd like to know? I can help with projects, tasks, team management, or general navigation.`;
};

// Team Chat Simulator (for demo purposes)
export const simulateTeamResponse = (message: string, users: any[]): string => {
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
    "I'll get back to you on that.",
    "Sounds good to me.",
    "Let's coordinate on this.",
    "I'll update the team.",
    "Great work!",
  ];
  
  // Context-aware responses
  if (message.toLowerCase().includes('deadline')) {
    return "I'll make sure we meet the deadline. Let me check the current progress.";
  }
  
  if (message.toLowerCase().includes('meeting')) {
    return "I'll schedule a meeting and send out invites to the team.";
  }
  
  if (message.toLowerCase().includes('update')) {
    return "I'll provide an update on the current progress.";
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
}; 