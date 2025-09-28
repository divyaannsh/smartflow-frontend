import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Edit,
  Person,
  Email,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usersService } from '../services/apiService';
import { User, Task, UserWorkload } from '../types';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [workload, setWorkload] = useState<UserWorkload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
  });

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [userInfo, tasks, workloadData] = await Promise.all([
        usersService.getById(user!.id),
        usersService.getTasks(user!.id),
        usersService.getWorkload(user!.id),
      ]);
      
      setUserData(userInfo);
      setUserTasks(tasks);
      setWorkload(workloadData);
      setEditForm({
        full_name: userInfo.full_name,
        email: userInfo.email,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleEditProfile = async () => {
    try {
      if (!userData) return;
      
      const updatedUser = await usersService.update(userData.id, editForm);
      setUserData(updatedUser);
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'member': return 'info';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  const getWorkloadPercentage = () => {
    if (!workload) return 0;
    const totalTasks = workload.total_tasks;
    const completedTasks = workload.done_tasks;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box>
        <Alert severity="error">Failed to load user profile</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
              {userData.full_name.charAt(0)}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {userData.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              @{userData.username}
            </Typography>
            <Chip
              label={userData.role}
              color={getRoleColor(userData.role) as any}
              sx={{ mb: 2 }}
            />
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">{userData.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">Member since {new Date(userData.created_at).toLocaleDateString()}</Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Edit Profile
            </Button>
          </Paper>
        </Grid>

        {/* Workload Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workload Overview
            </Typography>
            {workload && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {workload.done_tasks}/{workload.total_tasks} tasks completed
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getWorkloadPercentage()}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {workload.total_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {workload.done_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {workload.in_progress_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error">
                      {workload.overdue_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* My Tasks */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Tasks ({userTasks.length})
            </Typography>
            {userTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                No tasks assigned yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {userTasks.map((task) => (
                  <Grid item xs={12} sm={6} md={4} key={task.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority) as any}
                            size="small"
                          />
                          <Chip
                            label={task.status.replace('_', ' ')}
                            color={getStatusColor(task.status) as any}
                            size="small"
                          />
                        </Box>
                        {task.project_name && (
                          <Typography variant="caption" color="text.secondary">
                            Project: {task.project_name}
                          </Typography>
                        )}
                        {task.deadline && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Full Name"
              value={editForm.full_name}
              onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditProfile} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile; 