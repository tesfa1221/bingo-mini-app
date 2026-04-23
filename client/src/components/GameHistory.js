import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function GameHistory({ user, initData }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameHistory();
    fetchUserStats();
  }, []);

  const fetchGameHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/history`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setHistory(response.data.games || []);
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/user-stats`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const formatGameId = (id) => {
    return `KEB${id.toString().padStart(6, '0')}`;
  };

  const getStatusColor = (isWinner, status) => {
    if (status === 'finished' && isWinner) return 'won';
    if (status === 'finished') return 'lost';
    if (status === 'cancelled') return 'cancelled';
    return 'active';
  };

  const getStatusText = (isWinner, status) => {
    if (status === 'finished' && isWinner) return 'Won';
    if (status === 'finished') return 'Lost';
    if (status === 'cancelled') return 'Cancelled';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="game-history">
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-history">
      <h2>Game History</h2>
      
      {stats && (
        <div className="total-games-card">
          <div className="total-count">{stats.totalGames}</div>
          <div className="total-label">Total Games</div>
        </div>
      )}

      <div className="recent-section">
        <h3>Recent Games</h3>
        
        {history.length === 0 ? (
          <div className="empty-history">
            <p>No games played yet</p>
            <p className="hint">Start playing to see your history!</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((game) => (
              <div key={game.id} className="history-item">
                <div className="game-info">
                  <div className="game-header">
                    <span className="game-id">Game {formatGameId(game.id)}</span>
                    <span className={`status-badge ${getStatusColor(game.is_winner, game.status)}`}>
                      {getStatusText(game.is_winner, game.status)}
                    </span>
                  </div>
                  
                  <div className="game-time">
                    📅 {new Date(game.created_at).toLocaleDateString()} {new Date(game.created_at).toLocaleTimeString()}
                  </div>
                  
                  <div className="game-details">
                    <div className="detail-row">
                      <span className="label">Stake:</span>
                      <span className="value">{game.bet_amount}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Cards:</span>
                      <span className="value">{game.card_id || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Prize:</span>
                      <span className="value">{game.prize_pool}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Winners:</span>
                      <span className="value">{game.winner_count || 0}</span>
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

export default GameHistory;