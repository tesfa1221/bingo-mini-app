import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function UserProfile({ user, initData, onUpdate }) {
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({
    sound: true,
    vibration: true,
    autoMark: true
  });

  useEffect(() => {
    fetchUserStats();
    loadSettings();
  }, []);

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

  const loadSettings = () => {
    const saved = localStorage.getItem('kebrchacha_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('kebrchacha_settings', JSON.stringify(newSettings));
  };

  const getUserInitial = () => {
    return user.username ? user.username.charAt(0).toUpperCase() : 'K';
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {getUserInitial()}
          </div>
        </div>
        <h2 className="profile-name">{user.username || 'Kebrchacha Player'}</h2>
      </div>

      <div className="wallet-summary">
        <div className="wallet-card main">
          <div className="wallet-icon">💰</div>
          <div className="wallet-label">Main Wallet</div>
          <div className="wallet-amount">{parseFloat(user.main_wallet_balance || 0).toFixed(0)}</div>
        </div>
        
        <div className="wallet-card play">
          <div className="wallet-icon">🎮</div>
          <div className="wallet-label">Play Wallet</div>
          <div className="wallet-amount">{parseFloat(user.play_wallet_balance || 0).toFixed(1)}</div>
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-label">Games Won</div>
            <div className="stat-value">{stats.gamesWon || 0}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-label">Total Invite</div>
            <div className="stat-value">{stats.totalInvites || 0}</div>
          </div>
          
          <div className="stat-card wide">
            <div className="stat-icon">📈</div>
            <div className="stat-label">Total Earning</div>
            <div className="stat-value">{stats.totalEarnings || 0}</div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h3>Settings</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">🔊</span>
            <span className="setting-label">Sound</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) => updateSetting('sound', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">📳</span>
            <span className="setting-label">Vibration</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.vibration}
              onChange={(e) => updateSetting('vibration', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-icon">🎯</span>
            <span className="setting-label">Auto Mark</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoMark}
              onChange={(e) => updateSetting('autoMark', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn btn-secondary" onClick={onUpdate}>
          🔄 Refresh Balance
        </button>
      </div>
    </div>
  );
}

export default UserProfile;