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
    console.log('🔧 Kebrchacha Vite App starting...', { 
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
      <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kebrchacha-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Kebrchacha...</p>
          {DEV_MODE && (
            <div className="mt-4 text-kebrchacha-orange text-sm">
              <p>🔧 Development Mode</p>
              <p>Open in Telegram for full experience</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray">
      {user.username === 'Anonymous' && !DEV_MODE && (
        <div className="bg-gradient-to-r from-kebrchacha-gold to-kebrchacha-orange text-kebrchacha-dark p-3 text-center font-semibold border-b-2 border-kebrchacha-gold">
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
          <nav className="fixed bottom-0 left-0 right-0 bg-kebrchacha-dark/90 backdrop-blur-md border-t border-kebrchacha-gold/20">
            <div className="grid grid-cols-5 gap-1 p-2">
              <button 
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                  activeTab === 'welcome' 
                    ? 'bg-kebrchacha-green/20 text-kebrchacha-green' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('welcome')}
              >
                <span className="text-lg mb-1">🏠</span>
                <span className="text-xs font-medium">Home</span>
              </button>
              <button 
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                  activeTab === 'lobby' 
                    ? 'bg-kebrchacha-green/20 text-kebrchacha-green' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('lobby')}
              >
                <span className="text-lg mb-1">🎮</span>
                <span className="text-xs font-medium">Game</span>
              </button>
              <button 
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                  activeTab === 'history' 
                    ? 'bg-kebrchacha-green/20 text-kebrchacha-green' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <span className="text-lg mb-1">📊</span>
                <span className="text-xs font-medium">History</span>
              </button>
              <button 
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                  activeTab === 'wallet' 
                    ? 'bg-kebrchacha-green/20 text-kebrchacha-green' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('wallet')}
              >
                <span className="text-lg mb-1">💰</span>
                <span className="text-xs font-medium">Wallet</span>
              </button>
              <button 
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-300 ${
                  activeTab === 'profile' 
                    ? 'bg-kebrchacha-green/20 text-kebrchacha-green' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="text-lg mb-1">👤</span>
                <span className="text-xs font-medium">Profile</span>
              </button>
            </div>
            
            {/* Admin Tab (conditional) */}
            {(user.telegram_id.toString() === '991793142' || DEV_MODE) && (
              <div className="border-t border-kebrchacha-gold/20 p-2">
                <button 
                  className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-300 ${
                    activeTab === 'admin' 
                      ? 'bg-kebrchacha-gold/20 text-kebrchacha-gold' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveTab('admin')}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="text-sm font-medium">Admin Panel</span>
                </button>
              </div>
            )}
          </nav>
        </>
      )}
      
      {DEV_MODE && (
        <div className="fixed top-4 right-4 bg-kebrchacha-orange/90 text-kebrchacha-dark px-3 py-1 rounded-full text-xs font-bold z-50">
          DEV MODE
        </div>
      )}
    </div>
  );
}

export default App;
