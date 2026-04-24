const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

// Login / Register - called when mini app opens
router.post('/login', checkAuth, async (req, res) => {
  try {
    const { id, username, first_name, last_name, language_code, photo_url } = req.telegramUser;

    const fullName = [first_name, last_name].filter(Boolean).join(' ') || username || 'Player';
    const displayName = username || fullName;

    // Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [id]
    );

    if (existing.length > 0) {
      // Update user info in case it changed
      await db.query(
        `UPDATE users SET 
          username = ?,
          full_name = ?,
          language_code = ?,
          last_seen = NOW()
         WHERE telegram_id = ?`,
        [displayName, fullName, language_code || 'en', id]
      );

      const [updated] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [id]);
      return res.json({ user: updated[0], isNew: false });
    }

    // New user - register them
    const [result] = await db.query(
      `INSERT INTO users 
        (telegram_id, username, full_name, language_code, main_wallet_balance, play_wallet_balance) 
       VALUES (?, ?, ?, ?, 0, 0)`,
      [id, displayName, fullName, language_code || 'en']
    );

    const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);

    res.json({ user: newUser[0], isNew: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', checkAuth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [req.telegramUser.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found. Please restart the bot.' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
