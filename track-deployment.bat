@echo off
echo ========================================
echo   TRACKING RENDER DEPLOYMENT
echo ========================================
echo.

echo 🚀 Deployment Status:
echo =====================
echo ✅ render-start script added to package.json
echo ✅ Changes pushed to GitHub
echo ✅ Render auto-deployment triggered
echo.

echo ⏳ Monitoring deployment progress...
echo (Checking every 20 seconds for up to 5 minutes)
echo.

set /a counter=0
set /a maxChecks=15

:check_loop
set /a counter+=1
echo [Check #%counter%/%maxChecks% - %time%] Testing backend...

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing -TimeoutSec 10; if ($response.Content -like '*Kebrchacha Bingo Backend API*') { Write-Host '🎉 SUCCESS! New backend is live!' -ForegroundColor Green; Write-Host 'Health endpoint returning JSON response' -ForegroundColor Green; exit 0 } elseif ($response.Content -like '*html*') { Write-Host '⏳ Old frontend still serving...' -ForegroundColor Yellow } else { Write-Host '⏳ Deployment in progress...' -ForegroundColor Yellow } } catch { Write-Host '⏳ Service starting up...' -ForegroundColor Yellow }"

if %counter% geq %maxChecks% (
    echo.
    echo ⚠️  Deployment taking longer than expected
    echo.
    echo 🔧 ALTERNATIVE SOLUTION:
    echo =======================
    echo 1. Go to https://dashboard.render.com
    echo 2. Find service: bingo-mini-app-sily
    echo 3. Go to Settings
    echo 4. Set Root Directory to: server
    echo 5. Set Build Command to: npm install
    echo 6. Set Start Command to: npm start
    echo 7. Manual Deploy → Deploy latest commit
    echo.
    echo This will use the server directory directly instead of root package.json
    echo.
    pause
    exit /b 1
)

timeout /t 20 /nobreak >nul
goto check_loop