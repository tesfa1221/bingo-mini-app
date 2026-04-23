import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import WelcomeScreen from './components/WelcomeScreen';
import WalletTab from './components/WalletTab';
import GameLobby from './components/GameLobby';
import GameHistory from './components/GameHistory';
import UserProfile from './components/UserProfile';
import CardSelectionLobby from './components/CardSelectionLobby';
import BingoGame from './components/ModernBingoGame';
import AdminPanel from './components/AdminPanel';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';
const socket = io(API_URL);

// Development mode - bypass Telegram auth for local testing
const DEV_MODE = !window.Telegram?.WebApp;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('welcome');
  const [currentGame, setCurrentGame] = useState(null);
  const [gamePhase, setGamePhase] = useState('lobby'); // 'lobby', 'card-selection', 'game'
  const [initData, setInitData] = useState('');

  useEffect(() => {
    console.log('🔧 App starting...', { 
      hasTelegram: !!window.Telegram?.WebApp, 
      DEV_MODE 
    });
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setInitData(tg.initData);
      
      if (tg.initData) {
        console.log('🔐 Using Telegram auth');
        loginUser(tg.initData);
      } else {
        console.log('🔧 No Telegram initData, using dev mode');
        // Fallback to dev mode
        setUser({
          id: 1,
          telegram_id: 991793142,
          username: 'TestUser',
          main_wallet_balance: 100.00,
          play_wallet_balance: 50.00
        });
        setInitData('mock_init_data_for_development');
      }
    } else if (DEV_MODE) {
      // Development mode - create mock user
      console.log('🔧 Development mode: Creating mock user');
      setUser({
        id: 1,
        telegram_id: 991793142,
        username: 'TestUser',
        main_wallet_balance: 100.00,
        play_wallet_balance: 50.00
      });
      setInitData('mock_init_data_for_development');
    }
  }, []);

  const loginUser = async (initDataString) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {}, {
        headers: {
          'x-telegram-init-data': initDataString
        }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      if (DEV_MODE) {
        // Fallback to mock user in development
        setUser({
          id: 1,
          telegram_id: 991793142,
          username: 'TestUser',
          main_wallet_balance: 100.00,
          play_wallet_balance: 50.00
        });
      }
    }
  };

  const refreshUser = async () => {
    if (DEV_MODE) {
      // In dev mode, just update the mock user
      setUser(prev => ({ ...prev, main_wallet_balance: prev.main_wallet_balance + 10 }));
      return;
    }
    
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          'x-telegram-init-data': initData
        }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  const joinGame = (gameId) => {
    setCurrentGame(gameId);
    setGamePhase('card-selection');
    setActiveTab('game');
  };

  const selectStake = (amount) => {
    // Navigate to game lobby with selected stake
    setActiveTab('lobby');
  };

  const startGame = () => {
    setGamePhase('game');
  };

  const leaveGame = () => {
    setCurrentGame(null);
    setGamePhase('lobby');
    setActiveTab('welcome');
    refreshUser();
  };

  if (!user) {
    console.log('🔧 Still loading user...', { user, DEV_MODE, hasTelegram: !!window.Telegram?.WebApp });
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
        {DEV_MODE && (
          <div style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
            <p>🔧 Development Mode</p>
            <p>Open in Telegram for full experience</p>
            <p>Debug: User is {user ? 'set' : 'null'}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {user.username === 'Anonymous' && !DEV_MODE && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-3 text-center font-semibold border-b-2 border-yellow-600">
          ⚠️ Please start the bot first: Send /start to @Odabingobot to register
        </div>
      )}
      
      {/* Game View */}
      {activeTab === 'game' && currentGame ? (
        <>
          {gamePhase === 'card-selection' && (
            <CardSelectionLobby
              gameId={currentGame}
              user={user}
              socket={socket}
              initData={initData}
              onStartGame={startGame}
              onLeave={leaveGame}
            />
          )}
          {gamePhase === 'game' && (
            <BingoGame 
              gameId={currentGame} 
              user={user} 
              socket={socket}
              initData={initData}
              onLeave={leaveGame}
            />
          )}
        </>
      ) : (
        <>
          {/* Main Content */}
          <main className="pb-20">
            {activeTab === 'welcome' && (
              <WelcomeScreen 
                user={user} 
                initData={initData}
                onSelectStake={selectStake}
              />
            )}
            {activeTab === 'lobby' && (
              <GameLobby 
                user={user} 
                initData={initData}
                onJoinGame={joinGame}
              />
            )}
            {activeTab === 'history' && (
              <GameHistory 
                user={user} 
                initData={initData}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletTab 
                user={user} 
                initData={initData}
                onUpdate={refreshUser}
              />
            )}
            {activeTab === 'profile' && (
              <UserProfile 
                user={user} 
                initData={initData}
                onUpdate={refreshUser}
              />
            )}
            {activeTab === 'admin' && (
              <AdminPanel initData={initData} />
            )}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 z-50">
            <div className="flex">
              <button 
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  activeTab === 'welcome' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('welcome')}
              >
                <span className="text-lg mb-1">🏠</span>
                <span>Home</span>
              </button>
              <button 
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  activeTab === 'lobby' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('lobby')}
              >
                <span className="text-lg mb-1">🎮</span>
                <span>Game</span>
              </button>
              <button 
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  activeTab === 'history' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <span className="text-lg mb-1">📊</span>
                <span>History</span>
              </button>
              <button 
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  activeTab === 'wallet' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('wallet')}
              >
                <span className="text-lg mb-1">💰</span>
                <span>Wallet</span>
              </button>
              <button 
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  activeTab === 'profile' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="text-lg mb-1">👤</span>
                <span>Profile</span>
              </button>
              {(user.telegram_id.toString() === process.env.REACT_APP_ADMIN_ID || DEV_MODE) && (
                <button 
                  className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                    activeTab === 'admin' ? 'text-yellow-400' : 'text-white/60 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('admin')}
                >
                  <span className="text-lg mb-1">⚙️</span>
                  <span>Admin</span>
                </button>
              )}
            </div>
          </nav>
        </>
      )}
      
      {DEV_MODE && (
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-medium z-50">
          DEV MODE
        </div>
      )}
    </div>
  );
}

export default App;
