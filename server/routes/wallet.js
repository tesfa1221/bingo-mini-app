const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth } = require('../middleware/auth');
const crypto = require('crypto');

router.post('/deposit', checkAuth, async (req, res) => {
  try {
    const { amount, screenshotUrl, payment_method, transaction_ref } = req.body;
    const telegramId = req.telegramUser.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Accept either screenshotUrl or transaction_ref as the reference
    const reference = screenshotUrl || transaction_ref || 'manual-deposit';
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const transactionRef = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    await db.query(
      'INSERT INTO transactions (user_id, amount, type, status, screenshot_url, transaction_ref) VALUES (?, ?, ?, ?, ?, ?)',
      [users[0].id, amount, 'deposit', 'pending', reference, transactionRef]
    );
    
    res.json({ 
      message: 'Deposit request submitted successfully',
      transactionRef 
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Deposit failed' });
  }
});

router.get('/transactions', checkAuth, async (req, res) => {
  try {
    const telegramId = req.telegramUser.id;
    
    const [users] = await db.query(
      'SELECT id FROM users WHERE telegram_id = ?',
      [telegramId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const [transactions] = await db.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [users[0].id]
    );
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.post('/transfer-to-play', checkAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    const telegramId = req.telegramUser.id;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
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
      
      if (user.main_wallet_balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      await connection.query(
        'UPDATE users SET main_wallet_balance = main_wallet_balance - ?, play_wallet_balance = play_wallet_balance + ? WHERE id = ?',
        [amount, amount, user.id]
      );
      
      await connection.commit();
      
      const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
      
      res.json({ 
        message: 'Transfer successful',
        user: updated[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error.message || 'Transfer failed' });
  }
});

module.exports = router;
