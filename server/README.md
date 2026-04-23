# 🚀 Kebrchacha Bingo Backend API

Backend API server for the Kebrchacha Bingo real-time multiplayer game.

## 🔧 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MySQL** - Database (Aiven)
- **Cloudinary** - Image storage
- **Telegram Bot API** - Authentication

## 📁 Project Structure

```
server/
├── config/          # Database and service configurations
├── database/        # Database schema and migrations
├── middleware/      # Authentication and validation
├── routes/          # API endpoints
│   ├── auth.js      # User authentication
│   ├── wallet.js    # Wallet operations
│   ├── game.js      # Game management
│   ├── admin.js     # Admin operations
│   └── card-selection.js
├── socket/          # Socket.io handlers
├── utils/           # Helper functions
├── index.js         # Main server file
└── package.json     # Dependencies
```

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - Telegram user login
- `GET /api/auth/me` - Get current user

### Wallet
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/deposit` - Submit deposit request
- `POST /api/wallet/transfer-to-play` - Transfer to play wallet

### Game
- `GET /api/game/available` - Get available games
- `POST /api/game/join/:id` - Join a game
- `GET /api/game/:id/status` - Get game status
- `GET /api/game/:id/ticket` - Get user's ticket
- `POST /api/game/:id/update-marks` - Update marked cells

### Admin
- `GET /api/admin/transactions/pending` - Get pending transactions
- `POST /api/admin/transactions/:id/approve` - Approve transaction
- `POST /api/admin/transactions/:id/reject` - Reject transaction
- `POST /api/admin/game/create` - Create new game
- `GET /api/admin/stats` - Get platform statistics

## 🔌 WebSocket Events

### Client → Server
- `join_game` - Join a game room
- `join_card_lobby` - Join card selection lobby
- `card_selected` - Select a bingo card
- `claim_bingo` - Claim BINGO win

### Server → Client
- `game_state` - Current game state
- `ball_drawn` - New number called
- `game_countdown` - Game timer updates
- `game_won` - Game finished with winners
- `card_status_update` - Card selection updates

## 🔐 Environment Variables

Create a `.env` file with:

```env
# Database
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_TELEGRAM_ID=your-admin-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=3001
NODE_ENV=production
```

## 🏥 Health Check

- `GET /health` - Server health status
- `GET /api` - API information

## 🚀 Deployment (Render)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node Version:** 18.x

## 📊 Features

- ✅ Real-time multiplayer game engine
- ✅ Telegram WebApp authentication
- ✅ Dual wallet system
- ✅ Transaction management
- ✅ Admin panel operations
- ✅ Image upload handling
- ✅ Game state management
- ✅ Socket.io real-time communication

## 🔧 Development

### Adding New Routes
1. Create route file in `routes/`
2. Add middleware in `middleware/`
3. Register in `index.js`

### Database Changes
1. Update schema in `database/schema.sql`
2. Create migration script
3. Update models/queries

### Socket Events
1. Add handlers in `socket/gameSocket.js`
2. Update client-side listeners
3. Test real-time functionality

---

**Backend-only deployment optimized for API and WebSocket services.**