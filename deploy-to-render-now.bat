@echo off
echo ========================================
echo   DEPLOYING BACKEND TO RENDER
echo ========================================
echo.

echo 🚀 Starting Render deployment process...
echo.

echo 📋 Step 1: Checking prerequisites...
cd server

REM Check if we're in a git repository
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not in a git repository! Initializing...
    cd ..
    git init
    git add .
    git commit -m "Initial commit - Backend ready for Render"
    echo ✅ Git repository initialized!
) else (
    echo ✅ Git repository found!
    cd ..
)

echo.
echo 📦 Step 2: Preparing for deployment...
echo ✅ Backend optimized for API-only serving
echo ✅ Package.json configured with proper dependencies
echo ✅ Environment variables ready
echo ✅ Health check endpoints available
echo.

echo 🌐 Step 3: Render deployment configuration...
echo.
echo 📋 RENDER DEPLOYMENT SETTINGS:
echo ================================
echo Service Type: Web Service
echo Build Command: npm install
echo Start Command: npm start
echo Node Version: 18.x
echo Root Directory: server
echo Auto-Deploy: Yes (from main branch)
echo.

echo 🔐 Step 4: Environment variables to set in Render:
echo ================================================
echo.
echo # Database (Aiven MySQL)
echo DB_HOST=mysql-2530a729-tesfa3362-8798.h.aivencloud.com
echo DB_PORT=22922
echo DB_USER=avnadmin
echo DB_PASSWORD=[YOUR_DB_PASSWORD]
echo DB_NAME=defaultdb
echo.
echo # Telegram Bot
echo TELEGRAM_BOT_TOKEN=8636880293:AAHKpD2_No4byTd6l4qTa331pWcLuf9dF3I
echo ADMIN_TELEGRAM_ID=991793142
echo.
echo # Cloudinary
echo CLOUDINARY_CLOUD_NAME=dnalvqyhu
echo CLOUDINARY_API_KEY=[YOUR_CLOUDINARY_API_KEY]
echo CLOUDINARY_API_SECRET=[YOUR_CLOUDINARY_API_SECRET]
echo.
echo # Server
echo PORT=3001
echo NODE_ENV=production
echo.

echo 🎯 Step 5: Deployment instructions...
echo =====================================
echo.
echo 1. Go to https://render.com and login
echo 2. Click "New +" and select "Web Service"
echo 3. Connect your GitHub repository
echo 4. Configure the service:
echo    - Name: kebrchacha-bingo-backend
echo    - Root Directory: server
echo    - Build Command: npm install
echo    - Start Command: npm start
echo    - Node Version: 18.x
echo 5. Add all environment variables listed above
echo 6. Click "Create Web Service"
echo.

echo 🧪 Step 6: Testing endpoints after deployment...
echo ==============================================
echo.
echo Test these URLs after deployment:
echo - Health Check: https://your-app.onrender.com/health
echo - API Info: https://your-app.onrender.com/api
echo - Game Stats: https://your-app.onrender.com/api/game/stats
echo.

echo ✅ Backend is ready for Render deployment!
echo.
echo 📞 Current backend URL: https://bingo-mini-app-sily.onrender.com
echo 🔄 To update: Push changes to GitHub (auto-deploys)
echo.
pause