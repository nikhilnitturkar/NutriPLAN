# 🚀 Backend Deployment Guide for NutriPlan by A S T R A

This guide covers deploying the Node.js backend API to various platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- MongoDB database (MongoDB Atlas recommended)
- Account on your chosen platform

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
- Go to [mongodb.com/atlas](https://mongodb.com/atlas)
- Sign up for free account
- Create a new cluster (free tier is fine)

### 2. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password

### 3. Network Access
- Go to "Network Access" tab
- Click "Add IP Address"
- Choose "Allow Access from Anywhere" (0.0.0.0/0)

## 🏗️ Step 2: Choose Your Platform

### Option A: Heroku Deployment (Recommended)

#### 1. Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login to Heroku
```bash
heroku login
```

#### 3. Create Heroku App
```bash
heroku create your-nutriplan-backend
```

#### 4. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-connection-string
heroku config:set JWT_SECRET=your-super-secure-jwt-secret-key
```

#### 5. Deploy
```bash
git add .
git commit -m "Deploy backend to Heroku"
git push heroku main
```

#### 6. Test Deployment
```bash
heroku open
# Or visit: https://your-app-name.herokuapp.com/api/health
```

### Option B: Railway Deployment

#### 1. Connect to Railway
- Go to [railway.app](https://railway.app)
- Sign in with GitHub
- Click "New Project"
- Choose "Deploy from GitHub repo"

#### 2. Configure Project
- Select your repository
- Railway will auto-detect Node.js
- Set build command: `npm install`
- Set start command: `npm start`

#### 3. Set Environment Variables
In Railway dashboard, add:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5001
```

#### 4. Deploy
- Railway will automatically deploy on every push
- Get your URL from the dashboard

### Option C: Render Deployment

#### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

#### 2. Create Web Service
- Click "New +"
- Choose "Web Service"
- Connect your GitHub repository

#### 3. Configure Service
- **Name**: `nutriplan-backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for more resources)

#### 4. Set Environment Variables
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5001
```

#### 5. Deploy
- Click "Create Web Service"
- Render will build and deploy automatically

### Option D: DigitalOcean App Platform

#### 1. Create DigitalOcean Account
- Go to [digitalocean.com](https://digitalocean.com)
- Sign up for account

#### 2. Create App
- Go to "Apps" section
- Click "Create App"
- Connect your GitHub repository

#### 3. Configure App
- **Source**: GitHub repository
- **Branch**: main
- **Build Command**: `npm install`
- **Run Command**: `npm start`

#### 4. Set Environment Variables
Add in the app settings:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secure-jwt-secret-key
PORT=5001
```

## 🔧 Step 3: Environment Variables

### Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutriplan-db
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters
PORT=5001
```

### Optional Variables
```env
CORS_ORIGIN=https://your-frontend-domain.netlify.app
LOG_LEVEL=info
```

## 🔍 Step 4: Testing Your Backend

### Health Check
```bash
curl https://your-backend-url.herokuapp.com/api/health
```

### Test Endpoints
```bash
# Test registration
curl -X POST https://your-backend-url.herokuapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Trainer","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://your-backend-url.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check logs
heroku logs --tail
# or
railway logs
# or
render logs
```

#### 2. Database Connection Issues
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

#### 3. Port Issues
- Make sure PORT is set in environment variables
- Some platforms auto-assign ports

#### 4. CORS Issues
Update your backend CORS settings in `server/index.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-domain.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Debug Commands

#### Heroku
```bash
# View logs
heroku logs --tail

# Check config
heroku config

# Restart app
heroku restart
```

#### Railway
```bash
# View logs
railway logs

# Check status
railway status
```

#### Render
- Use the Render dashboard for logs and status

## 📊 Monitoring

### Health Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor response times
- Set up alerts for downtime

### Log Monitoring
- Use platform-specific log viewers
- Set up log aggregation if needed
- Monitor error rates

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit secrets to Git
- Use strong, unique JWT secrets
- Rotate secrets regularly

### 2. Database Security
- Use MongoDB Atlas with network restrictions
- Enable database authentication
- Use SSL connections

### 3. API Security
- Enable HTTPS (automatic on most platforms)
- Set up proper CORS configuration
- Use security headers (already configured with Helmet)

## 🎯 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Health endpoint returns 200 OK
- [ ] Database connection working
- [ ] Registration endpoint working
- [ ] Login endpoint working
- [ ] CORS configured for frontend domain
- [ ] Environment variables set correctly
- [ ] Logs accessible and clean

## 🎉 Next Steps

After successful backend deployment:

1. **Update Frontend**: Set `REACT_APP_API_URL` in Netlify
2. **Test Integration**: Verify frontend can connect to backend
3. **Monitor Performance**: Set up monitoring and alerts
4. **Scale if Needed**: Upgrade plans as your app grows

---

**Your NutriPlan by A S T R A backend is ready for deployment! 🚀** 