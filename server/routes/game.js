const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

// Get active games
router.get('/active', async (req, res) => {
  try {
    const [games] = await db.query(`
      SELECT g.*, COUNT(t.id) as player_count, SUM(t.entry_fee) as prize_pool
      FROM games g
      LEFT JOIN tickets t ON g.id = t.game_id
      WHERE g.status IN ('waiting', 'starting', 'playing')
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
    
    res.json({ games });
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({ error: 'Failed to get active games' });
  }
});

// Create new game
router.post('/create', checkAuth, async (req, res) => {
  try {
    const { entryFee } = req.body;
    const userId = req.telegramUser.id;
    
    if (!entryFee || entryFee <= 0) {
      return res.status(400).json({ error: 'Invalid entry fee' });
    }
    
    // Check user balance
    const [users] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    if (user.play_wallet_balance < entryFee) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create game
      const [gameResult] = await connection.query(`
        INSERT INTO games (entry_fee, max_players, status, created_by, start_time)
        VALUES (?, 10, 'waiting', ?, DATE_ADD(NOW(), INTERVAL 60 SECOND))
      `, [entryFee, user.id]);
      
      const gameId = gameResult.insertId;
      
      // Deduct entry fee
      await connection.query(
        'UPDATE users SET play_wallet_balance = play_wallet_balance - ? WHERE id = ?',
        [entryFee, user.id]
      );
      
      // Create ticket for creator
      const cardNumbers = generateBingoCard();
      await connection.query(`
        INSERT INTO tickets (game_id, user_id, entry_fee, card_numbers, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [gameId, user.id, entryFee, JSON.stringify(cardNumbers)]);
      
      await connection.commit();
      
      // Get updated user
      const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
      
      res.json({
        game: { id: gameId, entry_fee: entryFee, status: 'waiting', player_count: 1 },
        cards: [{ numbers: cardNumbers, marked: [12] }], // Mark FREE space
        user: updatedUser[0]
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Join existing game
router.post('/join', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.body;
    const userId = req.telegramUser.id;
    
    // Get game details
    const [games] = await db.query('SELECT * FROM games WHERE id = ? AND status IN ("waiting", "starting")', [gameId]);
    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found or already started' });
    }
    
    const game = games[0];
    
    // Check if user already joined
    const [existingTickets] = await db.query(
      'SELECT * FROM tickets WHERE game_id = ? AND user_id = (SELECT id FROM users WHERE telegram_id = ?)',
      [gameId, userId]
    );
    
    if (existingTickets.length > 0) {
      return res.status(400).json({ error: 'Already joined this game' });
    }
    
    // Check user balance
    const [users] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    if (user.play_wallet_balance < game.entry_fee) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Deduct entry fee
      await connection.query(
        'UPDATE users SET play_wallet_balance = play_wallet_balance - ? WHERE id = ?',
        [game.entry_fee, user.id]
      );
      
      // Create ticket
      const cardNumbers = generateBingoCard();
      await connection.query(`
        INSERT INTO tickets (game_id, user_id, entry_fee, card_numbers, status)
        VALUES (?, ?, ?, ?, 'active')
      `, [gameId, user.id, game.entry_fee, JSON.stringify(cardNumbers)]);
      
      await connection.commit();
      
      // Get updated user
      const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
      
      res.json({
        game: { id: gameId, entry_fee: game.entry_fee, status: game.status },
        cards: [{ numbers: cardNumbers, marked: [12] }], // Mark FREE space
        user: updatedUser[0]
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// Get game details
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const [games] = await db.query(`
      SELECT g.*, COUNT(t.id) as player_count, SUM(t.entry_fee) as prize_pool
      FROM games g
      LEFT JOIN tickets t ON g.id = t.game_id
      WHERE g.id = ?
      GROUP BY g.id
    `, [gameId]);
    
    if (games.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Get players
    const [players] = await db.query(`
      SELECT u.username, u.full_name, t.status
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.game_id = ?
    `, [gameId]);
    
    const game = games[0];
    game.players = players.map(p => ({
      username: p.username || p.full_name || 'Player',
      status: p.status
    }));
    
    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to get game details' });
  }
});

// Get user's ticket for a game
router.get('/:gameId/ticket', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.telegramUser.id;
    
    const [tickets] = await db.query(`
      SELECT t.*, u.id as user_db_id
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.game_id = ? AND u.telegram_id = ?
    `, [gameId, userId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const ticket = tickets[0];
    const cardNumbers = JSON.parse(ticket.card_numbers || '[]');
    
    res.json({
      ticket: {
        id: ticket.id,
        numbers: cardNumbers,
        marked: [12], // FREE space always marked
        status: ticket.status
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// Claim bingo
router.post('/:gameId/bingo', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { cards } = req.body;
    const userId = req.telegramUser.id;
    
    // Verify user has ticket
    const [tickets] = await db.query(`
      SELECT t.*, u.id as user_db_id
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.game_id = ? AND u.telegram_id = ?
    `, [gameId, userId]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // TODO: Verify bingo is valid
    // For now, accept all bingo claims
    
    await db.query(
      'UPDATE tickets SET status = ? WHERE id = ?',
      ['bingo', tickets[0].id]
    );
    
    res.json({ message: 'Bingo claimed successfully' });
  } catch (error) {
    console.error('Claim bingo error:', error);
    res.status(500).json({ error: 'Failed to claim bingo' });
  }
});

// Generate bingo card numbers
function generateBingoCard() {
  const card = [];
  
  // B column (1-15)
  const bNumbers = generateUniqueNumbers(1, 15, 5);
  // I column (16-30)
  const iNumbers = generateUniqueNumbers(16, 30, 5);
  // N column (31-45) with FREE space
  const nNumbers = generateUniqueNumbers(31, 45, 4);
  // G column (46-60)
  const gNumbers = generateUniqueNumbers(46, 60, 5);
  // O column (61-75)
  const oNumbers = generateUniqueNumbers(61, 75, 5);
  
  // Arrange in grid
  for (let row = 0; row < 5; row++) {
    card.push(bNumbers[row]);
    card.push(iNumbers[row]);
    if (row === 2) {
      card.push('FREE');
    } else {
      const nIndex = row > 2 ? row - 1 : row;
      card.push(nNumbers[nIndex]);
    }
    card.push(gNumbers[row]);
    card.push(oNumbers[row]);
  }
  
  return card;
}

function generateUniqueNumbers(min, max, count) {
  const numbers = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers;
}

module.exports = router;