@echo off
echo ========================================
echo   MONITORING RENDER DEPLOYMENT
echo ========================================
echo.

echo 🚀 Latest fixes pushed to GitHub:
echo ✅ Added root package.json for Render
echo ✅ Updated Node.js to v20.11.0 (supported)
echo ✅ Fixed build command: npm run render-build
echo.

echo 📋 Deployment Info:
echo ==================
echo Service: bingo-mini-app-sily
echo URL: https://bingo-mini-app-sily.onrender.com
echo Latest Commit: Fix Render deployment
echo.

echo ⏳ Monitoring deployment progress...
echo (Checking every 15 seconds)
echo.

set /a counter=0

:check_loop
set /a counter+=1
echo [Check #%counter% - %time%] Testing endpoints...

REM Test health endpoint
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing -TimeoutSec 10; if ($response.Content -like '*Kebrchacha Bingo Backend API*') { Write-Host '✅ BACKEND DEPLOYED! Health check working!' -ForegroundColor Green; $global:healthOk = $true } else { Write-Host '⏳ Old version still running...' -ForegroundColor Yellow; $global:healthOk = $false } } catch { Write-Host '❌ Service not responding (likely deploying)' -ForegroundColor Red; $global:healthOk = $false }"

REM Test API endpoint
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/api' -UseBasicParsing -TimeoutSec 10; if ($response.Content -like '*Kebrchacha Bingo API*') { Write-Host '✅ API endpoint working!' -ForegroundColor Green; if ($global:healthOk) { Write-Host '🎉 DEPLOYMENT SUCCESSFUL!' -ForegroundColor Green; exit 0 } } else { Write-Host '⏳ API not ready yet...' -ForegroundColor Yellow } } catch { Write-Host '❌ API not responding' -ForegroundColor Red }"

echo.

REM Stop after 20 checks (5 minutes)
if %counter% geq 20 (
    echo ⚠️  Deployment taking longer than expected.
    echo 📋 Manual check recommended:
    echo    1. Visit: https://dashboard.render.com
    echo    2. Check service: bingo-mini-app-sily
    echo    3. Review deployment logs
    echo.
    pause
    exit /b 1
)

timeout /t 15 /nobreak >nul
goto check_loop