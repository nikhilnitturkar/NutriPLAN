# 🚀 Deployment Guide for NutriPlan by A S T R A

This guide will help you deploy NutriPlan by A S T R A on Netlify (frontend) and a backend service.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- MongoDB database (MongoDB Atlas recommended)
- Backend deployment platform (Heroku, Railway, Render, etc.)

## 🎯 Deployment Strategy

### Frontend (Netlify) + Backend (Separate Platform)

Since this is a full-stack application, we'll deploy:
- **Frontend**: Netlify (React app)
- **Backend**: Heroku/Railway/Render (Node.js API)
- **Database**: MongoDB Atlas

## 🏗️ Step 1: Backend Deployment

### Option A: Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create your-nutriplan-backend
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-secure-jwt-secret
   ```

3. **Deploy Backend**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

### Option B: Railway Deployment

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set environment variables in Railway dashboard

2. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secure-jwt-secret
   PORT=5001
   ```

### Option C: Render Deployment

1. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

2. **Configure Service**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

3. **Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-secure-jwt-secret
   ```

## 🌐 Step 2: Frontend Deployment (Netlify)

### Method A: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd client
   netlify deploy --prod --dir=build
   ```

### Method B: Netlify Dashboard

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   ```

### Method C: Drag & Drop

1. **Build the Project**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `client/build` folder

## 🔧 Step 3: Configuration

### Update API URL

1. **In Netlify Dashboard**
   - Go to Site settings > Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.herokuapp.com`

2. **Or in netlify.toml**
   ```toml
   [context.production.environment]
   REACT_APP_API_URL = "https://your-backend-url.herokuapp.com"
   ```

### CORS Configuration

Update your backend CORS settings in `server/index.js`:

```javascript
app.use(cors({
  origin: ['https://your-netlify-app.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

## 🗄️ Step 4: Database Setup

### MongoDB Atlas

1. **Create Cluster**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster

2. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Environment Variables**
   - Replace `<password>` with your database password
   - Add to your backend environment variables

## 🔍 Step 5: Testing

### Test Backend
```bash
curl https://your-backend-url.herokuapp.com/api/health
```

### Test Frontend
- Visit your Netlify URL
- Test login/registration
- Test all features

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origin in backend
   - Check environment variables

2. **API Connection Issues**
   - Verify `REACT_APP_API_URL` is correct
   - Check backend is running

3. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies are installed

4. **Database Connection**
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas

### Debug Commands

```bash
# Check backend logs
heroku logs --tail

# Check Netlify build logs
netlify logs

# Test API locally
curl http://localhost:5001/api/health
```

## 📊 Monitoring

### Backend Monitoring
- **Heroku**: Use Heroku dashboard
- **Railway**: Use Railway dashboard
- **Render**: Use Render dashboard

### Frontend Monitoring
- **Netlify**: Use Netlify dashboard
- **Analytics**: Add Google Analytics

## 🔄 Continuous Deployment

### Automatic Deployments
- Connect GitHub repository to both platforms
- Enable automatic deployments on push to main branch
- Set up branch protection rules

### Environment Management
- Use different environment variables for staging/production
- Set up staging environment for testing

## 🎉 Success!

Your NutriPlan by A S T R A application is now deployed and ready to use!

### URLs
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend-url.herokuapp.com
- **Health Check**: https://your-backend-url.herokuapp.com/api/health

### Next Steps
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Create backup strategies
5. Plan for scaling

---

**Need Help?** Check the troubleshooting section or create an issue in the repository. 