const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { checkAuth, checkAdmin } = require('../middleware/auth');

router.get('/transactions/pending', checkAuth, checkAdmin, async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT t.*, u.username, u.telegram_id 
       FROM transactions t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.status = 'pending' 
       ORDER BY t.created_at ASC`
    );
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get pending transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.post('/transactions/:id/approve', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [transactions] = await connection.query(
        'SELECT * FROM transactions WHERE id = ? AND status = "pending" FOR UPDATE',
        [id]
      );
      
      if (transactions.length === 0) {
        throw new Error('Transaction not found or already processed');
      }
      
      const transaction = transactions[0];
      
      await connection.query(
        'UPDATE users SET main_wallet_balance = main_wallet_balance + ? WHERE id = ?',
        [transaction.amount, transaction.user_id]
      );
      
      await connection.query(
        'UPDATE transactions SET status = "approved", admin_note = ? WHERE id = ?',
        [adminNote || null, id]
      );
      
      await connection.commit();
      
      res.json({ message: 'Transaction approved successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve transaction' });
  }
});

router.post('/transactions/:id/reject', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    
    await db.query(
      'UPDATE transactions SET status = "rejected", admin_note = ? WHERE id = ? AND status = "pending"',
      [adminNote || 'Rejected by admin', id]
    );
    
    res.json({ message: 'Transaction rejected successfully' });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});

module.exports = router;
