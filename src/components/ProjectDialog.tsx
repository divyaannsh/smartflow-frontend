import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { Project } from '../types';

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
  project?: Project;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'completed' | 'on_hold';
  deadline: string;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onClose,
  onSave,
  project,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'active',
    deadline: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        priority: project.priority,
        status: project.status,
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'active',
        deadline: '',
      });
    }
  }, [project, open]);

  const handleTextChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: keyof FormData) => (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as any,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {project ? 'Edit Project' : 'Create New Project'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Project Name"
              value={formData.name}
              onChange={handleTextChange('name')}
              required
              fullWidth
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleTextChange('description')}
              multiline
              rows={3}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleSelectChange('priority')}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleSelectChange('status')}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={handleTextChange('deadline')}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !formData.name}>
            {loading ? 'Saving...' : (project ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectDialog; 