#!/bin/bash

# Heroku Deployment Script for NutriPlan by A S T R A Backend

echo "🚀 Deploying NutriPlan by A S T R A Backend to Heroku..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "📦 Installing Heroku CLI..."
    brew tap heroku/brew && brew install heroku
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

# Create Heroku app if it doesn't exist
APP_NAME="nutriplan-backend-$(date +%s)"
echo "🏗️  Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

# Set environment variables
echo "🔧 Setting environment variables..."
echo "Please enter your MongoDB Atlas connection string:"
read -p "MONGODB_URI: " MONGODB_URI

echo "Please enter a secure JWT secret (at least 32 characters):"
read -p "JWT_SECRET: " JWT_SECRET

# Set the environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="$MONGODB_URI"
heroku config:set JWT_SECRET="$JWT_SECRET"

echo "✅ Environment variables set!"

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy NutriPlan backend to Heroku"
git push heroku main

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your backend is now live at: https://$APP_NAME.herokuapp.com"
    echo ""
    echo "🔍 Testing health endpoint..."
    curl -s https://$APP_NAME.herokuapp.com/api/health
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your frontend REACT_APP_API_URL to: https://$APP_NAME.herokuapp.com"
    echo "2. Test the API endpoints"
    echo "3. Configure CORS if needed"
    echo ""
    echo "🎉 Your NutriPlan by A S T R A backend is deployed!"
else
    echo "❌ Deployment failed. Check the logs with: heroku logs --tail"
    exit 1
fi 