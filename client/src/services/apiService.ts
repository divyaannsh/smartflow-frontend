
 import axios from 'axios';
import { Project, Task, User, Comment, TaskStats, ProjectStats, UserWorkload } from '../types';

// Mock data for demo purposes when server is not available
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Administrator',
    role: 'admin' as const,
    avatar: '',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'member' as const,
    avatar: '',
    created_at: new Date().toISOString(),
  }
];

const mockProjects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete redesign of company website',
    status: 'active' as const,
    priority: 'high' as const,
    deadline: '2024-12-31',
    created_by: 1,
    created_by_name: 'Administrator',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_tasks: 5,
    completed_tasks: 2
  }
];

const mockTasks = [
  {
    id: 1,
    title: 'Design Homepage',
    description: 'Create new homepage design',
    status: 'todo' as const,
    priority: 'high' as const,
    deadline: '2024-09-15',
    project_id: 1,
    project_name: 'Website Redesign',
    assigned_to: 2,
    assigned_to_name: 'Regular User',
    created_by: 1,
    created_by_name: 'Administrator',
    estimated_hours: 8.0,
    actual_hours: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Use localhost when running locally, current domain when deployed
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : (process.env.REACT_APP_API_URL || `${window.location.origin}/api`);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add interceptors for logging requests/responses
api.interceptors.request.use((config) => {
  console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
  
  // Add token to requests
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;

// Mock API service for demo when server is not available
const createMockResponse = (data: any) => Promise.resolve({ data });

// Auth API
export const authService = {
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      // Try real API first
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      // In production, do not fallback to mock
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      console.log('Server unavailable, using mock login');
      const user = mockUsers.find(u => u.username === username);
      if (user && (username === 'admin' && password === 'admin123' || username === 'user' && password === 'user123')) {
        const token = 'mock-jwt-token-' + Date.now();
        return { user, token };
      }
      throw new Error('Invalid credentials');
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'manager' | 'member';
  }): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      throw new Error('Registration not available in demo mode');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      // Return mock user based on stored token (dev only)
      const token = localStorage.getItem('token');
      if (token && token.includes('admin')) {
        return mockUsers[0];
      } else if (token && token.includes('user')) {
        return mockUsers[1];
      }
      throw new Error('User not found');
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      return { token: 'mock-refresh-token-' + Date.now() };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // Mock logout
        localStorage.removeItem('token');
      } else {
        throw error;
      }
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      throw new Error('Password change not available in demo mode');
    }
  },
};

// Projects API
export const projectsService = {
  async getAll(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.log('Server unavailable, using mock projects');
      return mockProjects;
    }
  },

  async getById(id: number): Promise<Project> {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      const project = mockProjects.find(p => p.id === id);
      if (project) return project;
      throw new Error('Project not found');
    }
  },

  async create(project: Partial<Project>): Promise<Project> {
    try {
      const response = await api.post('/projects', project);
      return response.data;
    } catch (error) {
      throw new Error('Project creation not available in demo mode');
    }
  },

  async update(id: number, project: Partial<Project>): Promise<Project> {
    try {
      const response = await api.put(`/projects/${id}`, project);
      return response.data;
    } catch (error) {
      throw new Error('Project update not available in demo mode');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      throw new Error('Project deletion not available in demo mode');
    }
  },

  async getStats(id: number): Promise<ProjectStats> {
    try {
      const response = await api.get(`/projects/${id}/stats`);
      return response.data;
    } catch (error) {
      return {
        total_tasks: 5,
        todo_tasks: 3,
        in_progress_tasks: 1,
        review_tasks: 0,
        done_tasks: 1,
        critical_tasks: 1,
        high_tasks: 2,
        total_estimated_hours: 40,
        total_actual_hours: 8
      };
    }
  },
};

// Tasks API
export const tasksService = {
  async getAll(params?: {
    project_id?: number;
    assigned_to?: number;
    status?: string;
    priority?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<Task[]> {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      console.log('Server unavailable, using mock tasks');
      return mockTasks;
    }
  },

  async getById(id: number): Promise<Task> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      const task = mockTasks.find(t => t.id === id);
      if (task) return task;
      throw new Error('Task not found');
    }
  },

  async create(task: Partial<Task>): Promise<Task> {
    try {
      const response = await api.post('/tasks', task);
      return response.data;
    } catch (error) {
      throw new Error('Task creation not available in demo mode');
    }
  },

  async update(id: number, task: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      throw new Error('Task update not available in demo mode');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw new Error('Task deletion not available in demo mode');
    }
  },

  async updateStatus(id: number, status: string): Promise<{ message: string; status: string }> {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return { message: 'Status updated (demo mode)', status: 'success' };
    }
  },

  async getComments(id: number): Promise<Comment[]> {
    try {
      const response = await api.get(`/tasks/${id}/comments`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async addComment(id: number, content: string): Promise<Comment> {
    try {
      const response = await api.post(`/tasks/${id}/comments`, { content });
      return response.data;
    } catch (error) {
      throw new Error('Comment creation not available in demo mode');
    }
  },

  async getStats(): Promise<TaskStats> {
    try {
      const response = await api.get('/tasks/stats/overview');
      return response.data;
    } catch (error) {
      return {
        total_tasks: 5,
        todo_tasks: 3,
        in_progress_tasks: 1,
        review_tasks: 0,
        done_tasks: 1,
        critical_tasks: 1,
        high_tasks: 2,
        overdue_tasks: 0,
        total_estimated_hours: 40,
        total_actual_hours: 8
      };
    }
  },
};

// Users API
export const usersService = {
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.log('Server unavailable, using mock users');
      return mockUsers;
    }
  },

  async getById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const user = mockUsers.find(u => u.id === id);
      if (user) return user;
      throw new Error('User not found');
    }
  },

  async create(user: Partial<User>): Promise<User> {
    try {
      const response = await api.post('/users', user);
      return response.data;
    } catch (error) {
      throw new Error('User creation not available in demo mode');
    }
  },

  async update(id: number, user: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      throw new Error('User update not available in demo mode');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw new Error('User deletion not available in demo mode');
    }
  },

  async getWorkload(id: number): Promise<UserWorkload> {
    try {
      const response = await api.get(`/users/${id}/workload`);
      return response.data;
    } catch (error) {
      return {
        total_tasks: 3,
        todo_tasks: 2,
        in_progress_tasks: 1,
        review_tasks: 0,
        done_tasks: 0,
        critical_tasks: 1,
        high_tasks: 1,
        overdue_tasks: 0,
        total_estimated_hours: 24,
        total_actual_hours: 8
      };
    }
  },

  async getTasks(id: number, params?: { status?: string; priority?: string }): Promise<Task[]> {
    try {
      const response = await api.get(`/users/${id}/tasks`, { params });
      return response.data;
    } catch (error) {
      return mockTasks.filter(t => t.assigned_to === id);
    }
  },

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post(`/users/${id}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error('Password change not available in demo mode');
    }
  },
}; 