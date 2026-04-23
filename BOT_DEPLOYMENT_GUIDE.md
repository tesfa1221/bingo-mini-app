# 🤖 Telegram Bot Deployment Guide

## ✅ What's Been Done

1. **Bot Implementation Complete** ✅
   - Welcome message with interactive buttons
   - Contact sharing for registration
   - Phone number verification
   - All commands implemented (/start, /help, /balance, /support)
   - Database integration ready

2. **Database Schema Updated** ✅
   - Added `phone_number` column (UNIQUE)
   - Added `first_name` column
   - Added `last_name` column
   - Migration script executed successfully

3. **Dependencies Installed** ✅
   - `node-telegram-bot-api` package added
   - All required packages in package.json

4. **Environment Variables Configured** ✅
   - Bot token: 8636880293:AAHKpD2_No4byTd6l4qTa331pWcLuf9dF3I
   - WebApp URL: https://bingo-mini-app-sily.onrender.com
   - Channel URL: https://t.me/kebrchacha_official
   - Support username: kebrchacha_support

---

## 🚀 Deploy to Render

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add Telegram bot with contact sharing"
git push origin main
```

### Step 2: Update Render Environment Variables

Go to your Render dashboard → Your service → Environment

**Add these new variables:**

```
WEBAPP_URL=https://bingo-mini-app-sily.onrender.com
CHANNEL_URL=https://t.me/kebrchacha_official
SUPPORT_USERNAME=kebrchacha_support
```

**Existing variables (verify they're set):**
- TELEGRAM_BOT_TOKEN (your bot token)
- DB_HOST (your Aiven MySQL host)
- DB_PORT (your database port)
- DB_USER (your database user)
- DB_PASSWORD (your database password)
- DB_NAME (your database name)
- ADMIN_TELEGRAM_ID (your Telegram ID)

### Step 3: Verify Start Script

Your `package.json` already has the correct start script:

```json
"render-start": "node server/index.js & node telegram-bot.js"
```

This will start BOTH the web server AND the bot automatically.

### Step 4: Deploy

Render will automatically deploy when you push to GitHub. The bot will start running alongside your web server.

---

## 🧪 Testing the Bot

### 1. Test /start Command

Open Telegram and send `/start` to @Odabingobot

**Expected Response:**
- Welcome message with buttons:
  - 🎮 Play Now (opens WebApp)
  - ✅ Register / Update Profile
  - 📝 How to Play
  - 💰 Deposit Guide
  - 💬 Contact Support
  - 📢 Our Channel
  - 🏆 Leaderboard
  - ℹ️ About Us

### 2. Test Registration Flow

1. Click "✅ Register / Update Profile"
2. Bot should ask you to share contact
3. Click "📱 Share My Contact"
4. Bot registers you with phone number
5. Success message appears with your details

**Expected Database Entry:**
```sql
SELECT * FROM users WHERE telegram_id = YOUR_ID;
-- Should show: phone_number, first_name, last_name
```

### 3. Test Other Commands

```
/help - Shows help message
/balance - Shows wallet balance
/support - Shows support contact info
```

### 4. Test Buttons

- **Play Now** → Opens WebApp
- **How to Play** → Shows game instructions
- **Deposit Guide** → Shows payment methods
- **Leaderboard** → Shows top 10 players
- **About Us** → Shows platform info

---

## 🔍 Troubleshooting

### Bot Not Responding

1. Check Render logs:
   ```
   Dashboard → Your Service → Logs
   ```

2. Look for:
   ```
   🤖 Kebrchacha Bingo Bot is running...
   📱 Waiting for /start commands...
   ```

3. If you see "Conflict: terminated by other getUpdates request":
   - Only ONE bot instance can run at a time
   - Stop any local instances
   - Render should be the only one running

### Contact Sharing Not Working

1. Verify database columns exist:
   ```sql
   DESCRIBE users;
   ```

2. Check for phone_number, first_name, last_name columns

3. If missing, run migration again:
   ```bash
   node add-phone-fields.js
   ```

### Database Connection Issues

1. Verify environment variables on Render
2. Check SSL connection in bot code (already configured)
3. Test connection:
   ```bash
   node check-setup.js
   ```

---

## 📱 Bot Features

### Registration System
- ✅ Contact sharing request
- ✅ Phone number verification
- ✅ Duplicate phone check
- ✅ User profile storage
- ✅ Success confirmation

### Commands
- `/start` - Welcome & register
- `/help` - Show help
- `/balance` - Check wallet
- `/support` - Contact support

### Interactive Buttons
- Play Now (WebApp)
- Register/Update Profile
- How to Play
- Deposit Guide
- Contact Support
- Our Channel
- Leaderboard
- About Us

### Security Features
- ✅ Own contact verification
- ✅ Unique phone number constraint
- ✅ Duplicate account prevention
- ✅ Secure database storage

---

## 🎯 Next Steps After Deployment

1. **Test on Telegram**
   - Send /start to @Odabingobot
   - Complete registration with contact sharing
   - Verify phone number is stored

2. **Update Channel & Support**
   - Create @kebrchacha_official channel (if not exists)
   - Create @kebrchacha_support account (if not exists)
   - Update CHANNEL_URL and SUPPORT_USERNAME if needed

3. **Monitor Logs**
   - Watch Render logs for bot activity
   - Check for any errors
   - Verify database entries

4. **Test Full Flow**
   - Register → Deposit → Play → Win → Withdraw
   - Verify all bot commands work
   - Test all interactive buttons

---

## 📊 Bot Status Indicators

When bot is running correctly, you'll see in logs:

```
🤖 Kebrchacha Bingo Bot is running...
📱 Waiting for /start commands...
📱 /start command from USERNAME (USER_ID)
✅ User USERNAME registered/updated
🔘 Button clicked: register
📱 Contact received from USER_ID
✅ User USERNAME registered with phone +251912345678
```

---

## 🆘 Support

If you encounter issues:

1. Check Render logs first
2. Verify all environment variables
3. Test database connection
4. Ensure only one bot instance is running
5. Check Telegram bot token is valid

**Bot is ready to deploy!** 🚀
