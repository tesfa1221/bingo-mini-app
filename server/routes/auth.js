const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

router.post('/login', checkAuth, async (req, res) => {
  try {
    const { id, username } = req.telegramUser;
    
    const [existing] = await db.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [id]
    );
    
    if (existing.length > 0) {
      return res.json({ user: existing[0] });
    }
    
    const [result] = await db.query(
      'INSERT INTO users (telegram_id, username) VALUES (?, ?)',
      [id, username || 'Anonymous']
    );
    
    const [newUser] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.json({ user: newUser[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', checkAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [req.telegramUser.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
