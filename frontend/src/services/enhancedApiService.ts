import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { User, Project, Task, TaskStats } from '../types';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api'
  : (process.env.REACT_APP_API_URL || 'https://jirasoftware-6d40.onrender.com/api');

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Exponential backoff retry function
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries,
  baseDelay: number = RETRY_CONFIG.baseDelay
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1),
          RETRY_CONFIG.maxDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms`);
      }
      
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          throw error; // Don't retry auth or not found errors
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`❌ Request failed after ${maxRetries + 1} attempts:`, lastError.message);
        throw lastError;
      }
    }
  }
  
  throw lastError!;
}

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
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced API methods with retry logic
const apiWithRetry = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    retryRequest(() => api.get<T>(url, config)),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    retryRequest(() => api.post<T>(url, data, config)),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    retryRequest(() => api.put<T>(url, data, config)),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    retryRequest(() => api.delete<T>(url, config)),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    retryRequest(() => api.patch<T>(url, data, config))
};

// Mock data for development fallback
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    full_name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'manager1',
    full_name: 'Manager One',
    email: 'manager1@example.com',
    role: 'manager',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'member1',
    full_name: 'Member One',
    email: 'member1@example.com',
    role: 'member',
    created_at: new Date().toISOString()
  }
];

// Auth Service
export const authService = {
  async login(username: string, password: string) {
    try {
      const response = await apiWithRetry.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiWithRetry.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }
};

// Users Service
export const usersService = {
  async getAll() {
    try {
      const response = await apiWithRetry.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users failed:', error);
      // Return mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock users data');
        return mockUsers;
      }
      throw error;
    }
  },

  async getById(id: number) {
    try {
      const response = await apiWithRetry.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user by ID failed:', error);
      throw error;
    }
  },

  async create(userData: Partial<User>) {
    try {
      const response = await apiWithRetry.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  },

  async update(id: number, userData: Partial<User>) {
    try {
      const response = await apiWithRetry.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const response = await apiWithRetry.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  },

  async getTasks(userId: number) {
    try {
      const response = await apiWithRetry.get(`/users/${userId}/tasks`);
      return response.data;
    } catch (error) {
      console.error('Get user tasks failed:', error);
      throw error;
    }
  },

  async getWorkload(userId: number) {
    try {
      const response = await apiWithRetry.get(`/users/${userId}/workload`);
      return response.data;
    } catch (error) {
      console.error('Get user workload failed:', error);
      throw error;
    }
  }
};

// Projects Service
export const projectsService = {
  async getAll() {
    try {
      const response = await apiWithRetry.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Get projects failed:', error);
      throw error;
    }
  },

  async getById(id: number) {
    try {
      const response = await apiWithRetry.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get project by ID failed:', error);
      throw error;
    }
  },

  async create(projectData: Partial<Project>) {
    try {
      const response = await apiWithRetry.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Create project failed:', error);
      throw error;
    }
  },

  async update(id: number, projectData: Partial<Project>) {
    try {
      const response = await apiWithRetry.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Update project failed:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const response = await apiWithRetry.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete project failed:', error);
      throw error;
    }
  },

  async deleteWithTasks(id: number) {
    try {
      const response = await apiWithRetry.delete(`/projects/${id}/with-tasks`);
      return response.data;
    } catch (error) {
      console.error('Delete project with tasks failed:', error);
      throw error;
    }
  }
};

// Tasks Service
export const tasksService = {
  async getAll() {
    try {
      const response = await apiWithRetry.get('/tasks');
      return response.data;
    } catch (error) {
      console.error('Get tasks failed:', error);
      throw error;
    }
  },

  async getById(id: number) {
    try {
      const response = await apiWithRetry.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get task by ID failed:', error);
      throw error;
    }
  },

  async create(taskData: Partial<Task>) {
    try {
      const response = await apiWithRetry.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Create task failed:', error);
      throw error;
    }
  },

  async update(id: number, taskData: Partial<Task>) {
    try {
      const response = await apiWithRetry.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Update task failed:', error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const response = await apiWithRetry.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete task failed:', error);
      throw error;
    }
  },

  async updateStatus(id: number, status: string) {
    try {
      const response = await apiWithRetry.patch(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update task status failed:', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await apiWithRetry.get('/tasks/stats');
      return response.data;
    } catch (error) {
      console.error('Get task stats failed:', error);
      throw error;
    }
  }
};

export default api;
