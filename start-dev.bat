@echo off
echo ========================================
echo   Bingo Mini App - Development Mode
echo ========================================
echo.
echo Starting Backend Server...
start cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start cmd /k "cd client && npm start"
echo.
echo ========================================
echo   Both servers are starting!
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
