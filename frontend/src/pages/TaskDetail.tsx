import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  ArrowBack,
  Send,
  Pause,
  PlayArrow,
  Stop,
  Reply,
  Assignment,
  AttachFile,
  Notifications,
} from '@mui/icons-material';
import { tasksService, projectsService, usersService } from '../services/apiService';
import { Task, Project, User, Comment as CommentType } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
    deadline: string;
    estimated_hours: number;
    assigned_to: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    deadline: '',
    estimated_hours: 0,
    assigned_to: '',
  });

  const loadTaskData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskData, projectsData, usersData] = await Promise.all([
        tasksService.getById(parseInt(id!)),
        projectsService.getAll(),
        usersService.getAll(),
      ]);
      
      setTask(taskData);
      setProject(projectsData.find(p => p.id === taskData.project_id) || null);
      setUsers(usersData);
      
      // Initialize edit form
      setEditForm({
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status,
        priority: taskData.priority,
        deadline: taskData.deadline || '',
        estimated_hours: taskData.estimated_hours || 0,
        assigned_to: taskData.assigned_to?.toString() || '',
      });

      // Load comments (mock data for now)
      setComments([
        {
          id: 1,
          content: 'Task has been assigned and work is in progress.',
          task_id: parseInt(id!),
          user_id: 1,
          user_name: 'John Doe',
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          content: 'Updated the requirements based on client feedback.',
          task_id: parseInt(id!),
          user_id: 2,
          user_name: 'Jane Smith',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load task data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadTaskData();
    }
  }, [id, loadTaskData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleEditTask = async () => {
    try {
      const taskData = {
        ...editForm,
        assigned_to: editForm.assigned_to ? parseInt(editForm.assigned_to) : undefined,
      };
      const updatedTask = await tasksService.update(parseInt(id!), taskData);
      setTask(updatedTask);
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await tasksService.delete(parseInt(id!));
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      // Mock comment addition
      const newComment: CommentType = {
        id: comments.length + 1,
        content: commentText,
        task_id: parseInt(id!),
        user_id: 1, // Current user ID
        user_name: 'Current User',
        created_at: new Date().toISOString(),
      };
      
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await tasksService.updateStatus(parseInt(id!), newStatus);
      setTask(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'todo': return 'in_progress';
      case 'in_progress': return 'review';
      case 'review': return 'done';
      default: return currentStatus;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box p={3}>
        <Alert severity="warning">Task not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/tasks')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>
            {task.title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={task.status.replace('_', ' ')} 
              color={getStatusColor(task.status) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip 
              label={task.priority} 
              color={getPriorityColor(task.priority) as any}
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            {project && (
              <Chip 
                label={project.name} 
                color="primary" 
                size="small"
                onClick={() => navigate(`/projects/${project.id}`)}
                clickable
              />
            )}
          </Box>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="done">Done</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleStatusChange(getNextStatus(task.status))}
                disabled={task.status === 'done'}
              >
                Move to {getNextStatus(task.status).replace('_', ' ')}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                Time Tracking:
              </Typography>
              <Typography variant="h6" fontFamily="monospace">
                {formatTime(timerSeconds)}
              </Typography>
              <IconButton onClick={toggleTimer} color={isTimerRunning ? 'error' : 'primary'}>
                {isTimerRunning ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={resetTimer} size="small">
                <Stop />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Details" />
              <Tab label="Comments" />
              <Tab label="Attachments" />
              <Tab label="History" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Task Details
              </Typography>
              
              <Typography variant="body1" paragraph>
                {task.description || 'No description available'}
              </Typography>

              <Grid container spacing={2} mb={3}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body1">
                    {task.assigned_to_name || 'Unassigned'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body1">
                    {task.created_by_name}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Hours
                  </Typography>
                  <Typography variant="body1">
                    {task.estimated_hours || 0}h
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Actual Hours
                  </Typography>
                  <Typography variant="body1">
                    {task.actual_hours || 0}h
                  </Typography>
                </Grid>
              </Grid>

              {task.deadline && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary">
                    Deadline
                  </Typography>
                  <Typography variant="body1">
                    {new Date(task.deadline).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(task.created_at).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(task.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Comments</Typography>
                <Typography variant="body2" color="text.secondary">
                  {comments.length} comments
                </Typography>
              </Box>

              <Box mb={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  Add Comment
                </Button>
              </Box>

              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{comment.user_name?.charAt(0) || '?'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {comment.user_name || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(comment.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {comment.content}
                        </Typography>
                      }
                    />
                    <IconButton size="small">
                      <Reply />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Attachments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File attachments coming soon...
              </Typography>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Task History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activity history coming soon...
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Task Information
            </Typography>
            
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Project
              </Typography>
              <Typography variant="body1">
                {project?.name || 'Unknown Project'}
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Priority
              </Typography>
              <Chip 
                label={task.priority} 
                color={getPriorityColor(task.priority) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={task.status.replace('_', ' ')} 
                color={getStatusColor(task.status) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            {task.deadline && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Deadline
                </Typography>
                <Typography variant="body1">
                  {new Date(task.deadline).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Time Tracking
              </Typography>
              <Typography variant="body1">
                Estimated: {task.estimated_hours || 0}h
              </Typography>
              <Typography variant="body1">
                Actual: {task.actual_hours || 0}h
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assignment />}
              sx={{ mb: 1 }}
            >
              Reassign Task
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<AttachFile />}
              sx={{ mb: 1 }}
            >
              Add Attachment
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Notifications />}
            >
              Set Reminder
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Task Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
              label="Status"
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={editForm.assigned_to}
              onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
              label="Assigned To"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id.toString()}>
                  {user.full_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Estimated Hours"
            type="number"
            value={editForm.estimated_hours}
            onChange={(e) => setEditForm({ ...editForm, estimated_hours: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            value={editForm.deadline}
            onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditTask} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteTask} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetail; 