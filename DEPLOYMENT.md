# 🚀 SmartFlow AI - Vercel Deployment Guide

This guide will help you deploy your SmartFlow AI application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be on GitHub
3. **Node.js**: Ensure you have Node.js installed locally

## 🔧 Pre-Deployment Setup

### 1. Update Environment Variables

Before deploying, you need to update the following files with your actual Vercel domain:

#### Update `client/package.json`:
```json
"build": "REACT_APP_API_URL=https://your-actual-app-name.vercel.app react-scripts build"
```

#### Update `server/index.js`:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-app-name.vercel.app'] // Replace with your actual domain
  : ['http://localhost:3000', 'http://localhost:3001'],
```

### 2. Database Configuration

The application uses SQLite for the database. For production, you might want to consider:
- **Vercel Postgres**: For a more robust database solution
- **Supabase**: For a managed PostgreSQL database
- **PlanetScale**: For a MySQL-compatible database

## 🚀 Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

4. **Environment Variables** (if needed):
   - Add any environment variables in the Vercel dashboard
   - For JWT secrets, database URLs, etc.

5. **Deploy**: Click "Deploy" and wait for the build to complete

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set up environment variables if needed
   - Deploy

## 🔧 Post-Deployment Configuration

### 1. Update API URLs

After deployment, update your API URLs:

1. **Get your Vercel domain** (e.g., `https://your-app.vercel.app`)
2. **Update `client/package.json`**:
   ```json
   "build": "REACT_APP_API_URL=https://your-app.vercel.app react-scripts build"
   ```
3. **Update `server/index.js`**:
   ```javascript
   origin: ['https://your-app.vercel.app']
   ```
4. **Redeploy** the application

### 2. Test the Application

1. **Frontend**: Visit your Vercel domain
2. **Backend**: Test API endpoints at `https://your-app.vercel.app/api/health`
3. **Authentication**: Test login functionality
4. **Database**: Ensure data persistence works

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Update CORS configuration in `server/index.js`
   - Ensure your Vercel domain is in the allowed origins

2. **API Not Found**:
   - Check that routes are properly configured in `vercel.json`
   - Ensure API endpoints start with `/api/`

3. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure build scripts are correct

4. **Database Issues**:
   - SQLite might not work well on Vercel
   - Consider migrating to a cloud database

### Environment Variables

If you need to set environment variables:

1. **Vercel Dashboard**: Go to your project settings
2. **Environment Variables**: Add any required variables
3. **Redeploy**: After adding variables, redeploy the application

## 🔄 Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Handle rollbacks if needed

## 📊 Monitoring

- **Vercel Analytics**: Built-in analytics for your application
- **Function Logs**: Monitor serverless function execution
- **Performance**: Track Core Web Vitals and performance metrics

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to your repository
2. **CORS**: Properly configure CORS for production
3. **HTTPS**: Vercel automatically provides SSL certificates
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Set up a custom domain in Vercel
2. **Database Migration**: Consider moving to a cloud database
3. **Monitoring**: Set up monitoring and alerting
4. **CI/CD**: Configure GitHub Actions for automated testing

## 📞 Support

If you encounter issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review deployment logs in Vercel dashboard
- Check GitHub issues for similar problems

---

**Happy Deploying! 🚀** 