# Bingo Mini App - Complete System

A full-stack Telegram Bingo Mini App with wallet system, manual payment verification, and real-time game engine.

## Features

### 💰 Wallet System
- **Main Wallet**: Stores approved deposits
- **Play Wallet**: Used for game bets
- **Manual Payment Verification**: Admin approval for deposits
- **Screenshot Upload**: Direct to Cloudinary
- **Transaction History**: Track all deposits/withdrawals

### 🎮 Game Engine
- **Real-time Bingo**: Socket.io powered live games
- **Auto-Daubing**: Optional automatic number marking
- **Haptic Feedback**: Telegram WebApp integration
- **Winner Validation**: Server-side verification
- **Prize Pool**: Automatic distribution

### 🔒 Security
- **Telegram Auth**: initData validation
- **Transaction Safety**: MySQL transactions
- **Admin Panel**: Secure approval system

## Tech Stack

**Backend:**
- Node.js 10
- Express.js
- Socket.io 2.x
- MySQL 2 (Aiven.io)
- Cloudinary

**Frontend:**
- React 17
- Socket.io-client 2.x
- Axios
- Telegram WebApp API

## Installation

### 1. Database Setup (Aiven.io)

```bash
# Run the schema on your Aiven MySQL instance
mysql -h your-host.aivencloud.com -u avnadmin -p < server/database/schema.sql
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm start
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Start development
npm start

# Build for production
npm run build
```

## Environment Variables

### Backend (.env)
```
DB_HOST=your-aiven-host.aivencloud.com
DB_PORT=3306
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=bingo_db

TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_TELEGRAM_ID=123456789

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

PORT=3001
```

### Frontend (client/.env)
```
REACT_APP_API_URL=https://your-api.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-preset
REACT_APP_ADMIN_ID=123456789
```

## Cloudinary Setup

1. Create account at cloudinary.com
2. Go to Settings → Upload
3. Create an unsigned upload preset
4. Enable "Unsigned uploading"
5. Set folder to "bingo-deposits"
6. Copy preset name to .env

## Telegram Bot Setup

1. Create bot with @BotFather
2. Get bot token
3. Set bot commands:
```
start - Start the game
wallet - View wallet
play - Join game
```
4. Set Mini App URL in bot settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Wallet
- `POST /api/wallet/deposit` - Submit deposit request
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/transfer-to-play` - Transfer to play wallet

### Game
- `GET /api/game/available` - List available games
- `POST /api/game/create` - Create new game (admin)
- `POST /api/game/join/:gameId` - Join a game
- `GET /api/game/:gameId` - Get game details

### Admin
- `GET /api/admin/transactions/pending` - Get pending deposits
- `POST /api/admin/transactions/:id/approve` - Approve deposit
- `POST /api/admin/transactions/:id/reject` - Reject deposit

## Socket Events

### Client → Server
- `join_game` - Join game room
- `claim_bingo` - Claim BINGO win

### Server → Client
- `game_state` - Initial game state
- `ball_drawn` - New number called
- `game_won` - Game finished
- `bingo_error` - Error message

## Game Flow

1. **User deposits funds**
   - Enters amount
   - Uploads payment screenshot
   - Waits for admin approval

2. **Admin approves**
   - Reviews screenshot
   - Approves/rejects transaction
   - Balance updated automatically

3. **User transfers to play wallet**
   - Moves funds from main to play wallet
   - Ready to join games

4. **User joins game**
   - Selects available game
   - Bet deducted from play wallet
   - Receives Bingo card

5. **Game starts**
   - Numbers drawn every 7 seconds
   - Auto-daub marks numbers
   - Haptic feedback on draws

6. **User wins**
   - Claims BINGO
   - Server validates
   - Prize sent to main wallet

## Security Features

- **initData Validation**: Prevents fake requests
- **MySQL Transactions**: Ensures data consistency
- **Admin-only Routes**: Protected endpoints
- **SSL/TLS**: Aiven MySQL encryption
- **Input Validation**: All user inputs sanitized

## Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or DigitalOcean
- Set environment variables
- Ensure MySQL connection

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or Cloudflare Pages
- Set environment variables

### Database
- Already hosted on Aiven.io
- Ensure SSL is enabled
- Whitelist server IP

## Troubleshooting

**Connection Issues:**
- Check Aiven IP whitelist
- Verify SSL certificate
- Test MySQL connection

**Socket.io Issues:**
- Ensure CORS is configured
- Check WebSocket support
- Verify Socket.io versions match

**Telegram Auth Fails:**
- Verify bot token
- Check initData format
- Ensure HTTPS in production

## License

MIT

## Support

For issues or questions, contact your development team.
