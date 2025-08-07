
 import axios from 'axios';
import { Project, Task, User, Comment, TaskStats, ProjectStats, UserWorkload } from '../types';

// Use localhost when running locally, Vercel when deployed
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'
  : (process.env.REACT_APP_API_URL || 'https://jirasoftware-5jad.vercel.app/api');

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

// Auth API
export const authService = {
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'manager' | 'member';
  }): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

// Projects API
export const projectsService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get('/projects');
    return response.data;
  },

  async getById(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async create(project: Partial<Project>): Promise<Project> {
    const response = await api.post('/projects', project);
    return response.data;
  },

  async update(id: number, project: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getStats(id: number): Promise<ProjectStats> {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
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
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async getById(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async create(task: Partial<Task>): Promise<Task> {
    const response = await api.post('/tasks', task);
    return response.data;
  },

  async update(id: number, task: Partial<Task>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async updateStatus(id: number, status: string): Promise<{ message: string; status: string }> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  async getComments(id: number): Promise<Comment[]> {
    const response = await api.get(`/tasks/${id}/comments`);
    return response.data;
  },

  async addComment(id: number, content: string): Promise<Comment> {
    const response = await api.post(`/tasks/${id}/comments`, { content });
    return response.data;
  },

  async getStats(): Promise<TaskStats> {
    const response = await api.get('/tasks/stats/overview');
    return response.data;
  },
};

// Users API
export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(user: Partial<User>): Promise<User> {
    const response = await api.post('/users', user);
    return response.data;
  },

  async update(id: number, user: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getWorkload(id: number): Promise<UserWorkload> {
    const response = await api.get(`/users/${id}/workload`);
    return response.data;
  },

  async getTasks(id: number, params?: { status?: string; priority?: string }): Promise<Task[]> {
    const response = await api.get(`/users/${id}/tasks`, { params });
    return response.data;
  },

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    await api.patch(`/users/${id}/password`, { current_password: currentPassword, new_password: newPassword });
  },
}; 