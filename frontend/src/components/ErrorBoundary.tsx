import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Refresh Page
          </Button>
          <Button
            variant="outlined"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Alert severity="error" sx={{ mt: 2, maxWidth: 600 }}>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
                {this.state.error.toString()}
              </Typography>
            </Alert>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 