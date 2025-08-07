# 🚂 Railway Backend Deployment (Quick Setup)

## Step 1: Deploy Backend on Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `divyaannsh/jirasoftware`
6. **Configure the service**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

## Step 2: Set Environment Variables

In Railway dashboard, go to your service → Variables tab and add:

```env
JWT_SECRET=your-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=SmartFlow AI
FRONTEND_URL=https://your-netlify-app.netlify.app
```

## Step 3: Get Your Backend URL

After deployment, Railway will give you a URL like:
`https://your-app-name.railway.app`

**Save this URL** - you'll need it for the frontend deployment.

## Step 4: Test Backend

Test your backend is working:
```bash
curl https://your-app-name.railway.app/api/health
```

Should return: `{"status":"OK","timestamp":"..."}` 