# Team Project Manager

A modern, Jira-like project management tool for teams to manage deadlines, work allocation, priorities, and tasks.

## Features

- **Project Management**: Create and manage multiple projects
- **Task Management**: Create, assign, and track tasks with deadlines
- **Work Allocation**: Assign tasks to team members with workload tracking
- **Priority Management**: Set and manage task priorities
- **Deadline Tracking**: Monitor project and task deadlines
- **Team Dashboard**: Real-time overview of team workload and progress
- **Kanban Board**: Visual task management with drag-and-drop
- **Reporting**: Generate reports on team performance and project progress

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express
- **Database**: SQLite (for simplicity, can be upgraded to PostgreSQL)
- **UI Framework**: Material-UI (MUI)
- **State Management**: React Context + Hooks
- **Authentication**: JWT-based authentication

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript type definitions
├── server/                # Node.js backend
│   ├── routes/            # API routes
│   ├── models/            # Data models
│   ├── middleware/        # Express middleware
│   └── database/          # Database setup
└── shared/                # Shared types and utilities
```

## Features in Detail

### Project Management
- Create and manage multiple projects
- Set project deadlines and milestones
- Track project progress and completion

### Task Management
- Create tasks with descriptions, deadlines, and priorities
- Assign tasks to team members
- Track task status (To Do, In Progress, Review, Done)
- Add comments and attachments to tasks

### Work Allocation
- View team member workload
- Balance task distribution
- Track individual and team productivity

### Priority Management
- Set task priorities (Low, Medium, High, Critical)
- Filter and sort by priority
- Priority-based task ordering

### Dashboard & Reporting
- Real-time project overview
- Team performance metrics
- Deadline alerts and notifications
- Progress tracking and analytics

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 