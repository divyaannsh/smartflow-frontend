# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel

## Deployment Steps

### 1. Environment Variables Setup
In your Vercel dashboard, add these environment variables:

**For the Client (Frontend):**
```
REACT_APP_API_URL=https://your-app-name.vercel.app/api
```

**For the Server (Backend):**
```
NODE_ENV=production
PORT=5000
```

### 2. Build Configuration
The project is configured to build both client and server:

- **Client**: Builds to `client/build/`
- **Server**: Runs on Vercel's serverless functions

### 3. Vercel Configuration
The `vercel.json` file is already configured for:
- Static build of the React app
- API routes for the backend
- Proper routing between frontend and backend

### 4. Deployment Commands
```bash
# Install dependencies
npm run install-all

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### 5. Common Issues & Solutions

#### Issue: Build fails with "Command npm run build exited with 1"
**Solution:**
1. Ensure all dependencies are installed
2. Check that `REACT_APP_API_URL` is set correctly
3. Verify the build command in `client/package.json`

#### Issue: API calls fail after deployment
**Solution:**
1. Set the correct `REACT_APP_API_URL` in Vercel environment variables
2. Ensure the URL points to your Vercel app domain
3. Add `/api` suffix to the URL

#### Issue: Server routes not working
**Solution:**
1. Verify `vercel.json` routes configuration
2. Ensure server is properly configured for serverless deployment
3. Check that API routes are prefixed with `/api`

### 6. Testing Deployment
After deployment:
1. Test the frontend at `https://your-app-name.vercel.app`
2. Test API endpoints at `https://your-app-name.vercel.app/api/...`
3. Verify authentication and data flow

### 7. Database Configuration
For production, consider:
- Using a cloud database (MongoDB Atlas, PostgreSQL, etc.)
- Setting up proper database environment variables
- Configuring connection pooling for serverless functions 