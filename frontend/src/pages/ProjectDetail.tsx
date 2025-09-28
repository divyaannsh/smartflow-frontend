import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  AvatarGroup,
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
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  ArrowBack,
} from '@mui/icons-material';
import { projectsService, tasksService, usersService } from '../services/apiService';
import { Project, Task, User } from '../types';

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'member' | 'manager' | 'admin'>('member');
  const [members, setMembers] = useState<Array<{ user_id: number; role: string; full_name: string; email: string }>>([]);
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    status: Project['status'];
    priority: Project['priority'];
    deadline: string;
  }>({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    deadline: '',
  });

  const loadProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectData, tasksData, usersData] = await Promise.all([
        projectsService.getById(parseInt(id!)),
        tasksService.getAll(),
        usersService.getAll(),
      ]);
      
      setProject(projectData);
      setTasks(tasksData.filter(task => task.project_id === parseInt(id!)));
      setUsers(usersData);
      try {
        const memberRows = await projectsService.getMembers(parseInt(id!));
        setMembers(memberRows);
      } catch (e) {
        // ignore
      }
      
      // Initialize edit form
      setEditForm({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status,
        priority: projectData.priority,
        deadline: projectData.deadline || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id, loadProjectData]);

  const handleAddMember = async () => {
    if (!selectedMember) return;
    try {
      await projectsService.addMember(parseInt(id!), parseInt(selectedMember), selectedRole);
      const updated = await projectsService.getMembers(parseInt(id!));
      setMembers(updated);
      setAddMemberDialogOpen(false);
      setSelectedMember('');
      setSelectedRole('member');
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    }
  };

  const handleEditProject = async () => {
    try {
      const updatedProject = await projectsService.update(parseInt(id!), editForm);
      setProject(updatedProject);
      setEditDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsService.delete(parseInt(id!));
      navigate('/projects');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete project';
      
      // Check if it's the "has tasks" error
      if (errorMessage.includes('existing tasks')) {
        setError(`Cannot delete project "${project?.name}" because it has ${tasks.length} associated task(s). Please delete or reassign all tasks first before deleting the project.`);
      } else {
        setError(errorMessage);
      }
    }
  };

  const getProjectProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'on_hold': return 'warning';
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

  const getTaskStatusCount = (status: string) => {
    return tasks.filter(task => task.status === status).length;
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

  if (!project) {
    return (
      <Box p={3}>
        <Alert severity="warning">Project not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/projects')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created by {project.created_by_name} on {new Date(project.created_at).toLocaleDateString()}
          </Typography>
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

      {/* Project Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Overview
            </Typography>
            <Typography variant="body1" paragraph>
              {project.description || 'No description available'}
            </Typography>
            
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {tasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {getTaskStatusCount('done')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {getTaskStatusCount('in_progress')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {getTaskStatusCount('todo')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProjectProgress()} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" mt={1}>
                {Math.round(getProjectProgress())}% Complete
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip 
                label={project.status.replace('_', ' ')} 
                color={getStatusColor(project.status) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Priority
              </Typography>
              <Chip 
                label={project.priority} 
                color={getPriorityColor(project.priority) as any}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            {project.deadline && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Deadline
                </Typography>
                <Typography variant="body1">
                  {new Date(project.deadline).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Team Members
              </Typography>
              <AvatarGroup max={6} sx={{ mt: 1 }}>
                {members.map((m) => (
                  <Tooltip key={m.user_id} title={`${m.full_name} • ${m.role}`}>
                    <Avatar>{m.full_name.charAt(0)}</Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Box mt={1}>
                <Button variant="outlined" size="small" onClick={() => setAddMemberDialogOpen(true)}>
                  Add Member
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Tasks" />
          <Tab label="Team" />
          <Tab label="Activity" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Project Tasks</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/tasks/new', { state: { projectId: project.id } })}
            >
              Add Task
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Deadline</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status.replace('_', ' ')} 
                        color={getStatusColor(task.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        color={getPriorityColor(task.priority) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {task.assigned_to_name ? (
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                            {task.assigned_to_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {task.assigned_to_name}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.deadline ? (
                        new Date(task.deadline).toLocaleDateString()
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No deadline
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>
          <List>
            {users.map((user) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Avatar>{user.full_name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.full_name}
                  secondary={`${user.email} • ${user.role}`}
                />
                <Chip 
                  label={user.role} 
                  color="primary" 
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Activity tracking coming soon...
          </Typography>
        </TabPanel>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on_hold">On Hold</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Project['priority'] })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
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
          <Button onClick={handleEditProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>User</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value as string)}
              label="User"
            >
              {users
                .filter(u => !members.some(m => m.user_id === u.id))
                .map(u => (
                  <MenuItem key={u.id} value={u.id.toString()}>
                    {u.full_name} ({u.email})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              label="Role"
            >
              <MenuItem value="member">Member</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={!selectedMember}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{project.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail; 