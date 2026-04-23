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
import BingoGame from './components/BingoGame';
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
    <div className="app">
      {user.username === 'Anonymous' && !DEV_MODE && (
        <div style={{
          background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
          color: '#121212',
          padding: '12px 20px',
          textAlign: 'center',
          fontWeight: '600',
          borderBottom: '2px solid #D4AF37'
        }}>
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
          <main className="app-content">
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
          <nav className="bottom-nav">
            <button 
              className={`nav-item ${activeTab === 'welcome' ? 'active' : ''}`}
              onClick={() => setActiveTab('welcome')}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'lobby' ? 'active' : ''}`}
              onClick={() => setActiveTab('lobby')}
            >
              <span className="nav-icon">🎮</span>
              <span className="nav-label">Game</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">History</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallet')}
            >
              <span className="nav-icon">💰</span>
              <span className="nav-label">Wallet</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
            {(user.telegram_id.toString() === process.env.REACT_APP_ADMIN_ID || DEV_MODE) && (
              <button 
                className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Admin</span>
              </button>
            )}
          </nav>
        </>
      )}
      
      {DEV_MODE && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: '#f59e0b', 
          color: 'white', 
          padding: '5px 10px', 
          borderRadius: '5px', 
          fontSize: '12px' 
        }}>
          DEV MODE
        </div>
      )}
    </div>
  );
}

export default App;
