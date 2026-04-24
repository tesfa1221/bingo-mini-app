@echo off
echo ========================================
echo   UPLOAD VERIFICATION - TELEGRAM FIX
echo ========================================
echo.

echo 🔍 VERIFYING DEPLOYMENT STATUS
echo ===============================
echo.

echo 📍 Testing deployment URLs...
echo.

echo 1. Simple Test Page:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://negattech.com/kbingo/simple-test.html' -UseBasicParsing; if ($response.Content -like '*Simple Test Version Working*') { Write-Host '✅ Simple test page working!' -ForegroundColor Green } else { Write-Host '❌ Simple test page not found' -ForegroundColor Red } } catch { Write-Host '❌ Simple test page not accessible' -ForegroundColor Red }"

echo.
echo 2. Debug Page:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://negattech.com/kbingo/debug.html' -UseBasicParsing; if ($response.Content -like '*Debug Page*') { Write-Host '✅ Debug page available!' -ForegroundColor Green } else { Write-Host '❌ Debug page not found' -ForegroundColor Red } } catch { Write-Host '❌ Debug page not accessible' -ForegroundColor Red }"

echo.
echo 3. Main App:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://negattech.com/kbingo/' -UseBasicParsing; if ($response.Content -like '*kbingo/assets*') { Write-Host '✅ New version uploaded!' -ForegroundColor Green } else { Write-Host '❌ Old version still active' -ForegroundColor Red } } catch { Write-Host '❌ Main app not accessible' -ForegroundColor Red }"

echo.
echo 4. CSS Asset:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://negattech.com/kbingo/assets/index-BmR_6EwN.css' -UseBasicParsing -Method Head; Write-Host '✅ CSS file accessible' -ForegroundColor Green } catch { Write-Host '❌ CSS file not found (404)' -ForegroundColor Red }"

echo.
echo 5. JS Asset:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://negattech.com/kbingo/assets/index-DH6_iV7_.js' -UseBasicParsing -Method Head; Write-Host '✅ JS file accessible' -ForegroundColor Green } catch { Write-Host '❌ JS file not found (404)' -ForegroundColor Red }"

echo.
echo 6. Backend Connection:
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing; $json = $response.Content | ConvertFrom-Json; Write-Host '✅ Backend online:' $json.service -ForegroundColor Green } catch { Write-Host '❌ Backend connection failed' -ForegroundColor Red }"

echo.
echo 📋 DIAGNOSIS RESULTS:
echo ====================
echo.

echo 🎯 NEXT STEPS BASED ON RESULTS:
echo ================================
echo.
echo IF SIMPLE TEST WORKS:
echo - ✅ Server and upload are working
echo - ✅ Files were uploaded successfully
echo - 🔧 Issue is with asset loading or caching
echo.
echo IF SIMPLE TEST FAILS:
echo - ❌ Files weren't uploaded correctly
echo - 🔧 Need to re-upload all files to /kbingo/
echo - 🔧 Check file permissions and .htaccess
echo.
echo IF ASSETS FAIL (404):
echo - ❌ Assets folder not uploaded correctly
echo - 🔧 Ensure assets/ folder is in /kbingo/assets/
echo - 🔧 Check file permissions on assets directory
echo.
echo IF MAIN APP SHOWS OLD VERSION:
echo - ❌ Browser/server caching issue
echo - 🔧 Clear browser cache (Ctrl+F5)
echo - 🔧 Clear Telegram cache
echo - 🔧 Wait 5-10 minutes for server cache
echo.

echo 🚀 IMMEDIATE ACTIONS:
echo ======================
echo.
echo 1. Visit: https://negattech.com/kbingo/simple-test.html
echo 2. If working: Clear all caches and test main app
echo 3. If not working: Re-upload all files from cpanel-vite-upload/
echo 4. Check debug page: https://negattech.com/kbingo/debug.html
echo 5. Test in Telegram WebApp after fixes
echo.

echo 📞 TROUBLESHOOTING RESOURCES:
echo ==============================
echo - Simple Test: https://negattech.com/kbingo/simple-test.html
echo - Debug Page: https://negattech.com/kbingo/debug.html
echo - Performance Test: https://negattech.com/kbingo/performance-test.html
echo - Full Guide: TELEGRAM_LOADING_TROUBLESHOOTING.md
echo.

pause

echo.
echo 🌐 Opening simple test page...
start https://negattech.com/kbingo/simple-test.html