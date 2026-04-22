import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

  return (
    <div className="game-lobby">
      <h2>Available Games</h2>
      
      {games.length === 0 ? (
        <div className="empty-state">
          <p>No games available</p>
          <p className="hint">Check back soon!</p>
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <h3>Game #{game.id}</h3>
                <span className="game-status">{game.status}</span>
              </div>
              <div className="game-info">
                <div className="info-row">
                  <span>Bet Amount:</span>
                  <strong>{game.bet_amount} ETB</strong>
                </div>
                <div className="info-row">
                  <span>Prize Pool:</span>
                  <strong className="prize">{game.prize_pool} ETB</strong>
                </div>
                <div className="info-row">
                  <span>Players:</span>
                  <strong>{game.current_players}/{game.max_players}</strong>
                </div>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => handleJoinGame(game.id)}
                disabled={loading || user.play_wallet_balance < game.bet_amount}
              >
                {user.play_wallet_balance < game.bet_amount 
                  ? 'Insufficient Balance' 
                  : 'Join Game'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GameLobby;
