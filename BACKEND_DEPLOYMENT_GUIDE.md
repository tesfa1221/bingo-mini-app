# 🚀 BACKEND DEPLOYMENT GUIDE - RENDER CONFIGURATION

## 🔍 Current Status
- ✅ Code is ready and pushed to GitHub
- ✅ Root package.json created for Render compatibility  
- ✅ Node.js updated to v20.11.0 (supported version)
- ❌ Render service still serving old frontend version
- ❌ Manual Render configuration update required

## 🛠️ REQUIRED RENDER CONFIGURATION CHANGES

### Step 1: Access Render Dashboard
1. Go to: https://dashboard.render.com
2. Login with your account
3. Find service: **bingo-mini-app-sily**

### Step 2: Update Service Settings
Click on your service, then go to **Settings** tab and update:

#### Build & Deploy Settings:
```
Build Command: npm run render-build
Start Command: npm start
Node Version: 20.11.0
Auto-Deploy: Yes
Branch: main
```

#### Advanced Settings:
```
Root Directory: (leave empty - we use root package.json now)
```

### Step 3: Environment Variables
Ensure these are set in the **Environment** tab:

```bash
# Database (Aiven MySQL)
DB_HOST=mysql-2530a729-tesfa3362-8798.h.aivencloud.com
DB_PORT=22922
DB_USER=avnadmin
DB_PASSWORD=[YOUR_DB_PASSWORD]
DB_NAME=defaultdb

# Telegram Bot
TELEGRAM_BOT_TOKEN=8636880293:AAHKpD2_No4byTd6l4qTa331pWcLuf9dF3I
ADMIN_TELEGRAM_ID=991793142

# Cloudinary
CLOUDINARY_CLOUD_NAME=dnalvqyhu
CLOUDINARY_API_KEY=[YOUR_CLOUDINARY_API_KEY]
CLOUDINARY_API_SECRET=[YOUR_CLOUDINARY_API_SECRET]

# Server
PORT=3001
NODE_ENV=production
```

### Step 4: Manual Deploy
1. Go to **Manual Deploy** section
2. Click **"Deploy latest commit"**
3. Wait 2-3 minutes for deployment

## 🧪 Verification Steps

After deployment, test these endpoints:

### 1. Health Check
```
GET https://bingo-mini-app-sily.onrender.com/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "Kebrchacha Bingo Backend API",
  "timestamp": "2026-04-23T12:00:00.000Z",
  "uptime": 123.45
}
```

### 2. API Info
```
GET https://bingo-mini-app-sily.onrender.com/api
```
**Expected Response:**
```json
{
  "name": "Kebrchacha Bingo API",
  "version": "1.0.0",
  "description": "Backend API for Kebrchacha Bingo game",
  "endpoints": {
    "auth": "/api/auth",
    "wallet": "/api/wallet",
    "game": "/api/game",
    "admin": "/api/admin"
  },
  "websocket": "Socket.io enabled for real-time communication",
  "status": "Backend-only deployment"
}
```

### 3. 404 Handler Test
```
GET https://bingo-mini-app-sily.onrender.com/nonexistent
```
**Expected Response:**
```json
{
  "error": "Endpoint not found",
  "message": "This is a backend API server. Frontend is served separately.",
  "availableEndpoints": ["/api", "/health", "/api/auth", "/api/wallet", "/api/game", "/api/admin"]
}
```

## 🔧 Troubleshooting

### If deployment fails:
1. Check **Events** tab for error logs
2. Verify all environment variables are set
3. Ensure Node.js version is 20.11.0
4. Check build logs for npm install errors

### If still serving old version:
1. Clear Render cache (in service settings)
2. Try manual deploy again
3. Check if auto-deploy is enabled
4. Verify GitHub webhook is working

### Common Issues:
- **Build fails**: Check package.json syntax
- **Start fails**: Verify start command points to server
- **Database errors**: Check environment variables
- **CORS errors**: Verify frontend domain in server/index.js

## 📋 Deployment Checklist

- [ ] Render dashboard accessed
- [ ] Service settings updated
- [ ] Environment variables configured
- [ ] Manual deploy triggered
- [ ] Health endpoint returns JSON
- [ ] API endpoint returns JSON
- [ ] 404 handler works correctly
- [ ] Frontend can connect to backend
- [ ] WebSocket connections work
- [ ] Database queries successful

## 🎯 Success Criteria

✅ **Deployment is successful when:**
1. Health endpoint returns backend API JSON (not HTML)
2. API endpoint returns service information
3. All game endpoints respond correctly
4. WebSocket connections establish properly
5. Frontend can communicate with backend
6. Database operations work correctly

## 📞 Next Steps After Success

1. **Update Frontend**: Ensure frontend points to correct backend URL
2. **Test Integration**: Verify all game features work
3. **Monitor Performance**: Check Render dashboard for metrics
4. **Update Documentation**: Mark deployment as complete

---

## 🚨 IMPORTANT NOTES

- **Current Issue**: Render is serving old HTML frontend instead of new backend API
- **Root Cause**: Service configuration hasn't been updated to use new build process
- **Solution**: Manual configuration update in Render dashboard required
- **ETA**: 5-10 minutes once configuration is updated

The code is ready and correct - only the Render service configuration needs to be updated manually through their dashboard.