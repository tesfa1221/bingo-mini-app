const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

// Get card status for a game
router.get('/game/:gameId/cards', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const [cards] = await db.query(
      'SELECT card_id, status, user_id FROM card_selections WHERE game_id = ? ORDER BY card_id',
      [gameId]
    );
    
    res.json({ cards });
  } catch (error) {
    console.error('Get card status error:', error);
    res.status(500).json({ error: 'Failed to get card status' });
  }
});

// Get card preview
router.get('/game/card/:cardId/preview', checkAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const [cards] = await db.query(
      'SELECT grid_data FROM bingo_cards WHERE card_id = ?',
      [cardId]
    );
    
    if (cards.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json({ card: JSON.parse(cards[0].grid_data) });
  } catch (error) {
    console.error('Get card preview error:', error);
    res.status(500).json({ error: 'Failed to get card preview' });
  }
});

// Select and confirm a card
router.post('/game/:gameId/select-card', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { cardId } = req.body;
    const telegramId = req.telegramUser.id;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get user
      const [users] = await connection.query(
        'SELECT * FROM users WHERE telegram_id = ? FOR UPDATE',
        [telegramId]
      );
      
      if (users.length === 0) {
        throw new Error('User not found');
      }
      
      const user = users[0];
      
      // Check if user is banned
      if (user.is_banned_until && new Date(user.is_banned_until) > new Date()) {
        const banMinutes = Math.ceil((new Date(user.is_banned_until) - new Date()) / 60000);
        throw new Error(`You are banned for ${banMinutes} more minutes`);
      }
      
      // Check if card is available
      const [existingSelection] = await connection.query(
        'SELECT * FROM card_selections WHERE game_id = ? AND card_id = ? FOR UPDATE',
        [gameId, cardId]
      );
      
      if (existingSelection.length > 0 && existingSelection[0].status !== 'available') {
        throw new Error('Card already taken');
      }
      
      // Check if user already has a card in this game
      const [userCard] = await connection.query(
        'SELECT * FROM card_selections WHERE game_id = ? AND user_id = ?',
        [gameId, user.id]
      );
      
      if (userCard.length > 0) {
        // Update existing selection
        await connection.query(
          'UPDATE card_selections SET card_id = ?, status = "confirmed", confirmed_at = NOW() WHERE game_id = ? AND user_id = ?',
          [cardId, gameId, user.id]
        );
      } else {
        // Create new selection
        await connection.query(
          'INSERT INTO card_selections (game_id, card_id, user_id, status, selected_at, confirmed_at) VALUES (?, ?, ?, "confirmed", NOW(), NOW())',
          [gameId, cardId, user.id]
        );
      }
      
      // Get the card data
      const [cardData] = await connection.query(
        'SELECT grid_data FROM bingo_cards WHERE card_id = ?',
        [cardId]
      );
      
      if (cardData.length === 0) {
        throw new Error('Card data not found');
      }
      
      // Check if user already has a ticket
      const [existingTicket] = await connection.query(
        'SELECT id FROM tickets WHERE game_id = ? AND user_id = ?',
        [gameId, user.id]
      );
      
      if (existingTicket.length > 0) {
        // Update existing ticket
        await connection.query(
          'UPDATE tickets SET card_id = ?, grid_data = ? WHERE game_id = ? AND user_id = ?',
          [cardId, cardData[0].grid_data, gameId, user.id]
        );
      } else {
        // Create new ticket
        await connection.query(
          'INSERT INTO tickets (game_id, user_id, card_id, grid_data, marked_cells) VALUES (?, ?, ?, ?, ?)',
          [gameId, user.id, cardId, cardData[0].grid_data, JSON.stringify([])]
        );
      }
      
      await connection.commit();
      
      res.json({ 
        message: 'Card selected successfully',
        cardId 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Select card error:', error);
    res.status(500).json({ error: error.message || 'Failed to select card' });
  }
});

// Update marked cells
router.post('/game/:gameId/update-marks', checkAuth, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { markedCells } = req.body;
    const telegramId = req.telegramUser.id;
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.query(
      'UPDATE tickets SET marked_cells = ? WHERE game_id = ? AND user_id = ?',
      [JSON.stringify(markedCells), gameId, users[0].id]
    );
    
    res.json({ message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Update marks error:', error);
    res.status(500).json({ error: 'Failed to update marks' });
  }
});

module.exports = router;
