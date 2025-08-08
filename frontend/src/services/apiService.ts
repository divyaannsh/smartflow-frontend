
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : (process.env.REACT_APP_API_URL || 'https://jirasoftware-6d40.onrender.com/api');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for development fallback
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'member',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockProjects = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'in_progress',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'iOS and Android app development',
    status: 'planning',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockTasks = [
  {
    id: 1,
    title: 'Design Homepage',
    description: 'Create new homepage design',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 2,
    project_id: 1,
    due_date: '2024-12-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Setup Database',
    description: 'Configure database schema',
    status: 'completed',
    priority: 'medium',
    assigned_to: 1,
    project_id: 1,
    due_date: '2024-12-15',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to: number;
  project_id: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

// Auth Service
export const authService = {
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.log('Server unavailable, using mock login');
      // Mock login for demo
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
    role: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async verifyToken(token: string): Promise<boolean> {
    try {
      await api.post('/auth/verify', { token });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Projects Service
export const projectsService = {
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.log('Using mock projects');
      return mockProjects;
    }
  },

  async getProject(id: number): Promise<Project> {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      const project = mockProjects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return project;
    }
  },

  async createProject(projectData: { name: string; description: string }): Promise<Project> {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  async deleteProject(id: number): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  }
};

// Tasks Service
export const tasksService = {
  async getAllTasks(): Promise<Task[]> {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.log('Using mock tasks');
      return mockTasks;
    }
  },

  async getTask(id: number): Promise<Task> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      const task = mockTasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      return task;
    }
  },

  async createTask(taskData: {
    title: string;
    description: string;
    priority: string;
    assigned_to: number;
    project_id: number;
    due_date: string;
  }): Promise<Task> {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  },

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  },

  async deleteTask(id: number): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  },

  async getUserTasks(userId: number): Promise<Task[]> {
    try {
      const response = await api.get(`/tasks/user/${userId}`);
      return response.data;
    } catch (error) {
      console.log('Using mock user tasks');
      return mockTasks.filter(task => task.assigned_to === userId);
    }
  }
};

// Users Service
export const usersService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.log('Using mock users');
      return mockUsers;
    }
  },

  async getUser(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
};

export default api; 