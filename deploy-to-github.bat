@echo off
echo 🚀 Deploying Bingo Mini App to GitHub...
echo.

echo 📁 Initializing Git repository...
git init

echo 📦 Adding all files...
git add .

echo 💾 Committing files...
git commit -m "Initial commit - Bingo Mini App ready for deployment"

echo.
echo ✅ Files prepared for GitHub!
echo.
echo 📋 NEXT STEPS:
echo 1. Create repository on GitHub.com named: bingo-mini-app
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_URL
echo 4. Run: git push -u origin main
echo.
echo 🌐 Then go to render.com to deploy!
echo.
pause