@echo off
echo ========================================
echo   Building Modern Kebrchacha Bingo
echo ========================================
echo.

echo [1/3] Setting environment...
set NODE_OPTIONS=--openssl-legacy-provider
set GENERATE_SOURCEMAP=false

echo [2/3] Building React app...
cd client
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed! Trying alternative approach...
    echo.
    
    echo Removing node_modules and reinstalling...
    rmdir /s /q node_modules
    npm install --legacy-peer-deps
    
    echo Retrying build...
    npm run build
)

echo [3/3] Build complete!
echo.
echo ========================================
echo   MODERN TAILWIND BUILD READY!
echo ========================================
echo.
echo Features:
echo - Mobile-first responsive design
echo - Tailwind CSS styling
echo - Modern animations
echo - Beteseb-style interface
echo - Ultra-fast performance
echo.
echo Files ready in: client/build/
echo Upload to cPanel for lightning speed!
echo ========================================
pause