const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');

// Check registration status
router.get('/status', checkAuth, async (req, res) => {
  try {
    const telegramId = req.telegramUser.id;
    
    const [users] = await db.query(
      'SELECT is_registered, phone_number, full_name FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    res.json({
      isRegistered: user.is_registered,
      hasPhoneNumber: !!user.phone_number,
      fullName: user.full_name
    });
  } catch (error) {
    console.error('Registration status error:', error);
    res.status(500).json({ error: 'Failed to check registration status' });
  }
});

// Complete registration
router.post('/complete', checkAuth, async (req, res) => {
  try {
    const { phoneNumber, fullName } = req.body;
    const telegramId = req.telegramUser.id;
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }
    
    // Validate full name
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    
    // Check if phone number is already registered
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE phone_number = ? AND telegram_id != ?',
      [phoneNumber, telegramId]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Update user registration
    await db.query(`
      UPDATE users 
      SET phone_number = ?, 
          full_name = ?, 
          is_registered = TRUE,
          main_wallet_balance = 100.00,
          play_wallet_balance = 50.00,
          updated_at = NOW()
      WHERE telegram_id = ?
    `, [phoneNumber, fullName.trim(), telegramId]);
    
    // Get updated user
    const [updatedUser] = await db.query(
      'SELECT * FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    console.log(`✅ User registered: ${fullName} (${phoneNumber}) - ID: ${telegramId}`);
    
    res.json({
      message: 'Registration completed successfully',
      user: updatedUser[0],
      welcomeBonus: {
        mainWallet: 100,
        playWallet: 50
      }
    });
  } catch (error) {
    console.error('Registration completion error:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

module.exports = router;