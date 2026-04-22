# 🚀 Start Your Bingo App

## ✅ Configuration Complete!

All your credentials are configured:
- ✅ Database credentials
- ✅ Telegram bot token
- ✅ Cloudinary credentials
- ✅ Admin ID

## 📋 Before Starting

### 1. Deploy Database Schema (5 minutes)

**Easiest Method - Aiven Web Console:**
1. Go to: https://console.aiven.io
2. Login and select your MySQL service
3. Click **Query Editor**
4. Copy content from `server/database/schema.sql`
5. Paste and execute

See `DATABASE_SETUP.md` for detailed instructions.

### 2. Create Cloudinary Upload Preset (2 minutes)

1. Go to: https://console.cloudinary.com
2. Settings → Upload → Add upload preset
3. Name: `bingo_deposits`
4. Mode: **Unsigned**
5. Save

See `CLOUDINARY_SETUP.md` for detailed instructions.

## 🎮 Start the Application

### Method 1: Automatic (Windows)

Double-click: `start-dev.bat`

This will open two terminals:
- Terminal 1: Backend server (port 3001)
- Terminal 2: Frontend server (port 3000)

### Method 2: Manual

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## ✅ Verify Everything Works

### 1. Backend Health Check
Open: http://localhost:3001/health

Should see:
```json
{"status":"ok"}
```

### 2. Frontend
Open: http://localhost:3000

Should see the Bingo app interface.

### 3. Check Terminals
- Backend terminal: "Server running on port 3001"
- Frontend terminal: "Compiled successfully!"

## 🎯 Test the App

### Local Testing (Without Telegram)

The app will load but Telegram features won't work until you:
1. Use ngrok to expose localhost
2. Configure Telegram bot menu button
3. Open via Telegram

### With Telegram (Recommended)

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
4. Update `client/.env`:
   ```
   REACT_APP_API_URL=https://your-ngrok-url.ngrok.io
   ```
5. Restart frontend
6. Go to @BotFather on Telegram
7. Send: `/mybots` → Select your bot → Bot Settings → Menu Button
8. Enter your ngrok URL
9. Open your bot in Telegram
10. Click "Open App"

## 🎮 Test Full Flow

1. **Login** - Opens automatically via Telegram
2. **Deposit** - Wallet tab → Deposit → Upload screenshot
3. **Admin Approve** - Admin tab → Approve transaction
4. **Transfer** - Wallet tab → Transfer to play wallet
5. **Create Game** - Use API or create admin UI
6. **Join Game** - Lobby tab → Join game
7. **Play** - Numbers called every 7 seconds
8. **Win** - Click BINGO when you win

## 🐛 Troubleshooting

### Backend Won't Start
- Check database connection in terminal
- Verify .env file is correct
- Ensure port 3001 is not in use

### Frontend Won't Start
- Check client/.env file
- Ensure port 3000 is not in use
- Try: `cd client && npm install`

### Database Connection Error
- Deploy schema first (see DATABASE_SETUP.md)
- Check Aiven service is running
- Verify credentials in .env

### Cloudinary Upload Fails
- Create upload preset (see CLOUDINARY_SETUP.md)
- Ensure preset is "Unsigned"
- Check preset name matches

## 📞 Quick Commands

```bash
# Check configuration
npm run check

# Start backend
npm start

# Start frontend
cd client && npm start

# Start both (Windows)
start-dev.bat

# Deploy database schema
node deploy-schema.js
```

## 🚀 Next Steps

1. Deploy database schema
2. Create Cloudinary preset
3. Start the app
4. Test locally
5. Set up ngrok for Telegram testing
6. Deploy to production (see DEPLOYMENT.md)

---

**Everything is configured and ready!** Just deploy the schema and start the servers.
