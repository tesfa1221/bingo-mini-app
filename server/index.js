const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const gameRoutes = require('./routes/game');
const cardSelectionRoutes = require('./routes/card-selection');
const adminRoutes = require('./routes/admin');
const adminGameRoutes = require('./routes/admin-game');
const telegramRoutes = require('./routes/telegram');
const { initializeGameSocket } = require('./socket/gameSocket');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS for frontend domains
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://negattech.com',
      'https://web.telegram.org',
      'https://telegram.org',
      'https://t.me',
      '*'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// CORS configuration for API endpoints
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://negattech.com',
    'https://web.telegram.org',
    'https://telegram.org',
    'https://t.me',
    '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-telegram-init-data');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api', cardSelectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminGameRoutes);
app.use('/api/telegram', telegramRoutes);

// Initialize Socket.io for real-time game communication
initializeGameSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Kebrchacha Bingo Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Kebrchacha Bingo API',
    version: '1.0.0',
    description: 'Backend API for Kebrchacha Bingo game',
    endpoints: {
      auth: '/api/auth',
      wallet: '/api/wallet', 
      game: '/api/game',
      admin: '/api/admin',
      telegram: '/api/telegram'
    },
    websocket: 'Socket.io enabled for real-time communication',
    status: 'Backend-only deployment'
  });
});

// 404 handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This is a backend API server. Frontend is served separately.',
    availableEndpoints: [
      '/api',
      '/health',
      '/api/auth',
      '/api/wallet',
      '/api/game', 
      '/api/admin',
      '/api/telegram'
    ]
  });
});

const PORT = process.env.PORT || 3001;

// Run DB migrations then start server
async function runMigrations() {
  const cols = [
    { table: 'users',        column: 'full_name',           def: "VARCHAR(255)" },
    { table: 'users',        column: 'phone_number',        def: "VARCHAR(50)" },
    { table: 'users',        column: 'language_code',       def: "VARCHAR(10) DEFAULT 'en'" },
    { table: 'users',        column: 'is_registered',       def: "BOOLEAN DEFAULT FALSE" },
    { table: 'users',        column: 'is_banned_until',     def: "TIMESTAMP NULL" },
    { table: 'users',        column: 'last_seen',           def: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP" },
    { table: 'games',        column: 'house_earnings',      def: "DECIMAL(10,2) DEFAULT 0.00" },
    { table: 'games',        column: 'house_commission',    def: "INT DEFAULT 10" },
    { table: 'games',        column: 'min_balls_for_bingo', def: "INT DEFAULT 5" },
    { table: 'games',        column: 'registration_timer',  def: "INT DEFAULT 60" },
    { table: 'tickets',      column: 'false_bingo_count',   def: "INT DEFAULT 0" },
    { table: 'transactions', column: 'payment_method',      def: "VARCHAR(100)" },
  ];
  for (const m of cols) {
    try {
      const [rows] = await db.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?`,
        [m.table, m.column]
      );
      if (rows.length === 0) {
        await db.query(`ALTER TABLE ${m.table} ADD COLUMN ${m.column} ${m.def}`);
        console.log(`✅ Migration: added ${m.table}.${m.column}`);
      }
    } catch (e) {
      console.log(`⚠️  Migration skip ${m.table}.${m.column}: ${e.message}`);
    }
  }
}

server.listen(PORT, async () => {
  console.log(`🚀 Kebrchacha Bingo Backend API running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  try {
    await runMigrations();
    console.log('✅ DB migrations complete');
  } catch (e) {
    console.error('⚠️  Migration error:', e.message);
  }
});

module.exports = { io };
