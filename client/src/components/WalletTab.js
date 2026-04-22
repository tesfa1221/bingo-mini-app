import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function WalletTab({ user, initData, onUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [uploadWidget, setUploadWidget] = useState(null);

  useEffect(() => {
    fetchTransactions();
    
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'camera'],
          multiple: false,
          maxFiles: 1
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            handleDepositSubmit(result.info.secure_url);
          }
        }
      );
      setUploadWidget(widget);
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet/transactions`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const handleDepositSubmit = async (screenshotUrl) => {
    try {
      await axios.post(
        `${API_URL}/api/wallet/deposit`,
        { amount: parseFloat(depositAmount), screenshotUrl },
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setDepositAmount('');
      setShowDeposit(false);
      fetchTransactions();
      alert('Deposit request submitted! Wait for admin approval.');
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleTransfer = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/wallet/transfer-to-play`,
        { amount: parseFloat(transferAmount) },
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setTransferAmount('');
      onUpdate();
      alert('Transfer successful!');
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Checking', color: 'yellow' },
      approved: { text: 'Done', color: 'green' },
      rejected: { text: 'Rejected', color: 'red' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge badge-${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div className="wallet-tab">
      <div className="wallet-balances">
        <div className="balance-card">
          <h3>Main Wallet</h3>
          <p className="balance-amount">{user.main_wallet_balance} ETB</p>
        </div>
        <div className="balance-card">
          <h3>Play Wallet</h3>
          <p className="balance-amount">{user.play_wallet_balance} ETB</p>
        </div>
      </div>

      <div className="wallet-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowDeposit(!showDeposit)}
        >
          💳 Deposit
        </button>
      </div>

      {showDeposit && (
        <div className="deposit-form">
          <h3>Deposit Funds</h3>
          <div className="payment-info">
            <p><strong>Telebirr:</strong> 0912345678</p>
            <p><strong>Bank:</strong> CBE - 1000123456789</p>
            <p>Send payment and upload screenshot below</p>
          </div>
          <input
            type="number"
            placeholder="Amount (ETB)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="input"
          />
          <button
            className="btn btn-success"
            onClick={() => uploadWidget?.open()}
            disabled={!depositAmount || depositAmount <= 0}
          >
            📸 Upload Screenshot
          </button>
        </div>
      )}

      <div className="transfer-section">
        <h3>Transfer to Play Wallet</h3>
        <div className="transfer-form">
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="input"
          />
          <button
            className="btn btn-primary"
            onClick={handleTransfer}
            disabled={!transferAmount || transferAmount <= 0}
          >
            Transfer
          </button>
        </div>
      </div>

      <div className="transactions-list">
        <h3>Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="empty-state">No transactions yet</p>
        ) : (
          <div className="transactions">
            {transactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <span className="tx-type">{tx.type}</span>
                  <span className="tx-amount">{tx.amount} ETB</span>
                </div>
                <div className="tx-status">
                  {getStatusBadge(tx.status)}
                  <span className="tx-date">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletTab;
