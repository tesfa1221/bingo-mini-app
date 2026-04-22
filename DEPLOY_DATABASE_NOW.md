# 🗄️ Deploy Database Schema - EASY METHOD

## ⚠️ Network Issue

The automatic deployment failed due to network/firewall restrictions. This is normal!

**Don't worry - there's an easier way using Aiven's web interface.**

---

## ✅ EASIEST METHOD - Aiven Web Console (5 minutes)

### Step 1: Login to Aiven

1. Go to: **https://console.aiven.io**
2. Login with your account

### Step 2: Open Query Editor

1. Find your MySQL service in the dashboard
2. Click on it to open
3. Look for **"Query Editor"** tab at the top
4. Click it

### Step 3: Copy the Schema

1. Open this file in your editor: `server/database/schema.sql`
2. Select ALL content (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 4: Execute the Schema

1. Go back to Aiven Query Editor
2. Paste the schema (Ctrl+V)
3. Click **"Execute"** or **"Run"** button
4. Wait for success message

### Step 5: Verify

You should see a success message and these tables created:
- ✅ users
- ✅ transactions
- ✅ games
- ✅ tickets

---

## 🎯 That's It!

Once you see the success message, your database is ready!

---

## 📋 What the Schema Creates

### users table
- Stores user accounts
- Main wallet balance
- Play wallet balance

### transactions table
- Deposit/withdrawal records
- Screenshot URLs
- Admin approval status

### games table
- Bingo game sessions
- Prize pools
- Called numbers

### tickets table
- User game tickets
- Bingo card grids
- Winner status

---

## ✅ After Deployment

Once database is deployed, your app will be fully functional:

1. Users can register via Telegram
2. Deposits can be submitted
3. Admin can approve deposits
4. Games can be created and played
5. Winners receive prizes automatically

---

## 🐛 Troubleshooting

### Can't find Query Editor?
- Look for tabs: Overview, Logs, **Query Editor**, Metrics
- Or look for "SQL" or "Database" section

### Execute button not working?
- Make sure you pasted the entire schema
- Check for any error messages
- Try executing one CREATE TABLE statement at a time

### Tables already exist?
- That's fine! It means schema was already deployed
- You can skip this step

---

## 🚀 Next Step

After deploying database:
1. Create Cloudinary upload preset (see CLOUDINARY_SETUP.md)
2. Open http://localhost:3000
3. Test your app!

---

**Need help?** The schema file is at: `server/database/schema.sql`
