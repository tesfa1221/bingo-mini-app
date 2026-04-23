@echo off
echo ========================================
echo   TRIGGERING RENDER DEPLOYMENT
echo ========================================
echo.

echo 🔄 Creating deployment trigger...
echo.

REM Add the deployment status check file to git
git add check-deployment-status.bat

REM Create a small change to trigger deployment
echo # Deployment trigger - %date% %time% > deployment-trigger.txt
git add deployment-trigger.txt

REM Commit and push to trigger auto-deployment
git commit -m "Trigger Render deployment - Backend API configuration"
git push origin main

echo.
echo ✅ Deployment trigger pushed to GitHub!
echo.
echo 🕐 Waiting for Render to deploy (this may take 2-3 minutes)...
echo.

echo 📋 What happens next:
echo ===================
echo 1. Render detects the new commit
echo 2. Starts building from "server" directory
echo 3. Runs "npm install" and "npm start"
echo 4. Backend API becomes available
echo.

echo 🔗 Monitor deployment:
echo =====================
echo Render Dashboard: https://dashboard.render.com
echo Service: bingo-mini-app-sily
echo.

echo 🧪 Test after 3 minutes:
echo ========================
echo Health: https://bingo-mini-app-sily.onrender.com/health
echo API: https://bingo-mini-app-sily.onrender.com/api
echo.

pause