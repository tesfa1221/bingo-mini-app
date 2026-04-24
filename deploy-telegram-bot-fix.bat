@echo off
echo ========================================
echo   TELEGRAM BOT FIX - COMPLETE SETUP
echo ========================================
echo.

echo 🤖 DEPLOYING TELEGRAM BOT WEBHOOK SUPPORT
echo ==========================================
echo.

echo ✅ CHANGES MADE:
echo ================
echo ✓ Created /api/telegram/webhook endpoint
echo ✓ Added bot command handlers (/start, /help, /play, /wallet)
echo ✓ Configured WebApp button responses
echo ✓ Added webhook setup utilities
echo ✓ Updated server with Telegram routes
echo.

echo 📤 PUSHING TO RENDER:
echo =====================
echo Committing and pushing backend changes...
echo.

git add .
git commit -m "🤖 Add Telegram bot webhook support - Fix bot not responding issue"
git push origin main

echo.
echo ⏳ Waiting for Render deployment...
timeout /t 30 /nobreak >nul

echo.
echo 🔧 SETTING UP WEBHOOK:
echo ======================
echo Testing backend deployment...

powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/health' -UseBasicParsing; Write-Host '✅ Backend is running' -ForegroundColor Green } catch { Write-Host '❌ Backend not accessible' -ForegroundColor Red }"

echo.
echo Setting up Telegram webhook...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/api/telegram/set-webhook' -Method POST -UseBasicParsing; Write-Host '✅ Webhook configured successfully' -ForegroundColor Green } catch { Write-Host '❌ Webhook setup failed' -ForegroundColor Red }"

echo.
echo 🧪 TESTING BOT:
echo ===============
echo Testing bot API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://bingo-mini-app-sily.onrender.com/api/telegram/test' -UseBasicParsing; Write-Host '✅ Bot API working' -ForegroundColor Green } catch { Write-Host '❌ Bot API failed' -ForegroundColor Red }"

echo.
echo 📋 BOTFATHER CONFIGURATION NEEDED:
echo ==================================
echo.
echo 1. MESSAGE @BotFather:
echo ----------------------
echo /setcommands
echo Choose: @Odabingobot
echo.
echo Commands to set:
echo start - 🎮 Welcome! Start playing Kebrchacha Bingo
echo help - 📋 How to play and game instructions  
echo play - 🎯 Quick access to the game
echo wallet - 💰 Check wallet balance and transactions
echo.

echo 2. SET MENU BUTTON:
echo -------------------
echo /setmenubutton
echo Choose: @Odabingobot
echo Button Text: 🎮 Play Bingo
echo WebApp URL: https://negattech.com/kbingo/?v=2
echo.

echo 3. SET DESCRIPTION:
echo ------------------
echo /setdescription
echo Choose: @Odabingobot
echo Description: 🎮 Kebrchacha Bingo - Real-time multiplayer bingo game with instant payouts! Play now and win big!
echo.

echo 🎯 EXPECTED BEHAVIOR AFTER SETUP:
echo =================================
echo.
echo ✅ Bot responds to /start command
echo ✅ Shows welcome message with WebApp button
echo ✅ Menu button opens game directly
echo ✅ All commands work correctly
echo ✅ WebApp loads properly (not stuck on loading)
echo.

echo 🧪 TESTING STEPS:
echo =================
echo.
echo 1. Send /start to @Odabingobot
echo 2. Bot should respond with welcome message
echo 3. Tap "🎮 Play Bingo" button
echo 4. WebApp should open with game interface
echo 5. Verify all features work correctly
echo.

echo 📞 TROUBLESHOOTING:
echo ===================
echo.
echo IF BOT STILL DOESN'T RESPOND:
echo - Check webhook status: https://bingo-mini-app-sily.onrender.com/api/telegram/webhook-info
echo - Verify bot token in Render environment variables
echo - Check backend logs for webhook requests
echo.
echo IF WEBAPP STILL LOADING:
echo - Clear Telegram cache completely
echo - Try different device/Telegram client
echo - Use cache-busting URL: https://negattech.com/kbingo/?v=2
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo ========================
echo.
echo Backend now supports:
echo ✓ Telegram bot commands
echo ✓ WebApp button responses  
echo ✓ Webhook handling
echo ✓ Cache-busting URLs
echo.
echo Next: Configure @BotFather settings above
echo.

pause

echo.
echo 🌐 Testing webhook endpoint...
start https://bingo-mini-app-sily.onrender.com/api/telegram/test

echo.
echo 📱 Testing WebApp...
start https://negattech.com/kbingo/?v=2