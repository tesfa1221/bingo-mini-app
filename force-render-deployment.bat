@echo off
echo ========================================
echo   FORCING RENDER DEPLOYMENT
echo ========================================
echo.

echo 🚀 Deployment triggered via GitHub push!
echo.
echo 📋 Deployment Details:
echo =====================
echo Repository: https://github.com/tesfa1221/bingo-mini-app
echo Service: bingo-mini-app-sily
echo Branch: main
echo Latest Commit: Add deployment status checker and trigger scripts
echo.

echo ⏳ Waiting for deployment to complete...
echo (This usually takes 2-3 minutes)
echo.

echo 🔄 Checking deployment progress every 30 seconds...
echo.

:check_loop
echo [%time%] Checking deployment status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing; if ($response.Content -like '*Kebrchacha Bingo Backend API*') { Write-Host '✅ NEW BACKEND DEPLOYED SUCCESSFULLY!' -ForegroundColor Green; exit 0 } else { Write-Host '⏳ Still deploying old version...' -ForegroundColor Yellow } } catch { Write-Host '⏳ Service starting up...' -ForegroundColor Yellow }"

timeout /t 30 /nobreak >nul
goto check_loop

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo.
pause