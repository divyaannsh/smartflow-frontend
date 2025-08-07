# 🚀 Vercel Full-Stack Deployment Guide for SmartFlow AI

Vercel is perfect for your SmartFlow AI application because it can deploy both frontend and backend from the same repository!

## 📋 Prerequisites

- GitHub account with your SmartFlow AI repository
- Vercel account (free)
- Email service credentials (Gmail app password)

## 🏗️ Architecture on Vercel

- **Frontend**: React app (client directory)
- **Backend**: Node.js/Express API (server directory)
- **Database**: SQLite (file-based, works on Vercel)
- **Email**: Nodemailer with Gmail SMTP

## 🚀 Step 1: Deploy to Vercel

### 1.1 Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository**: `divyaannsh/jirasoftware`

### 1.2 Configure Project

Vercel will automatically detect your configuration from `vercel.json`, but verify:

- **Framework Preset**: Other
- **Root Directory**: `./` (root)
- **Build Command**: Leave empty (handled by vercel.json)
- **Output Directory**: Leave empty (handled by vercel.json)

### 1.3 Set Environment Variables

Before deploying, add these environment variables in Vercel dashboard:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=SmartFlow AI

# Frontend URL (will be your Vercel domain)
FRONTEND_URL=https://your-app-name.vercel.app

# Database (SQLite file will be created automatically)
DB_PATH=./database/project_manager.db
```

### 1.4 Deploy

Click **"Deploy"** and wait for the build to complete.

## 🔧 Step 2: Post-Deployment Configuration

### 2.1 Get Your Vercel URL

After deployment, Vercel will give you a URL like:
`https://your-app-name.vercel.app`

### 2.2 Update Environment Variables

Go back to your Vercel project settings and update:

```env
FRONTEND_URL=https://your-app-name.vercel.app
```

### 2.3 Test Your Application

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-app-name.vercel.app/api/health`
3. **Test Authentication**: Try logging in with admin credentials
4. **Test Email**: Create a task and assign it to someone

## 🧪 Step 3: Testing Checklist

### Frontend Tests
- [ ] **Homepage loads** without errors
- [ ] **Login page** works
- [ ] **Registration** works
- [ ] **Admin dashboard** loads
- [ ] **User dashboard** loads
- [ ] **Project management** works
- [ ] **Task management** works
- [ ] **Chat features** work

### Backend Tests
- [ ] **Health check**: `/api/health`
- [ ] **Authentication**: Login/logout
- [ ] **CRUD operations**: Projects, tasks, users
- [ ] **Email notifications**: Task assignments
- [ ] **File uploads**: Profile pictures, attachments

### Email Tests
- [ ] **Task assignment emails** work
- [ ] **Admin message emails** work
- [ ] **Welcome emails** work
- [ ] **Deadline reminder emails** work

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Vercel build logs
   - Verify all dependencies are in package.json
   - Ensure Node.js version compatibility

2. **API Errors**:
   - Check environment variables are set correctly
   - Verify database file permissions
   - Check CORS configuration

3. **Email Not Working**:
   - Verify Gmail app password is correct
   - Check SMTP settings
   - Ensure 2FA is enabled on Gmail

4. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Test with default admin credentials

### Debug Commands:

```bash
# Test API endpoints
curl https://your-app-name.vercel.app/api/health

# Test authentication
curl -X POST https://your-app-name.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check environment variables
vercel env ls
```

## 📊 Monitoring

- **Vercel Analytics**: Monitor performance
- **Function Logs**: Check serverless function logs
- **Error Tracking**: Set up error monitoring

## 🔄 Continuous Deployment

Vercel will automatically redeploy when you push changes to your main branch.

## 🎉 Success!

Your SmartFlow AI application is now live at:
**https://your-app-name.vercel.app**

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints directly
4. Check build logs for errors

## 🚀 Advantages of Vercel Deployment

✅ **Single platform** for frontend and backend  
✅ **Automatic deployments** from GitHub  
✅ **Serverless functions** for API  
✅ **Global CDN** for fast loading  
✅ **Free tier** with generous limits  
✅ **Easy environment variable management**  
✅ **Built-in analytics and monitoring**  

---

**Next Steps**: After deployment, test all features and share your live application URL! 