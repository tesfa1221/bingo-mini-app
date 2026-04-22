const db = require('../config/database');
const { validateBingo } = require('../utils/bingoGenerator');

let activeGames = new Map();

function initializeGameSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
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
    
    socket.on('claim_bingo', async ({ gameId, userId }) => {
      try {
        const connection = await db.getConnection();
        
        try {
          await connection.beginTransaction();
          
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
          const markedCells = ticket.marked_cells;
          
          const isValid = validateBingo(gridData, markedCells, calledNumbers);
          
          if (!isValid) {
            socket.emit('bingo_error', { message: 'Invalid BINGO claim' });
            await connection.rollback();
            return;
          }
          
          await connection.query(
            'UPDATE games SET status = "finished", winner_id = ?, finished_at = NOW() WHERE id = ?',
            [userId, gameId]
          );
          
          await connection.query(
            'UPDATE tickets SET is_winner = TRUE WHERE id = ?',
            [ticket.id]
          );
          
          await connection.query(
            'UPDATE users SET main_wallet_balance = main_wallet_balance + ? WHERE id = ?',
            [game.prize_pool, userId]
          );
          
          await connection.commit();
          
          if (activeGames.has(gameId)) {
            clearInterval(activeGames.get(gameId));
            activeGames.delete(gameId);
          }
          
          const [winner] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
          
          io.to(`game_${gameId}`).emit('game_won', {
            winnerId: userId,
            winnerName: winner[0]?.username || 'Anonymous',
            prizeAmount: game.prize_pool
          });
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

async function startGame(io, gameId) {
  try {
    await db.query(
      'UPDATE games SET status = "active", started_at = NOW() WHERE id = ?',
      [gameId]
    );
    
    const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const calledNumbers = [];
    
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
  } catch (error) {
    console.error('Start game error:', error);
  }
}

module.exports = { initializeGameSocket, startGame };
