import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function AdminPanel({ initData }) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Game creation form
  const [betAmount, setBetAmount] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [houseCommission, setHouseCommission] = useState(10);
  const [registrationTimer, setRegistrationTimer] = useState(60);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchPendingTransactions();
    } else if (activeTab === 'games') {
      fetchAllGames();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

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

  const fetchAllGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/games`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setGames(response.data.games);
    } catch (error) {
      console.error('Fetch games error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
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

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(
        `${API_URL}/api/admin/game/create`,
        {
          betAmount,
          maxPlayers,
          houseCommission,
          registrationTimer
        },
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      alert('Game created successfully!');
      setBetAmount(10);
      setMaxPlayers(10);
      setHouseCommission(10);
      setRegistrationTimer(60);
      fetchAllGames();
    } catch (error) {
      console.error('Create game error:', error);
      alert('Failed to create game: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (gameId) => {
    if (!confirm('Start this game now?')) return;
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/game/${gameId}/start`,
        {},
        { headers: { 'x-telegram-init-data': initData } }
      );
      alert('Game started!');
      fetchAllGames();
    } catch (error) {
      console.error('Start game error:', error);
      alert('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGame = async (gameId) => {
    if (!confirm('Cancel this game? All players will be refunded.')) return;
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/game/${gameId}/cancel`,
        {},
        { headers: { 'x-telegram-init-data': initData } }
      );
      alert('Game cancelled and players refunded!');
      fetchAllGames();
    } catch (error) {
      console.error('Cancel game error:', error);
      alert('Failed to cancel game');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrizePool = () => {
    const totalBets = betAmount * maxPlayers;
    const commission = (totalBets * houseCommission) / 100;
    const prizePool = totalBets - commission;
    return { totalBets, commission, prizePool };
  };

  const { totalBets, commission, prizePool } = calculatePrizePool();

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-kebrchacha-gold">⚙️ Admin Dashboard</h2>
      
      {/* Admin Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'transactions', label: '💰 Transactions' },
          { id: 'games', label: '🎮 Games' },
          { id: 'create', label: '➕ Create Game' },
          { id: 'stats', label: '📊 Statistics' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-kebrchacha-green text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Pending Transactions</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-white/60">No pending transactions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{tx.username}</h3>
                      <p className="text-sm text-white/60">{tx.transaction_ref}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-kebrchacha-gold">{tx.amount} ETB</div>
                      <div className="text-sm text-white/60">{tx.type}</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-white/70 mb-4">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                  
                  {tx.screenshot_url && (
                    <div className="mb-4">
                      <img 
                        src={tx.screenshot_url} 
                        alt="Payment proof" 
                        className="w-full max-w-sm rounded-lg border border-white/20"
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-kebrchacha-green text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
                      onClick={() => handleApprove(tx.id)}
                      disabled={loading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
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
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">All Games</h3>
          {games.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-white/60">No games yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">Game #{game.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      game.status === 'waiting' ? 'bg-kebrchacha-orange/20 text-kebrchacha-orange' :
                      game.status === 'active' ? 'bg-kebrchacha-green/20 text-kebrchacha-green' :
                      'bg-white/20 text-white'
                    }`}>
                      {game.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-white/60">Bet Amount</div>
                      <div className="font-bold text-kebrchacha-gold">{game.bet_amount} ETB</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Prize Pool</div>
                      <div className="font-bold text-kebrchacha-green">{game.prize_pool} ETB</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Commission</div>
                      <div className="font-bold">{game.house_commission}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60">Players</div>
                      <div className="font-bold">{game.current_players}/{game.max_players}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-white/60 mb-4">
                    Created: {new Date(game.created_at).toLocaleString()}
                    {game.started_at && (
                      <> • Started: {new Date(game.started_at).toLocaleString()}</>
                    )}
                    {game.finished_at && (
                      <> • Finished: {new Date(game.finished_at).toLocaleString()}</>
                    )}
                  </div>
                  
                  {game.status === 'waiting' && (
                    <div className="flex gap-3">
                      <button
                        className="flex-1 bg-kebrchacha-green text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                        onClick={() => handleStartGame(game.id)}
                        disabled={loading}
                      >
                        ▶️ Start Now
                      </button>
                      <button
                        className="flex-1 bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                        onClick={() => handleCancelGame(game.id)}
                        disabled={loading}
                      >
                        ✗ Cancel & Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Game Tab */}
      {activeTab === 'create' && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Create New Game</h3>
          <form onSubmit={handleCreateGame} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bet Amount (ETB)</label>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kebrchacha-green"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min="1"
                required
              />
              <p className="text-xs text-white/60 mt-1">Amount each player pays to join</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Players</label>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kebrchacha-green"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min="2"
                max="100"
                required
              />
              <p className="text-xs text-white/60 mt-1">Maximum number of players (2-100)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">House Commission (%)</label>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kebrchacha-green"
                value={houseCommission}
                onChange={(e) => setHouseCommission(Number(e.target.value))}
                min="0"
                max="50"
                required
              />
              <p className="text-xs text-white/60 mt-1">Your platform fee (0-50%)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Registration Timer (seconds)</label>
              <input
                type="number"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kebrchacha-green"
                value={registrationTimer}
                onChange={(e) => setRegistrationTimer(Number(e.target.value))}
                min="30"
                max="300"
                required
              />
              <p className="text-xs text-white/60 mt-1">Card selection time (30-300 seconds)</p>
            </div>

            {/* Prize Calculation */}
            <div className="bg-white/10 rounded-xl p-4 border border-white/20">
              <h4 className="font-bold mb-3 text-kebrchacha-gold">💰 Prize Calculation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Bets:</span>
                  <strong>{totalBets.toFixed(2)} ETB</strong>
                </div>
                <div className="flex justify-between text-kebrchacha-gold">
                  <span>Your Commission ({houseCommission}%):</span>
                  <strong>+{commission.toFixed(2)} ETB</strong>
                </div>
                <div className="flex justify-between text-kebrchacha-green border-t border-white/20 pt-2">
                  <span>Prize Pool:</span>
                  <strong>{prizePool.toFixed(2)} ETB</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : '🎮 Create Game'}
            </button>
          </form>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Platform Statistics</h3>
          {!stats ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-kebrchacha-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-2xl font-bold text-kebrchacha-green">{stats.totalUsers}</div>
                <div className="text-sm text-white/70">Total Users</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-2xl font-bold text-kebrchacha-blue">{stats.totalGames}</div>
                <div className="text-sm text-white/70">Total Games</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-2xl font-bold text-kebrchacha-orange">{stats.totalRevenue} ETB</div>
                <div className="text-sm text-white/70">Total Revenue</div>
              </div>
              
              <div className="bg-gradient-to-br from-kebrchacha-gold/20 to-kebrchacha-orange/20 rounded-2xl p-6 text-center border border-kebrchacha-gold/30">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-kebrchacha-gold">{stats.houseEarnings} ETB</div>
                <div className="text-sm text-white/70">House Earnings</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-2xl font-bold text-kebrchacha-purple">{stats.activeGames}</div>
                <div className="text-sm text-white/70">Active Games</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="text-2xl mb-2">⏳</div>
                <div className="text-2xl font-bold text-kebrchacha-orange">{stats.pendingTransactions}</div>
                <div className="text-sm text-white/70">Pending Transactions</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;