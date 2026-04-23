import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

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

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize if too large
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      console.log('Compressing image...');
      const compressedImage = await compressImage(selectedFile);
      console.log('Image compressed, uploading...');
      
      const response = await axios.post(
        `${API_URL}/api/wallet/deposit`,
        { 
          amount: parseFloat(depositAmount), 
          screenshotUrl: compressedImage 
        },
        { 
          headers: { 'x-telegram-init-data': initData },
          timeout: 30000
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
      } else if (error.response?.status === 413) {
        alert('Image too large. Please use a smaller screenshot.');
      } else {
        alert('Deposit failed: ' + (error.response?.data?.error || error.message || 'Unknown error'));
      }
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
      pending: { text: 'Checking', color: 'bg-kebrchacha-orange/20 text-kebrchacha-orange' },
      approved: { text: 'Done', color: 'bg-kebrchacha-green/20 text-kebrchacha-green' },
      rejected: { text: 'Rejected', color: 'bg-red-500/20 text-red-400' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white p-6">
      {/* Wallet Balances */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-kebrchacha-gold/20 to-kebrchacha-orange/20 rounded-2xl p-6 border border-kebrchacha-gold/30">
          <h3 className="text-sm text-white/70 mb-2">Main Wallet</h3>
          <p className="text-2xl font-bold text-kebrchacha-gold">{user.main_wallet_balance} ETB</p>
        </div>
        <div className="bg-gradient-to-br from-kebrchacha-green/20 to-kebrchacha-blue/20 rounded-2xl p-6 border border-kebrchacha-green/30">
          <h3 className="text-sm text-white/70 mb-2">Play Wallet</h3>
          <p className="text-2xl font-bold text-kebrchacha-green">{user.play_wallet_balance} ETB</p>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="mb-8">
        <button 
          className="w-full bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
          onClick={() => setShowDeposit(!showDeposit)}
        >
          💳 Deposit Funds
        </button>
      </div>

      {/* Deposit Form */}
      {showDeposit && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Deposit Funds</h3>
          <div className="bg-kebrchacha-dark/50 rounded-xl p-4 mb-4">
            <p className="text-sm mb-2"><strong className="text-kebrchacha-gold">Telebirr:</strong> 0912345678</p>
            <p className="text-sm mb-2"><strong className="text-kebrchacha-gold">Bank:</strong> CBE - 1000123456789</p>
            <p className="text-xs text-white/70">Send payment and upload screenshot below</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Amount (ETB)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-kebrchacha-green"
            />
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-kebrchacha-green file:text-white file:font-medium"
            />
            
            {selectedFile && (
              <p className="text-kebrchacha-green text-sm">
                ✓ {selectedFile.name} selected
              </p>
            )}
            
            <button
              className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                !depositAmount || !selectedFile || uploading
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white hover:scale-105'
              }`}
              onClick={handleDepositSubmit}
              disabled={!depositAmount || !selectedFile || uploading}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                '📤 Submit Deposit'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Transfer Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Transfer to Play Wallet</h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-kebrchacha-green"
          />
          <button
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              !transferAmount || transferAmount <= 0
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white hover:scale-105'
            }`}
            onClick={handleTransfer}
            disabled={!transferAmount || transferAmount <= 0}
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white/60">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium capitalize">{tx.type}</span>
                    <div className="text-lg font-bold text-kebrchacha-gold">{tx.amount} ETB</div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(tx.status)}
                    <div className="text-xs text-white/60 mt-1">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </div>
                  </div>
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