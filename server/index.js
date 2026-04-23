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
const { initializeGameSocket } = require('./socket/gameSocket');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS for frontend domains
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://yourdomain.com',
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
    'https://yourdomain.com',
    '*'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api', cardSelectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminGameRoutes);

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
      admin: '/api/admin'
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
      '/api/admin'
    ]
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Kebrchacha Bingo Backend API running on port ${PORT}`);
  console.log(`📡 Socket.io enabled for real-time communication`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API info: http://localhost:${PORT}/api`);
});

module.exports = { io };
