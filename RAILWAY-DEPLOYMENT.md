# 🚀 Railway Deployment Guide for NutriPlan by A S T R A

## ✅ Quick Setup (5 minutes)

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Click "Try Free"
   - Sign up with email

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0)
   - Select cloud provider (AWS/Google Cloud/Azure)
   - Choose region (closest to you)
   - Click "Create"

3. **Set Up Database Access**
   - Go to "Database Access" tab
   - Click "Add New Database User"
   - Username: `nutriplan-user`
   - Password: `your-secure-password`
   - Role: "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - Go to "Network Access" tab
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go back to "Database" tab
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 2: Deploy to Railway

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

3. **Wait for Auto-Detection**
   - Railway will detect Node.js automatically
   - It will use your `package.json` start script

4. **Set Environment Variables**
   In Railway dashboard, go to "Variables" tab and add:

   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://nutriplan-user:your-password@cluster.mongodb.net/nutriplan-db
   JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
   PORT=5001
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Takes 1-2 minutes
   - You'll get a URL like: `https://nutriplan-backend-production.up.railway.app`

### Step 3: Test Your Deployment

1. **Health Check**
   ```bash
   curl https://your-app-name.up.railway.app/api/health
   ```

2. **Test Registration**
   ```bash
   curl -X POST https://your-app-name.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Trainer","email":"test@example.com","password":"password123"}'
   ```

3. **Test Login**
   ```bash
   curl -X POST https://your-app-name.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

### Step 4: Connect to Frontend

1. **Get Your Railway URL**
   - Copy the URL from Railway dashboard
   - Example: `https://nutriplan-backend-production.up.railway.app`

2. **Update Netlify Environment Variable**
   - Go to your Netlify dashboard
   - Site settings > Environment variables
   - Add: `REACT_APP_API_URL` = `https://your-app-name.up.railway.app`

3. **Test Integration**
   - Visit your Netlify frontend
   - Try to register/login
   - Check if API calls work

## 🔧 Railway Dashboard Features

### Monitoring
- **Real-time logs** in dashboard
- **Performance metrics**
- **Error tracking**
- **Uptime monitoring**

### Custom Domain (Optional)
- Go to "Settings" tab
- Click "Custom Domain"
- Add your domain
- Configure DNS

### Environment Management
- **Production**: Automatic deployments
- **Preview**: Test deployments for PRs
- **Variables**: Secure environment management

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check logs in Railway dashboard
   - Verify `package.json` has correct start script
   - Ensure all dependencies are in `package.json`

2. **Database Connection Fails**
   - Verify MongoDB URI is correct
   - Check network access in MongoDB Atlas
   - Ensure database user has proper permissions

3. **Environment Variables Not Set**
   - Go to "Variables" tab in Railway
   - Add all required variables
   - Redeploy after adding variables

4. **CORS Issues**
   - Update your backend CORS settings
   - Add your frontend domain to allowed origins

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check Railway status
railway status

# Open Railway dashboard
railway open
```

## 📊 Railway Benefits

### ✅ Free Tier Features
- **Unlimited deployments**
- **No sleeping** (always active)
- **SSL/HTTPS included**
- **Custom domains**
- **Auto-scaling**
- **Real-time monitoring**

### 🚀 Performance
- **Global CDN**
- **Auto-scaling**
- **Fast deployments** (1-2 minutes)
- **99.9% uptime**

## 🎉 Success!

After deployment, you'll have:
- ✅ **Backend**: `https://your-app.up.railway.app`
- ✅ **Frontend**: `https://your-app.netlify.app`
- ✅ **Database**: MongoDB Atlas
- ✅ **Auto-deployment** on every push

### Next Steps
1. **Test all features**
2. **Set up monitoring**
3. **Configure custom domain** (optional)
4. **Set up alerts**

---

**Your NutriPlan by A S T R A is now deployed on Railway! 🚀** 