# ⚡ Quick Start - Get Running in 15 Minutes

## What You Have Now

✅ Complete Bingo Mini App codebase
✅ Backend dependencies installed
✅ Frontend dependencies installed
✅ Environment files created

## What You Need

1. **Aiven MySQL Database** (free tier available)
2. **Telegram Bot** (free, takes 2 minutes)
3. **Cloudinary Account** (free tier available)

---

## 🚀 15-Minute Setup

### Minute 1-5: Database Setup

1. Go to https://aiven.io → Sign up
2. Create MySQL service (free tier)
3. Wait for it to start
4. Copy credentials from dashboard
5. Edit `.env` file with your credentials:

```env
DB_HOST=your-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-password
```

6. Deploy schema:
```bash
mysql -h your-host.aivencloud.com -u avnadmin -p < server/database/schema.sql
```

### Minute 6-8: Telegram Bot

1. Open Telegram → Search `@BotFather`
2. Send `/newbot` → Follow instructions
3. Copy bot token
4. Search `@userinfobot` → Get your ID
5. Edit `.env`:

```env
TELEGRAM_BOT_TOKEN=your-token-here
ADMIN_TELEGRAM_ID=your-id-here
```

6. Edit `client/.env`:

```env
REACT_APP_ADMIN_ID=your-id-here
```

### Minute 9-13: Cloudinary

1. Go to https://cloudinary.com → Sign up
2. Dashboard shows: Cloud Name, API Key, API Secret
3. Settings → Upload → Add preset:
   - Name: `bingo_deposits`
   - Mode: **Unsigned**
4. Edit `.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

5. Edit `client/.env`:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
```

### Minute 14-15: Start App

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
# Terminal 1
npm start

# Terminal 2
cd client && npm start
```

---

## ✅ Verify It Works

1. Open http://localhost:3001/health → Should see `{"status":"ok"}`
2. Open http://localhost:3000 → Should see Bingo app
3. Check terminals for errors

---

## 🎮 Test with Telegram

### Quick Test (Local)

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy HTTPS URL
4. Go to @BotFather → `/mybots` → Your bot → Bot Settings → Menu Button
5. Enter ngrok URL
6. Open your bot → Click "Open App"

### Full Test Flow

1. **Login** - Opens automatically
2. **Deposit** - Wallet tab → Deposit → Upload screenshot
3. **Approve** - Admin tab → Approve transaction
4. **Transfer** - Wallet tab → Transfer to play wallet
5. **Play** - Create game (via API) → Join → Play

---

## 🐛 Quick Fixes

**Database error?**
- Check Aiven credentials in `.env`

**Cloudinary error?**
- Preset must be "Unsigned"
- Check preset name matches

**Port in use?**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 📚 Next Steps

- **Full setup guide:** `SETUP_GUIDE.md`
- **Configuration details:** `CONFIGURATION_CHECKLIST.md`
- **Deploy to production:** `DEPLOYMENT.md`
- **Full documentation:** `README.md`

---

## 🎯 Commands Reference

```bash
# Check configuration
npm run check

# Start backend
npm start

# Start frontend
cd client && npm start

# Start both (Windows)
start-dev.bat

# Build for production
cd client && npm run build
```

---

**You're all set!** 🎉

The app is running locally. Configure your Telegram bot menu button to test it.

For production deployment, see `DEPLOYMENT.md`.
