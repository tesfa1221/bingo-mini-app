# ✅ Configuration Checklist

## Current Status

Run `npm run check` to see your configuration status.

## Step-by-Step Configuration

### 🗄️ Step 1: Aiven MySQL Database (5 minutes)

**If you don't have Aiven account:**
1. Go to https://aiven.io
2. Sign up (free tier available)
3. Create a MySQL service
4. Wait for it to start (~2 minutes)

**Get your credentials:**
1. Open your MySQL service in Aiven dashboard
2. Click "Overview" tab
3. You'll see:
   - Host: `something.aivencloud.com`
   - Port: `3306`
   - User: `avnadmin`
   - Password: Click "Show" to reveal

**Update `.env` file:**
```env
DB_HOST=your-actual-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-actual-password
DB_NAME=bingo_db
```

**Deploy the database schema:**

Option A - Using MySQL client:
```bash
mysql -h your-host.aivencloud.com -u avnadmin -p --ssl-mode=REQUIRED < server/database/schema.sql
```

Option B - Using Aiven web console:
1. Go to your MySQL service
2. Click "Query Editor"
3. Copy contents of `server/database/schema.sql`
4. Paste and execute

---

### 🤖 Step 2: Telegram Bot (3 minutes)

**Create the bot:**
1. Open Telegram
2. Search for `@BotFather`
3. Send: `/newbot`
4. Choose a name: `My Bingo Game`
5. Choose a username: `mybingo_game_bot` (must end with 'bot')
6. Copy the token (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Get your Telegram ID:**
1. Search for `@userinfobot` on Telegram
2. Start the bot
3. Copy your ID (a number like: `123456789`)

**Update `.env` file:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ADMIN_TELEGRAM_ID=123456789
```

**Update `client/.env` file:**
```env
REACT_APP_ADMIN_ID=123456789
```

---

### ☁️ Step 3: Cloudinary (5 minutes)

**Create account:**
1. Go to https://cloudinary.com
2. Sign up (free tier: 25GB storage, 25GB bandwidth/month)
3. Verify email

**Get credentials:**
1. Go to Dashboard
2. You'll see:
   - Cloud Name
   - API Key
   - API Secret (click "Reveal")

**Create upload preset:**
1. Go to Settings (gear icon)
2. Click "Upload" tab
3. Scroll to "Upload presets"
4. Click "Add upload preset"
5. Configure:
   - Preset name: `bingo_deposits`
   - Signing mode: **Unsigned** (important!)
   - Folder: `bingo-deposits`
6. Click "Save"

**Update `.env` file:**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

**Update `client/.env` file:**
```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
```

---

## 🎯 Verify Configuration

Run the setup checker:
```bash
npm run check
```

You should see all ✅ green checkmarks.

---

## 🚀 Start the Application

### Method 1: Automatic (Windows)
```bash
start-dev.bat
```

### Method 2: Manual (Two terminals)

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

---

## 🧪 Test Everything

### 1. Backend Health Check
Open: http://localhost:3001/health

Should see:
```json
{"status":"ok"}
```

### 2. Frontend
Open: http://localhost:3000

Should see the Bingo app interface.

### 3. Database Connection
Check Terminal 1 (backend) - should see:
```
Server running on port 3001
```

No errors about database connection.

---

## 📱 Connect Telegram Bot

### For Local Testing (Development)

**Option A: Use ngrok (Recommended)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the HTTPS URL (like: https://abc123.ngrok.io)
# Update client/.env:
REACT_APP_API_URL=https://your-ngrok-url.ngrok.io
```

**Option B: Deploy to production first**
See DEPLOYMENT.md

### Configure Bot Menu Button

1. Go to @BotFather
2. Send: `/mybots`
3. Select your bot
4. Choose "Bot Settings"
5. Choose "Menu Button"
6. Choose "Edit menu button URL"
7. Enter your URL:
   - Local: `https://your-ngrok-url.ngrok.io`
   - Production: `https://your-domain.com`

### Test the Bot

1. Open your bot in Telegram
2. Click "Menu" button or type `/start`
3. Click "Open App"
4. Should see the Bingo interface

---

## 🎮 Test Full Flow

### 1. Login
- Open bot → Click "Open App"
- Should auto-login with Telegram

### 2. Deposit
- Click "Wallet" tab
- Click "Deposit"
- Enter amount (e.g., 100)
- Click "Upload Screenshot"
- Upload any image
- Should see "Deposit request submitted"

### 3. Admin Approval
- Click "Admin" tab (only visible to admin)
- Should see pending transaction
- Click "Approve"
- Balance should update

### 4. Transfer to Play Wallet
- Go to "Wallet" tab
- Enter amount in "Transfer to Play Wallet"
- Click "Transfer"
- Play wallet balance should increase

### 5. Create Game (Admin)
You'll need to create a game via API:

```bash
# Using curl (replace with your initData)
curl -X POST http://localhost:3001/api/game/create \
  -H "Content-Type: application/json" \
  -H "x-telegram-init-data: your-init-data" \
  -d '{"betAmount": 10, "maxPlayers": 5}'
```

Or create a simple admin UI for game creation.

### 6. Join Game
- Go to "Lobby" tab
- Should see available games
- Click "Join Game"
- Should see your Bingo card

### 7. Start Game (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/game/start/1 \
  -H "x-telegram-init-data: your-init-data"
```

### 8. Play
- Numbers will be called every 7 seconds
- Auto-daub marks your numbers
- When you get BINGO, click "BINGO!" button
- Prize goes to main wallet

---

## 🐛 Common Issues

### "Database connection failed"
- Check Aiven credentials in `.env`
- Ensure database is running in Aiven dashboard
- Verify SSL is enabled

### "Cloudinary upload failed"
- Check upload preset is "Unsigned"
- Verify preset name matches
- Check cloud name is correct

### "Invalid Telegram authentication"
- Verify bot token is correct
- For production, must use HTTPS
- Check initData is being sent

### "Port 3001 already in use"
```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 📊 Environment Variables Summary

### Backend (.env)
```env
DB_HOST=your-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=bingo_db
TELEGRAM_BOT_TOKEN=your-bot-token
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_TELEGRAM_ID=your-telegram-id
PORT=3001
```

### Frontend (client/.env)
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
REACT_APP_ADMIN_ID=your-telegram-id
```

---

## ✅ Final Checklist

- [ ] Aiven MySQL database created
- [ ] Database schema deployed
- [ ] Telegram bot created
- [ ] Telegram ID obtained
- [ ] Cloudinary account created
- [ ] Cloudinary upload preset created (unsigned)
- [ ] All `.env` variables configured
- [ ] All `client/.env` variables configured
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Health check returns OK
- [ ] Telegram bot menu button configured
- [ ] Can login via Telegram
- [ ] Can upload deposit screenshot
- [ ] Admin can approve deposits
- [ ] Can transfer to play wallet
- [ ] Can join games

---

**Ready to deploy?** See `DEPLOYMENT.md` for production deployment guide.

**Need help?** Check `README.md` for full documentation.
