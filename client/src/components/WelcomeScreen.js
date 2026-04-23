import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

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
    { amount: 5, color: 'from-green-400 to-green-600', icon: '🎯' },
    { amount: 10, color: 'from-blue-400 to-blue-600', icon: '🎮' },
    { amount: 20, color: 'from-purple-400 to-purple-600', icon: '🚀' },
    { amount: 50, color: 'from-yellow-400 to-orange-500', icon: '👑' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="px-6 py-8">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-black mx-auto mb-4 shadow-2xl animate-pulse">
            K
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="text-yellow-400">Kebrchacha</span> Bingo
          </h1>
          <p className="text-white/70">Experience the thrill of real-time multiplayer bingo</p>
        </div>

        {/* Active Players Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 text-center border border-white/20">
          <div className="text-4xl font-bold text-green-400 mb-2">{activeGames.toLocaleString()}+</div>
          <div className="text-white/70">Active Players Online</div>
          <div className="flex justify-center gap-2 mt-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>

        {/* Stake Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <span>▷</span> Choose Your Stake
          </h2>
          
          <div className="space-y-4">
            {stakeOptions.map((stake) => (
              <button
                key={stake.amount}
                className={`w-full bg-gradient-to-r ${stake.color} text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                onClick={() => onSelectStake(stake.amount)}
                disabled={loading || user.play_wallet_balance < stake.amount}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stake.icon}</span>
                    <span className="text-xl">Play {stake.amount} ETB</span>
                  </div>
                  <span className="text-2xl">▷</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-white/70">Real-time</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm text-white/70">Instant Payouts</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm text-white/70">Fair Play</div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="font-bold mb-3 text-yellow-400">🎮 How to Play</h3>
          <div className="space-y-2 text-sm text-white/80">
            <p>• Select your stake and join a game</p>
            <p>• Mark numbers as they're called</p>
            <p>• Complete any pattern to win</p>
            <p>• Claim BINGO to win the prize!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;