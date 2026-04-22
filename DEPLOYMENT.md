# Deployment Guide

## Prerequisites

1. **Aiven MySQL Database** (already set up)
2. **Cloudinary Account** for image uploads
3. **Telegram Bot** created via @BotFather
4. **Node.js 10+** installed

## Step 1: Database Setup

### Connect to Aiven MySQL

```bash
mysql -h your-host.aivencloud.com -u avnadmin -p -P 3306 --ssl-mode=REQUIRED
```

### Run Schema

```bash
mysql -h your-host.aivencloud.com -u avnadmin -p < server/database/schema.sql
```

Or copy-paste the SQL from `server/database/schema.sql` into your MySQL client.

## Step 2: Cloudinary Setup

1. Go to https://cloudinary.com and create account
2. Navigate to Settings → Upload
3. Scroll to "Upload presets"
4. Click "Add upload preset"
5. Set:
   - Preset name: `bingo_deposits` (or your choice)
   - Signing mode: **Unsigned**
   - Folder: `bingo-deposits`
6. Save and copy the preset name

## Step 3: Telegram Bot Setup

### Create Bot

```
1. Open Telegram and search for @BotFather
2. Send /newbot
3. Follow instructions to create bot
4. Copy the bot token
```

### Configure Bot

```
/setcommands

start - Start the Bingo game
wallet - View your wallet
help - Get help
```

### Set Mini App URL

```
/newapp
Select your bot
Enter app title: "Bingo Game"
Enter description
Upload icon (512x512 PNG)
Enter Web App URL: https://your-frontend-url.com
```

## Step 4: Backend Deployment

### Option A: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DB_HOST=your-host.aivencloud.com
railway variables set DB_PORT=3306
railway variables set DB_USER=avnadmin
railway variables set DB_PASSWORD=your-password
railway variables set DB_NAME=bingo_db
railway variables set TELEGRAM_BOT_TOKEN=your-token
railway variables set ADMIN_TELEGRAM_ID=your-telegram-id
railway variables set CLOUDINARY_CLOUD_NAME=your-cloud
railway variables set CLOUDINARY_API_KEY=your-key
railway variables set CLOUDINARY_API_SECRET=your-secret
railway variables set PORT=3001

# Deploy
railway up
```

### Option B: Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create bingo-api

# Set environment variables
heroku config:set DB_HOST=your-host.aivencloud.com
heroku config:set DB_PORT=3306
heroku config:set DB_USER=avnadmin
heroku config:set DB_PASSWORD=your-password
heroku config:set DB_NAME=bingo_db
heroku config:set TELEGRAM_BOT_TOKEN=your-token
heroku config:set ADMIN_TELEGRAM_ID=your-telegram-id
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud
heroku config:set CLOUDINARY_API_KEY=your-key
heroku config:set CLOUDINARY_API_SECRET=your-secret

# Deploy
git push heroku main
```

### Option C: DigitalOcean App Platform

1. Connect GitHub repository
2. Select Node.js environment
3. Set build command: `npm install`
4. Set run command: `npm start`
5. Add environment variables in dashboard
6. Deploy

## Step 5: Frontend Deployment

### Build Frontend

```bash
cd client

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=bingo_deposits
REACT_APP_ADMIN_ID=your-telegram-id
EOF

# Build
npm run build
```

### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel

# Set environment variables in Vercel dashboard
# Then deploy production
vercel --prod
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd client
netlify deploy

# Follow prompts
# Build directory: build
# Deploy to production
netlify deploy --prod
```

### Option C: Cloudflare Pages

1. Connect GitHub repository
2. Set build command: `cd client && npm install && npm run build`
3. Set build output directory: `client/build`
4. Add environment variables
5. Deploy

## Step 6: Configure Telegram Bot with Mini App

```
1. Go to @BotFather
2. Send /mybots
3. Select your bot
4. Select "Bot Settings" → "Menu Button"
5. Enter your frontend URL: https://your-frontend-url.com
```

## Step 7: Testing

### Test Authentication

```bash
# Open Telegram
# Start your bot
# Click "Open App" button
# Should see login screen
```

### Test Deposit Flow

```bash
1. Click "Wallet" tab
2. Click "Deposit"
3. Enter amount
4. Upload screenshot
5. Check admin panel for pending transaction
```

### Test Game Flow

```bash
1. Admin creates game via API or admin panel
2. User transfers funds to play wallet
3. User joins game
4. Admin starts game
5. Numbers are drawn every 7 seconds
6. User claims BINGO when they win
```

## Step 8: Admin Panel Access

Only the Telegram user with ID matching `ADMIN_TELEGRAM_ID` can access:
- Pending transactions approval
- Game management
- User management

Get your Telegram ID:
1. Message @userinfobot on Telegram
2. Copy your ID
3. Set as `ADMIN_TELEGRAM_ID` environment variable

## Monitoring

### Check Logs

**Railway:**
```bash
railway logs
```

**Heroku:**
```bash
heroku logs --tail
```

**DigitalOcean:**
Check logs in dashboard

### Database Monitoring

Connect to Aiven dashboard to monitor:
- Connection count
- Query performance
- Storage usage

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
mysql -h your-host.aivencloud.com -u avnadmin -p --ssl-mode=REQUIRED

# Check SSL certificate
openssl s_client -connect your-host.aivencloud.com:3306
```

### Socket.io Connection Issues

- Ensure WebSocket is enabled on hosting platform
- Check CORS configuration
- Verify Socket.io versions match (2.x)

### Telegram Auth Fails

- Verify bot token is correct
- Check initData is being sent in headers
- Ensure HTTPS in production (required by Telegram)

### Cloudinary Upload Fails

- Verify upload preset is unsigned
- Check CORS settings in Cloudinary
- Ensure preset name matches .env

## Security Checklist

- [ ] Database uses SSL/TLS
- [ ] Environment variables are set (not hardcoded)
- [ ] Admin ID is configured correctly
- [ ] Cloudinary preset is unsigned but restricted
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled (optional)
- [ ] Input validation is working
- [ ] SQL injection protection (using parameterized queries)

## Scaling Considerations

### For High Traffic:

1. **Database**: Upgrade Aiven plan for more connections
2. **Backend**: Enable horizontal scaling on hosting platform
3. **Socket.io**: Use Redis adapter for multi-instance support
4. **CDN**: Use Cloudflare for frontend caching

### Redis Setup (Optional for Scaling):

```bash
# Install Redis adapter
npm install socket.io-redis@5.4.0

# Update server/index.js
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'redis-host', port: 6379 }));
```

## Maintenance

### Database Backups

Aiven provides automatic backups. To manually backup:

```bash
mysqldump -h your-host.aivencloud.com -u avnadmin -p bingo_db > backup.sql
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update carefully (test in development first)
npm update
```

## Support

For issues:
1. Check logs first
2. Verify environment variables
3. Test database connection
4. Check Telegram bot configuration
5. Review Cloudinary settings

## Production Checklist

- [ ] Database schema deployed
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Telegram bot configured with Mini App URL
- [ ] Cloudinary upload preset created
- [ ] Admin access tested
- [ ] Deposit flow tested
- [ ] Game flow tested
- [ ] Socket.io real-time updates working
- [ ] Haptic feedback working in Telegram
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring set up (optional)

Your Bingo Mini App is now live! 🎉
