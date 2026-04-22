import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import WalletTab from './components/WalletTab';
import GameLobby from './components/GameLobby';
import BingoGame from './components/BingoGame';
import AdminPanel from './components/AdminPanel';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
const socket = io(API_URL);

// Development mode - bypass Telegram auth for local testing
const DEV_MODE = !window.Telegram?.WebApp;

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('lobby');
  const [currentGame, setCurrentGame] = useState(null);
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
    setActiveTab('game');
  };

  const leaveGame = () => {
    setCurrentGame(null);
    setActiveTab('lobby');
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
      <header className="app-header">
        <h1>🎱 Bingo Game</h1>
        <div className="user-info">
          <span>{user.username}</span>
          {DEV_MODE && <span style={{ color: '#f59e0b', fontSize: '12px' }}> (DEV)</span>}
          <div className="balance">
            <span>💰 {user.main_wallet_balance}</span>
            <span>🎮 {user.play_wallet_balance}</span>
          </div>
        </div>
      </header>

      {activeTab === 'game' && currentGame ? (
        <BingoGame 
          gameId={currentGame} 
          user={user} 
          socket={socket}
          initData={initData}
          onLeave={leaveGame}
        />
      ) : (
        <>
          <nav className="tab-nav">
            <button 
              className={activeTab === 'lobby' ? 'active' : ''}
              onClick={() => setActiveTab('lobby')}
            >
              🎮 Lobby
            </button>
            <button 
              className={activeTab === 'wallet' ? 'active' : ''}
              onClick={() => setActiveTab('wallet')}
            >
              💰 Wallet
            </button>
            {(user.telegram_id.toString() === process.env.REACT_APP_ADMIN_ID || DEV_MODE) && (
              <button 
                className={activeTab === 'admin' ? 'active' : ''}
                onClick={() => setActiveTab('admin')}
              >
                ⚙️ Admin
              </button>
            )}
          </nav>

          <main className="app-content">
            {activeTab === 'lobby' && (
              <GameLobby 
                user={user} 
                initData={initData}
                onJoinGame={joinGame}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletTab 
                user={user} 
                initData={initData}
                onUpdate={refreshUser}
              />
            )}
            {activeTab === 'admin' && (
              <AdminPanel initData={initData} />
            )}
          </main>
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
