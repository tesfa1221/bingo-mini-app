import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

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
    if (!window.confirm('Start this game now?')) return;
    
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
    if (!window.confirm('Cancel this game? All players will be refunded.')) return;
    
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
    <div className="admin-panel">
      <h2>⚙️ Admin Dashboard</h2>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          💰 Transactions
        </button>
        <button
          className={activeTab === 'games' ? 'active' : ''}
          onClick={() => setActiveTab('games')}
        >
          🎮 Games
        </button>
        <button
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Game
        </button>
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div className="admin-section">
          <h3>Pending Transactions</h3>
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
      )}

      {activeTab === 'games' && (
        <div className="admin-section">
          <h3>All Games</h3>
          {games.length === 0 ? (
            <p className="empty-state">No games yet</p>
          ) : (
            <div className="games-admin">
              {games.map((game) => (
                <div key={game.id} className="game-admin-card">
                  <div className="game-admin-header">
                    <h3>Game #{game.id}</h3>
                    <span className={`status-badge status-${game.status}`}>
                      {game.status}
                    </span>
                  </div>
                  <div className="game-admin-details">
                    <p><strong>Bet Amount:</strong> {game.bet_amount} ETB</p>
                    <p><strong>Prize Pool:</strong> {game.prize_pool} ETB</p>
                    <p><strong>House Commission:</strong> {game.house_commission}%</p>
                    <p><strong>Players:</strong> {game.current_players}/{game.max_players}</p>
                    <p><strong>Created:</strong> {new Date(game.created_at).toLocaleString()}</p>
                    {game.started_at && (
                      <p><strong>Started:</strong> {new Date(game.started_at).toLocaleString()}</p>
                    )}
                    {game.finished_at && (
                      <p><strong>Finished:</strong> {new Date(game.finished_at).toLocaleString()}</p>
                    )}
                  </div>
                  {game.status === 'waiting' && (
                    <div className="game-admin-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStartGame(game.id)}
                        disabled={loading}
                      >
                        ▶️ Start Now
                      </button>
                      <button
                        className="btn btn-danger"
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

      {activeTab === 'create' && (
        <div className="admin-section">
          <h3>Create New Game</h3>
          <form onSubmit={handleCreateGame} className="create-game-form">
            <div className="form-group">
              <label>Bet Amount (ETB)</label>
              <input
                type="number"
                className="input"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min="1"
                required
              />
              <small>Amount each player pays to join</small>
            </div>

            <div className="form-group">
              <label>Max Players</label>
              <input
                type="number"
                className="input"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min="2"
                max="100"
                required
              />
              <small>Maximum number of players (2-100)</small>
            </div>

            <div className="form-group">
              <label>House Commission (%)</label>
              <input
                type="number"
                className="input"
                value={houseCommission}
                onChange={(e) => setHouseCommission(Number(e.target.value))}
                min="0"
                max="50"
                required
              />
              <small>Your platform fee (0-50%)</small>
            </div>

            <div className="form-group">
              <label>Registration Timer (seconds)</label>
              <input
                type="number"
                className="input"
                value={registrationTimer}
                onChange={(e) => setRegistrationTimer(Number(e.target.value))}
                min="30"
                max="300"
                required
              />
              <small>Card selection time (30-300 seconds)</small>
            </div>

            <div className="prize-calculation">
              <h4>💰 Prize Calculation</h4>
              <div className="calc-row">
                <span>Total Bets:</span>
                <strong>{totalBets.toFixed(2)} ETB</strong>
              </div>
              <div className="calc-row commission">
                <span>Your Commission ({houseCommission}%):</span>
                <strong className="gold-text">+{commission.toFixed(2)} ETB</strong>
              </div>
              <div className="calc-row prize">
                <span>Prize Pool:</span>
                <strong className="neon-text">{prizePool.toFixed(2)} ETB</strong>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-large"
              disabled={loading}
            >
              {loading ? 'Creating...' : '🎮 Create Game'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="admin-section">
          <h3>Platform Statistics</h3>
          {!stats ? (
            <p>Loading...</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-value">{stats.totalGames}</div>
                <div className="stat-label">Total Games</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">{stats.totalRevenue} ETB</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              
              <div className="stat-card gold">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{stats.houseEarnings} ETB</div>
                <div className="stat-label">House Earnings</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.activeGames}</div>
                <div className="stat-label">Active Games</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingTransactions}</div>
                <div className="stat-label">Pending Transactions</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
