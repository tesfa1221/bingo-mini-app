const db = require('./config/database');

class SimpleGameEngine {
  constructor(io) {
    this.io = io;
    this.startEngine();
  }

  startEngine() {
    console.log('🎮 Simple Game Engine started');
    
    // Create auto games every 3 minutes if no active games
    setInterval(() => {
      this.createAutoGames();
    }, 180000);
    
    // Initial auto game creation
    setTimeout(() => {
      this.createAutoGames();
    }, 15000);
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
        VALUES (?, 10, 'waiting', NULL, DATE_ADD(NOW(), INTERVAL 180 SECOND))
      `, [entryFee]);

      const gameId = result.insertId;
      
      console.log(`🎮 Auto game created: ID ${gameId}, Entry: ${entryFee} ETB`);
    } catch (error) {
      console.error('Error creating auto game:', error);
    }
  }
}

module.exports = SimpleGameEngine;