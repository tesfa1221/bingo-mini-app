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
    
    console.log('Approving transaction:', id);
    
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [transactions] = await connection.query(
        'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
        [id]
      );
      
      console.log('Transaction found:', transactions.length > 0);
      
      if (transactions.length === 0) {
        throw new Error('Transaction not found');
      }
      
      const transaction = transactions[0];
      
      console.log('Transaction status:', transaction.status);
      
      if (transaction.status !== 'pending') {
        throw new Error(`Transaction already ${transaction.status}`);
      }
      
      console.log('Updating user wallet:', transaction.user_id, transaction.amount);
      
      await connection.query(
        'UPDATE users SET main_wallet_balance = main_wallet_balance + ? WHERE id = ?',
        [transaction.amount, transaction.user_id]
      );
      
      console.log('Updating transaction status');
      
      await connection.query(
        'UPDATE transactions SET status = "approved", admin_note = ?, updated_at = NOW() WHERE id = ?',
        [adminNote || 'Approved by admin', id]
      );
      
      await connection.commit();
      
      console.log('Transaction approved successfully');
      
      res.json({ 
        message: 'Transaction approved successfully',
        transactionId: id,
        amount: transaction.amount
      });
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to approve transaction',
      details: error.toString()
    });
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
