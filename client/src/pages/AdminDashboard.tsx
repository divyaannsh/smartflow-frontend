import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  People,
  Assignment,
  Schedule,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  Edit,
  Person,
  Work,
  Timer,
  Group,
  AdminPanelSettings,
  FilterList,
  Search,
} from '@mui/icons-material';
import { usersService, tasksService, projectsService } from '../services/apiService';
import { User, Task, Project, UserWorkload } from '../types';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userWorkloads, setUserWorkloads] = useState<Record<number, UserWorkload>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailDialog, setUserDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [usersData, tasksData, projectsData] = await Promise.all([
        usersService.getAll(),
        tasksService.getAll(),
        projectsService.getAll(),
      ]);

      setUsers(usersData);
      setTasks(tasksData);
      setProjects(projectsData);

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
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserDetail = (user: User) => {
    setSelectedUser(user);
    setUserDetailDialog(true);
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

  const getWorkloadPercentage = (workload: UserWorkload) => {
    const totalTasks = workload.total_tasks;
    const completedTasks = workload.done_tasks;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUserTasks = (userId: number) => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  const getUserProjects = (userId: number) => {
    const userTasks = getUserTasks(userId);
    const projectIds = Array.from(new Set(userTasks.map(task => task.project_id)));
    return projects.filter(project => projectIds.includes(project.id));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettings sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">Admin Dashboard</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Team Overview" icon={<People />} />
          <Tab label="Task Management" icon={<Assignment />} />
          <Tab label="Performance Analytics" icon={<TrendingUp />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          <Grid container spacing={3}>
            {filteredUsers.map((user) => {
              const workload = userWorkloads[user.id];
              const userTasks = getUserTasks(user.id);
              const userProjects = getUserProjects(user.id);

              return (
                <Grid item xs={12} md={6} lg={4} key={user.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, width: 48, height: 48 }}>
                          {user.full_name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{user.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username} • {user.role}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleUserDetail(user)}>
                          <Visibility />
                        </IconButton>
                      </Box>

                      {workload && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Workload Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(getWorkloadPercentage(workload))}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getWorkloadPercentage(workload)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={`${userTasks.length} tasks`}
                          size="small"
                          icon={<Assignment />}
                        />
                        <Chip
                          label={`${userProjects.length} projects`}
                          size="small"
                          icon={<Work />}
                        />
                      </Box>

                      {workload && (
                        <Grid container spacing={1}>
                          <Grid item xs={3}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary">
                                {workload.total_tasks}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={3}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="info.main">
                                {workload.in_progress_tasks}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Active
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={3}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="success.main">
                                {workload.done_tasks}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Done
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={3}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="error.main">
                                {workload.overdue_tasks}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Overdue
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="review">Review</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => {
                  const assignedUser = users.find(u => u.id === task.assigned_to);
                  const project = projects.find(p => p.id === task.project_id);

                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.description?.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {assignedUser ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {assignedUser.full_name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {assignedUser.full_name}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Unassigned
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {project?.name || 'Unknown Project'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status.replace('_', ' ')}
                          color={getStatusColor(task.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          color={getPriorityColor(task.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Task">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Task">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Team Performance Overview
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {users.map((user) => {
                      const workload = userWorkloads[user.id];
                      if (!workload) return null;

                      return (
                        <Box key={user.id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{user.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(getWorkloadPercentage(workload))}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getWorkloadPercentage(workload)}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Task Distribution
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">To Do</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tasks.filter(t => t.status === 'todo').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">In Progress</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tasks.filter(t => t.status === 'in_progress').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Review</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tasks.filter(t => t.status === 'review').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Done</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tasks.filter(t => t.status === 'done').length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* User Detail Dialog */}
      <Dialog open={userDetailDialog} onClose={() => setUserDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar>{selectedUser?.full_name.charAt(0)}</Avatar>
            <Typography variant="h6">{selectedUser?.full_name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Username:</strong> @{selectedUser.username}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Role:</strong> {selectedUser.role}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Current Tasks
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Deadline</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getUserTasks(selectedUser.id).map((task) => {
                      const project = projects.find(p => p.id === task.project_id);
                      return (
                        <TableRow key={task.id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{project?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip
                              label={task.status.replace('_', ' ')}
                              color={getStatusColor(task.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={task.priority}
                              color={getPriorityColor(task.priority) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 