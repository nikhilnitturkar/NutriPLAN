#!/bin/bash

# Test Build Script for NutriPlan by A S T R A

echo "🧪 Testing production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf client/build
rm -rf node_modules
rm -rf client/node_modules

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Test build
echo "🔨 Testing production build..."
cd client
npm run build
cd ..

# Check if build was successful
if [ -d "client/build" ]; then
    echo "✅ Production build test successful!"
    echo "📁 Build output: client/build/"
    echo "📊 Build size: $(du -sh client/build | cut -f1)"
else
    echo "❌ Production build failed!"
    exit 1
fi

# Test server start (briefly)
echo "🚀 Testing server start..."
timeout 10s npm start &
SERVER_PID=$!

sleep 5

# Check if server is running
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Server test successful!"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Server test failed!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "🎉 All tests passed! The application is ready for deployment." 