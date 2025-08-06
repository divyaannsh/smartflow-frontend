# SmartFlow AI - Setup Guide

## Quick Start

1. **Install Dependencies** (already done):
   ```bash
   npm run install-all
   ```

2. **Start Development Servers**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Login Credentials

- **Username**: admin
- **Password**: admin123

## Features Implemented

### Backend (Node.js + Express + SQLite)

✅ **Authentication System**
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Role-based access control (admin, manager, member)

✅ **Project Management**
- Create, read, update, delete projects
- Project status tracking (active, completed, on_hold)
- Priority levels (low, medium, high, critical)
- Deadline management
- Project statistics and progress tracking

✅ **Task Management**
- Full CRUD operations for tasks
- Task status workflow (todo → in_progress → review → done)
- Priority management
- Deadline tracking with overdue detection
- Time estimation and actual hours tracking
- Task assignment to team members
- Comments system for tasks

✅ **User Management**
- User registration and profile management
- Role-based permissions
- Workload tracking per user
- User statistics and performance metrics

✅ **API Endpoints**
- RESTful API design
- Input validation with express-validator
- Error handling and logging
- Database relationships and constraints

### Frontend (React + TypeScript + Material-UI)

✅ **Authentication**
- Login page with form validation
- JWT token management
- Protected routes
- User session management

✅ **Layout & Navigation**
- Responsive sidebar navigation
- Material-UI theme integration
- User profile menu
- Mobile-friendly design

✅ **Dashboard**
- Overview statistics
- Project and task summaries
- Quick access to key features

✅ **TypeScript Integration**
- Type-safe development
- Interface definitions for all data models
- Proper error handling

## Database Schema

### Users Table
- id, username, email, password, full_name, role, avatar, timestamps

### Projects Table
- id, name, description, status, priority, deadline, created_by, timestamps

### Tasks Table
- id, title, description, status, priority, deadline, estimated_hours, actual_hours, project_id, assigned_to, created_by, timestamps

### Comments Table
- id, content, task_id, user_id, timestamps

### Project Members Table
- id, project_id, user_id, role, joined_at

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/stats` - Get project statistics

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `GET /api/tasks/:id/comments` - Get task comments
- `POST /api/tasks/:id/comments` - Add comment to task
- `GET /api/tasks/stats/overview` - Get task statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id/workload` - Get user workload
- `GET /api/users/:id/tasks` - Get user's assigned tasks
- `PATCH /api/users/:id/password` - Change user password

## Development Commands

```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build frontend for production
npm run build
```

## Project Structure

```
├── server/                 # Backend Node.js application
│   ├── database/          # Database initialization and setup
│   ├── routes/            # API route handlers
│   ├── index.js           # Main server file
│   └── package.json       # Backend dependencies
├── client/                # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # React entry point
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json with scripts
└── README.md             # Project documentation
```

## Next Steps for Enhancement

1. **Complete Frontend Pages**
   - Implement full Projects page with CRUD operations
   - Implement full Tasks page with Kanban board
   - Implement full Users page with user management
   - Add detailed project and task views

2. **Advanced Features**
   - File uploads for task attachments
   - Real-time notifications
   - Email notifications for deadlines
   - Advanced reporting and analytics
   - Team collaboration features

3. **Production Deployment**
   - Environment configuration
   - Database migration system
   - Docker containerization
   - CI/CD pipeline setup

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000 or 5000 are in use, modify the port in the respective package.json files.

2. **Database issues**: The SQLite database is automatically created in `server/database/project_manager.db`.

3. **CORS issues**: The backend is configured to allow requests from the frontend.

4. **Authentication issues**: Make sure to use the default admin credentials (admin/admin123).

## Security Notes

- Change the JWT_SECRET in production
- Implement proper input sanitization
- Add rate limiting for API endpoints
- Use HTTPS in production
- Implement proper session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 