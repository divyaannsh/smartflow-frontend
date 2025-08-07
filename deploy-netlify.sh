#!/bin/bash

# 🚀 Netlify Deployment Script for SmartFlow AI
# This script helps you deploy your application to Netlify

echo "🚀 Starting Netlify Deployment for SmartFlow AI..."

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

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_warning "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not found. Please initialize git first."
    exit 1
fi

print_success "Prerequisites check completed"

# Build the client
print_status "Building React application..."
cd client
npm install
npm run build
cd ..

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the errors above."
    exit 1
fi

print_success "React application built successfully"

# Check if netlify.toml exists
if [ ! -f "netlify.toml" ]; then
    print_warning "netlify.toml not found. Creating..."
    cat > netlify.toml << EOF
[build]
  base = "client"
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_API_URL = "https://your-backend-url.herokuapp.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
EOF
    print_success "netlify.toml created"
fi

# Deploy to Netlify
print_status "Deploying to Netlify..."

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    print_warning "Not logged in to Netlify. Please login first:"
    echo "Run: netlify login"
    echo "Then run this script again."
    exit 1
fi

# Deploy
netlify deploy --prod --dir=client/build

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
    print_status "Your site is now live on Netlify"
    print_warning "Remember to:"
    echo "1. Set up your backend (Heroku/Railway/Render)"
    echo "2. Update REACT_APP_API_URL in Netlify environment variables"
    echo "3. Update CORS settings in your backend"
    echo "4. Test all features including authentication and email"
else
    print_error "Deployment failed. Please check the errors above."
    exit 1
fi

echo ""
print_success "🎉 Netlify deployment script completed!"
print_status "Next steps:"
echo "1. Deploy your backend to Heroku/Railway/Render"
echo "2. Update environment variables in Netlify dashboard"
echo "3. Test your application"
echo ""
echo "📖 For detailed instructions, see: NETLIFY_DEPLOYMENT.md" 