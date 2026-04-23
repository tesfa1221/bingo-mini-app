@echo off
echo ========================================
echo   BACKEND VERIFICATION - QUICK CHECK
echo ========================================
echo.

echo 🔍 Testing Kebrchacha Bingo Backend...
echo.

echo 1. Health Check:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing; $json = $response.Content | ConvertFrom-Json; Write-Host '✅ Health: OK' -ForegroundColor Green; Write-Host '   Service:' $json.service -ForegroundColor Cyan; Write-Host '   Uptime:' $json.uptime 'seconds' -ForegroundColor Cyan } catch { Write-Host '❌ Health check failed' -ForegroundColor Red }"

echo.
echo 2. API Info:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/api' -UseBasicParsing; $json = $response.Content | ConvertFrom-Json; Write-Host '✅ API: OK' -ForegroundColor Green; Write-Host '   Name:' $json.name -ForegroundColor Cyan; Write-Host '   Version:' $json.version -ForegroundColor Cyan } catch { Write-Host '❌ API check failed' -ForegroundColor Red }"

echo.
echo 3. 404 Handler:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/test404' -UseBasicParsing; Write-Host '❌ 404 handler not working' -ForegroundColor Red } catch { if ($_.Exception.Response.StatusCode -eq 404) { Write-Host '✅ 404 Handler: OK' -ForegroundColor Green; Write-Host '   Properly rejecting invalid endpoints' -ForegroundColor Cyan } else { Write-Host '❌ Unexpected error' -ForegroundColor Red } }"

echo.
echo 📋 Backend Status Summary:
echo ==========================
echo URL: https://bingo-mini-app-sily.onrender.com
echo Type: API-only backend (no frontend serving)
echo Platform: Render
echo Node.js: v20.11.0
echo Database: Aiven MySQL
echo WebSocket: Socket.io enabled
echo.

echo 🎯 Available Endpoints:
echo =======================
echo /health          - Health check
echo /api             - API information
echo /api/auth/*      - Authentication
echo /api/wallet/*    - Wallet system
echo /api/game/*      - Game logic
echo /api/admin/*     - Admin panel
echo.

echo 📱 Frontend Integration:
echo ========================
echo Backend URL: https://bingo-mini-app-sily.onrender.com
echo WebSocket: wss://bingo-mini-app-sily.onrender.com
echo CORS: Enabled for all domains
echo.
pause