import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
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
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add,
  Assignment,
  Person,
  Work,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import { projectsService, tasksService, usersService } from '../services/apiService';
import { Project, Task, User, UserWorkload } from '../types';

const AdminTaskAssignment: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userWorkloads, setUserWorkloads] = useState<Record<number, UserWorkload>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    assigned_to: '',
    priority: 'medium',
    deadline: '',
    estimated_hours: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, usersData, tasksData] = await Promise.all([
        projectsService.getAll(),
        usersService.getAll(),
        tasksService.getAll(),
      ]);
      
      setProjects(projectsData);
      setUsers(usersData);
      setTasks(tasksData);
      
      // Load workloads for each user
      const workloads: Record<number, UserWorkload> = {};
      for (const user of usersData) {
        try {
          const workload = await usersService.getWorkload(user.id);
          workloads[user.id] = workload;
        } catch (err) {
          console.error(`Failed to load workload for user ${user.id}:`, err);
        }
      }
      setUserWorkloads(workloads);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    try {
      if (!selectedTask) return;
      
      const updatedTask = await tasksService.update(selectedTask.id, {
        assigned_to: parseInt(assignmentForm.assigned_to),
        priority: assignmentForm.priority as any,
        deadline: assignmentForm.deadline,
        estimated_hours: assignmentForm.estimated_hours ? parseFloat(assignmentForm.estimated_hours) : undefined,
      });
      
      setTasks(tasks.map(task => task.id === selectedTask.id ? updatedTask : task));
      setAssignmentDialogOpen(false);
      setSelectedTask(null);
      setAssignmentForm({
        assigned_to: '',
        priority: 'medium',
        deadline: '',
        estimated_hours: '',
      });
      
      // Reload workloads
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign task');
    }
  };

  const openAssignmentDialog = (task: Task) => {
    setSelectedTask(task);
    setAssignmentForm({
      assigned_to: task.assigned_to?.toString() || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
      estimated_hours: task.estimated_hours?.toString() || '',
    });
    setAssignmentDialogOpen(true);
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

  const getWorkloadPercentage = (userId: number) => {
    const workload = userWorkloads[userId];
    if (!workload) return 0;
    const totalTasks = workload.total_tasks;
    const completedTasks = workload.done_tasks;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const unassignedTasks = tasks.filter(task => !task.assigned_to);
  const assignedTasks = tasks.filter(task => task.assigned_to);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Task Assignment Center
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Team Workload Overview */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Workload Overview
            </Typography>
            <Grid container spacing={2}>
              {users.map((user) => {
                const workload = userWorkloads[user.id];
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ mr: 2 }}>
                            {user.full_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {user.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.role}
                            </Typography>
                          </Box>
                        </Box>
                        {workload && (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Progress
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {workload.done_tasks}/{workload.total_tasks} tasks
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={getWorkloadPercentage(user.id)}
                              sx={{ height: 6, borderRadius: 3, mb: 1 }}
                            />
                            <Grid container spacing={1}>
                              <Grid size={{ xs: 6 }}>
                                <Typography variant="h6" color="success.main">
                                  {workload.done_tasks}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Done
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Typography variant="h6" color="warning.main">
                                  {workload.in_progress_tasks}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  In Progress
                                </Typography>
                              </Grid>
                              {workload.overdue_tasks > 0 && (
                                <Grid size={{ xs: 12 }}>
                                  <Typography variant="h6" color="error">
                                    {workload.overdue_tasks} overdue
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>

        {/* Unassigned Tasks */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Unassigned Tasks ({unassignedTasks.length})
            </Typography>
            {unassignedTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                All tasks have been assigned
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unassignedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="caption" color="text.secondary">
                              {task.description.substring(0, 50)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{task.project_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            color={getPriorityColor(task.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status.replace('_', ' ')}
                            color={getStatusColor(task.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Assignment />}
                            onClick={() => openAssignmentDialog(task)}
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Assigned Tasks */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Assigned Tasks ({assignedTasks.length})
            </Typography>
            {assignedTasks.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                No tasks have been assigned yet
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedTasks.map((task) => {
                      const assignedUser = users.find(u => u.id === task.assigned_to);
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Typography variant="subtitle2">
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary">
                                {task.description.substring(0, 50)}...
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                {assignedUser?.full_name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {assignedUser?.full_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{task.project_name}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.status.replace('_', ' ')}
                              color={getStatusColor(task.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Assignment />}
                              onClick={() => openAssignmentDialog(task)}
                            >
                              Reassign
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? `Assign Task: ${selectedTask.title}` : 'Assign Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={assignmentForm.assigned_to}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                label="Assign To"
              >
                {users.map((user) => {
                  const workload = userWorkloads[user.id];
                  const workloadPercentage = workload ? getWorkloadPercentage(user.id) : 0;
                  return (
                    <MenuItem key={user.id} value={user.id.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {user.full_name.charAt(0)}
                          </Avatar>
                          <Typography>{user.full_name}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {workload ? `${workload.total_tasks} tasks (${Math.round(workloadPercentage)}% done)` : 'No tasks'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={assignmentForm.priority}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, priority: e.target.value }))}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Deadline"
              type="date"
              value={assignmentForm.deadline}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, deadline: e.target.value }))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Estimated Hours"
              type="number"
              value={assignmentForm.estimated_hours}
              onChange={(e) => setAssignmentForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignTask} variant="contained" disabled={!assignmentForm.assigned_to}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTaskAssignment; 