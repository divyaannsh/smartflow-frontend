import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Assignment,
  Schedule,
  Person,
  Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tasksService } from '../services/apiService';
import { Task } from '../types';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksService.getAll();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksService.updateStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as any } : task
      ));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusTasks = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
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

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }} onClick={() => navigate(`/tasks/${task.id}`)}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flex: 1 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={task.priority}
              color={getPriorityColor(task.priority) as any}
              size="small"
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tasks/${task.id}/edit`);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {task.project_name && (
            <Chip
              label={task.project_name}
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${task.project_id}`);
              }}
              clickable
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assigned_to_name && (
              <Tooltip title={task.assigned_to_name}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {task.assigned_to_name.charAt(0)}
                </Avatar>
              </Tooltip>
            )}
            {task.deadline && (
              <Tooltip title={`Deadline: ${new Date(task.deadline).toLocaleDateString()}`}>
                <Schedule fontSize="small" color="action" />
              </Tooltip>
            )}
            {task.estimated_hours && (
              <Tooltip title={`Estimated: ${task.estimated_hours}h`}>
                <Typography variant="caption" color="text.secondary">
                  {task.estimated_hours}h
                </Typography>
              </Tooltip>
            )}
          </Box>
          
          <Chip
            label={task.status.replace('_', ' ')}
            color={getStatusColor(task.status) as any}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus = getNextStatus(task.status);
              if (nextStatus) handleStatusChange(task.id, nextStatus);
            }}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'todo': 'in_progress',
      'in_progress': 'review',
      'review': 'done',
      'done': null
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const statusColumns = [
    { key: 'todo', label: 'To Do', color: '#e3f2fd' },
    { key: 'in_progress', label: 'In Progress', color: '#fff3e0' },
    { key: 'review', label: 'Review', color: '#fce4ec' },
    { key: 'done', label: 'Done', color: '#e8f5e8' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tasks/new')}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant={viewMode === 'kanban' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('kanban')}
              size="small"
            >
              Kanban
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip
              icon={<FilterList />}
              label={`${filteredTasks.length} tasks`}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

      {filteredTasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </Typography>
        </Box>
      ) : viewMode === 'kanban' ? (
        <Grid container spacing={2}>
          {statusColumns.map((column) => {
            const columnTasks = getStatusTasks(column.key);
            return (
              <Grid item xs={12} sm={6} md={3} key={column.key}>
                <Box
                  sx={{
                    backgroundColor: column.color,
                    borderRadius: 1,
                    p: 2,
                    minHeight: '500px',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {column.label} ({columnTasks.length})
                  </Typography>
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <TaskCard task={task} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Tasks; 