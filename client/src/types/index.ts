export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  estimated_hours?: number;
  actual_hours?: number;
  project_id: number;
  project_name?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  content: string;
  task_id: number;
  user_id: number;
  user_name?: string;
  created_at: string;
}

export interface TaskStats {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  critical_tasks: number;
  high_tasks: number;
  overdue_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface ProjectStats {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  critical_tasks: number;
  high_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface UserWorkload {
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  critical_tasks: number;
  high_tasks: number;
  overdue_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
} 