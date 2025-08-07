#!/bin/bash

# 🚀 Vercel Deployment Script for SmartFlow AI
# This script helps you deploy your full-stack application to Vercel

echo "🚀 Starting Vercel Deployment for SmartFlow AI..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    print_error "Please run this script from the root directory of your SmartFlow AI project"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found. Please initialize git first."
    exit 1
fi

print_success "Prerequisites check completed"

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. Please ensure it exists in the root directory."
    exit 1
fi

print_success "Vercel configuration found"

# Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login first:"
    echo "Run: vercel login"
    echo "Then run this script again."
    exit 1
fi

# Deploy
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    print_status "Your SmartFlow AI application is now live on Vercel!"
    print_warning "Remember to:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Configure email settings (Gmail app password)"
    echo "3. Test all features including authentication and email"
    echo "4. Update CORS settings with your Vercel domain"
else
    print_error "Deployment failed. Please check the errors above."
    exit 1
fi

echo ""
print_success "🎉 Vercel deployment script completed!"
print_status "Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Set environment variables (JWT_SECRET, SMTP settings, etc.)"
echo "3. Test your application"
echo "4. Share your live application URL!"
echo ""
echo "📖 For detailed instructions, see: VERCEL_DEPLOYMENT.md" 