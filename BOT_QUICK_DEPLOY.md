# 🚀 Quick Deploy Checklist

## ✅ Pre-Deployment (DONE)

- [x] Bot code created (`telegram-bot.js`)
- [x] Database schema updated (phone fields added)
- [x] Dependencies installed (`node-telegram-bot-api`)
- [x] Environment variables configured
- [x] Contact sharing implemented
- [x] All commands working

## 📤 Deploy Now (3 Steps)

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Telegram bot with contact sharing"
git push origin main
```

### 2. Add Environment Variables to Render

Go to: **Render Dashboard → Your Service → Environment**

Add these 3 new variables:

```
WEBAPP_URL=https://bingo-mini-app-sily.onrender.com
CHANNEL_URL=https://t.me/kebrchacha_official
SUPPORT_USERNAME=kebrchacha_support
```

### 3. Wait for Auto-Deploy

Render will automatically:
- Pull latest code
- Install dependencies
- Start both server AND bot
- Bot will be live in ~2 minutes

## 🧪 Test (After Deploy)

1. Open Telegram
2. Search for: **@Odabingobot**
3. Send: `/start`
4. Click: **"✅ Register / Update Profile"**
5. Click: **"📱 Share My Contact"**
6. Verify: Success message with your phone number

## ✅ Success Indicators

You'll know it's working when:

- Bot responds to `/start` immediately
- Registration button appears
- Contact sharing works
- Phone number is saved
- All buttons work (Play Now, Deposit Guide, etc.)

## 🔍 Check Logs

**Render Dashboard → Logs**

Look for:
```
🤖 Kebrchacha Bingo Bot is running...
📱 Waiting for /start commands...
```

## 🎯 That's It!

Your bot is ready. Just push to GitHub and test on Telegram!

---

**Bot Username:** @Odabingobot  
**WebApp URL:** https://bingo-mini-app-sily.onrender.com  
**Status:** Ready to Deploy ✅
