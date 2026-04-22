# 🌐 Render Deployment - Step by Step Guide

## 🎯 Overview
We'll deploy your Bingo Mini App to Render in 4 main steps:
1. **GitHub Setup** (5 minutes)
2. **Render Account** (2 minutes)
3. **Deploy Service** (10 minutes)
4. **Configure & Test** (15 minutes)

---

## 📋 STEP 1: GitHub Repository Setup

### A. Create GitHub Repository
1. **Go to**: https://github.com
2. **Click**: "New" (green button, top left)
3. **Repository name**: `bingo-mini-app`
4. **Visibility**: Select "Public" ⚠️ **IMPORTANT: Must be public for free Render tier**
5. **Initialize**: Leave all checkboxes UNCHECKED (we have files already)
6. **Click**: "Create repository"

### B. Get Repository URL
After creation, you'll see a page with commands. Copy the HTTPS URL:
```
https://github.com/YOUR_USERNAME/bingo-mini-app.git
```

### C. Push Your Code
Open Command Prompt in your project folder and run:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Bingo Mini App"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bingo-mini-app.git

# Push to GitHub
git push -u origin main
```

**✅ Checkpoint**: Your code should now be visible on GitHub

---

## 🌐 STEP 2: Create Render Account

### A. Sign Up for Render
1. **Go to**: https://render.com
2. **Click**: "Get Started for Free"
3. **Sign up with GitHub**: Click "GitHub" button
4. **Authorize**: Allow Render to access your repositories
5. **Complete profile**: Add any required information

**✅ Checkpoint**: You should be in the Render dashboard

---

## 🚀 STEP 3: Deploy Web Service

### A. Create New Web Service
1. **In Render Dashboard**: Click "New +" (top right)
2. **Select**: "Web Service"
3. **Connect Repository**: Find and click "Connect" next to `bingo-mini-app`

### B. Configure Service Settings

**Basic Information:**
- **Name**: `bingo-mini-app` (or any name you prefer)
- **Region**: Choose closest to your users:
  - `Oregon (US West)` - Good for global
  - `Frankfurt (EU Central)` - Good for Europe/Africa
  - `Singapore (Asia Pacific)` - Good for Asia
- **Branch**: `main`
- **Root Directory**: Leave EMPTY
- **Runtime**: `Node`

**Build & Deploy Commands:**
- **Build Command**: `npm run render-build`
- **Start Command**: `npm run render-start`

**Instance Type:**
- **Free**: Select "Free" (0.1 CPU, 512 MB RAM)
- **Paid**: For better performance, choose "Starter" ($7/month)

### C. Advanced Settings (Click "Advanced")

**Environment Variables** - Add these one by one:

```
DB_HOST = mysql-2530a729-tesfa3362-8798.h.aivencloud.com
DB_PORT = 22922
DB_USER = avnadmin
DB_PASSWORD = YOUR_DATABASE_PASSWORD
DB_NAME = defaultdb
TELEGRAM_BOT_TOKEN = YOUR_TELEGRAM_BOT_TOKEN
CLOUDINARY_CLOUD_NAME = dnalvqyhu
CLOUDINARY_API_KEY = YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET = YOUR_CLOUDINARY_API_SECRET
ADMIN_TELEGRAM_ID = 991793142
NODE_ENV = production
PORT = 10000
```

**How to add each variable:**
1. Click "Add Environment Variable"
2. **Key**: Enter the variable name (e.g., `DB_HOST`)
3. **Value**: Enter the variable value (e.g., `mysql-2530a729-tesfa3362-8798.h.aivencloud.com`)
4. Repeat for all variables

### D. Deploy!
1. **Click**: "Create Web Service"
2. **Wait**: Deployment takes 5-10 minutes
3. **Watch**: Build logs in real-time

**✅ Checkpoint**: Build should complete successfully

---

## 🔧 STEP 4: Configure & Test

### A. Get Your App URL
After successful deployment, you'll get a URL like:
```
https://bingo-mini-app-xyz123.onrender.com
```

### B. Test Backend Health
1. **Open**: `https://your-app-url.onrender.com/health`
2. **Should see**: `{"status":"ok"}`

### C. Test Frontend
1. **Open**: `https://your-app-url.onrender.com`
2. **Should see**: Your Bingo app interface
3. **Check**: All tabs work (Lobby, Wallet, Admin)

### D. Update Telegram Bot
1. **Open Telegram**
2. **Search**: `@BotFather`
3. **Send**: `/setmenubutton`
4. **Select**: Your bot name
5. **Button text**: `🎮 Play Bingo`
6. **WebApp URL**: Your Render URL (https://your-app.onrender.com)

### E. Test Complete Flow
1. **Open your bot** in Telegram
2. **Click menu button**
3. **App should open** in Telegram WebApp
4. **Test features**: Join game, check wallet, etc.

**✅ Checkpoint**: Everything should work end-to-end!

---

## 📊 Monitoring Your Deployment

### A. Render Dashboard Features
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory usage
- **Events**: Deployment history
- **Settings**: Update environment variables

### B. Important URLs to Bookmark
- **App URL**: `https://your-app.onrender.com`
- **Health Check**: `https://your-app.onrender.com/health`
- **Render Dashboard**: `https://dashboard.render.com`

---

## 🐛 Common Issues & Solutions

### Build Fails
**Problem**: Build command fails
**Solution**: 
- Check build logs in Render dashboard
- Verify package.json scripts are correct
- Ensure all dependencies are listed

### App Won't Start
**Problem**: Service shows "Deploy failed"
**Solution**:
- Check environment variables are set correctly
- Verify database credentials
- Check start command logs

### Database Connection Error
**Problem**: "Connection refused" or SSL errors
**Solution**:
- Verify Aiven database is running
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- Ensure SSL settings are correct

### Telegram Bot Not Working
**Problem**: Bot menu button doesn't work
**Solution**:
- Verify WebApp URL is correct (https, not http)
- Check bot token is correct
- Ensure app is accessible publicly

---

## 💰 Render Free Tier Limits

**Free Tier Includes:**
- ✅ 750 hours/month (about 31 days if always on)
- ✅ Automatic HTTPS/SSL
- ✅ Custom domains
- ✅ GitHub auto-deploy
- ⚠️ **Sleeps after 15 minutes of inactivity**
- ⚠️ **Cold start delay** (30 seconds to wake up)

**Upgrade to Paid ($7/month) for:**
- ✅ Always-on service (no sleeping)
- ✅ Faster performance
- ✅ More resources
- ✅ Better for production use

---

## 🎉 Success Checklist

After completing all steps, verify:

- [ ] **GitHub**: Code pushed successfully
- [ ] **Render**: Service deployed and running
- [ ] **Health Check**: `/health` endpoint returns OK
- [ ] **Frontend**: App loads and shows interface
- [ ] **Database**: Can view games and user data
- [ ] **Telegram**: Bot menu button works
- [ ] **WebApp**: Opens in Telegram successfully
- [ ] **Features**: Can join games, use wallet, etc.

---

## 🚀 You're Live!

Once all checkboxes are complete, your Bingo Mini App is:
- ✅ **Deployed to production**
- ✅ **Accessible worldwide**
- ✅ **Integrated with Telegram**
- ✅ **Ready for real users**

**Share your bot with friends and start getting real users!** 🎊

---

## 🆘 Need Help?

If you get stuck on any step:
1. **Check the logs** in Render dashboard
2. **Verify environment variables** are exactly as shown
3. **Test each URL** individually
4. **Ask me for help** with specific error messages

**Ready to start? Let's go step by step!** 🚀