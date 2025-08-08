# SmartFlow AI - Full Stack Project Management

A complete project management application with user authentication, task assignment, and real-time collaboration.

## 🏗️ Project Structure

```
smartflow-fullstack/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
├── package.json       # Root package.json for workspace management
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd smartflow-fullstack
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Start development servers**
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

## 📁 Project Structure

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **Responsive design** with modern UI

### Backend (`/backend`)
- **Node.js** with Express
- **SQLite** database (with in-memory fallback)
- **JWT** authentication
- **RESTful API** endpoints

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend in development
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build frontend for production
npm run build

# Run tests
npm run test
```

### Environment Variables

#### Frontend (`.env`)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

#### Backend (`.env`)
```env
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key
PORT=5000
```

## 🚀 Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repo to Render**
2. **Create a new Web Service**
3. **Configure the service:**
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     JWT_SECRET=smartflow-jwt-secret-key-2024-production
     PORT=8080
     ```

### Frontend Deployment (Vercel)

1. **Connect your GitHub repo to Vercel**
2. **Configure the project:**
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com/api
     ```

## 🔐 Authentication

### Default Users (for testing)
- **Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

### Registration
New users can register with:
- Username
- Email
- Password
- Full Name
- Role (admin/manager/member)

## 📊 Features

### Admin Features
- ✅ User management
- ✅ Project creation and management
- ✅ Task assignment and tracking
- ✅ Dashboard with analytics
- ✅ User role management

### User Features
- ✅ View assigned tasks
- ✅ Update task progress
- ✅ View project details
- ✅ Personal dashboard

### Core Features
- ✅ User authentication (JWT)
- ✅ Task assignment system
- ✅ Project management
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Role-based access control

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify token

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/user/:userId` - Get user's tasks

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 🔍 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check environment variables

2. **Frontend can't connect to backend**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in frontend

3. **Database issues**
   - Check if SQLite is properly initialized
   - Verify database file permissions
   - Check database path configuration

### Development Tips

- Use `npm run dev` to start both servers
- Backend logs will show API requests
- Frontend console will show API calls
- Check browser network tab for API errors

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, please open an issue in the GitHub repository. 