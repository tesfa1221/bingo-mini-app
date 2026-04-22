import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function WalletTab({ user, initData, onUpdate }) {
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTransactions();
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large! Maximum 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDepositSubmit = async () => {
    if (!selectedFile || !depositAmount) {
      alert('Please enter amount and select screenshot');
      return;
    }

    if (parseFloat(depositAmount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          
          // Compress if image is too large
          let imageData = base64Image;
          if (base64Image.length > 1000000) { // If larger than 1MB
            console.log('Compressing large image...');
            // For now, just use as is - can add compression later
          }
          
          const response = await axios.post(
            `${API_URL}/api/wallet/deposit`,
            { 
              amount: parseFloat(depositAmount), 
              screenshotUrl: imageData 
            },
            { 
              headers: { 'x-telegram-init-data': initData },
              timeout: 30000 // 30 second timeout
            }
          );
          
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
          
          setDepositAmount('');
          setSelectedFile(null);
          setShowDeposit(false);
          setUploading(false);
          fetchTransactions();
          alert('✅ Deposit request submitted! Wait for admin approval.');
        } catch (error) {
          console.error('Deposit error:', error);
          setUploading(false);
          if (error.code === 'ECONNABORTED') {
            alert('Upload timeout. Please try with a smaller image.');
          } else {
            alert('Deposit failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
          }
        }
      };
      
      reader.onerror = () => {
        setUploading(false);
        alert('Failed to read image file');
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Deposit failed: ' + error.message);
      setUploading(false);
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
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="input"
            style={{ padding: '8px' }}
          />
          {selectedFile && (
            <p style={{ color: '#39FF14', marginTop: '10px' }}>
              ✓ {selectedFile.name} selected
            </p>
          )}
          <button
            className="btn btn-success btn-block"
            onClick={handleDepositSubmit}
            disabled={!depositAmount || !selectedFile || uploading}
            style={{ marginTop: '15px' }}
          >
            {uploading ? (
              <>
                <span className="spinner" style={{ 
                  width: '16px', 
                  height: '16px', 
                  display: 'inline-block',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}></span>
                Uploading...
              </>
            ) : (
              '📤 Submit Deposit'
            )}
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
