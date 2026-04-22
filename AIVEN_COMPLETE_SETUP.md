# 🚀 Aiven Setup - Complete Guide from Scratch

## Step 1: Create Aiven Account

1. Go to: **https://aiven.io**
2. Click **"Get Started for Free"** or **"Sign Up"**
3. Enter your email and create password
4. Verify your email (check inbox)
5. Login to Aiven

---

## Step 2: Create MySQL Service

1. After login, you'll see the dashboard
2. Click **"Create Service"** button
3. Select **"MySQL"** from the list
4. Choose these settings:
   - **Plan**: Select **"Hobbyist"** (free tier)
   - **Cloud**: Any (AWS, Google Cloud, etc.)
   - **Region**: Choose closest to you
   - **Service Name**: `bingo-mysql` (or any name you like)
5. Click **"Create Service"**
6. Wait 2-3 minutes for service to start

---

## Step 3: Get Connection Details

1. Click on your MySQL service (when it shows "Running")
2. You'll see **"Connection Information"** section
3. Copy these details:
   ```
   Host: [something].aivencloud.com
   Port: 3306
   User: avnadmin
   Password: [click "Show" to reveal]
   Database: defaultdb
   ```

---

## Step 4: Find Query Interface

Look for one of these options:

### Option A: Query Tab
- Look for **"Query"** tab at the top
- Click it

### Option B: Database Tools
- In the service overview, look for **"Database Tools"**
- Click **"Query Editor"** or **"SQL Console"**

### Option C: Connection Section
- Scroll down to **"Connection Information"**
- Look for **"Query Database"** button

---

## Step 5: Execute SQL

1. You should now see a text box for SQL
2. Copy the SQL from your Notepad file:
   - Select All (Ctrl+A)
   - Copy (Ctrl+C)
3. Paste in the SQL box (Ctrl+V)
4. Click **"Execute"** or **"Run"**
5. You should see success message

---

## Step 6: Update Your App

After successful execution, update your `.env` file with the NEW connection details:

```env
DB_HOST=your-new-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-new-password
DB_NAME=defaultdb
```

---

## What You Should See

After executing SQL, you should see:
- ✅ Table 'users' created
- ✅ Table 'transactions' created  
- ✅ Table 'games' created
- ✅ Table 'tickets' created

---

## Troubleshooting

**Service won't start?**
- Wait a few more minutes
- Try refreshing the page

**Can't find Query interface?**
- Try different tabs: Overview, Database, Query, Tools
- Look for any button with "SQL" or "Query"

**SQL execution fails?**
- Make sure you copied the entire SQL file
- Check if tables already exist (that's OK)

---

## After Database is Ready

1. Update your `.env` file with new connection details
2. Restart your backend: `npm start`
3. Create Cloudinary preset
4. Test your app at http://localhost:3000

---

**Let's do this step by step! Start with creating the Aiven account.**