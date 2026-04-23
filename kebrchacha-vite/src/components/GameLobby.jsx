import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function GameLobby({ user, initData, onJoinGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/available`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setGames(response.data.games);
    } catch (error) {
      console.error('Fetch games error:', error);
    }
  };

  const handleJoinGame = async (gameId) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/game/join/${gameId}`,
        {},
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      onJoinGame(gameId);
    } catch (error) {
      console.error('Join game error:', error);
      alert('Failed to join: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleWatchGame = (gameId) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    onJoinGame(gameId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-kebrchacha-gold">Available Games</h2>
      
      {games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-xl mb-2">No games available</p>
          <p className="text-white/60">Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">Game #{game.id}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.status === 'waiting' ? 'bg-kebrchacha-green/20 text-kebrchacha-green' : 
                  'bg-kebrchacha-orange/20 text-kebrchacha-orange'
                }`}>
                  {game.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-white/60">Bet Amount</div>
                  <div className="text-lg font-bold text-kebrchacha-gold">{game.bet_amount} ETB</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-white/60">Prize Pool</div>
                  <div className="text-lg font-bold text-kebrchacha-green">{game.prize_pool} ETB</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 col-span-2">
                  <div className="text-sm text-white/60">Players</div>
                  <div className="text-lg font-bold">{game.current_players}/{game.max_players}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                    user.play_wallet_balance < game.bet_amount || loading
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white hover:scale-105 shadow-lg hover:shadow-glow-green'
                  }`}
                  onClick={() => handleJoinGame(game.id)}
                  disabled={loading || user.play_wallet_balance < game.bet_amount}
                >
                  {user.play_wallet_balance < game.bet_amount 
                    ? 'Insufficient Balance' 
                    : 'Join Game'}
                </button>
                
                <button
                  className="w-full py-3 px-6 rounded-xl font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
                  onClick={() => handleWatchGame(game.id)}
                >
                  👁️ Watch Game
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GameLobby;