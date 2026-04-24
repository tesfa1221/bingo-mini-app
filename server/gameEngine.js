const db = require('./config/database');

class GameEngine {
  constructor(io) {
    this.io = io;
    this.activeGames = new Map();
    this.gameTimers = new Map();
    
    // Start the game engine
    this.startEngine();
  }

  startEngine() {
    console.log('🎮 Game Engine started');
    
    // Check for games to start every 5 seconds
    setInterval(() => {
      this.checkGamesToStart();
    }, 5000);
    
    // Create auto games every 2 minutes if no active games
    setInterval(() => {
      this.createAutoGames();
    }, 120000);
    
    // Initial auto game creation
    setTimeout(() => {
      this.createAutoGames();
    }, 10000);
  }

  async checkGamesToStart() {
    try {
      // Get games that should start
      const [games] = await db.query(`
        SELECT g.*, COUNT(t.id) as player_count
        FROM games g
        LEFT JOIN tickets t ON g.id = t.game_id
        WHERE g.status = 'waiting' AND (
          g.start_time <= NOW() OR 
          COUNT(t.id) >= g.max_players
        )
        GROUP BY g.id
      `);

      for (const game of games) {
        if (game.player_count > 0) { // Start game even with 1 player
          await this.startGame(game.id);
        } else {
          // Cancel game if no players
          await this.cancelGame(game.id);
        }
      }
    } catch (error) {
      console.error('Error checking games to start:', error);
    }
  }

  async createAutoGames() {
    try {
      // Check if there are any active games
      const [activeGames] = await db.query(`
        SELECT COUNT(*) as count FROM games 
        WHERE status IN ('waiting', 'starting', 'playing')
      `);

      if (activeGames[0].count === 0) {
        // Create auto games with different entry fees
        const entryFees = [25, 50, 100];
        
        for (const entryFee of entryFees) {
          await this.createAutoGame(entryFee);
        }
        
        console.log('🤖 Auto games created');
      }
    } catch (error) {
      console.error('Error creating auto games:', error);
    }
  }

  async createAutoGame(entryFee) {
    try {
      const [result] = await db.query(`
        INSERT INTO games (entry_fee, max_players, status, created_by, start_time)
        VALUES (?, 10, 'waiting', NULL, DATE_ADD(NOW(), INTERVAL 120 SECOND))
      `, [entryFee]);

      const gameId = result.insertId;
      
      // Emit to all connected clients
      this.io.emit('new_game_created', {
        id: gameId,
        entry_fee: entryFee,
        status: 'waiting',
        player_count: 0,
        prize_pool: 0
      });
      
      console.log(`🎮 Auto game created: ID ${gameId}, Entry: ${entryFee} ETB`);
    } catch (error) {
      console.error('Error creating auto game:', error);
    }
  }

