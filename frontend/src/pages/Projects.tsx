import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add, Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectsService } from '../services/apiService';
import { Project } from '../types';
import ProjectCardMemo from '../components/ProjectCardMemo';
import { useDebounce } from '../hooks/useDebounce';
import VirtualScroll from '../components/VirtualScroll';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Debounce search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteWithTasksDialogOpen, setDeleteWithTasksDialogOpen] = useState(false);
  const [projectToDeleteWithTasks, setProjectToDeleteWithTasks] = useState<Project | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAll();
      setProjects(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await projectsService.delete(projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete project';
      
      // Check if it's the "has tasks" error
      if (errorMessage.includes('existing tasks')) {
        setError(`Cannot delete project "${projectToDelete.name}" because it has associated tasks. Please use "Delete with Tasks" option instead.`);
        // Close the delete dialog and show the delete with tasks dialog instead
        setDeleteDialogOpen(false);
        setProjectToDeleteWithTasks(projectToDelete);
        setDeleteWithTasksDialogOpen(true);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleDeleteProjectWithTasks = async () => {
    if (!projectToDeleteWithTasks) return;
    
    try {
      await projectsService.deleteWithTasks(projectToDeleteWithTasks.id);
      setProjects(projects.filter(p => p.id !== projectToDeleteWithTasks.id));
      setDeleteWithTasksDialogOpen(false);
      setProjectToDeleteWithTasks(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete project with tasks';
      setError(errorMessage);
    }
  };

  // Memoized filtered projects for better performance
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           (project.description && project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [projects, debouncedSearchTerm, statusFilter, priorityFilter]);

  const handleViewProject = (project: Project) => {
    console.log('View project clicked:', project.id);
    navigate(`/projects/${project.id}`);
  };

  const handleEditProject = (project: Project) => {
    console.log('Edit project clicked:', project.id);
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProjectClick = (project: Project) => {
    console.log('Delete project clicked:', project.id);
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProjectWithTasksClick = (project: Project) => {
    console.log('Delete project with tasks clicked:', project.id);
    setProjectToDeleteWithTasks(project);
    setDeleteWithTasksDialogOpen(true);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/projects/new')}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Chip
              icon={<FilterList />}
              label={`${filteredProjects.length} projects`}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

      {filteredProjects.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first project to get started'}
          </Typography>
        </Box>
      ) : filteredProjects.length > 20 ? (
        // Use virtual scrolling for large lists
        <VirtualScroll
          items={filteredProjects}
          itemHeight={300} // Approximate height of ProjectCard
          containerHeight={600}
          renderItem={(project) => (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <ProjectCardMemo
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProjectClick}
                  onDeleteWithTasks={handleDeleteProjectWithTasksClick}
                  onView={handleViewProject}
                />
              </Grid>
            </Grid>
          )}
        />
      ) : (
        // Regular grid for smaller lists
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCardMemo
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProjectClick}
                onDeleteWithTasks={handleDeleteProjectWithTasksClick}
                onView={handleViewProject}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProject} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteWithTasksDialogOpen} onClose={() => setDeleteWithTasksDialogOpen(false)}>
        <DialogTitle>Delete Project with Tasks</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{projectToDeleteWithTasks?.name}" and all its associated tasks? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteWithTasksDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteProjectWithTasks} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects; 