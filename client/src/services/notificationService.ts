import api from './apiService';

export interface AdminMessage {
  id: string;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  targetUsers?: number[]; // Specific users to send to, if empty sends to all
  channel: 'general' | 'announcement' | 'urgent';
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  senderId?: number;
  senderName?: string;
  action?: {
    label: string;
    url: string;
  };
}

// Notification Service
export const notificationService = {
  // Send admin message to users
  async sendAdminMessage(message: Omit<AdminMessage, 'id' | 'timestamp'>): Promise<AdminMessage> {
    const response = await api.post('/notifications/admin-message', message);
    return response.data;
  },

  // Get user notifications
  async getUserNotifications(): Promise<UserNotification[]> {
    const response = await api.get('/notifications/user');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/mark-all-read');
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
};

// Local notification management (for demo purposes)
class LocalNotificationManager {
  private notifications: UserNotification[] = [];
  private listeners: ((notifications: UserNotification[]) => void)[] = [];

  constructor() {
    // Load notifications from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    }
  }

  // Add notification
  addNotification(notification: Omit<UserNotification, 'id' | 'timestamp'>): void {
    const newNotification: UserNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Mark as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Get notifications
  getNotifications(): UserNotification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Subscribe to changes
  subscribe(listener: (notifications: UserNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Save to localStorage
  private saveToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}

// Global notification manager instance
export const notificationManager = new LocalNotificationManager();

// Simulate admin sending message to users
export const simulateAdminMessage = (
  content: string,
  senderId: number,
  senderName: string,
  targetUsers?: number[]
): void => {
  const adminMessage: Omit<UserNotification, 'id' | 'timestamp'> = {
    title: `Message from ${senderName}`,
    message: content,
    type: 'info',
    read: false,
    senderId,
    senderName,
    action: {
      label: 'View in Chat',
      url: '/portal',
    },
  };

  notificationManager.addNotification(adminMessage);
};

// Convert AdminMessage to UserNotification
export const convertAdminMessageToNotification = (
  adminMessage: AdminMessage
): Omit<UserNotification, 'id' | 'timestamp'> => {
  return {
    title: `Message from ${adminMessage.senderName}`,
    message: adminMessage.content,
    type: adminMessage.channel === 'urgent' ? 'error' : 
          adminMessage.channel === 'announcement' ? 'warning' : 'info',
    read: false,
    senderId: adminMessage.senderId,
    senderName: adminMessage.senderName,
    action: {
      label: 'View in Chat',
      url: '/portal',
    },
  };
}; 