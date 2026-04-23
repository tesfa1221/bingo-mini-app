import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function WelcomeScreen({ user, initData, onSelectStake }) {
  const [activeGames, setActiveGames] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/stats`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setActiveGames(response.data.activePlayers || 0);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const stakeOptions = [
    { amount: 5, color: 'stake-low' },
    { amount: 10, color: 'stake-medium' },
    { amount: 20, color: 'stake-high' },
    { amount: 50, color: 'stake-premium' }
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        <div className="brand-logo">
          <div className="logo-circle">K</div>
        </div>
        <h1 className="welcome-title">
          Welcome to <span className="brand-name">Kebrchacha</span> Bingo
        </h1>
      </div>

      <div className="stake-selection">
        <div className="stake-header">
          <h2>▷ Choose Your Stake</h2>
        </div>
        
        <div className="stake-options">
          {stakeOptions.map((stake) => (
            <button
              key={stake.amount}
              className={`stake-btn ${stake.color}`}
              onClick={() => onSelectStake(stake.amount)}
              disabled={loading || user.play_wallet_balance < stake.amount}
            >
              <span className="play-icon">▷</span>
              <span className="stake-text">Play {stake.amount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="active-players-card">
        <div className="players-count">{activeGames.toLocaleString()}+</div>
        <div className="players-label">Active Players</div>
      </div>

      <div className="welcome-features">
        <div className="feature-item">
          <span className="feature-icon">🎯</span>
          <span>Real-time Multiplayer</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💰</span>
          <span>Instant Payouts</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🏆</span>
          <span>Fair & Transparent</span>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;