# 🚀 GitHub-Based Deployment Guide

This guide will help you set up automatic deployments using GitHub Actions for your NutriPlan application.

## 📋 Current Status

✅ **GitHub Repository**: https://github.com/nikhilnitturkar/NutriPLAN.git  
✅ **GitHub Actions**: Workflows created and pushed  
✅ **Code**: All changes committed and pushed to main branch  

## 🎯 Deployment Options

### Option 1: Netlify (Recommended for Frontend)

#### Step 1: Connect GitHub to Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com
   - Click "New site from Git"

2. **Connect GitHub Repository**
   - Choose "GitHub" as Git provider
   - Select your repository: `nikhilnitturkar/NutriPLAN`
   - Authorize Netlify to access your GitHub account

3. **Configure Build Settings**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Branch to deploy**: `main`

4. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add: `REACT_APP_API_URL` = `https://nutriplan-backend-7fha.onrender.com`

#### Step 2: Enable Automatic Deployments

1. **In Netlify Dashboard**
   - Go to Site settings > Build & deploy
   - Under "Build settings", ensure "Deploy automatically" is enabled
   - Set branch to deploy: `main`

2. **Test Deployment**
   - Make a small change to your code
   - Push to GitHub: `git push origin main`
   - Check Netlify dashboard for automatic deployment

### Option 2: Render (For Backend)

#### Step 1: Connect GitHub to Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" > "Web Service"

2. **Connect GitHub Repository**
   - Choose "GitHub" as Git provider
   - Select your repository: `nikhilnitturkar/NutriPLAN`
   - Authorize Render to access your GitHub account

3. **Configure Service Settings**
   - **Name**: `nutriplan-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci --omit=dev --legacy-peer-deps`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (root of repo)

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secure-jwt-secret
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

#### Step 2: Enable Automatic Deployments

1. **In Render Dashboard**
   - Go to your service settings
   - Under "Build & Deploy", ensure "Auto-Deploy" is enabled
   - Set branch to deploy: `main`

## 🔧 GitHub Actions Setup

### Current Workflows

1. **Build and Test** (`.github/workflows/build.yml`)
   - Runs on every push to main
   - Installs dependencies
   - Builds frontend
   - Validates build output

2. **Deploy** (`.github/workflows/deploy.yml`)
   - Runs on every push to main
   - Deploys to Netlify and Render
   - Requires secrets configuration

### Setting Up Secrets (Optional)

If you want to use the deployment workflow, add these secrets to your GitHub repository:

1. **Go to GitHub Repository Settings**
   - Visit: https://github.com/nikhilnitturkar/NutriPLAN/settings/secrets/actions

2. **Add Required Secrets**
   ```
   NETLIFY_AUTH_TOKEN=your-netlify-auth-token
   NETLIFY_SITE_ID=your-netlify-site-id
   RENDER_SERVICE_ID=your-render-service-id
   RENDER_API_KEY=your-render-api-key
   ```

## 🚀 Quick Start (Recommended)

### For Immediate Deployment:

1. **Netlify (Frontend)**
   - Go to: https://app.netlify.com
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure as shown above

2. **Render (Backend)**
   - Go to: https://dashboard.render.com
   - Create new Web Service
   - Connect your GitHub repository
   - Configure as shown above

3. **Test Deployment**
   - Make a change to your code
   - Push to GitHub: `git push origin main`
   - Watch automatic deployment

## 📊 Monitoring Deployments

### GitHub Actions
- **View Actions**: https://github.com/nikhilnitturkar/NutriPLAN/actions
- **Build Status**: Check the Actions tab for build results

### Netlify
- **Deploy Logs**: Check Netlify dashboard for deployment status
- **Build Logs**: Available in the deploy details

### Render
- **Service Logs**: Check Render dashboard for backend logs
- **Health Check**: Monitor service health

## 🔄 Continuous Deployment

Once set up, your deployment flow will be:

1. **Make Changes** → Edit code locally
2. **Commit & Push** → `git push origin main`
3. **Automatic Build** → GitHub Actions builds the project
4. **Automatic Deploy** → Netlify/Render deploys automatically
5. **Live Update** → Your app updates automatically

## 🎉 Success!

Your NutriPlan application will now automatically deploy whenever you push to the main branch!

### URLs After Setup:
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.onrender.com
- **GitHub**: https://github.com/nikhilnitturkar/NutriPLAN

---

**Need Help?** Check the deployment logs or create an issue in the repository. 