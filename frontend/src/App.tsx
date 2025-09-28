import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import RoleRedirect from './components/RoleRedirect';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationManager from './components/NotificationManager';
import Login from './pages/Login';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectForm = lazy(() => import('./pages/ProjectForm'));
const Tasks = lazy(() => import('./pages/Tasks'));
const TaskForm = lazy(() => import('./pages/TaskForm'));
const Users = lazy(() => import('./pages/Users'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserPortal = lazy(() => import('./pages/UserPortal'));
const AdminTaskAssignment = lazy(() => import('./pages/AdminTaskAssignment'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const Pricing = lazy(() => import('./pages/Pricing'));

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
        <NotificationManager>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={
                <Suspense fallback={<LoadingGate />}>
                  <Pricing />
                </Suspense>
              } />
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
                <Route index element={
                  <Suspense fallback={<LoadingGate />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="projects" element={
                  <Suspense fallback={<LoadingGate />}>
                    <Projects />
                  </Suspense>
                } />
                <Route path="projects/:id" element={
                  <Suspense fallback={<LoadingGate />}>
                    <ProjectDetail />
                  </Suspense>
                } />
                <Route path="projects/new" element={
                  <Suspense fallback={<LoadingGate />}>
                    <ProjectForm />
                  </Suspense>
                } />
                <Route path="tasks" element={
                  <Suspense fallback={<LoadingGate />}>
                    <Tasks />
                  </Suspense>
                } />
                <Route path="tasks/new" element={
                  <Suspense fallback={<LoadingGate />}>
                    <TaskForm />
                  </Suspense>
                } />
                <Route path="tasks/:id" element={
                  <Suspense fallback={<LoadingGate />}>
                    <TaskDetail />
                  </Suspense>
                } />
                <Route path="tasks/:id/edit" element={
                  <Suspense fallback={<LoadingGate />}>
                    <TaskForm />
                  </Suspense>
                } />
                <Route path="users" element={
                  <Suspense fallback={<LoadingGate />}>
                    <Users />
                  </Suspense>
                } />
                <Route path="profile" element={
                  <Suspense fallback={<LoadingGate />}>
                    <UserProfile />
                  </Suspense>
                } />
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
                <Route index element={
                  <Suspense fallback={<LoadingGate />}>
                    <UserPortal />
                  </Suspense>
                } />
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
                <Route index element={
                  <Suspense fallback={<LoadingGate />}>
                    <AdminDashboard />
                  </Suspense>
                } />
                <Route path="task-assignment" element={
                  <Suspense fallback={<LoadingGate />}>
                    <AdminTaskAssignment />
                  </Suspense>
                } />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
              
              {/* Catch-all route for unmatched paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </NotificationManager>
      </ErrorBoundary>
    </AuthProvider>
  );
};

export default App; 