@echo off
echo ========================================
echo   CHECKING RENDER DEPLOYMENT STATUS
echo ========================================
echo.

echo 🔍 Checking current deployment...
echo.

echo 📡 Testing backend endpoints...
echo.

echo 1. Health Check:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing; if ($response.Content -like '*status*') { Write-Host '✅ New backend detected!' -ForegroundColor Green } else { Write-Host '❌ Old frontend still serving' -ForegroundColor Red } } catch { Write-Host '❌ Endpoint not accessible' -ForegroundColor Red }"

echo.
echo 2. API Info:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/api' -UseBasicParsing; if ($response.Content -like '*Kebrchacha Bingo API*') { Write-Host '✅ API endpoint working!' -ForegroundColor Green } else { Write-Host '❌ API not responding correctly' -ForegroundColor Red } } catch { Write-Host '❌ API endpoint not accessible' -ForegroundColor Red }"

echo.
echo 📋 Deployment Status:
echo ==================
echo.
echo Current URL: https://bingo-mini-app-sily.onrender.com
echo GitHub Repo: https://github.com/tesfa1221/bingo-mini-app
echo Last Commit: Backend optimized for API-only serving
echo.

echo 🔄 If old version is still running:
echo ================================
echo 1. Go to Render Dashboard: https://dashboard.render.com
echo 2. Find service: bingo-mini-app-sily
echo 3. Check "Events" tab for deployment status
echo 4. If needed, click "Manual Deploy" → "Deploy latest commit"
echo 5. Wait 2-3 minutes for deployment to complete
echo.

echo 🎯 Expected New Backend Response:
echo ===============================
echo Health: {"status":"ok","service":"Kebrchacha Bingo Backend API",...}
echo API: {"name":"Kebrchacha Bingo API","version":"1.0.0",...}
echo.

echo 📞 Need Help?
echo =============
echo - Check Render dashboard for deployment logs
echo - Verify environment variables are set
echo - Ensure "server" is set as root directory
echo - Build command: npm install
echo - Start command: npm start
echo.
pause