import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Alert,
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
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  Folder,
  Assignment,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Visibility,
  Edit,
  Delete,
  Add,
  Person,
  Group,
  Notifications,
  Speed,
  Timeline,
  Assessment,
  Dashboard,
  Work,
  Security,
  Settings,
  Analytics,
  BarChart,
  PieChart,
  Timeline as TimelineIcon,
  CalendarToday,
  PriorityHigh,
  Schedule,
  Done,
  Pending,
  Block,
} from '@mui/icons-material';
import { projectsService, tasksService, usersService } from '../services/apiService';
import { Project, Task, User, TaskStats } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
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
      setError(err.response?.data?.error || 'Failed to load admin data');
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

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Done color="success" />;
      case 'in_progress': return <Pending color="warning" />;
      case 'review': return <TimelineIcon color="info" />;
      case 'todo': return <Schedule color="action" />;
      default: return <Block color="error" />;
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

  const getOverdueTasks = () => {
    return tasks.filter(task => 
      task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'
    );
  };

  const getCriticalTasks = () => {
    return tasks.filter(task => task.priority === 'critical' && task.status !== 'done');
  };

  const getTeamPerformance = () => {
    return users.map(user => {
      const userTasks = tasks.filter(task => task.assigned_to === user.id);
      const completedTasks = userTasks.filter(task => task.status === 'done').length;
      const totalTasks = userTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      return {
        ...user,
        totalTasks,
        completedTasks,
        completionRate,
        overdueTasks: userTasks.filter(task => 
          task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'
        ).length
      };
    });
  };

  const AdminStatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: number;
    trendDirection?: 'up' | 'down';
  }> = ({ title, value, icon, color, subtitle, trend, trendDirection }) => (
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
                label={`${trendDirection === 'up' ? '+' : ''}${trend}%`}
                size="small"
                color={trendDirection === 'up' ? 'success' : 'error'}
                icon={trendDirection === 'up' ? <TrendingUp /> : <TrendingDown />}
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

  const SystemOverview: React.FC = () => (
    <Slide direction="up" in timeout={400}>
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AdminPanelSettings sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              System Overview
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {projects.filter(p => p.status === 'active').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {getOverdueTasks().length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue Tasks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {users.filter(u => u.role === 'admin').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Admin Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {getCriticalTasks().length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Tasks
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Slide>
  );

  const TeamPerformance: React.FC = () => {
    const teamPerformance = getTeamPerformance();
    
    return (
      <Slide direction="up" in timeout={500}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <People sx={{ fontSize: 32, color: 'secondary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Team Performance
              </Typography>
            </Box>
            
            <List>
              {teamPerformance.map((member, index) => (
                <Fade in timeout={600 + index * 100} key={member.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)` }}>
                        {member.full_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {member.full_name}
                          </Typography>
                          <Chip
                            label={member.role}
                            size="small"
                            color={member.role === 'admin' ? 'error' : member.role === 'manager' ? 'warning' : 'info'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.completedTasks}/{member.totalTasks} tasks completed
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={member.completionRate}
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">
                              {Math.round(member.completionRate)}%
                            </Typography>
                          </Box>
                          {member.overdueTasks > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <Warning color="error" sx={{ fontSize: 12 }} />
                              <Typography variant="caption" color="error">
                                {member.overdueTasks} overdue
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="View Profile">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Fade>
              ))}
            </List>
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const CriticalTasksAlert: React.FC = () => {
    const criticalTasks = getCriticalTasks();
    
    return (
      <Slide direction="up" in timeout={600}>
        <Card sx={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PriorityHigh sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Critical Tasks Alert
              </Typography>
            </Box>
            
            {criticalTasks.length === 0 ? (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                No critical tasks pending. Great job!
              </Typography>
            ) : (
              <List>
                {criticalTasks.slice(0, 5).map((task, index) => (
                  <Fade in timeout={700 + index * 100} key={task.id}>
                    <ListItem sx={{ px: 0, color: 'white' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                          {getTaskStatusIcon(task.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={task.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {task.description?.substring(0, 60)}...
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="View Task">
                          <IconButton size="small" sx={{ color: 'white' }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </Fade>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const ProjectManagement: React.FC = () => (
    <Slide direction="up" in timeout={700}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Folder sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Project Management
              </Typography>
            </Box>
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
                    <Fade in timeout={800 + index * 100} key={project.id}>
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
            Welcome, Administrator! 👨‍💼
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            System administration dashboard - Monitor team performance, manage projects, and oversee operations.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AdminStatCard
                title="Total Users"
                value={users.length}
                icon={<People />}
                color={theme.palette.primary.main}
                subtitle={`${users.filter(u => u.role === 'admin').length} admins`}
                trend={12}
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminStatCard
                title="Active Projects"
                value={projects.filter(p => p.status === 'active').length}
                icon={<Folder />}
                color={theme.palette.success.main}
                subtitle={`${projects.length} total projects`}
                trend={8}
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminStatCard
                title="Total Tasks"
                value={tasks.length}
                icon={<Assignment />}
                color={theme.palette.warning.main}
                subtitle={taskStats ? `${taskStats.done_tasks} completed` : ''}
                trend={-5}
                trendDirection="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AdminStatCard
                title="Critical Issues"
                value={getCriticalTasks().length}
                icon={<PriorityHigh />}
                color={theme.palette.error.main}
                subtitle="Requires attention"
                trend={-15}
                trendDirection="down"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <SystemOverview />
            </Grid>
            <Grid item xs={12} md={4}>
              <TeamPerformance />
            </Grid>
            <Grid item xs={12} md={4}>
              <CriticalTasksAlert />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <ProjectManagement />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default AdminDashboard; 