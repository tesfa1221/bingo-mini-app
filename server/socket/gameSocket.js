const db = require('../config/database');
const { validateBingo } = require('../utils/bingoGenerator');

function initializeGameSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // User connection
    socket.on('user_connected', async ({ userId, telegramId }) => {
      try {
        console.log(`👤 User connected: ${telegramId} (${userId})`);
        socket.userId = userId;
        socket.telegramId = telegramId;
        
        // Send current active games
        const [games] = await db.query(`
          SELECT g.*, COUNT(t.id) as player_count, SUM(t.entry_fee) as prize_pool
          FROM games g
          LEFT JOIN tickets t ON g.id = t.game_id
          WHERE g.status IN ('waiting', 'starting', 'playing')
          GROUP BY g.id
          ORDER BY g.created_at DESC
        `);
        
        socket.emit('active_games', { games });
      } catch (error) {
        console.error('User connection error:', error);
      }
    });
    
    // Join game room
    socket.on('join_game', async ({ gameId, userId }) => {
      try {
        // Simple fallback - just join room and send game state
        socket.join(`game_${gameId}`);
        
        // Get current game state
        const [games] = await db.query('SELECT * FROM games WHERE id = ?', [gameId]);
        if (games.length > 0) {
          const game = games[0];
          socket.emit('game_state', {
            gameId,
            status: game.status,
            calledNumbers: JSON.parse(game.called_numbers || '[]')
          });
        }
      } catch (error) {
        console.error('Join game error:', error);
      }
    });
    
    // Leave game room
    socket.on('leave_game', ({ gameId, userId }) => {
      socket.leave(`game_${gameId}`);
    });
    
    // Claim bingo
    socket.on('claim_bingo', async ({ gameId, userId, cards }) => {
      try {
        // Simple bingo handling
        await handleBingoClaimFallback(socket, gameId, userId, cards, io);
      } catch (error) {
        console.error('Claim bingo error:', error);
        socket.emit('bingo_error', { message: 'Failed to process BINGO claim' });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

// Fallback bingo claim handler
async function handleBingoClaimFallback(socket, gameId, userId, cards, io) {
  try {
    // Update ticket status
    await db.query(`
      UPDATE tickets t
      JOIN users u ON t.user_id = u.id
      SET t.status = 'bingo'
      WHERE t.game_id = ? AND u.telegram_id = ?
    `, [gameId, userId]);
    
    // Get player name
    const [users] = await db.query('SELECT username, full_name FROM users WHERE telegram_id = ?', [userId]);
    const playerName = users[0]?.username || users[0]?.full_name || 'Player';
    
    // Emit bingo claimed
    io.to(`game_${gameId}`).emit('bingo_claimed', {
      gameId,
      userId,
      playerName
    });
    
    console.log(`🏆 BINGO claimed by ${playerName} in game ${gameId}`);
  } catch (error) {
    console.error('Fallback bingo claim error:', error);
    throw error;
  }
}

async function startRegistrationTimer(io, gameId) {
  try {
    const [game] = await db.query('SELECT registration_timer FROM games WHERE id = ?', [gameId]);
    
    if (game.length === 0) return;
    
    let timeLeft = game[0].registration_timer || 60;
    
    const timerInterval = setInterval(async () => {
      timeLeft--;
      
      io.to(`card_lobby_${gameId}`).emit('registration_timer', { timeLeft });
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        
        // Start the game
        io.to(`card_lobby_${gameId}`).emit('game_starting');
        await startGame(io, gameId);
      }
    }, 1000);
  } catch (error) {
    console.error('Registration timer error:', error);
  }
}

async function startGame(io, gameId) {
  try {
    await db.query(
      'UPDATE games SET status = "playing", started_at = NOW() WHERE id = ?',
      [gameId]
    );
    
    console.log(`🚀 Game ${gameId} started via socket fallback`);
    
    io.to(`game_${gameId}`).emit('game_started', { gameId });
  } catch (error) {
    console.error('Start game error:', error);
  }
}

module.exports = { initializeGameSocket, startGame };
