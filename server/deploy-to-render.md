# 🚀 Deploy Backend to Render

## Quick Deployment Steps

### 1. Prepare Repository
```bash
# Make sure you're in the server directory
cd server

# Install dependencies to generate package-lock.json
npm install
```

### 2. Render Configuration

**Service Type:** Web Service
**Build Command:** `npm install`
**Start Command:** `npm start`
**Node Version:** 18.x

### 3. Environment Variables

Set these in Render dashboard:

```env
# Database (Aiven MySQL)
DB_HOST=mysql-2530a729-tesfa3362-8798.h.aivencloud.com
DB_PORT=22922
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb

# Telegram Bot
TELEGRAM_BOT_TOKEN=8636880293:AAHKpD2_No4byTd6l4qTa331pWcLuf9dF3I
ADMIN_TELEGRAM_ID=991793142

# Cloudinary
CLOUDINARY_CLOUD_NAME=dnalvqyhu
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3001
NODE_ENV=production
```

### 4. Deploy

1. **Connect GitHub:** Link your repository
2. **Select Directory:** Choose `server/` as root directory
3. **Auto-Deploy:** Enable automatic deploys from main branch
4. **Deploy:** Click "Create Web Service"

### 5. Verify Deployment

- **Health Check:** `https://your-app.onrender.com/health`
- **API Info:** `https://your-app.onrender.com/api`
- **Test Endpoint:** `https://your-app.onrender.com/api/game/stats`

## 🔧 Current Deployment

**URL:** `https://bingo-mini-app-sily.onrender.com`

### Test Endpoints:
- Health: https://bingo-mini-app-sily.onrender.com/health
- API Info: https://bingo-mini-app-sily.onrender.com/api
- Game Stats: https://bingo-mini-app-sily.onrender.com/api/game/stats

## 📊 Monitoring

- **Logs:** Check Render dashboard for server logs
- **Performance:** Monitor response times
- **Uptime:** Render provides uptime monitoring
- **Database:** Monitor Aiven MySQL performance

## 🔄 Updates

To update the backend:
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Monitor deployment logs
4. Test endpoints after deployment

---

**Backend is now optimized for API-only deployment on Render.**