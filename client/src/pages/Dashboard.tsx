import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
} from '@mui/material';
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
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getProjectTeamMembers = (project: Project) => {
    // Get users assigned to tasks in this project
    const projectTaskUserIds = tasks
      .filter(task => task.project_id === project.id && task.assigned_to)
      .map(task => task.assigned_to)
      .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
    
    return users.filter(user => projectTaskUserIds.includes(user.id));
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Box sx={{ color, mr: 1 }}>
          {icon}
        </Box>
        <Typography variant="h4" color={color}>
          {value}
        </Typography>
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  const RecentTasks: React.FC = () => {
    const recentTasks = tasks
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Tasks
          </Typography>
          {recentTasks.map((task) => (
            <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">
                  {task.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.project_name} • {task.assigned_to_name || 'Unassigned'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  const ProjectProgress: React.FC = () => {
    const activeProjects = projects.filter(p => p.status === 'active');
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Project Progress
          </Typography>
          {activeProjects.map((project) => {
            const progress = getProjectProgress(project);
            return (
              <Box key={project.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {tasks.filter(t => t.project_id === project.id && t.status === 'done').length}/{tasks.filter(t => t.project_id === project.id).length} tasks completed
                </Typography>
              </Box>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  const LiveProjectsOverview: React.FC = () => {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Live Projects Overview
            </Typography>
            <IconButton 
              color="primary" 
              onClick={() => navigate('/projects')}
              size="small"
            >
              <Add />
            </IconButton>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => {
                  const progress = getProjectProgress(project);
                  const teamMembers = getProjectTeamMembers(project);
                  const projectTasks = tasks.filter(task => task.project_id === project.id);
                  const overdueTasks = projectTasks.filter(task => 
                    task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done'
                  ).length;
                  
                  return (
                    <TableRow key={project.id} hover>
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
                          <Tooltip title="Delete Project">
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {projects.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No projects found. Create your first project!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

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
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Notification Dashboard */}
      <NotificationDashboard maxNotifications={3} showUnreadOnly={false} />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={projects.length}
            icon={<Folder />}
            color="primary.main"
            subtitle={`${projects.filter(p => p.status === 'active').length} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={tasks.length}
            icon={<Assignment />}
            color="secondary.main"
            subtitle={taskStats ? `${taskStats.done_tasks} completed` : ''}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={users.length}
            icon={<People />}
            color="success.main"
            subtitle={`${users.filter(u => u.role === 'admin').length} admins`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Tasks"
            value={taskStats?.overdue_tasks || 0}
            icon={<Schedule />}
            color="error.main"
            subtitle="Needs attention"
          />
        </Grid>
      </Grid>

      {taskStats && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Task Status Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="success.main">
                      {taskStats.done_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Warning color="warning" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="warning.main">
                      {taskStats.in_progress_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Assignment color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="info.main">
                      {taskStats.todo_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      To Do
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Error color="error" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="error.main">
                      {taskStats.overdue_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Priority Distribution
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {taskStats.critical_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Critical
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {taskStats.high_tasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Priority
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Live Projects Overview - Jira-like interface */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <LiveProjectsOverview />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <RecentTasks />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProjectProgress />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 