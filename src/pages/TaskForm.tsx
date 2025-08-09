import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Save,
  Cancel,
  ArrowBack,
  Assignment,
  Schedule,
  Person,
  PriorityHigh,
  Description,
} from '@mui/icons-material';
import { tasksService, projectsService, usersService } from '../services/apiService';
import { Task, Project, User } from '../types';
// import { notificationService } from '../services/notificationService'; // Temporarily disabled

const TaskForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
    deadline: string;
    estimated_hours: number;
    project_id: string;
    assigned_to: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
    estimated_hours: 0,
    project_id: location.state?.projectId || '',
    assigned_to: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData] = await Promise.all([
        projectsService.getAll(),
        usersService.getAll(),
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);

      if (isEditing && id) {
        const taskData = await tasksService.getById(parseInt(id));
        setTask(taskData);
        setFormData({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status,
          priority: taskData.priority,
          deadline: taskData.deadline || '',
          estimated_hours: taskData.estimated_hours || 0,
          project_id: taskData.project_id.toString(),
          assigned_to: taskData.assigned_to?.toString() || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (formData.deadline && new Date(formData.deadline) < new Date()) {
      newErrors.deadline = 'Deadline cannot be in the past';
    }

    if (formData.estimated_hours < 0) {
      newErrors.estimated_hours = 'Estimated hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskData = {
        project_id: parseInt(formData.project_id.toString()),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to.toString()) : undefined,
        estimated_hours: formData.estimated_hours,
        title: formData.title,
        description: formData.description,
        status: formData.status as Task['status'],
        priority: formData.priority as Task['priority'],
        deadline: formData.deadline
      };

      if (isEditing) {
        await tasksService.update(parseInt(id!), taskData);
      } else {
        const newTask = await tasksService.create(taskData);
        
        // Email notification temporarily disabled
        // if (taskData.assigned_to) {
        //   try {
        //     await notificationService.sendTaskAssignmentEmail(newTask.id, taskData.assigned_to);
        //     console.log('Task assignment email sent successfully');
        //   } catch (emailError) {
        //     console.error('Failed to send task assignment email:', emailError);
        //   }
        // }
      }

      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    let typedValue = value;
    
    // Cast specific fields to their proper types
    if (field === 'status') {
      typedValue = value as Task['status'];
    } else if (field === 'priority') {
      typedValue = value as Task['priority'];
    }
    
    setFormData(prev => ({ ...prev, [field]: typedValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                placeholder="Enter task title..."
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={4}
                placeholder="Describe the task in detail..."
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.project_id}>
                <InputLabel>Project *</InputLabel>
                <Select
                  value={formData.project_id}
                  onChange={(e) => handleInputChange('project_id', e.target.value)}
                  label="Project *"
                  required
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id.toString()}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={project.status.replace('_', ' ')} 
                          color={getStatusColor(project.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {project.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.project_id && (
                  <FormHelperText>{errors.project_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={formData.assigned_to}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                  label="Assigned To"
                >
                  <MenuItem value="">
                    <em>Unassigned</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id.toString()}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {user.full_name.charAt(0)}
                        </Avatar>
                        {user.full_name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Task Details */}
            <Grid size={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Task Details
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="todo">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="To Do" color="default" size="small" />
                      To Do
                    </Box>
                  </MenuItem>
                  <MenuItem value="in_progress">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="In Progress" color="info" size="small" />
                      In Progress
                    </Box>
                  </MenuItem>
                  <MenuItem value="review">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Review" color="warning" size="small" />
                      Review
                    </Box>
                  </MenuItem>
                  <MenuItem value="done">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Done" color="success" size="small" />
                      Done
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Low" color="success" size="small" />
                      Low
                    </Box>
                  </MenuItem>
                  <MenuItem value="medium">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Medium" color="info" size="small" />
                      Medium
                    </Box>
                  </MenuItem>
                  <MenuItem value="high">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="High" color="warning" size="small" />
                      High
                    </Box>
                  </MenuItem>
                  <MenuItem value="critical">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Critical" color="error" size="small" />
                      Critical
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                error={!!errors.deadline}
                helperText={errors.deadline}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                error={!!errors.estimated_hours}
                helperText={errors.estimated_hours}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tasks')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : (isEditing ? 'Update Task' : 'Create Task')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm; 