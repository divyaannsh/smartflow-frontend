const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
// const notificationsRoutes = require('./routes/notifications'); // Temporarily disabled

const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production - use default if FRONTEND_URL not set
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://jirasoftware.vercel.app',
        'https://jirasoftware.vercel.app',
        'https://jirasoftware-jvwt.vercel.app',
        'https://jirasoftware-5jad.vercel.app',
        'https://smartflowaiai.vercel.app',
        'https://jirasoftware-1ntd.vercel.app',
        'https://smartflow-ai.vercel.app',
        'http://localhost:3000', // Allow localhost for local testing
        'http://localhost:3001'  // Allow localhost for local testing
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/notifications', notificationsRoutes); // Temporarily disabled

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check database connection
app.get('/api/debug/db', async (req, res) => {
  try {
    const { getDatabase } = require('./database/init');
    const db = getDatabase();
    if (db) {
      if (typeof db.get === 'function') {
        // SQLite database
        db.get('SELECT 1 as test', (err, row) => {
          if (err) {
            console.error('Database connection test failed:', err);
            res.status(500).json({ error: 'Database connection failed', details: err.message });
          } else {
            res.json({ status: 'Database connected', test: row });
          }
        });
      } else {
        // In-memory storage
        res.json({ status: 'In-memory storage active', test: { test: 1 } });
      }
    } else {
      res.status(500).json({ error: 'Database not initialized' });
    }
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint failed', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('Starting server initialization...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Port:', PORT);
    
    // Initialize database with timeout
    console.log('Initializing database...');
    const dbInitPromise = initializeDatabase();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database initialization timeout')), 10000)
    );
    
    try {
      await Promise.race([dbInitPromise, timeoutPromise]);
      console.log('Database initialized successfully');
    } catch (dbError) {
      console.error('Database initialization failed, but continuing with server startup:', dbError);
      // Continue with server startup even if database fails
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔍 Debug DB: http://localhost:${PORT}/api/debug/db`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Don't exit process, let it continue
    console.log('Server will continue without database initialization');
    
    // Start server anyway
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit process, let it continue
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit process, let it continue
});

startServer(); 