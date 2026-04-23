# 🤖 Telegram Bot Setup Guide

## ✅ What I've Created

A complete Telegram bot with:
- 🎉 Welcome message with interactive buttons
- 🎮 Play Now button (opens WebApp)
- 📝 How to Play guide
- 💰 Deposit guide
- 💬 Contact Support button
- 📢 Channel link button
- 🏆 Leaderboard
- ℹ️ About section
- 💰 Balance checker
- 🆘 Help command

---

## 🚀 How to Run the Bot

### Option 1: Run Locally (Testing)

```bash
# Install dependencies
npm install

# Run the bot
npm run bot
```

### Option 2: Run on Render (Production)

The bot will start automatically with your web server!

---

## ⚙️ Configuration Needed

### 1. Update Your .env File

Add these new variables:

```env
WEBAPP_URL=https://bingo-mini-app-sily.onrender.com
CHANNEL_URL=https://t.me/your_channel_name
SUPPORT_USERNAME=your_support_bot
```

### 2. Create Support Channel (Optional)

1. Create a Telegram channel for announcements
2. Get the channel link (e.g., https://t.me/kebrchacha_official)
3. Add to CHANNEL_URL in .env

### 3. Create Support Bot/User (Optional)

1. Create a support account or bot
2. Get the username (e.g., kebrchacha_support)
3. Add to SUPPORT_USERNAME in .env

---

## 🎮 Bot Features

### /start Command
Shows welcome message with buttons:
- **🎮 Play Now** - Opens the Bingo game
- **📝 How to Play** - Complete game guide
- **💰 Deposit Guide** - Payment instructions
- **💬 Contact Support** - Direct link to support
- **📢 Our Channel** - Link to announcements
- **🏆 Leaderboard** - Top 10 players
- **ℹ️ About Us** - Company information

### /balance Command
Shows user's wallet balances:
- Main Wallet balance
- Play Wallet balance
- Total balance
- Quick play button

### /help Command
Shows all available commands and quick links

### /support Command
Shows support contact information

---

## 📱 User Flow

1. **User sends /start**
2. **Bot registers user** in database
3. **Shows welcome message** with buttons
4. **User clicks "Play Now"**
5. **WebApp opens** with their account ready
6. **No more "Anonymous"** - user is registered!

---

## 🎯 Benefits

### For Users:
- ✅ Clear onboarding process
- ✅ Easy access to game
- ✅ Built-in help and support
- ✅ Quick balance checking
- ✅ Direct channel access

### For You:
- ✅ Automatic user registration
- ✅ Better user engagement
- ✅ Professional appearance
- ✅ Easy support management
- ✅ Channel promotion built-in

---

## 🔧 Customization

### Change Welcome Message
Edit `telegram-bot.js` line 45-70

### Change Payment Details
Edit `telegram-bot.js` line 120-130

### Add More Buttons
Add to `keyboard.inline_keyboard` array

### Change Support Contact
Update `SUPPORT_USERNAME` in .env

---

## 🚀 Deployment to Render

### Step 1: Update Environment Variables

In Render dashboard, add:
```
WEBAPP_URL=https://bingo-mini-app-sily.onrender.com
CHANNEL_URL=https://t.me/your_channel
SUPPORT_USERNAME=your_support
```

### Step 2: Deploy

The bot will start automatically with the updated `render-start` script!

---

## 🧪 Testing

### Test Locally:
```bash
npm run bot
```

Then in Telegram:
1. Send /start to your bot
2. Check if welcome message appears
3. Click all buttons
4. Verify everything works

### Test on Production:
1. Deploy to Render
2. Wait for deployment
3. Send /start to bot
4. Test all features

---

## 📊 Bot Commands Summary

| Command | Description |
|---------|-------------|
| /start | Register and show welcome |
| /balance | Check wallet balance |
| /help | Show help message |
| /support | Contact support info |

---

## 🎉 Ready to Deploy!

Your bot is ready with:
- ✅ Complete welcome flow
- ✅ Interactive buttons
- ✅ User registration
- ✅ Help system
- ✅ Support integration
- ✅ Channel promotion

**Just deploy and your users will have a professional onboarding experience!** 🚀