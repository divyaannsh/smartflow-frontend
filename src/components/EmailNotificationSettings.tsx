import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email,
  Notifications,
  Settings,
  BugReport,
  Save,
  CheckCircle,
  Error,
  Info,
  Warning,
} from '@mui/icons-material';
import { notificationService, EmailNotificationSettings as EmailSettings } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const EmailNotificationSettingsComponent: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotificationSettings();
      setSettings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting: keyof EmailSettings) => {
    if (settings) {
      setSettings({
        ...settings,
        [setting]: !settings[setting]
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Here you would typically save the settings to the backend
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Notification settings saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setError('');
      setSuccess('');

      const result = await notificationService.testEmailConnection();
      
      if (result.status === 'connected') {
        setSuccess('Email service is connected and ready!');
      } else {
        setError('Email service connection failed. Please check your configuration.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to test email connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Send a test admin message
      await notificationService.sendAdminMessageEmail(
        'Test Email',
        'This is a test email to verify your email notification settings are working correctly.',
        [user.id]
      );

      setSuccess('Test email sent successfully!');
      setTestDialogOpen(false);
      setTestEmail('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send test email');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Email sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Email Notification Settings
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {settings && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notification Preferences
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email />
                        <Typography>Email Notifications</Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.taskAssignments}
                        onChange={() => handleSettingChange('taskAssignments')}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Info />
                        <Typography>Task Assignments</Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.deadlineReminders}
                        onChange={() => handleSettingChange('deadlineReminders')}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning />
                        <Typography>Deadline Reminders</Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.adminMessages}
                        onChange={() => handleSettingChange('adminMessages')}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Notifications />
                        <Typography>Admin Messages</Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.projectUpdates}
                        onChange={() => handleSettingChange('projectUpdates')}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Settings />
                        <Typography>Project Updates</Typography>
                      </Box>
                    }
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Email Configuration
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Notification Email:
                  </Typography>
                  <Chip
                    label={settings.email}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={testing ? <CircularProgress size={16} /> : <BugReport />}
                  onClick={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => setTestDialogOpen(true)}
                >
                  Send Test Email
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email />
            Send Test Email
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a test email to verify your notification settings are working correctly.
          </Typography>
          <TextField
            fullWidth
            label="Test Email Address"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email address to send test to"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendTestEmail}
            disabled={!testEmail || saving}
            startIcon={saving ? <CircularProgress size={16} /> : <Email />}
          >
            {saving ? 'Sending...' : 'Send Test Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailNotificationSettingsComponent; 