@echo off
echo ========================================
echo   Preparing Kebrchacha for cPanel Upload
echo ========================================
echo.

echo [1/4] Building production version...
cd client
set NODE_OPTIONS=--openssl-legacy-provider
npm run build

echo [2/4] Copying files for upload...
cd ..
if exist cpanel-upload rmdir /s /q cpanel-upload
mkdir cpanel-upload

echo [3/4] Copying build files...
xcopy "client\build\*" "cpanel-upload\" /E /I /Y

echo [4/4] Creating upload instructions...
echo. > cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo ========================================>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo   Kebrchacha Bingo - cPanel Upload>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo ========================================>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo.>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 1. Login to your cPanel>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 2. Open File Manager>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 3. Go to public_html folder>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 4. Upload ALL files from this folder>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 5. Make sure .htaccess is uploaded>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo 6. Test: https://yourdomain.com>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo.>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo Files included:>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo - index.html (main app file)>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo - static/ folder (CSS, JS, media)>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo - .htaccess (React Router support)>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo - manifest.json (PWA support)>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo - favicon.ico (website icon)>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo.>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo Backend: https://bingo-mini-app-sily.onrender.com>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo Expected load time: 0.5-1.5 seconds>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt
echo ========================================>> cpanel-upload\UPLOAD_INSTRUCTIONS.txt

echo.
echo ========================================
echo   READY FOR UPLOAD!
echo ========================================
echo.
echo All files are ready in: cpanel-upload/
echo.
echo Next steps:
echo 1. Zip the cpanel-upload folder (optional)
echo 2. Upload to your cPanel public_html
echo 3. Extract if zipped
echo 4. Test your domain
echo.
echo Your Kebrchacha Bingo will be ULTRA FAST!
echo ========================================
pause