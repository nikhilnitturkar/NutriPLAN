#!/bin/bash

# Netlify Deployment Script for NutriPlan by A S T R A

echo "🚀 Deploying NutriPlan by A S T R A to Netlify..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the frontend
echo "🔨 Building frontend..."
cd client
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=build

echo "🎉 Deployment completed!"
echo "📱 Your app is now live on Netlify!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Netlify dashboard"
echo "2. Configure your backend URL"
echo "3. Test all features"
echo ""
echo "Happy nutrition planning! 🥗" 