# 🚀 Netlify Deployment Guide for SmartFlow AI

This guide will help you deploy your SmartFlow AI application on Netlify.

## 📋 Prerequisites

- GitHub account with your SmartFlow AI repository
- Netlify account (free)
- Backend hosting service (Heroku, Railway, or Render)

## 🏗️ Architecture Overview

Since Netlify is primarily for frontend applications, we'll deploy:
- **Frontend**: Netlify (React app)
- **Backend**: Separate hosting service (Heroku/Railway/Render)

## 📦 Step 1: Prepare Your Repository

### 1.1 Update API Configuration

Update your client's API configuration to use environment variables:

```typescript
// client/src/services/apiService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### 1.2 Create Netlify Configuration

The `netlify.toml` file is already created with the correct configuration.

## 🌐 Step 2: Deploy Backend First

### Option A: Deploy on Heroku

1. **Create Heroku Account**: Sign up at [heroku.com](https://heroku.com)

2. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

3. **Login to Heroku**:
   ```bash
   heroku login
   ```

4. **Create Heroku App**:
   ```bash
   cd server
   heroku create your-smartflow-backend
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set SMTP_HOST=smtp.gmail.com
   heroku config:set SMTP_PORT=587
   heroku config:set SMTP_USER=your-email@gmail.com
   heroku config:set SMTP_PASS=your-app-password
   heroku config:set FROM_EMAIL=your-email@gmail.com
   heroku config:set FROM_NAME=SmartFlow AI
   ```

6. **Deploy Backend**:
   ```bash
   git add .
   git commit -m "Deploy backend to Heroku"
   git push heroku main
   ```

### Option B: Deploy on Railway

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Connect Repository**: Link your GitHub repository

3. **Configure Service**: Set the root directory to `server`

4. **Set Environment Variables**: Add all the same environment variables as Heroku

5. **Deploy**: Railway will automatically deploy your backend

### Option C: Deploy on Render

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create Web Service**: Connect your GitHub repository

3. **Configure**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. **Set Environment Variables**: Add all required environment variables

## 🎨 Step 3: Deploy Frontend on Netlify

### 3.1 Connect to Netlify

1. **Sign up/Login**: Go to [netlify.com](https://netlify.com)

2. **New Site from Git**: Click "New site from Git"

3. **Connect Repository**: Choose GitHub and select your repository

### 3.2 Configure Build Settings

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `build`

### 3.3 Set Environment Variables

In Netlify dashboard, go to Site settings → Environment variables:

```
REACT_APP_API_URL = https://your-backend-url.herokuapp.com/api
```

Replace `your-backend-url.herokuapp.com` with your actual backend URL.

### 3.4 Deploy

Click "Deploy site" and wait for the build to complete.

## 🔧 Step 4: Update API URLs

### 4.1 Update Frontend API Configuration

Make sure your frontend is using the correct backend URL:

```typescript
// client/src/services/apiService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.herokuapp.com/api';
```

### 4.2 Update CORS Configuration

Update your backend CORS settings to allow your Netlify domain:

```javascript
// server/index.js
const corsOptions = {
  origin: [
    'https://your-app-name.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true
};
```

## 🧪 Step 5: Test Your Deployment

1. **Test Frontend**: Visit your Netlify URL
2. **Test Backend**: Test API endpoints
3. **Test Email**: Verify email notifications work
4. **Test Authentication**: Ensure login/logout works

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Errors**: Update backend CORS configuration
2. **API 404**: Check backend URL in environment variables
3. **Build Failures**: Check Netlify build logs
4. **Email Not Working**: Verify SMTP credentials

### Debug Commands:

```bash
# Check Netlify build logs
netlify logs

# Test API endpoints
curl https://your-backend-url.herokuapp.com/api/health

# Check environment variables
netlify env:list
```

## 📊 Monitoring

- **Netlify Analytics**: Monitor frontend performance
- **Backend Logs**: Check your backend hosting service logs
- **Error Tracking**: Set up error monitoring

## 🔄 Continuous Deployment

Both Netlify and your backend hosting service will automatically redeploy when you push changes to your main branch.

## 🎉 Success!

Your SmartFlow AI application is now live on:
- **Frontend**: `https://your-app-name.netlify.app`
- **Backend**: `https://your-backend-url.herokuapp.com`

## 📞 Support

If you encounter issues:
1. Check the build logs in Netlify
2. Verify environment variables
3. Test API endpoints directly
4. Check CORS configuration

---

**Next Steps**: After deployment, test all features including authentication, email notifications, and admin functions. 