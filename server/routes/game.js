const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');
const { generateBingoCard } = require('../utils/bingoGenerator');

router.get('/available', checkAuth, async (req, res) => {
  try {
    const [games] = await db.query(
      `SELECT g.*, 
        (SELECT COUNT(*) FROM tickets WHERE game_id = g.id) as current_players
       FROM games g 
       WHERE g.status = 'waiting' 
       ORDER BY g.created_at DESC`
    );
    
    res.json({ games });
  } catch (error) {
    console.error('Get available games error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

router.post('/create', checkAuth, async (req, res) => {
  try {
    const { betAmount, maxPlayers } = req.body;
    
    if (!betAmount || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    
    const [result] = await db.query(
      'INSERT INTO games (bet_amount, max_players, called_numbers) VALUES (?, ?, ?)',
      [betAmount, maxPlayers || 10, JSON.stringify([])]
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

router.post('/join/:gameId', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const telegramId = req.telegramUser.id;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [users] = await connection.query(
        'SELECT * FROM users WHERE telegram_id = ? FOR UPDATE',
        [telegramId]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      const [games] = await connection.query(
        'SELECT * FROM games WHERE id = ? AND status = ? FOR UPDATE',
        [gameId, 'waiting']
      );
      
      if (games.length === 0) {
        throw new Error('Game not available');
      }
      
      const game = games[0];
      
      const [existingTicket] = await connection.query(
        'SELECT id FROM tickets WHERE game_id = ? AND user_id = ?',
        [gameId, user.id]
      );
      
      if (existingTicket.length > 0) {
        throw new Error('Already joined this game');
      }
      
      if (user.play_wallet_balance < game.bet_amount) {
        throw new Error('Insufficient play wallet balance');
      }
      
      const [ticketCount] = await connection.query(
        'SELECT COUNT(*) as count FROM tickets WHERE game_id = ?',
        [gameId]
      );
      
      if (ticketCount[0].count >= game.max_players) {
        throw new Error('Game is full');
      }
      
      await connection.query(
        'UPDATE users SET play_wallet_balance = play_wallet_balance - ? WHERE id = ?',
        [game.bet_amount, user.id]
      );
      
      // Calculate house commission
      const houseCommission = game.house_commission || 10;
      const commissionAmount = (game.bet_amount * houseCommission) / 100;
      const prizeContribution = game.bet_amount - commissionAmount;
      
      await connection.query(
        'UPDATE games SET prize_pool = prize_pool + ?, house_earnings = house_earnings + ? WHERE id = ?',
        [prizeContribution, commissionAmount, gameId]
      );
      
      const bingoCard = generateBingoCard();
      
      await connection.query(
        'INSERT INTO tickets (game_id, user_id, grid_data, marked_cells) VALUES (?, ?, ?, ?)',
        [gameId, user.id, JSON.stringify(bingoCard), JSON.stringify([])]
      );
      
      await connection.commit();
      
      res.json({ 
        message: 'Joined game successfully',
        ticket: bingoCard
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: error.message || 'Failed to join game' });
  }
});

router.get('/:gameId', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const [games] = await db.query('SELECT * FROM games WHERE id = ?', [gameId]);
    
    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ game: games[0] });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to get game' });
  }
});

router.get('/:gameId/ticket', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const telegramId = req.telegramUser.id;
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [tickets] = await db.query(
      'SELECT * FROM tickets WHERE game_id = ? AND user_id = ?',
      [gameId, users[0].id]
    );
    
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket: tickets[0] });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// Check if user is playing or spectating
router.get('/:gameId/status', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const telegramId = req.telegramUser.id;
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [tickets] = await db.query(
      'SELECT * FROM tickets WHERE game_id = ? AND user_id = ?',
      [gameId, users[0].id]
    );
    
    res.json({ 
      isPlaying: tickets.length > 0,
      isSpectator: tickets.length === 0,
      ticket: tickets.length > 0 ? tickets[0] : null
    });
  } catch (error) {
    console.error('Get game status error:', error);
    res.status(500).json({ error: 'Failed to get game status' });
  }
});

module.exports = router;
