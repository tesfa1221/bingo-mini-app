const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth, checkAdmin } = require('../middleware/auth');
const { startGame } = require('../socket/gameSocket');

// Create game with house commission
router.post('/game/create', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { betAmount, maxPlayers, houseCommission, registrationTimer } = req.body;
    
    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    
    if (houseCommission < 0 || houseCommission > 50) {
      return res.status(400).json({ error: 'House commission must be between 0-50%' });
    }
    
    const [result] = await db.query(
      `INSERT INTO games (
        bet_amount, 
        max_players, 
        house_commission,
        registration_timer,
        called_numbers
      ) VALUES (?, ?, ?, ?, ?)`,
      [betAmount, maxPlayers || 10, houseCommission || 10, registrationTimer || 60, JSON.stringify([])]
    );
    
    res.json({ 
      message: 'Game created successfully',
      gameId: result.insertId 
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Get all games
router.get('/games', checkAuth, checkAdmin, async (req, res) => {
  try {
    const [games] = await db.query(
      `SELECT g.*, 
        (SELECT COUNT(*) FROM tickets WHERE game_id = g.id) as current_players
       FROM games g 
       ORDER BY g.created_at DESC
       LIMIT 50`
    );
    
    res.json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// Get platform statistics
router.get('/stats', checkAuth, checkAdmin, async (req, res) => {
  try {
    // Total users
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Total games
    const [games] = await db.query('SELECT COUNT(*) as count FROM games');
    
    // Total revenue (all prize pools)
    const [revenue] = await db.query(
      'SELECT SUM(prize_pool) as total FROM games WHERE status = "finished"'
    );
    
    // House earnings
    const [earnings] = await db.query(
      'SELECT SUM(house_earnings) as total FROM games WHERE status = "finished"'
    );
    
    // Active games
    const [active] = await db.query(
      'SELECT COUNT(*) as count FROM games WHERE status IN ("waiting", "active")'
    );
    
    // Pending transactions
    const [pending] = await db.query(
      'SELECT COUNT(*) as count FROM transactions WHERE status = "pending"'
    );
    
    res.json({
      totalUsers: users[0].count,
      totalGames: games[0].count,
      totalRevenue: parseFloat(revenue[0].total || 0).toFixed(2),
      houseEarnings: parseFloat(earnings[0].total || 0).toFixed(2),
      activeGames: active[0].count,
      pendingTransactions: pending[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Start game manually
router.post('/game/:gameId/start', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { io } = require('../index');
    
    await startGame(io, gameId);
    
    res.json({ message: 'Game started successfully' });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// Cancel game and refund players
router.post('/game/:gameId/cancel', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get game details
      const [games] = await connection.query(
        'SELECT * FROM games WHERE id = ? AND status = "waiting" FOR UPDATE',
        [gameId]
      );
      
      if (games.length === 0) {
        throw new Error('Game not found or already started');
      }
      
      const game = games[0];
      
      // Get all tickets for this game
      const [tickets] = await connection.query(
        'SELECT * FROM tickets WHERE game_id = ?',
        [gameId]
      );
      
      // Refund all players
      for (const ticket of tickets) {
        await connection.query(
          'UPDATE users SET play_wallet_balance = play_wallet_balance + ? WHERE id = ?',
          [game.bet_amount, ticket.user_id]
        );
      }
      
      // Delete tickets
      await connection.query('DELETE FROM tickets WHERE game_id = ?', [gameId]);
      
      // Mark game as cancelled
      await connection.query(
        'UPDATE games SET status = "cancelled", finished_at = NOW() WHERE id = ?',
        [gameId]
      );
      
      await connection.commit();
      
      res.json({ 
        message: 'Game cancelled and players refunded',
        refundedPlayers: tickets.length
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Cancel game error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel game' });
  }
});

module.exports = router;
