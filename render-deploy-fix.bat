@echo off
echo ========================================
echo   RENDER DEPLOYMENT - QUICK FIX
echo ========================================
echo.

echo 🔧 FIXING RENDER DEPLOYMENT ISSUE
echo =================================
echo.

echo ✅ Issue identified: Render looking for 'render-start' script
echo ✅ Solution: Added render-start script to package.json
echo ✅ Alternative: Configure Render to use 'server' as root directory
echo.

echo 📋 TWO DEPLOYMENT OPTIONS:
echo ==========================
echo.

echo OPTION 1: Use Root Package.json (CURRENT)
echo ==========================================
echo ✅ render-start script added
echo ✅ Pushing fix to GitHub now...
echo.

git add .
git commit -m "Fix Render deployment: Add render-start script"
git push origin main

echo.
echo ✅ Fix pushed! Render should auto-deploy in 1-2 minutes.
echo.

echo OPTION 2: Use Server Directory as Root (ALTERNATIVE)
echo ===================================================
echo If Option 1 doesn't work, configure Render with:
echo.
echo Root Directory: server
echo Build Command: npm install
echo Start Command: npm start
echo.

echo 🧪 TESTING DEPLOYMENT:
echo ======================
echo Waiting 30 seconds, then testing...
timeout /t 30 /nobreak >nul

echo.
echo Testing health endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing -TimeoutSec 15; if ($response.Content -like '*Kebrchacha Bingo Backend API*') { Write-Host '🎉 SUCCESS! Backend deployed!' -ForegroundColor Green } else { Write-Host '⏳ Still deploying...' -ForegroundColor Yellow } } catch { Write-Host '⏳ Deployment in progress...' -ForegroundColor Yellow }"

echo.
echo 📋 RENDER DASHBOARD SETTINGS (if manual config needed):
echo ======================================================
echo Service: bingo-mini-app-sily
echo Build Command: npm run render-build
echo Start Command: npm run render-start
echo Node Version: 20.11.0
echo Root Directory: (leave empty)
echo.

echo 🔄 Continue monitoring with:
echo .\check-deployment-status.bat
echo.
pause