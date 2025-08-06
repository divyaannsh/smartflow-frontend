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
  Person,
  Assignment,
  Work,
  TrendingUp,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  Edit,
  Schedule,
  Timer,
  Group,
  Search,
} from '@mui/icons-material';
import { usersService, tasksService, projectsService } from '../services/apiService';
import { User, Task, Project, UserWorkload } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserPortal: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userWorkload, setUserWorkload] = useState<UserWorkload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [usersData, tasksData, projectsData, workloadData] = await Promise.all([
        usersService.getAll(),
        tasksService.getAll(),
        projectsService.getAll(),
        usersService.getWorkload(user.id),
      ]);

      setUsers(usersData);
      setTasks(tasksData);
      setProjects(projectsData);
      setUserWorkload(workloadData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  const getUserTasks = (userId: number) => {
    return tasks.filter(task => task.assigned_to === userId);
  };

  const getUserProjects = (userId: number) => {
    const userTasks = getUserTasks(userId);
    const projectIds = Array.from(new Set(userTasks.map(task => task.project_id)));
    return projects.filter(project => projectIds.includes(project.id));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const isAssignedToUser = task.assigned_to === user?.id;
    return matchesSearch && matchesStatus && isAssignedToUser;
  });

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Please log in to access your portal.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const userTasks = getUserTasks(user.id);
  const userProjects = getUserProjects(user.id);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Person sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4">My Portal</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user portal tabs">
          <Tab label="My Overview" icon={<Person />} />
          <Tab label="My Tasks" icon={<Assignment />} />
          <Tab label="Team View" icon={<Group />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, width: 64, height: 64 }}>
                      {user.full_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5">{user.full_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{user.username} • {user.role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  {userWorkload && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        My Workload
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(getWorkloadPercentage(userWorkload))}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getWorkloadPercentage(userWorkload)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary">
                              {userWorkload.total_tasks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="info.main">
                              {userWorkload.in_progress_tasks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Active
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="success.main">
                              {userWorkload.done_tasks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Done
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={3}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="error.main">
                              {userWorkload.overdue_tasks}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Overdue
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">My Tasks</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userTasks.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">My Projects</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userProjects.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Team Members</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {users.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2">Total Projects</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {projects.length}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search my tasks..."
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
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => {
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
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <Grid container spacing={3}>
            {users.map((teamMember) => {
              const memberTasks = getUserTasks(teamMember.id);
              const memberProjects = getUserProjects(teamMember.id);

              return (
                <Grid item xs={12} md={6} lg={4} key={teamMember.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2, width: 48, height: 48 }}>
                          {teamMember.full_name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{teamMember.full_name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{teamMember.username} • {teamMember.role}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={`${memberTasks.length} tasks`}
                          size="small"
                          icon={<Assignment />}
                        />
                        <Chip
                          label={`${memberProjects.length} projects`}
                          size="small"
                          icon={<Work />}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {teamMember.email}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserPortal; 