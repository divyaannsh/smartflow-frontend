import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  Security,
  Work,
  Group,
  Favorite,
  Code,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/apiService';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
  );
}

const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Admin login form state
  const [adminLoginData, setAdminLoginData] = useState({
    username: '',
    password: '',
  });
  
  // User login form state
  const [userLoginData, setUserLoginData] = useState({
    username: '',
    password: '',
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'member' as 'admin' | 'manager' | 'member',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(adminLoginData.username, adminLoginData.password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(userLoginData.username, userLoginData.password);
      navigate('/portal');
    } catch (err: any) {
      setError(err.response?.data?.error || 'User login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        full_name: registerData.full_name,
        role: registerData.role,
      });
      
      setSuccess('Registration successful! You can now sign in.');
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'member',
      });
      setTabValue(0); // Switch to login tab
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h3" gutterBottom align="center">
          Team Project Manager
        </Typography>
        <Typography component="h2" variant="h6" color="text.secondary" gutterBottom align="center">
          Choose your login portal
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ width: '100%', mb: 3 }}>
          <Tab label="Admin Portal" icon={<AdminPanelSettings />} />
          <Tab label="User Portal" icon={<Person />} />
          <Tab label="Register" icon={<Security />} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Admin Portal Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AdminPanelSettings sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Admin Access</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Access the admin dashboard to manage teams, projects, and system settings.
                  </Typography>
                  
                  <Box component="form" onSubmit={handleAdminLoginSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="admin-username"
                      label="Admin Username"
                      name="username"
                      autoComplete="username"
                      autoFocus
                      value={adminLoginData.username}
                      onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Admin Password"
                      type="password"
                      id="admin-password"
                      autoComplete="current-password"
                      value={adminLoginData.password}
                      onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Admin Sign In'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Admin Features
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip icon={<Group />} label="Team Management" sx={{ mr: 1, mb: 1 }} />
                    <Chip icon={<Work />} label="Project Oversight" sx={{ mr: 1, mb: 1 }} />
                    <Chip icon={<AdminPanelSettings />} label="System Settings" sx={{ mr: 1, mb: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Demo Admin Credentials:</strong><br />
                    Username: admin<br />
                    Password: admin123
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Portal Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6">User Access</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Access your personal portal to manage tasks and collaborate with your team.
                  </Typography>
                  
                  <Box component="form" onSubmit={handleUserLoginSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="user-username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      autoFocus
                      value={userLoginData.username}
                      onChange={(e) => setUserLoginData({ ...userLoginData, username: e.target.value })}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="user-password"
                      autoComplete="current-password"
                      value={userLoginData.password}
                      onChange={(e) => setUserLoginData({ ...userLoginData, password: e.target.value })}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="secondary"
                      sx={{ mt: 3, mb: 2 }}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'User Sign In'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Features
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip icon={<Work />} label="Task Management" sx={{ mr: 1, mb: 1 }} />
                    <Chip icon={<Group />} label="Team Collaboration" sx={{ mr: 1, mb: 1 }} />
                    <Chip icon={<Person />} label="Personal Dashboard" sx={{ mr: 1, mb: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Demo User Credentials:</strong><br />
                    Username: john.doe<br />
                    Password: john123<br />
                    <br />
                    Username: jane.smith<br />
                    Password: jane123
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Register Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Create New Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Register a new user account. Only admins can create admin accounts.
            </Typography>
            
            <Box component="form" onSubmit={handleRegisterSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="register-username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="register-email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="register-fullname"
                    label="Full Name"
                    name="full_name"
                    autoComplete="name"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="register-password"
                    autoComplete="new-password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="register-confirm-password"
                    autoComplete="new-password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    id="register-role"
                    label="Role"
                    name="role"
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value as any })}
                  >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Box>
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Beautiful Footer */}
      <Box
        sx={{
          mt: 6,
          py: 4,
          px: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h6" 
              color="primary.main" 
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <Code sx={{ mr: 1, fontSize: '1.2rem' }} />
              Crafted with Passion
              <Favorite sx={{ ml: 1, fontSize: '1.2rem', color: 'error.main' }} />
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            color="text.primary"
            sx={{ 
              fontWeight: 500,
              mb: 1,
              fontSize: '1.1rem'
            }}
          >
            A Special Project by Divyansh for Deckmount
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              fontStyle: 'italic'
            }}
          >
            "Building the future of team collaboration, one project at a time"
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} Team Project Manager
            </Typography>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Built with React & Material-UI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              •
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Powered by Node.js & Express
            </Typography>
          </Box>
        </Container>
      </Box>
    </Container>
  );
};

export default Login; 