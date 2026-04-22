# 🚀 Quick Setup Guide

## ✅ What's Already Done

- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed
- ✅ Environment files created (.env and client/.env)
- ✅ Project structure ready

## 📋 What You Need to Configure

### 1. Database (Aiven MySQL) - REQUIRED

Edit `.env` file and update these lines:

```env
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-actual-password
DB_NAME=bingo_db
```

**Get these from your Aiven dashboard:**
- Go to https://console.aiven.io
- Select your MySQL service
- Copy connection details

**Run the database schema:**
```bash
mysql -h your-host.aivencloud.com -u avnadmin -p < server/database/schema.sql
```

### 2. Telegram Bot - REQUIRED

Edit `.env` file:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_TELEGRAM_ID=your-telegram-user-id
```

**Create bot:**
1. Open Telegram, search for @BotFather
2. Send `/newbot`
3. Follow instructions
4. Copy the token

**Get your Telegram ID:**
1. Search for @userinfobot on Telegram
2. Start the bot
3. Copy your ID

### 3. Cloudinary (Image Upload) - REQUIRED

Edit `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

Edit `client/.env` file:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
```

**Setup Cloudinary:**
1. Go to https://cloudinary.com (create free account)
2. Dashboard shows your Cloud Name, API Key, API Secret
3. Go to Settings → Upload → Add upload preset
4. Name it `bingo_deposits`
5. Set "Signing Mode" to **Unsigned**
6. Save

### 4. Update Admin ID in Frontend

Edit `client/.env`:

```env
REACT_APP_ADMIN_ID=your-telegram-user-id
```

## 🎮 Running the Application

### Option 1: Run Both (Recommended for Development)

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### Option 2: Use the Start Script

```bash
# Windows
npm run dev

# Or manually:
# Terminal 1: npm start
# Terminal 2: cd client && npm start
```

## 🔍 Verify Everything Works

### 1. Backend Running
- Open http://localhost:3001/health
- Should see: `{"status":"ok"}`

### 2. Frontend Running
- Open http://localhost:3000
- Should see the Bingo app (may show errors until Telegram integration)

### 3. Database Connected
- Check backend terminal for "Server running on port 3001"
- No database connection errors

## 📱 Testing with Telegram

### Setup Mini App

1. Go to @BotFather on Telegram
2. Send `/mybots`
3. Select your bot
4. Choose "Bot Settings" → "Menu Button"
5. Enter URL: `http://localhost:3000` (for testing)
   - For production: use your deployed URL

### Test the Flow

1. Open your bot in Telegram
2. Click "Open App" button
3. Should see the Bingo interface
4. Test wallet deposit (upload screenshot)
5. Check admin panel to approve deposits

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Fix:** Check your Aiven credentials in `.env`

### Cloudinary Upload Fails

```
Upload widget not loading
```

**Fix:** 
1. Verify upload preset is "Unsigned"
2. Check preset name matches in `client/.env`
3. Ensure CORS is enabled in Cloudinary settings

### Telegram Auth Fails

```
Invalid Telegram authentication
```

**Fix:**
1. Verify bot token is correct
2. In production, must use HTTPS
3. For local testing, use ngrok or similar

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change PORT in .env to 3002
```

## 🚀 Next Steps

1. **Configure all environment variables** (see above)
2. **Run database schema** on Aiven
3. **Start backend**: `npm start`
4. **Start frontend**: `cd client && npm start`
5. **Test locally** with Telegram bot
6. **Deploy to production** (see DEPLOYMENT.md)

## 📞 Quick Commands Reference

```bash
# Install dependencies (already done)
npm install
cd client && npm install

# Start backend
npm start

# Start frontend
cd client
npm start

# Build frontend for production
cd client
npm run build

# Check for issues
npm audit
cd client && npm audit

# Run database schema
mysql -h your-host.aivencloud.com -u avnadmin -p < server/database/schema.sql
```

## ✨ Features to Test

- [ ] User login via Telegram
- [ ] Deposit funds (upload screenshot)
- [ ] Admin approve deposit
- [ ] Transfer to play wallet
- [ ] Join a game
- [ ] Play Bingo (auto-daub)
- [ ] Claim BINGO win
- [ ] Receive prize

## 🎯 Production Checklist

Before deploying:

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Cloudinary upload preset created
- [ ] Telegram bot configured
- [ ] Admin ID set correctly
- [ ] Test deposit flow
- [ ] Test game flow
- [ ] Change API URL in `client/.env` to production URL

---

**Need Help?** Check the full documentation in `README.md` and `DEPLOYMENT.md`
