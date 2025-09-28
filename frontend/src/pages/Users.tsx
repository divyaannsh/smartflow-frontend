import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
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
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../services/apiService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { User, UserWorkload } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userWorkloads, setUserWorkloads] = useState<Record<number, UserWorkload>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageTarget, setMessageTarget] = useState<User | null>(null);
  const [announceDialogOpen, setAnnounceDialogOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('General Announcement');
  const [announceText, setAnnounceText] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
      
      // Load workloads for each user
      const workloads: Record<number, UserWorkload> = {};
      for (const user of data) {
        try {
          const workload = await usersService.getWorkload(user.id);
          workloads[user.id] = workload;
        } catch (err) {
          console.error(`Failed to load workload for user ${user.id}:`, err);
        }
      }
      setUserWorkloads(workloads);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await usersService.delete(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'member': return 'info';
      default: return 'default';
    }
  };

  const getWorkloadPercentage = (workload: UserWorkload) => {
    const totalTasks = workload.total_tasks;
    const completedTasks = workload.done_tasks;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const UserCard: React.FC<{ user: User }> = ({ user }) => {
    const workload = userWorkloads[user.id];
    const workloadPercentage = workload ? getWorkloadPercentage(workload) : 0;

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 48, height: 48 }}>
                {user.full_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" component="h2">
                  {user.full_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user.username}
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => navigate(`/users/${user.id}/edit`)}>
                <Edit />
              </IconButton>
              <IconButton size="small" onClick={() => handleDeleteUserClick(user)}>
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {user.email}
          </Typography>

          <Chip
            label={user.role}
            color={getRoleColor(user.role) as any}
            size="small"
            sx={{ mb: 2 }}
          />

          {workload && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Workload Progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {workload.done_tasks}/{workload.total_tasks} tasks
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={workloadPercentage}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {workload.total_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Tasks
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {workload.done_tasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Grid>
                {workload.overdue_tasks > 0 && (
                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error">
                        {workload.overdue_tasks}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Overdue
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/users/${user.id}/tasks`)}
            >
              View Tasks
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/users/${user.id}/workload`)}
            >
              Workload
            </Button>
            {currentUser?.role === 'admin' && (
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  setMessageTarget(user);
                  setMessageText('');
                  setMessageDialogOpen(true);
                }}
              >
                Message
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const handleDeleteUserClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
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
        <Typography variant="h4">Team Members</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentUser?.role === 'admin' && (
            <Button
              variant="outlined"
              onClick={() => setAnnounceDialogOpen(true)}
            >
              Announce
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/users/new')}
          >
            Add Member
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="member">Member</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Chip
              icon={<FilterList />}
              label={`${filteredUsers.length} members`}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

        {filteredUsers.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No team members found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first team member to get started'}
          </Typography>
        </Box>
        ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <UserCard user={user} />
            </Grid>
          ))}
        </Grid>
        )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Team Member</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{userToDelete?.full_name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin direct message dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Message {messageTarget?.full_name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder={`Write a message to ${messageTarget?.full_name || 'user'}...`}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!messageText.trim() || !messageTarget}
            onClick={async () => {
              try {
                await notificationService.sendAdminMessageEmail(
                  'Direct Message',
                  messageText,
                  [messageTarget!.id]
                );
                setMessageDialogOpen(false);
                setMessageText('');
              } catch (e) {
                setError('Failed to send message');
              }
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* General announcement dialog */}
      <Dialog open={announceDialogOpen} onClose={() => setAnnounceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>General Announcement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={announceTitle}
            onChange={(e) => setAnnounceTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your announcement..."
            value={announceText}
            onChange={(e) => setAnnounceText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnounceDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!announceTitle.trim() || !announceText.trim()}
            onClick={async () => {
              try {
                const allUserIds = users.map(u => u.id);
                await notificationService.sendAdminMessageEmail(
                  announceTitle,
                  announceText,
                  allUserIds,
                  true
                );
                setAnnounceDialogOpen(false);
                setAnnounceText('');
              } catch (e) {
                setError('Failed to send announcement');
              }
            }}
          >
            Send to Everyone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 