#!/bin/bash

# 🚀 Vercel Deployment Script
# This script helps deploy your SmartFlow AI app to Vercel

echo "🚀 Starting Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Build the application
echo "📦 Building application..."
npm run install-all
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at the URL provided above"
echo ""
echo "📝 Next steps:"
echo "1. Update the API URLs in your code with your new Vercel domain"
echo "2. Test the application functionality"
echo "3. Set up any environment variables if needed"
echo ""
echo "📖 For more information, see DEPLOYMENT.md" 