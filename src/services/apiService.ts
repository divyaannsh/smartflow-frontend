
import axios from 'axios';
import { User, Project, Task, TaskStats } from '../types';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api'
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
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin' as const,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    full_name: 'Regular User',
    role: 'member' as const,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    status: 'active',
    priority: 'high',
    created_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'iOS and Android app development',
    status: 'on_hold',
    priority: 'medium',
    created_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Design Homepage',
    description: 'Create new homepage design',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 2,
    project_id: 1,
    deadline: '2024-12-31',
    estimated_hours: 12,
    created_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Setup Database',
    description: 'Configure database schema',
    status: 'done',
    priority: 'medium',
    assigned_to: 1,
    project_id: 1,
    deadline: '2024-12-15',
    estimated_hours: 8,
    created_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Types are imported from '../types'

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
  async getAll(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.log('Using mock projects');
      return mockProjects;
    }
  },

  async getById(id: number): Promise<Project> {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      const project = mockProjects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return project;
    }
  },

  async getMembers(projectId: number): Promise<Array<{ user_id: number; role: string; full_name: string; email: string }>> {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch project members');
    }
  },

  async addMember(projectId: number, userId: number, role: 'admin' | 'manager' | 'member' = 'member') {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { user_id: userId, role });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add member');
    }
  },

  async create(projectData: { name: string; description: string }): Promise<Project> {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  },

  async update(id: number, projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  },

  async deleteAllTasks(projectId: number): Promise<void> {
    try {
      // First get all tasks for this project
      const tasksResponse = await api.get(`/tasks?project_id=${projectId}`);
      const tasks = tasksResponse.data;
      
      // Delete each task
      const deletePromises = tasks.map((task: any) => 
        api.delete(`/tasks/${task.id}`)
      );
      
      await Promise.all(deletePromises);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project tasks');
    }
  },

  async deleteWithTasks(id: number): Promise<void> {
    try {
      // Use the new backend endpoint that handles both tasks and project deletion
      await api.delete(`/projects/${id}/with-tasks`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project with tasks');
    }
  }
};

// Tasks Service
export const tasksService = {
  async getAll(): Promise<Task[]> {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      console.log('Using mock tasks');
      return mockTasks;
    }
  },

  async getById(id: number): Promise<Task> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      const task = mockTasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      return task;
    }
  },

  async create(taskData: {
    title: string;
    description: string;
    priority: string;
    assigned_to?: number;
    project_id: number;
    deadline?: string;
    status?: 'todo' | 'in_progress' | 'review' | 'done';
    estimated_hours?: number;
  }): Promise<Task> {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  },

  async update(id: number, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update task');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete task');
    }
  },

  async updateStatus(id: number, status: string): Promise<{ message: string; status: string }> {
    try {
      const response = await api.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update task status');
    }
  },

  async getStats(): Promise<any> {
    try {
      const response = await api.get('/tasks/stats/overview');
      return response.data;
    } catch (error) {
      return {
        total_tasks: mockTasks.length,
        todo_tasks: mockTasks.filter(t => t.status === 'todo').length,
        in_progress_tasks: mockTasks.filter(t => t.status === 'in_progress').length,
        review_tasks: mockTasks.filter(t => t.status === 'review').length,
        done_tasks: mockTasks.filter(t => t.status === 'done').length,
        critical_tasks: mockTasks.filter(t => t.priority === 'critical').length,
        high_tasks: mockTasks.filter(t => t.priority === 'high').length,
        overdue_tasks: mockTasks.filter(t => t.deadline && new Date(t.deadline) < new Date()).length,
        total_estimated_hours: mockTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0),
        total_actual_hours: 0,
      } as TaskStats;
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
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.log('Using mock users');
      return mockUsers;
    }
  },

  async getById(id: number): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  async update(id: number, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  async getTasks(id: number, params?: { status?: string; priority?: string }): Promise<Task[]> {
    try {
      const response = await api.get(`/users/${id}/tasks`, { params });
      return response.data;
    } catch (error) {
      console.log('Using mock user tasks');
      return mockTasks.filter(task => task.assigned_to === id);
    }
  },

  async getWorkload(id: number): Promise<any> {
    try {
      const response = await api.get(`/users/${id}/workload`);
      return response.data;
    } catch (error) {
      const userTasks = mockTasks.filter(task => task.assigned_to === id);
      return {
        total_tasks: userTasks.length,
        done_tasks: userTasks.filter(t => t.status === 'done').length,
        in_progress_tasks: userTasks.filter(t => t.status === 'in_progress').length,
        review_tasks: userTasks.filter(t => t.status === 'review').length,
        todo_tasks: userTasks.filter(t => t.status === 'todo').length,
        average_completion_time: 3.5
      };
    }
  }
};

export default api; 