const db = require('../config/database');
const { validateBingo } = require('../utils/bingoGenerator');

let activeGames = new Map();
let cardLobbies = new Map();

function initializeGameSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Card Selection Lobby
    socket.on('join_card_lobby', async ({ gameId, userId }) => {
      try {
        socket.join(`card_lobby_${gameId}`);
        
        // Send current card status
        const [cards] = await db.query(
          'SELECT card_id, status, user_id FROM card_selections WHERE game_id = ?',
          [gameId]
        );
        
        socket.emit('card_status_update', { cards });
        
        // Start registration timer if not started
        if (!cardLobbies.has(gameId)) {
          startRegistrationTimer(io, gameId);
        }
      } catch (error) {
        console.error('Join card lobby error:', error);
      }
    });
    
    socket.on('card_selected', async ({ gameId, cardId, userId }) => {
      try {
        // Broadcast card status update to all in lobby
        const [cards] = await db.query(
          'SELECT card_id, status, user_id FROM card_selections WHERE game_id = ?',
          [gameId]
        );
        
        io.to(`card_lobby_${gameId}`).emit('card_status_update', { cards });
      } catch (error) {
        console.error('Card selected broadcast error:', error);
      }
    });
    
    // Game Room
    socket.on('join_game', async ({ gameId, userId }) => {
      try {
        socket.join(`game_${gameId}`);
        
        const [game] = await db.query('SELECT * FROM games WHERE id = ?', [gameId]);
        
        if (game.length > 0) {
          socket.emit('game_state', {
            game: game[0],
            calledNumbers: JSON.parse(game[0].called_numbers || '[]')
          });
        }
      } catch (error) {
        console.error('Join game error:', error);
      }
    });
    
    socket.on('claim_bingo', async ({ gameId, userId, markedCells }) => {
      try {
        const connection = await db.getConnection();
        
        try {
          await connection.beginTransaction();
          
          // Check if user is banned
          const [users] = await connection.query(
            'SELECT * FROM users WHERE id = ? FOR UPDATE',
            [userId]
          );
          
          if (users.length === 0) {
            socket.emit('bingo_error', { message: 'User not found' });
            await connection.rollback();
            return;
          }
          
          const user = users[0];
          
          if (user.is_banned_until && new Date(user.is_banned_until) > new Date()) {
            const banMinutes = Math.ceil((new Date(user.is_banned_until) - new Date()) / 60000);
            socket.emit('bingo_error', { 
              message: `You are banned for ${banMinutes} more minutes due to false BINGO` 
            });
            await connection.rollback();
            return;
          }
          
          const [games] = await connection.query(
            'SELECT * FROM games WHERE id = ? AND status = "active" FOR UPDATE',
            [gameId]
          );
          
          if (games.length === 0) {
            socket.emit('bingo_error', { message: 'Game not active' });
            await connection.rollback();
            return;
          }
          
          const game = games[0];
          const calledNumbers = JSON.parse(game.called_numbers || '[]');
          
          // Check minimum balls requirement
          if (calledNumbers.length < (game.min_balls_for_bingo || 5)) {
            socket.emit('bingo_error', { message: 'Not enough balls drawn yet' });
            await connection.rollback();
            return;
          }
          
          const [tickets] = await connection.query(
            'SELECT * FROM tickets WHERE game_id = ? AND user_id = ?',
            [gameId, userId]
          );
          
          if (tickets.length === 0) {
            socket.emit('bingo_error', { message: 'Ticket not found' });
            await connection.rollback();
            return;
          }
          
          const ticket = tickets[0];
          const gridData = JSON.parse(ticket.grid_data);
          
          // Validate BINGO with marked cells
          const validation = validateBingo(gridData, JSON.stringify(markedCells), calledNumbers);
          
          if (!validation.valid) {
            // FALSE BINGO - Apply penalty
            console.log(`❌ False BINGO by user ${userId} in game ${gameId}`);
            
            // Ban user for 30 minutes
            const banUntil = new Date(Date.now() + 30 * 60 * 1000);
            await connection.query(
              'UPDATE users SET is_banned_until = ? WHERE id = ?',
              [banUntil, userId]
            );
            
            // Increment false bingo count
            await connection.query(
              'UPDATE tickets SET false_bingo_count = false_bingo_count + 1 WHERE id = ?',
              [ticket.id]
            );
            
            // Remove user from game (don't refund)
            await connection.query(
              'DELETE FROM tickets WHERE id = ?',
              [ticket.id]
            );
            
            await connection.commit();
            
            // Send penalty notification
            socket.emit('false_bingo_penalty', {
              message: 'Invalid BINGO pattern detected',
              banUntil: banUntil.toISOString()
            });
            
            // Trigger warning vibration
            if (socket.handshake.headers['x-telegram-webapp']) {
              socket.emit('trigger_vibration', { type: 'error' });
            }
            
            return;
          }
          
          // VALID BINGO - Check for multiple winners on same ball
          const currentBallCount = calledNumbers.length;
          
          // Mark this ticket as winner
          await connection.query(
            'UPDATE tickets SET is_winner = TRUE WHERE id = ?',
            [ticket.id]
          );
          
          // Check if there are other winners (claimed on same ball count)
          const [allWinners] = await connection.query(
            `SELECT t.*, u.username 
             FROM tickets t 
             JOIN users u ON t.user_id = u.id 
             WHERE t.game_id = ? AND t.is_winner = TRUE`,
            [gameId]
          );
          
          const prizePool = parseFloat(game.prize_pool);
          const winnerCount = allWinners.length;
          const prizePerWinner = prizePool / winnerCount;
          
          // Distribute prizes
          for (const winner of allWinners) {
            await connection.query(
              'UPDATE users SET main_wallet_balance = main_wallet_balance + ? WHERE id = ?',
              [prizePerWinner, winner.user_id]
            );
          }
          
          // Mark game as finished
          await connection.query(
            'UPDATE games SET status = "finished", winner_id = ?, finished_at = NOW() WHERE id = ?',
            [userId, gameId]
          );
          
          await connection.commit();
          
          // Stop ball drawing
          if (activeGames.has(gameId)) {
            clearInterval(activeGames.get(gameId));
            activeGames.delete(gameId);
          }
          
          // Notify all players
          if (winnerCount === 1) {
            io.to(`game_${gameId}`).emit('game_won', {
              winnerId: userId,
              winnerName: allWinners[0].username,
              prizeAmount: prizePool,
              pattern: validation.pattern
            });
          } else {
            io.to(`game_${gameId}`).emit('game_won', {
              winners: allWinners.map(w => ({ id: w.user_id, name: w.username })),
              prizePerWinner: prizePerWinner.toFixed(2),
              totalPrize: prizePool,
              pattern: validation.pattern
            });
          }
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
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
        cardLobbies.delete(gameId);
        
        // Start the game
        io.to(`card_lobby_${gameId}`).emit('game_starting');
        await startGame(io, gameId);
      }
    }, 1000);
    
    cardLobbies.set(gameId, timerInterval);
  } catch (error) {
    console.error('Registration timer error:', error);
  }
}

