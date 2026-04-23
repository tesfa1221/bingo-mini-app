# 🚀 Render Initialization Guide

## ✅ Code Already Pushed to GitHub

Your high-stakes Bingo system is now on GitHub and Render is deploying it automatically.

---

## 🔧 ONE-TIME Setup on Render

### Step 1: Wait for Deployment

Go to: https://dashboard.render.com/web/srv-YOUR-SERVICE-ID

Wait until you see: **"Deploy succeeded"** (usually 2-3 minutes)

### Step 2: Open Shell on Render

1. Click your service name
2. Click **"Shell"** tab on the left
3. A terminal will open

### Step 3: Run Initialization Command

Copy and paste this into the Render shell:

```bash
node initialize-high-stakes.js
```

**Expected Output:**
```
🎴 Initializing High-Stakes Bingo System...
✅ Connected to database
📝 Adding penalty system fields...
✅ Added is_banned_until column
📝 Updating tickets table...
✅ Added card_id column
✅ Added false_bingo_count column
📝 Updating games table...
✅ Added registration_timer column
✅ Added min_balls_for_bingo column
✅ Added card_range_max column
📝 Creating card_selections table...
✅ Created card_selections table
📝 Creating bingo_cards table...
✅ Created bingo_cards table
🎴 Generating 100 unique Bingo cards...
✅ Generated 10/100 cards
✅ Generated 20/100 cards
✅ Generated 30/100 cards
✅ Generated 40/100 cards
✅ Generated 50/100 cards
✅ Generated 60/100 cards
✅ Generated 70/100 cards
✅ Generated 80/100 cards
✅ Generated 90/100 cards
✅ Generated 100/100 cards
🎉 High-Stakes Bingo System initialized successfully!

📋 Summary:
   ✅ Penalty system (30-min ban for false BINGO)
   ✅ Card selection lobby (1-100 cards)
   ✅ Registration timer (60 seconds)
   ✅ Multi-pattern validation (Horizontal, Vertical, Diagonal, Four Corners)
   ✅ Manual marking system
   ✅ BINGO button activation after 5 balls
   ✅ Shared jackpot for multiple winners

🚀 System is ready to use!
```

### Step 4: Verify

Run this to check if cards were created:

```bash
node -e "const db = require('./server/config/database'); db.query('SELECT COUNT(*) as count FROM bingo_cards').then(([r]) => console.log('Cards:', r[0].count))"
```

Should show: **Cards: 100**

---

## 🎮 Test the System

1. Open: https://bingo-mini-app-sily.onrender.com
2. Go to Admin tab
3. Create a new game
4. Join the game
5. You should see the **Card Selection Lobby** with 1-100 cards!

---

## 🆘 If Something Goes Wrong

### Error: "Cannot find module"
```bash
npm install
node initialize-high-stakes.js
```

### Error: "Connection refused"
Check your environment variables are set:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

### Cards already exist
If you see "ℹ️ 100 cards already exist", that's fine! It means initialization already ran.

---

## 📱 Alternative: Run Locally Then Deploy

If Render shell doesn't work, you can:

1. Run locally:
```bash
node initialize-high-stakes.js
```

2. This updates YOUR database (Aiven)
3. Render will use the same database
4. Done! ✅

---

## ✨ What Happens After Initialization

- 100 unique Bingo cards stored in database
- All new database fields created
- System ready for high-stakes games
- Card selection lobby works
- Penalty system active
- 4-pattern validation enabled

---

## 🎯 Quick Test Flow

1. **Admin** → Create Game (bet: 10 ETB)
2. **Lobby** → Join Game
3. **Card Selection** → Pick a card (1-100)
4. **Preview** → See the 5x5 grid
5. **Confirm** → Lock your card
6. **Wait** → Timer counts down (60s)
7. **Game Starts** → Mark numbers manually
8. **BINGO** → Try to win!

---

## 🔥 That's It!

After running `node initialize-high-stakes.js` once on Render, your high-stakes Bingo system is fully operational!

**Need help?** Check the logs in Render dashboard.
