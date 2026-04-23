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
    if (status === 'finished' && isWinner) return 'bg-kebrchacha-green/20 text-kebrchacha-green';
    if (status === 'finished') return 'bg-red-500/20 text-red-400';
    if (status === 'cancelled') return 'bg-kebrchacha-orange/20 text-kebrchacha-orange';
    return 'bg-kebrchacha-blue/20 text-kebrchacha-blue';
  };

  const getStatusText = (isWinner, status) => {
    if (status === 'finished' && isWinner) return 'Won';
    if (status === 'finished') return 'Lost';
    if (status === 'cancelled') return 'Cancelled';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-kebrchacha-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-kebrchacha-gold">Game History</h2>
      
      {/* Stats Card */}
      {stats && (
        <div className="bg-gradient-to-br from-kebrchacha-green/20 to-kebrchacha-blue/20 rounded-2xl p-6 mb-8 text-center border border-kebrchacha-green/30">
          <div className="text-4xl font-bold text-kebrchacha-green mb-2">{stats.totalGames}</div>
          <div className="text-white/70">Total Games Played</div>
        </div>
      )}

      {/* Recent Games */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Recent Games</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-xl mb-2">No games played yet</p>
            <p className="text-white/60">Start playing to see your history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((game) => (
              <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold">Game {formatGameId(game.id)}</h4>
                    <p className="text-sm text-white/60">
                      📅 {new Date(game.created_at).toLocaleDateString()} {new Date(game.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(game.is_winner, game.status)}`}>
                    {getStatusText(game.is_winner, game.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60">Stake</div>
                    <div className="font-bold text-kebrchacha-gold">{game.bet_amount} ETB</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60">Prize Pool</div>
                    <div className="font-bold text-kebrchacha-green">{game.prize_pool} ETB</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60">Card ID</div>
                    <div className="font-bold">{game.card_id || 'N/A'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60">Winners</div>
                    <div className="font-bold">{game.winner_count || 0}</div>
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