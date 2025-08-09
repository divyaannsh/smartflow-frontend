import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import RoleRedirect from './components/RoleRedirect';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import UserPortal from './pages/UserPortal';
import AdminTaskAssignment from './pages/AdminTaskAssignment';
import AdminDashboard from './pages/AdminDashboard';
import ProjectDetail from './pages/ProjectDetail';
import TaskDetail from './pages/TaskDetail';

const LoadingGate: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingGate />;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingGate />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/portal" />;
  return <>{children}</>;
};

const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingGate />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/redirect" element={<RoleRedirect />} />
            
            {/* Main App Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/new" element={<ProjectForm />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/new" element={<TaskForm />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="tasks/:id/edit" element={<TaskForm />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
            
            {/* User Portal Routes - Separate Layout */}
            <Route
              path="/portal"
              element={
                <UserRoute>
                  <Layout />
                </UserRoute>
              }
            >
              <Route index element={<UserPortal />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Route>
            
            {/* Admin Portal Routes - Separate Layout */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="task-assignment" element={<AdminTaskAssignment />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
            
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App; 