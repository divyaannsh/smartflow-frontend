import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  AdminPanelSettings,
  Work,
  Group,
  School,
  Business,
  Security,
  VerifiedUser,
  AccountCircle,
  Login as LoginIcon,
  PersonAdd,
  WorkOutline,
  GroupAdd,
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [adminLoginData, setAdminLoginData] = useState({ username: '', password: '' });
  const [userLoginData, setUserLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(adminLoginData.username, adminLoginData.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(userLoginData.username, userLoginData.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Call API service to register (uses centralized axios baseURL)
      const { token } = await authService.register(registerData);
      if (token) {
        localStorage.setItem('token', token);
      }
      // Always login to populate AuthContext state
      const user = await login(registerData.username, registerData.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'manager': return <Work />;
      case 'member': return <Group />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return theme.palette.error.main;
      case 'manager': return theme.palette.warning.main;
      case 'member': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Grow in timeout={1000}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Work sx={{ fontSize: 48, mr: 2, color: 'white' }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'white' }}>
                    SmartFlow AI
                  </Typography>
                </Box>
              </Grow>
              <Slide direction="up" in timeout={1200}>
                <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
                  Intelligent Project Management Platform
                </Typography>
              </Slide>
            </Box>

            {/* Main Card */}
            <Slide direction="up" in timeout={1400}>
              <Card
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        py: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                      },
                      '& .Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <Tab
                      icon={<AdminPanelSettings />}
                      label="Admin Portal"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<WorkOutline />}
                      label="User Portal"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<PersonAdd />}
                      label="Register"
                      iconPosition="start"
                    />
                  </Tabs>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ m: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Admin Login */}
                <TabPanel value={tabValue} index={0}>
                  <Grow in timeout={500}>
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <AdminPanelSettings sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          Admin Portal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Access system administration and team management
                        </Typography>
                      </Box>
                      
                      <Box component="form" onSubmit={handleAdminLoginSubmit}>
                        <TextField
                          fullWidth
                          label="Username"
                          type="text"
                          value={adminLoginData.username}
                          onChange={(e) => setAdminLoginData({ ...adminLoginData, username: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={adminLoginData.password}
                          onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                            },
                          }}
                        >
                          {loading ? 'Signing In...' : 'Sign In as Admin'}
                        </Button>
                      </Box>
                    </Box>
                  </Grow>
                </TabPanel>

                {/* User Login */}
                <TabPanel value={tabValue} index={1}>
                  <Grow in timeout={500}>
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <WorkOutline sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          User Portal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Access your personal workspace and tasks
                        </Typography>
                      </Box>
                      
                      <Box component="form" onSubmit={handleUserLoginSubmit}>
                        <TextField
                          fullWidth
                          label="Username"
                          type="text"
                          value={userLoginData.username}
                          onChange={(e) => setUserLoginData({ ...userLoginData, username: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={userLoginData.password}
                          onChange={(e) => setUserLoginData({ ...userLoginData, password: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #e085e7 0%, #e54b60 100%)',
                            },
                          }}
                        >
                          {loading ? 'Signing In...' : 'Sign In as User'}
                        </Button>
                      </Box>
                    </Box>
                  </Grow>
                </TabPanel>

                {/* Register */}
                <TabPanel value={tabValue} index={2}>
                  <Grow in timeout={500}>
                    <Box>
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <PersonAdd sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Join our team and start managing projects
                        </Typography>
                      </Box>
                      
                      <Box component="form" onSubmit={handleRegisterSubmit}>
                        <TextField
                          fullWidth
                          label="Username"
                          type="text"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AccountCircle color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={registerData.full_name}
                          onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          fullWidth
                          select
                          label="Role"
                          value={registerData.role}
                          onChange={(e) => setRegisterData({ ...registerData, role: e.target.value as any })}
                          sx={{ mb: 3 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {getRoleIcon(registerData.role)}
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="member">Member</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                        </TextField>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #43a1f4 0%, #00e6f4 100%)',
                            },
                          }}
                        >
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </Box>
                    </Box>
                  </Grow>
                </TabPanel>
              </Card>
            </Slide>

            {/* Footer */}
            <Slide direction="up" in timeout={1600}>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    Crafted by Divyansh for Deckmount
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
                    SmartFlow AI - Intelligent Project Management Solution
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                    <Security sx={{ color: 'white', opacity: 0.7 }} />
                    <VerifiedUser sx={{ color: 'white', opacity: 0.7 }} />
                    <Business sx={{ color: 'white', opacity: 0.7 }} />
                  </Box>
                </Card>
              </Box>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 