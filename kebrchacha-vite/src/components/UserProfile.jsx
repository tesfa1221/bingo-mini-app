import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

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
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white p-6">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-kebrchacha-gold to-kebrchacha-orange rounded-full flex items-center justify-center text-2xl font-bold text-black mx-auto mb-4 shadow-2xl">
          {getUserInitial()}
        </div>
        <h2 className="text-2xl font-bold text-kebrchacha-gold">{user.username || 'Kebrchacha Player'}</h2>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-kebrchacha-gold/20 to-kebrchacha-orange/20 rounded-2xl p-6 text-center border border-kebrchacha-gold/30">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-sm text-white/70 mb-1">Main Wallet</div>
          <div className="text-xl font-bold text-kebrchacha-gold">{parseFloat(user.main_wallet_balance || 0).toFixed(0)}</div>
        </div>
        
        <div className="bg-gradient-to-br from-kebrchacha-green/20 to-kebrchacha-blue/20 rounded-2xl p-6 text-center border border-kebrchacha-green/30">
          <div className="text-2xl mb-2">🎮</div>
          <div className="text-sm text-white/70 mb-1">Play Wallet</div>
          <div className="text-xl font-bold text-kebrchacha-green">{parseFloat(user.play_wallet_balance || 0).toFixed(1)}</div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm text-white/70 mb-1">Games Won</div>
            <div className="text-xl font-bold text-kebrchacha-green">{stats.gamesWon || 0}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm text-white/70 mb-1">Total Invite</div>
            <div className="text-xl font-bold text-kebrchacha-blue">{stats.totalInvites || 0}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 col-span-2">
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm text-white/70 mb-1">Total Earning</div>
            <div className="text-xl font-bold text-kebrchacha-gold">{stats.totalEarnings || 0} ETB</div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
        <h3 className="text-xl font-bold mb-4 text-kebrchacha-gold">Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔊</span>
              <span>Sound</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(e) => updateSetting('sound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kebrchacha-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📳</span>
              <span>Vibration</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.vibration}
                onChange={(e) => updateSetting('vibration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kebrchacha-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <span>Auto Mark</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoMark}
                onChange={(e) => updateSetting('autoMark', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kebrchacha-green"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      <div>
        <button 
          className="w-full bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
          onClick={onUpdate}
        >
          🔄 Refresh Balance
        </button>
      </div>
    </div>
  );
}

export default UserProfile;