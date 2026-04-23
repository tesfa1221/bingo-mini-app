@echo off
echo ========================================
echo   Kebrchacha Bingo - cPanel Build
echo ========================================
echo.

echo [1/3] Setting Node.js environment...
set NODE_OPTIONS=--openssl-legacy-provider

echo [2/3] Building React app for production...
cd client
npm run build

echo [3/3] Build complete!
echo.
echo ========================================
echo   DEPLOYMENT INSTRUCTIONS
echo ========================================
echo.
echo 1. Go to your cPanel File Manager
echo 2. Navigate to public_html folder
echo 3. Upload ALL files from: client/build/
echo 4. Make sure .htaccess is uploaded
echo 5. Test: https://yourdomain.com
echo.
echo Files to upload:
echo - index.html
echo - static/ folder (CSS, JS files)
echo - .htaccess (React Router support)
echo - manifest.json
echo - favicon.ico
echo.
echo Expected performance:
echo - Load time: 0.5-1.5 seconds
echo - Mobile optimized
echo - CDN ready
echo.
echo Backend remains on Render for real-time features.
echo ========================================
pause