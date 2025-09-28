import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Person,
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
  Visibility,
  Edit,
  Add,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  PriorityHigh,
  Done,
  Pending,
  Block,
  Work,
  EmojiEvents,
  Timeline,
} from '@mui/icons-material';
import { projectsService, tasksService, usersService } from '../services/apiService';
import NotificationDashboard from '../components/NotificationDashboard';
import { Project, Task, User, TaskStats } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserPortal: React.FC = () => {
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
    loadUserData();
  }, []);

  const loadUserData = async () => {
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
      setError(err.response?.data?.error || 'Failed to load user data');
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
      case 'done': return 'success';
      case 'in_progress': return 'info';
      case 'review': return 'warning';
      case 'todo': return 'default';
      default: return 'default';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Done color="success" />;
      case 'in_progress': return <Pending color="warning" />;
      case 'review': return <Timeline color="info" />;
      case 'todo': return <Schedule color="action" />;
      default: return <Block color="error" />;
    }
  };

  // Get current user's tasks
  const getUserTasks = () => {
    return tasks.filter(task => task.assigned_to === user?.id);
  };

  // Get current user's projects
  const getUserProjects = () => {
    const userTaskProjectIds = getUserTasks().map(task => task.project_id);
    return projects.filter(project => userTaskProjectIds.includes(project.id));
  };

  // Get overdue tasks for current user
  const getOverdueTasks = () => {
    return getUserTasks().filter(task => 
      task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'
    );
  };

  // Get today's tasks
  const getTodayTasks = () => {
    const today = new Date();
    return getUserTasks().filter(task => 
      task.deadline && new Date(task.deadline).toDateString() === today.toDateString()
    );
  };

  // Get this week's tasks
  const getThisWeekTasks = () => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    return getUserTasks().filter(task => 
      task.deadline && new Date(task.deadline) <= endOfWeek && task.status !== 'done'
    );
  };

  // Calculate user's completion rate
  const getCompletionRate = () => {
    const userTasks = getUserTasks();
    const totalTasks = userTasks.length;
    if (totalTasks === 0) return 0;
    const completedTasks = userTasks.filter(task => task.status === 'done').length;
    return (completedTasks / totalTasks) * 100;
  };

  // Calculate productivity score
  const getProductivityScore = () => {
    const completionRate = getCompletionRate();
    const overdueTasks = getOverdueTasks().length;
    const totalTasks = getUserTasks().length;
    
    if (totalTasks === 0) return 100;
    
    const overduePenalty = (overdueTasks / totalTasks) * 30;
    return Math.max(0, completionRate - overduePenalty);
  };

  const UserStatCard: React.FC<{
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

  const PersonalProgress: React.FC = () => {
    const completionRate = getCompletionRate();
    const productivityScore = getProductivityScore();
    const userTasks = getUserTasks();
    const completedTasks = userTasks.filter(task => task.status === 'done').length;
    
    return (
      <Slide direction="up" in timeout={400}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Person sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                My Progress
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {Math.round(completionRate)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completion Rate
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={completionRate}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {Math.round(productivityScore)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Productivity Score
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={productivityScore}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {completedTasks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasks Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {getOverdueTasks().length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const TodayTasks: React.FC = () => {
    const todayTasks = getTodayTasks();
    
    return (
      <Slide direction="up" in timeout={500}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarToday sx={{ fontSize: 32, color: 'secondary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Today's Tasks
              </Typography>
            </Box>
            
            {todayTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">
                  No tasks due today!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Great job staying on top of your work.
                </Typography>
              </Box>
            ) : (
              <List>
                {todayTasks.map((task, index) => (
                  <Fade in timeout={600 + index * 100} key={task.id}>
                    <ListItem sx={{ px: 0, mb: 2 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.2) }}>
                          {getTaskStatusIcon(task.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {task.title}
                            </Typography>
                            <Chip
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {task.description?.substring(0, 60)}...
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="View Task">
                          <IconButton size="small">
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

  const UpcomingDeadlines: React.FC = () => {
    const thisWeekTasks = getThisWeekTasks();
    
    return (
      <Slide direction="up" in timeout={600}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Schedule sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Upcoming Deadlines
              </Typography>
            </Box>
            
            {thisWeekTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EmojiEvents sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">
                  All caught up!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No urgent deadlines this week.
                </Typography>
              </Box>
            ) : (
              <List>
                {thisWeekTasks.slice(0, 5).map((task, index) => {
                  const daysUntilDeadline = task.deadline ? 
                    Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  return (
                    <Fade in timeout={700 + index * 100} key={task.id}>
                      <ListItem sx={{ px: 0, mb: 2 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            backgroundColor: daysUntilDeadline <= 1 ? 'error.main' : 
                              daysUntilDeadline <= 3 ? 'warning.main' : 'info.main' 
                          }}>
                            {daysUntilDeadline}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {task.title}
                              </Typography>
                              <Chip
                                label={daysUntilDeadline === 0 ? 'Today' : 
                                  daysUntilDeadline === 1 ? 'Tomorrow' : 
                                  `${daysUntilDeadline} days`}
                                size="small"
                                color={daysUntilDeadline <= 1 ? 'error' : 
                                  daysUntilDeadline <= 3 ? 'warning' : 'info'}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="View Task">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Fade>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const MyTasks: React.FC = () => (
    <Slide direction="up" in timeout={700}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assignment sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                My Tasks
              </Typography>
            </Box>
            <Tooltip title="Add New Task">
              <IconButton
                size="small"
                onClick={() => navigate('/tasks')}
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
                  <TableCell sx={{ fontWeight: 600 }}>Task</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Deadline</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getUserTasks().map((task, index) => {
                  const project = projects.find(p => p.id === task.project_id);
                  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';
                  
                  return (
                    <Fade in timeout={800 + index * 100} key={task.id}>
                      <TableRow 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                          backgroundColor: isOverdue ? alpha(theme.palette.error.main, 0.05) : 'transparent',
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {task.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.description?.substring(0, 50)}...
                            </Typography>
                          </Box>
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
                          <Box>
                            <Typography variant="body2">
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </Typography>
                            {isOverdue && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Warning color="error" sx={{ fontSize: 12 }} />
                                <Typography variant="caption" color="error">
                                  Overdue
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Task">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => navigate(`/tasks/${task.id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Task">
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
            Welcome back, {user?.full_name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your personal workspace - Track your progress, manage deadlines, and stay productive.
          </Typography>

          {/* Show recent notifications for users too; fetches on mount so refresh shows latest */}
          <NotificationDashboard maxNotifications={5} showUnreadOnly={false} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <UserStatCard
                title="My Tasks"
                value={getUserTasks().length}
                icon={<Assignment />}
                color={theme.palette.primary.main}
                subtitle={`${getUserTasks().filter(t => t.status === 'done').length} completed`}
                trend={8}
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UserStatCard
                title="My Projects"
                value={getUserProjects().length}
                icon={<Work />}
                color={theme.palette.success.main}
                subtitle="Active projects"
                trend={12}
                trendDirection="up"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UserStatCard
                title="Today's Tasks"
                value={getTodayTasks().length}
                icon={<CalendarToday />}
                color={theme.palette.warning.main}
                subtitle="Due today"
                trend={-5}
                trendDirection="down"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <UserStatCard
                title="Overdue"
                value={getOverdueTasks().length}
                icon={<PriorityHigh />}
                color={theme.palette.error.main}
                subtitle="Needs attention"
                trend={-15}
                trendDirection="down"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <PersonalProgress />
            </Grid>
            <Grid item xs={12} md={4}>
              <TodayTasks />
            </Grid>
            <Grid item xs={12} md={4}>
              <UpcomingDeadlines />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <MyTasks />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default UserPortal; 