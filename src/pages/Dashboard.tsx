import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  Badge,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Assignment,
  Folder,
  People,
  TrendingUp,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  Edit,
  Delete,
  Add,
  Person,
  Group,
  Notifications,
  TrendingDown,
  Speed,
  Timeline,
} from '@mui/icons-material';
import { projectsService, tasksService, usersService } from '../services/apiService';
import { Project, Task, User, TaskStats } from '../types';
import { useNavigate } from 'react-router-dom';
import NotificationDashboard from '../components/NotificationDashboard';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, usersData, statsData] = await Promise.all([
        projectsService.getAll(),
        tasksService.getAll(),
        usersService.getAll(),
        tasksService.getStats(),
      ]);
      
      setProjects(projectsData);
      setTasks(tasksData);
      setUsers(usersData);
      setTaskStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'on_hold': return 'warning';
      default: return 'default';
    }
  };

  const getProjectProgress = (project: Project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const totalTasks = projectTasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return (completedTasks / totalTasks) * 100;
  };

  const getProjectTeamMembers = (project: Project) => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const memberIds = Array.from(new Set(projectTasks.map(task => task.assigned_to).filter(Boolean)));
    return users.filter(user => memberIds.includes(user.id));
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: number;
  }> = ({ title, value, icon, color, subtitle, trend }) => (
    <Grow in timeout={300}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 25px ${alpha(color, 0.3)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.2),
                color: color,
              }}
            >
              {icon}
            </Box>
            {trend !== undefined && (
              <Chip
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend > 0 ? 'success' : 'error'}
                icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {value.toLocaleString()}
          </Typography>
          <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  const RecentTasks: React.FC = () => (
    <Slide direction="up" in timeout={400}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent Tasks
            </Typography>
            <Tooltip title="View All Tasks">
              <IconButton
                size="small"
                onClick={() => navigate('/tasks')}
                sx={{ color: 'primary.main' }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {tasks.slice(0, 5).map((task, index) => (
              <Fade in timeout={500 + index * 100} key={task.id}>
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    backgroundColor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(task.status) as any}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {task.description?.substring(0, 60)}...
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority) as any}
                      variant="outlined"
                    />
                    {task.deadline && (
                      <Typography variant="caption" color="text.secondary">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Fade>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );

  const ProjectProgress: React.FC = () => (
    <Slide direction="up" in timeout={500}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Project Progress
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {projects.slice(0, 5).map((project, index) => {
              const progress = getProjectProgress(project);
              return (
                <Fade in timeout={600 + index * 100} key={project.id}>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {project.status.replace('_', ' ')}
                      </Typography>
                      <Chip
                        label={project.priority}
                        size="small"
                        color={getPriorityColor(project.priority) as any}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Fade>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Slide>
  );

  const LiveProjectsOverview: React.FC = () => (
    <Slide direction="up" in timeout={600}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Live Projects Overview
            </Typography>
            <Tooltip title="Add New Project">
              <IconButton
                size="small"
                onClick={() => navigate('/projects')}
                sx={{ color: 'primary.main' }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project, index) => {
                  const progress = getProjectProgress(project);
                  const teamMembers = getProjectTeamMembers(project);
                  const projectTasks = tasks.filter(task => task.project_id === project.id);
                  const overdueTasks = projectTasks.filter(task => 
                    task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'
                  ).length;
                  
                  return (
                    <Fade in timeout={700 + index * 100} key={project.id}>
                      <TableRow 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {project.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status.replace('_', ' ')}
                            color={getStatusColor(project.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.priority}
                            color={getPriorityColor(project.priority) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="caption">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {projectTasks.filter(t => t.status === 'done').length}/{projectTasks.length} tasks
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                              {teamMembers.map((member) => (
                                <Tooltip key={member.id} title={member.full_name}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                    {member.full_name.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </AvatarGroup>
                            {teamMembers.length === 0 && (
                              <Typography variant="caption" color="text.secondary">
                                No team
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="caption">
                              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                            </Typography>
                            {overdueTasks > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Warning color="error" sx={{ fontSize: 12 }} />
                                <Typography variant="caption" color="error">
                                  {overdueTasks} overdue
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Project">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => navigate(`/projects/${project.id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Project">
                              <IconButton size="small" color="info">
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Slide>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Fade in timeout={300}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome to SmartFlow AI, {users.find(u => u.id === 1)?.full_name || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Here's what's happening with your projects and team today.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Notification Dashboard */}
          <NotificationDashboard maxNotifications={3} showUnreadOnly={false} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Projects"
                value={projects.length}
                icon={<Folder />}
                color={theme.palette.primary.main}
                subtitle={`${projects.filter(p => p.status === 'active').length} active`}
                trend={12}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Tasks"
                value={tasks.length}
                icon={<Assignment />}
                color={theme.palette.secondary.main}
                subtitle={taskStats ? `${taskStats.done_tasks} completed` : ''}
                trend={-5}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Team Members"
                value={users.length}
                icon={<People />}
                color={theme.palette.success.main}
                subtitle={`${users.filter(u => u.role === 'admin').length} admins`}
                trend={8}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Overdue Tasks"
                value={taskStats?.overdue_tasks || 0}
                icon={<Schedule />}
                color={theme.palette.error.main}
                subtitle="Needs attention"
                trend={-15}
              />
            </Grid>
          </Grid>

          {taskStats && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Task Status Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.done_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Warning sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.in_progress_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Assignment sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.todo_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          To Do
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Error sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.overdue_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Overdue
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Priority Distribution
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.critical_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Critical
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {taskStats.high_tasks}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          High Priority
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Live Projects Overview - Jira-like interface */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={12}>
              <LiveProjectsOverview />
            </Grid>
          </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
              <RecentTasks />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
              <ProjectProgress />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default Dashboard; 