  async startGame(gameId) {
    try {
      console.log(`🚀 Starting game ${gameId}`);
      
      // Update game status
      await db.query('UPDATE games SET status = ?, started_at = NOW() WHERE id = ?', ['playing', gameId]);
      
      // Get game details
      const [games] = await db.query('SELECT * FROM games WHERE id = ?', [gameId]);
      const game = games[0];
      
      // Initialize game state
      const gameState = {
        id: gameId,
        status: 'playing',
        calledNumbers: [],
        currentBall: null,
        ballCount: 0,
        maxBalls: 75
      };
      
      this.activeGames.set(gameId, gameState);
      
      // Emit game started
      this.io.to(`game_${gameId}`).emit('game_started', {
        gameId,
        status: 'playing'
      });
      
      // Start calling numbers
      this.startNumberCalling(gameId);
      
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  startNumberCalling(gameId) {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) return;

    // Generate all possible numbers
    const allNumbers = [];
    
    // B (1-15)
    for (let i = 1; i <= 15; i++) allNumbers.push(`B-${i}`);
    // I (16-30)
    for (let i = 16; i <= 30; i++) allNumbers.push(`I-${i}`);
    // N (31-45)
    for (let i = 31; i <= 45; i++) allNumbers.push(`N-${i}`);
    // G (46-60)
    for (let i = 46; i <= 60; i++) allNumbers.push(`G-${i}`);
    // O (61-75)
    for (let i = 61; i <= 75; i++) allNumbers.push(`O-${i}`);
    
    // Shuffle numbers
    const shuffledNumbers = this.shuffleArray(allNumbers);
    
    let ballIndex = 0;
    
    const callNumber = () => {
      if (ballIndex >= shuffledNumbers.length || !this.activeGames.has(gameId)) {
        // Game ended or no more numbers
        this.endGame(gameId, 'no_winner');
        return;
      }
      
      const number = shuffledNumbers[ballIndex];
      ballIndex++;
      
      gameState.currentBall = number;
      gameState.calledNumbers.push(number);
      gameState.ballCount = ballIndex;
      
      console.log(`🎯 Game ${gameId}: Called ${number} (${ballIndex}/${shuffledNumbers.length})`);
      
      // Emit to all players and spectators
      this.io.to(`game_${gameId}`).emit('number_called', {
        gameId,
        number,
        ballCount: ballIndex,
        totalBalls: shuffledNumbers.length,
        calledNumbers: gameState.calledNumbers
      });
      
      // Update database
      db.query('UPDATE games SET called_numbers = ? WHERE id = ?', [
        JSON.stringify(gameState.calledNumbers),
        gameId
      ]).catch(console.error);
      
      // Schedule next number (7 seconds)
      const timer = setTimeout(callNumber, 7000);
      this.gameTimers.set(gameId, timer);
    };
    
    // Start calling numbers after 5 seconds
    setTimeout(callNumber, 5000);
  }

  async endGame(gameId, reason = 'completed') {
    try {
      console.log(`🏁 Ending game ${gameId}: ${reason}`);
      
      // Clear timer
      if (this.gameTimers.has(gameId)) {
        clearTimeout(this.gameTimers.get(gameId));
        this.gameTimers.delete(gameId);
      }
      
      // Remove from active games
      this.activeGames.delete(gameId);
      
      // Update game status
      await db.query('UPDATE games SET status = ?, ended_at = NOW() WHERE id = ?', ['finished', gameId]);
      
      // Get winners (players who claimed bingo)
      const [winners] = await db.query(`
        SELECT t.*, u.username, u.full_name, u.telegram_id
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.game_id = ? AND t.status = 'bingo'
      `, [gameId]);
      
      // Calculate prizes
      const [gameData] = await db.query(`
        SELECT g.*, SUM(t.entry_fee) as total_pool
        FROM games g
        LEFT JOIN tickets t ON g.id = t.game_id
        WHERE g.id = ?
        GROUP BY g.id
      `, [gameId]);
      
      const game = gameData[0];
      const totalPool = game.total_pool || 0;
      const houseCommission = 0.1; // 10%
      const prizePool = totalPool * (1 - houseCommission);
      
      if (winners.length > 0) {
        const prizePerWinner = prizePool / winners.length;
        
        // Distribute prizes
        for (const winner of winners) {
          await db.query(
            'UPDATE users SET main_wallet_balance = main_wallet_balance + ? WHERE id = ?',
            [prizePerWinner, winner.user_id]
          );
          
          console.log(`💰 Prize awarded: ${prizePerWinner} ETB to ${winner.username || winner.full_name}`);
        }
        
        // Emit game finished with winners
        this.io.to(`game_${gameId}`).emit('game_finished', {
          gameId,
          reason,
          winners: winners.map(w => ({
            userId: w.user_id,
            telegramId: w.telegram_id,
            name: w.username || w.full_name || 'Player',
            prize: prizePerWinner
          })),
          totalPrize: prizePool
        });
      } else {
        // No winners - refund players
        await db.query(`
          UPDATE users u
          JOIN tickets t ON u.id = t.user_id
          SET u.main_wallet_balance = u.main_wallet_balance + t.entry_fee
          WHERE t.game_id = ?
        `, [gameId]);
        
        this.io.to(`game_${gameId}`).emit('game_finished', {
          gameId,
          reason: 'no_winner',
          winners: [],
          message: 'No winners - entry fees refunded'
        });
      }
      
      // Create new auto game to replace this one
      setTimeout(() => {
        this.createAutoGame(game.entry_fee);
      }, 30000); // 30 seconds delay
      
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }

  async cancelGame(gameId) {
    try {
      console.log(`❌ Cancelling game ${gameId} - no players`);
      
      await db.query('UPDATE games SET status = ? WHERE id = ?', ['cancelled', gameId]);
      
      // Create replacement auto game
      const [games] = await db.query('SELECT entry_fee FROM games WHERE id = ?', [gameId]);
      if (games.length > 0) {
        setTimeout(() => {
          this.createAutoGame(games[0].entry_fee);
        }, 10000);
      }
    } catch (error) {
      console.error('Error cancelling game:', error);
    }
  }

  // Handle player joining game
  async handlePlayerJoin(gameId, userId, socket) {
    try {
      // Add player to game room
      socket.join(`game_${gameId}`);
      
      // Get current game state
      const gameState = this.activeGames.get(gameId);
      if (gameState) {
        // Send current game state to new player
        socket.emit('game_state', {
          gameId,
          status: gameState.status,
          calledNumbers: gameState.calledNumbers,
          currentBall: gameState.currentBall,
          ballCount: gameState.ballCount
        });
      }
      
      // Get and emit updated player list
      const [players] = await db.query(`
        SELECT u.username, u.full_name, t.status
        FROM tickets t
        JOIN users u ON t.user_id = u.id
        WHERE t.game_id = ?
      `, [gameId]);
      
      this.io.to(`game_${gameId}`).emit('player_joined', {
        gameId,
        players: players.map(p => ({
          username: p.username || p.full_name || 'Player',
          status: p.status
        }))
      });
      
    } catch (error) {
      console.error('Error handling player join:', error);
    }
  }

  // Handle player leaving game
  handlePlayerLeave(gameId, userId, socket) {
    socket.leave(`game_${gameId}`);
  }

  // Handle bingo claim
  async handleBingoClaim(gameId, userId, cards) {
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
      this.io.to(`game_${gameId}`).emit('bingo_claimed', {
        gameId,
        userId,
        playerName
      });
      
      // Check if we should end the game (for now, end on first bingo)
      setTimeout(() => {
        this.endGame(gameId, 'bingo_winner');
      }, 3000); // 3 second delay to show the bingo
      
    } catch (error) {
      console.error('Error handling bingo claim:', error);
    }
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = GameEngine;