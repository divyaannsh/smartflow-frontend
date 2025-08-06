# 🚀 SmartFlow AI - Professional Jira Alternative

A modern, intelligent project management platform built with React, Node.js, and Material-UI.

![SmartFlow AI](https://img.shields.io/badge/React-18.2.0-blue)

## ✨ Features

### 🎯 **Core Project Management**
- **Project Creation & Management**: Create, edit, and organize projects with detailed information
- **Task Management**: Comprehensive task creation, assignment, and tracking
- **User Management**: Role-based access control (Admin, Manager, Member)
- **Real-time Progress Tracking**: Visual progress indicators and status updates

### 📊 **Advanced Dashboard**
- **Overview Statistics**: Key metrics and KPIs at a glance
- **Project Progress**: Visual progress bars and completion tracking
- **Task Analytics**: Detailed task statistics and performance metrics
- **Team Workload**: User workload distribution and capacity planning

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Material Design**: Beautiful, intuitive interface using Material-UI
- **Dark/Light Theme**: Customizable theme options
- **Interactive Components**: Hover effects, animations, and smooth transitions

### 🔧 **Task Management Features**
- **Kanban Board**: Drag-and-drop task management with visual columns
- **Task Details**: Comprehensive task information with descriptions, deadlines, and priorities
- **Status Workflow**: Automated status progression (To Do → In Progress → Review → Done)
- **Priority Levels**: Critical, High, Medium, Low priority management
- **Time Tracking**: Built-in timer for tracking actual vs estimated hours
- **Comments System**: Real-time collaboration with threaded comments

### 👥 **Team Collaboration**
- **User Profiles**: Detailed user profiles with role management
- **Task Assignment**: Easy task assignment with user avatars
- **Project Teams**: Team member management per project
- **Activity Tracking**: Comprehensive activity logs and history

### 📈 **Analytics & Reporting**
- **Project Statistics**: Detailed project performance metrics
- **Task Analytics**: Time tracking, completion rates, and efficiency metrics
- **User Performance**: Individual and team performance tracking
- **Custom Reports**: Generate detailed reports and insights

### 🔔 **Notification System**
- **Real-time Notifications**: Instant updates for task assignments and status changes
- **Smart Alerts**: Deadline reminders and priority notifications
- **Unread Count**: Visual indicators for new notifications
- **Actionable Notifications**: Click to navigate directly to relevant items

### 🛡️ **Security & Authentication**
- **User Authentication**: Secure login system with session management
- **Role-based Access**: Admin, Manager, and Member permissions
- **Data Protection**: Secure API endpoints and data validation
- **Session Management**: Automatic logout and security features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (included)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/divyaannsh/Jirasoftware.git
   cd Jirasoftware
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Login Credentials
- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
jira/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── server/               # Node.js Backend
│   ├── routes/          # API routes
│   ├── database/        # Database files
│   └── index.js         # Server entry point
└── README.md           # This file
```

## 🎯 Key Features in Detail

### **Project Management**
- Create and manage multiple projects
- Set project priorities and deadlines
- Track project progress with visual indicators
- Assign team members to projects
- Project-specific task management

### **Task Management**
- **Kanban Board**: Visual task management with drag-and-drop
- **Task Details**: Comprehensive task information
- **Status Workflow**: Automated progression through task states
- **Time Tracking**: Built-in timer for accurate time tracking
- **Comments**: Real-time collaboration with threaded comments
- **Attachments**: File upload and management (coming soon)

### **User Management**
- **Role-based Access**: Admin, Manager, Member roles
- **User Profiles**: Detailed user information and statistics
- **Team Assignment**: Easy task and project assignment
- **Performance Tracking**: Individual and team metrics

### **Dashboard & Analytics**
- **Overview Dashboard**: Key metrics and KPIs
- **Project Analytics**: Detailed project performance
- **Task Statistics**: Time tracking and completion rates
- **User Workload**: Team capacity and workload distribution

### **Notification System**
- **Real-time Updates**: Instant notifications for changes
- **Smart Filtering**: Priority-based notification management
- **Actionable Alerts**: Direct navigation to relevant items
- **Unread Tracking**: Visual indicators for new notifications

## 🛠️ Technology Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Material-UI 5**: Professional UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### **Backend**
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **SQLite**: Lightweight database
- **JWT**: JSON Web Token authentication
- **CORS**: Cross-origin resource sharing

### **Development Tools**
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Concurrently**: Run multiple commands simultaneously
- **Nodemon**: Development server with auto-restart

## 🎨 UI/UX Features

### **Modern Design**
- Clean, professional interface
- Consistent color scheme and typography
- Responsive design for all devices
- Smooth animations and transitions

### **User Experience**
- Intuitive navigation and workflows
- Quick actions and shortcuts
- Contextual help and tooltips
- Progressive disclosure of information

### **Accessibility**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Responsive design for all screen sizes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_PATH=./server/database/project_manager.db

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Customization
- **Theme**: Modify colors and styling in `client/src/theme/`
- **API**: Configure endpoints in `client/src/services/apiService.ts`
- **Database**: Modify schema in `server/database/init.js`

## 📊 Performance Features

### **Optimization**
- Lazy loading of components
- Efficient state management
- Optimized database queries
- Caching strategies

### **Scalability**
- Modular architecture
- RESTful API design
- Database optimization
- Horizontal scaling support

## 🔒 Security Features

### **Authentication**
- JWT-based authentication
- Secure password handling
- Session management
- Role-based access control

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## 🚀 Deployment

### **Production Build**
```bash
# Build the frontend
cd client
npm run build

# Start the production server
cd ../server
npm start
```

### **Docker Deployment**
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### **Upcoming Features**
- [ ] File attachment system
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] Calendar integration
- [ ] API documentation

### **Enhancements**
- [ ] Dark mode toggle
- [ ] Custom themes
- [ ] Advanced permissions
- [ ] Audit logging
- [ ] Data export/import
- [ ] Multi-language support

---

**Built with ❤️ using React, TypeScript, and Material-UI**

*Perfect for teams looking for a professional, feature-rich project management solution.* 