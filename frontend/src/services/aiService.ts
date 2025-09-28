import axios from 'axios';

// Google AI API configuration
const GOOGLE_AI_API_KEY = 'AIzaSyAfDHhIhwcJh0U_o68KjTI1l3j1E5tpfmY';
const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Available models
const MODELS = {
  GEMINI_PRO: 'gemini-pro',
  GEMINI_PRO_VISION: 'gemini-pro-vision',
};

interface AIResponse {
  text: string;
  confidence?: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatHistory {
  messages: ChatMessage[];
}

class AIService {
  private apiKey: string;
  private baseURL: string;
  private chatHistory: Map<string, ChatHistory> = new Map();

  constructor() {
    this.apiKey = GOOGLE_AI_API_KEY;
    this.baseURL = GOOGLE_AI_BASE_URL;
  }

  /**
   * Generate AI response using Google Gemini Pro
   */
  async generateResponse(
    userMessage: string,
    userId: string,
    userRole: string,
    context?: string
  ): Promise<AIResponse> {
    try {
      // Get or create chat history for this user
      if (!this.chatHistory.has(userId)) {
        this.chatHistory.set(userId, { messages: [] });
      }
      const chatHistory = this.chatHistory.get(userId)!;

      // Add user message to history
      chatHistory.messages.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      // Prepare the prompt with context
      const enhancedPrompt = this.buildEnhancedPrompt(userMessage, userRole, context);

      // Make API call to Google AI
      const response = await axios.post(
        `${this.baseURL}/${MODELS.GEMINI_PRO}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: enhancedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the response text
      const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      // Add AI response to history
      chatHistory.messages.push({
        role: 'model',
        parts: [{ text: aiResponse }],
      });

      // Keep only last 10 messages to manage context
      if (chatHistory.messages.length > 10) {
        chatHistory.messages = chatHistory.messages.slice(-10);
      }

      return {
        text: aiResponse,
        confidence: 0.9, // High confidence for Google AI
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback to local responses if API fails
      return this.getFallbackResponse(userMessage, userRole);
    }
  }

  /**
   * Build enhanced prompt with context and role information
   */
  private buildEnhancedPrompt(userMessage: string, userRole: string, context?: string): string {
    const systemContext = `You are an intelligent AI assistant for SmartFlow AI, a project management platform. 
    
User Role: ${userRole}
Current Context: ${context || 'General project management assistance'}

Your capabilities include:
- Project management guidance
- Task management assistance
- Team collaboration tips
- System navigation help
- Best practices for project management
- Workflow optimization suggestions

Please provide helpful, concise, and actionable responses. Focus on being practical and solution-oriented.
Always consider the user's role when providing advice.

User Message: ${userMessage}`;

    return systemContext;
  }

  /**
   * Fallback responses when AI API is unavailable
   */
  private getFallbackResponse(userMessage: string, userRole: string): AIResponse {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced fallback responses based on user role
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        text: `Hello! I'm your AI assistant for SmartFlow AI. As a ${userRole}, I'm here to help you with project management tasks. What would you like to know?`,
        confidence: 0.8,
      };
    }
    
    if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
      if (userRole === 'admin') {
        return {
          text: `I can help you manage projects! As an admin, you can:
• Create and edit projects
• Assign team members and set permissions
• Monitor project progress and analytics
• Manage project budgets and timelines
• Generate project reports

Would you like me to guide you to the Projects section or help with a specific project task?`,
          confidence: 0.8,
        };
      } else {
        return {
          text: `I can help you with projects! You can:
• View your assigned projects and their status
• Check project progress and deadlines
• Update project information
• Collaborate with team members
• Access project documents and resources

Would you like me to show you your current projects or help with something specific?`,
          confidence: 0.8,
        };
      }
    }
    
    if (lowerMessage.includes('task') || lowerMessage.includes('tasks')) {
      if (userRole === 'admin') {
        return {
          text: `Task management for admins includes:
• Creating and assigning tasks to team members
• Monitoring task progress and completion rates
• Reassigning tasks when needed
• Setting priorities, deadlines, and dependencies
• Viewing comprehensive task analytics and reports
• Managing task workflows and automation

Would you like me to help you with task assignment, monitoring, or workflow optimization?`,
          confidence: 0.8,
        };
      } else {
        return {
          text: `For your tasks, you can:
• View all assigned tasks and their priorities
• Update task status and progress
• Add comments, attachments, and time estimates
• Mark tasks as complete
• Request task extensions or reassignment
• Track time spent on tasks

Would you like me to show you your current tasks or help with task management?`,
          confidence: 0.8,
        };
      }
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('member')) {
      if (userRole === 'admin') {
        return {
          text: `Team management features for admins:
• Add, remove, and manage team members
• Assign roles, permissions, and access levels
• Monitor team performance and workload
• View workload distribution and capacity planning
• Manage user accounts and security settings
• Generate team performance reports
• Set up team collaboration tools

Would you like me to help you with team management, performance monitoring, or user administration?`,
          confidence: 0.8,
        };
      } else {
        return {
          text: `You can view team information:
• See team member profiles and contact details
• Check who's working on what projects/tasks
• View team workload and availability
• Collaborate with colleagues through chat and comments
• Access team calendars and schedules
• View team performance metrics

Would you like me to show you the team overview or help with collaboration?`,
          confidence: 0.8,
        };
      }
    }
    
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('overview')) {
      return {
        text: `The dashboard provides:
• Overview of your projects, tasks, and team status
• Quick statistics and progress indicators
• Recent activities and notifications
• Quick access to key features and shortcuts
• Performance metrics and insights
• Calendar view of deadlines and meetings

Would you like me to explain any specific dashboard feature or help you navigate to different sections?`,
        confidence: 0.8,
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return {
        text: `I'm here to help! Here are some areas I can assist with:
• Navigation and feature explanations
• Project and task management best practices
• Team collaboration and communication tips
• System usage and workflow optimization
• Troubleshooting common issues
• General questions about the platform

What specific area would you like help with? I can provide detailed guidance on any of these topics.`,
        confidence: 0.8,
      };
    }
    
    // Default intelligent response
    return {
      text: `I understand you're asking about "${userMessage}". As a ${userRole} in SmartFlow AI, you have access to various project management features. 

Could you be more specific about what you'd like to know? I can help with:
• Project management and planning
• Task organization and tracking
• Team collaboration and communication
• System navigation and features
• Best practices and optimization tips

What would you like to learn more about?`,
      confidence: 0.7,
    };
  }

  /**
   * Clear chat history for a specific user
   */
  clearChatHistory(userId: string): void {
    this.chatHistory.delete(userId);
  }

  /**
   * Get chat history for a specific user
   */
  getChatHistory(userId: string): ChatHistory | undefined {
    return this.chatHistory.get(userId);
  }

  /**
   * Check if AI service is available
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      await axios.get(`${this.baseURL}?key=${this.apiKey}`);
      return true;
    } catch (error) {
      console.error('AI Service Health Check Failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
