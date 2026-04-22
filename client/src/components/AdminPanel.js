import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function AdminPanel({ initData }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/transactions/pending`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const handleApprove = async (txId) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/transactions/${txId}/approve`,
        {},
        { headers: { 'x-telegram-init-data': initData } }
      );
      alert('Transaction approved!');
      fetchPendingTransactions();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (txId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/transactions/${txId}/reject`,
        { adminNote: reason },
        { headers: { 'x-telegram-init-data': initData } }
      );
      alert('Transaction rejected!');
      fetchPendingTransactions();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Pending Transactions</h2>
      
      {transactions.length === 0 ? (
        <p className="empty-state">No pending transactions</p>
      ) : (
        <div className="transactions-admin">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <div className="tx-header">
                <h3>{tx.username}</h3>
                <span className="tx-ref">{tx.transaction_ref}</span>
              </div>
              <div className="tx-details">
                <p><strong>Amount:</strong> {tx.amount} ETB</p>
                <p><strong>Type:</strong> {tx.type}</p>
                <p><strong>Date:</strong> {new Date(tx.created_at).toLocaleString()}</p>
              </div>
              {tx.screenshot_url && (
                <div className="tx-screenshot">
                  <img src={tx.screenshot_url} alt="Payment proof" />
                </div>
              )}
              <div className="tx-actions">
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(tx.id)}
                  disabled={loading}
                >
                  ✓ Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(tx.id)}
                  disabled={loading}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
