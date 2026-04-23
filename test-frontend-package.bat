@echo off
echo ========================================
echo   FRONTEND PACKAGE VERIFICATION
echo ========================================
echo.

echo 🔍 Testing Frontend Deployment Package...
echo.

echo 📦 CHECKING PACKAGE CONTENTS:
echo =============================
if exist "cpanel-vite-upload\index.html" (
    echo ✅ index.html found
) else (
    echo ❌ index.html missing
)

if exist "cpanel-vite-upload\assets" (
    echo ✅ assets/ directory found
) else (
    echo ❌ assets/ directory missing
)

if exist "cpanel-vite-upload\.htaccess" (
    echo ✅ .htaccess found
) else (
    echo ❌ .htaccess missing
)

if exist "cpanel-vite-upload\performance-test.html" (
    echo ✅ performance-test.html found
) else (
    echo ❌ performance-test.html missing
)

echo.
echo 📊 PACKAGE SIZE ANALYSIS:
echo =========================
powershell -Command "Get-ChildItem -Recurse cpanel-vite-upload | Measure-Object -Property Length -Sum | ForEach-Object { Write-Host ('Total Size: {0:N2} KB' -f ($_.Sum / 1KB)) -ForegroundColor Green }"

echo.
echo 🔧 CHECKING CONFIGURATION:
echo ==========================

REM Check if backend URL is configured in the built files
findstr /C:"bingo-mini-app-sily.onrender.com" cpanel-vite-upload\assets\*.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend URL configured correctly
) else (
    echo ❌ Backend URL not found in build
)

REM Check .htaccess content
findstr /C:"mod_deflate" cpanel-vite-upload\.htaccess >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Gzip compression configured
) else (
    echo ❌ Gzip compression not configured
)

findstr /C:"mod_rewrite" cpanel-vite-upload\.htaccess >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ SPA routing configured
) else (
    echo ❌ SPA routing not configured
)

echo.
echo 🎮 FEATURE VERIFICATION:
echo =======================

REM Check if Telegram WebApp script is included
findstr /C:"telegram-web-app.js" cpanel-vite-upload\index.html >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Telegram WebApp integration included
) else (
    echo ❌ Telegram WebApp integration missing
)

REM Check if Socket.io is included
findstr /C:"socket.io" cpanel-vite-upload\assets\*.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Socket.io real-time communication included
) else (
    echo ❌ Socket.io not found
)

echo.
echo 📱 MOBILE OPTIMIZATION:
echo ======================

REM Check viewport meta tag
findstr /C:"viewport" cpanel-vite-upload\index.html >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Mobile viewport configured
) else (
    echo ❌ Mobile viewport missing
)

REM Check responsive design
findstr /C:"responsive" cpanel-vite-upload\assets\*.css >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Responsive design included
) else (
    echo ⚠️  Responsive design check inconclusive
)

echo.
echo 🔐 SECURITY FEATURES:
echo ====================

REM Check security headers in .htaccess
findstr /C:"X-Content-Type-Options" cpanel-vite-upload\.htaccess >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Security headers configured
) else (
    echo ❌ Security headers missing
)

REM Check CORS configuration
findstr /C:"Access-Control-Allow-Origin" cpanel-vite-upload\.htaccess >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ CORS headers configured
) else (
    echo ❌ CORS headers missing
)

echo.
echo 🎯 DEPLOYMENT READINESS:
echo =======================

set /a score=0

if exist "cpanel-vite-upload\index.html" set /a score+=1
if exist "cpanel-vite-upload\assets" set /a score+=1
if exist "cpanel-vite-upload\.htaccess" set /a score+=1

findstr /C:"bingo-mini-app-sily.onrender.com" cpanel-vite-upload\assets\*.js >nul 2>&1
if %errorlevel% equ 0 set /a score+=1

findstr /C:"mod_deflate" cpanel-vite-upload\.htaccess >nul 2>&1
if %errorlevel% equ 0 set /a score+=1

if %score% geq 4 (
    echo ✅ PACKAGE READY FOR DEPLOYMENT
    echo    Score: %score%/5 - Excellent
    echo.
    echo 🚀 NEXT STEPS:
    echo 1. Upload to cPanel public_html
    echo 2. Set file permissions (644/755)
    echo 3. Test with performance-test.html
    echo 4. Verify all game features
) else (
    echo ❌ PACKAGE NEEDS ATTENTION
    echo    Score: %score%/5 - Issues detected
    echo.
    echo 🔧 RECOMMENDED ACTIONS:
    echo 1. Rebuild frontend: npm run build
    echo 2. Check backend URL configuration
    echo 3. Verify .htaccess file
    echo 4. Re-run this test
)

echo.
echo 📋 QUICK STATS:
echo ===============
echo Files: 
dir cpanel-vite-upload /b | find /c /v ""
echo Directories:
dir cpanel-vite-upload /ad /b | find /c /v ""

echo.
echo 🧪 TEST PERFORMANCE TOOL:
echo =========================
echo After upload, test with:
echo https://yourdomain.com/performance-test.html
echo.

pause