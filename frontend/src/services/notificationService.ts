import api from './apiService';

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: Date;
  targetUsers?: number[];
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'personal' | 'general';
  read: boolean;
  timestamp: Date;
  senderName?: string;
}

export interface EmailNotificationSettings {
  emailNotifications: boolean;
  taskAssignments: boolean;
  deadlineReminders: boolean;
  adminMessages: boolean;
  projectUpdates: boolean;
  email: string;
}

export interface EmailNotificationResponse {
  message: string;
  taskId?: number;
  userId?: number;
  email?: string;
  sentTo?: number;
  users?: Array<{ id: number; email: string; name: string }>;
}

export const notificationService = {
  // Get all notifications
  async getAll(): Promise<UserNotification[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Email notification methods
  async sendTaskAssignmentEmail(taskId: number, userId: number): Promise<EmailNotificationResponse> {
    const response = await api.post('/notifications/task-assignment', {
      taskId,
      userId
    });
    return response.data;
  },

  async sendDeadlineReminderEmail(taskId: number): Promise<EmailNotificationResponse> {
    const response = await api.post('/notifications/deadline-reminder', {
      taskId
    });
    return response.data;
  },

  async sendAdminMessageEmail(title: string, content: string, userIds: number[], isGeneral: boolean = false): Promise<EmailNotificationResponse> {
    const response = await api.post('/notifications/admin-message', {
      title,
      content,
      userIds,
      isGeneral
    });
    return response.data;
  },

  async sendProjectUpdateEmail(projectId: number): Promise<EmailNotificationResponse> {
    const response = await api.post('/notifications/project-update', {
      projectId
    });
    return response.data;
  },

  async sendWelcomeEmail(userId: number): Promise<EmailNotificationResponse> {
    const response = await api.post('/notifications/welcome-email', {
      userId
    });
    return response.data;
  },

  async testEmailConnection(): Promise<{ message: string; status: string }> {
    const response = await api.get('/notifications/test-connection');
    return response.data;
  },

  async getNotificationSettings(): Promise<EmailNotificationSettings> {
    const response = await api.get('/notifications/settings');
    return response.data;
  }
};

// Local notification manager for in-app notifications
class LocalNotificationManager {
  private notifications: UserNotification[] = [];
  private subscribers: Set<(notifications: UserNotification[]) => void> = new Set();
  private idCounter = 0;

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications() {
    const stored = localStorage.getItem('smartflow_notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  private saveNotifications() {
    localStorage.setItem('smartflow_notifications', JSON.stringify(this.notifications));
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.notifications]));
  }

  subscribe(callback: (notifications: UserNotification[]) => void) {
    this.subscribers.add(callback);
    callback([...this.notifications]);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  addNotification(notification: Omit<UserNotification, 'id' | 'timestamp'> & { timestamp?: Date }) {
    this.idCounter += 1;
    const newNotification: UserNotification = {
      ...notification,
      id: `${Date.now()}-${this.idCounter}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date()
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    this.notifySubscribers();
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifySubscribers();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.notifySubscribers();
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    this.notifySubscribers();
  }

  getNotifications(): UserNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
    this.notifySubscribers();
  }
}

export const notificationManager = new LocalNotificationManager();

// Simulate admin message and convert to notification
export const simulateAdminMessage = (content: string, senderId: number, senderName: string, targetUsers?: number[]): void => {
  const adminMessage: AdminMessage = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Admin Message',
    content,
    senderId,
    senderName,
    timestamp: new Date(),
    targetUsers
  };

  // Add to local notification manager
  notificationManager.addNotification({
    title: `📢 ${adminMessage.title}`,
    message: adminMessage.content,
    type: 'info',
    read: false,
    senderName: adminMessage.senderName
  });
};

export const convertAdminMessageToNotification = (adminMessage: AdminMessage): Omit<UserNotification, 'id' | 'timestamp'> => {
  return {
    title: `📢 ${adminMessage.title}`,
    message: adminMessage.content,
    type: 'info',
    read: false,
    senderName: adminMessage.senderName
  };
}; 