async function startGame(io, gameId) {
  try {
    await db.query(
      'UPDATE games SET status = "active", started_at = NOW() WHERE id = ?',
      [gameId]
    );
    
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const calledNumbers = [];
    
    // Initial countdown before first ball
    let countdown = 10;
    const countdownInterval = setInterval(() => {
      io.to(`game_${gameId}`).emit('game_countdown', { timeLeft: countdown });
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    // Wait for countdown
    setTimeout(() => {
      const interval = setInterval(async () => {
        try {
          if (availableNumbers.length === 0) {
            clearInterval(interval);
            activeGames.delete(gameId);
            return;
          }
          
          const [game] = await db.query('SELECT status FROM games WHERE id = ?', [gameId]);
          
          if (game.length === 0 || game[0].status === 'finished') {
            clearInterval(interval);
            activeGames.delete(gameId);
            return;
          }
          
          const randomIndex = Math.floor(Math.random() * availableNumbers.length);
          const drawnNumber = availableNumbers.splice(randomIndex, 1)[0];
          calledNumbers.push(drawnNumber);
          
          await db.query(
            'UPDATE games SET called_numbers = ? WHERE id = ?',
            [JSON.stringify(calledNumbers), gameId]
          );
          
          io.to(`game_${gameId}`).emit('ball_drawn', {
            number: drawnNumber,
            totalCalled: calledNumbers.length
          });
        } catch (error) {
          console.error('Draw ball error:', error);
        }
      }, 7000);
      
      activeGames.set(gameId, interval);
    }, 10000);
  } catch (error) {
    console.error('Start game error:', error);
  }
}

module.exports = { initializeGameSocket, startGame };
