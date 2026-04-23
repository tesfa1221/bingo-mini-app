import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function ModernBingoGame({ gameId, user, socket, initData, onLeave }) {
  const [game, setGame] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [lastBall, setLastBall] = useState(null);
  const [bingoEnabled, setBingoEnabled] = useState(false);
  const [gameTimer, setGameTimer] = useState(10);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyMessage, setPenaltyMessage] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [autoDaub, setAutoDaub] = useState(true);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winData, setWinData] = useState(null);

  useEffect(() => {
    fetchGameData();
    
    socket.emit('join_game', { gameId, userId: user.id });
    
    socket.on('game_state', (data) => {
      setGame(data.game);
      setCalledNumbers(data.calledNumbers);
      
      if (autoDaub && ticket) {
        autoMarkNumbers(data.calledNumbers);
      }
      
      if (data.calledNumbers.length >= 5) {
        setBingoEnabled(true);
      }
    });
    
    socket.on('game_countdown', (data) => {
      setGameTimer(data.timeLeft);
    });
    
    socket.on('ball_drawn', (data) => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      setLastBall(data.number);
      setCalledNumbers(prev => {
        const updated = [...prev, data.number];
        
        if (autoDaub && ticket) {
          autoMarkNumber(data.number);
        }
        
        if (updated.length >= 5) {
          setBingoEnabled(true);
        }
        
        return updated;
      });
      
      setTimeout(() => setLastBall(null), 3000);
    });
    
    socket.on('game_won', (data) => {
      setWinData(data);
      setShowWinModal(true);
      
      setTimeout(() => {
        setShowWinModal(false);
        onLeave();
      }, 5000);
    });
    
    socket.on('false_bingo_penalty', (data) => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      
      setPenaltyMessage(data.message);
      setShowPenaltyModal(true);
      
      setTimeout(() => {
        onLeave();
      }, 3000);
    });
    
    socket.on('bingo_error', (data) => {
      alert('❌ ' + data.message);
    });
    
    return () => {
      socket.off('game_state');
      socket.off('game_countdown');
      socket.off('ball_drawn');
      socket.off('game_won');
      socket.off('false_bingo_penalty');
      socket.off('bingo_error');
    };
  }, [gameId, user.id, socket, autoDaub, ticket]);

  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/${gameId}`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setGame(response.data.game);
      
      const statusResponse = await axios.get(`${API_URL}/api/game/${gameId}/status`, {
        headers: { 'x-telegram-init-data': initData }
      });
      
      setIsSpectator(statusResponse.data.isSpectator);
      
      if (statusResponse.data.isPlaying) {
        const ticketResponse = await axios.get(`${API_URL}/api/game/${gameId}/ticket`, {
          headers: { 'x-telegram-init-data': initData }
        });
        setTicket(JSON.parse(ticketResponse.data.ticket.grid_data));
        
        const existingMarked = JSON.parse(ticketResponse.data.ticket.marked_cells || '[]');
        setMarkedCells(existingMarked);
      }
    } catch (error) {
      console.error('Fetch game data error:', error);
      setIsSpectator(true);
    }
  };

  const autoMarkNumbers = (numbers) => {
    if (!ticket || !autoDaub) return;
    
    const newMarkedCells = [];
    ticket.forEach((column, colIndex) => {
      column.forEach((cell, rowIndex) => {
        if (cell !== 'FREE' && numbers.includes(cell)) {
          newMarkedCells.push(`${colIndex}-${rowIndex}`);
        }
      });
    });
    
    setMarkedCells(newMarkedCells);
  };

  const autoMarkNumber = (number) => {
    if (!ticket || !autoDaub) return;
    
    ticket.forEach((column, colIndex) => {
      column.forEach((cell, rowIndex) => {
        if (cell === number) {
          const cellKey = `${colIndex}-${rowIndex}`;
          setMarkedCells(prev => {
            if (!prev.includes(cellKey)) {
              return [...prev, cellKey];
            }
            return prev;
          });
        }
      });
    });
  };

  const toggleCell = (col, row) => {
    if (isSpectator || autoDaub) return;
    
    const cell = ticket[col][row];
    
    if (cell === 'FREE') return;
    
    if (!calledNumbers.includes(cell)) {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      return;
    }
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    
    const cellKey = `${col}-${row}`;
    setMarkedCells(prev => {
      if (prev.includes(cellKey)) {
        return prev.filter(c => c !== cellKey);
      }
      return [...prev, cellKey];
    });
  };

  const claimBingo = async () => {
    if (isSpectator) {
      alert('👁️ Spectators cannot claim BINGO');
      return;
    }
    
    if (!bingoEnabled) {
      alert('⏳ Wait for at least 5 balls to be drawn');
      return;
    }
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
    }
    
    try {
      await axios.post(
        `${API_URL}/api/game/${gameId}/update-marks`,
        { markedCells },
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      socket.emit('claim_bingo', { gameId, userId: user.id, markedCells });
    } catch (error) {
      console.error('Claim bingo error:', error);
      alert('Failed to claim BINGO');
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-kebrchacha-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const columns = ['B', 'I', 'N', 'G', 'O'];
  const bingoColors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm">
        <button 
          onClick={onLeave}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <span>←</span> Back
        </button>
        <button className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors">
          <span>⟲</span> Refresh
        </button>
      </div>

      {/* Wallet Info Bar */}
      <div className="flex gap-2 p-4 bg-black/20">
        <div className="flex-1 bg-amber-900/80 rounded-lg p-2 text-center">
          <div className="text-xs opacity-80">Main Wallet</div>
          <div className="font-bold">{Math.floor(user.main_wallet_balance)}</div>
        </div>
        <div className="flex-1 bg-amber-900/80 rounded-lg p-2 text-center">
          <div className="text-xs opacity-80">Play Wallet</div>
          <div className="font-bold">{Math.floor(user.play_wallet_balance)}</div>
        </div>
        <div className="flex-1 bg-amber-900/80 rounded-lg p-2 text-center">
          <div className="text-xs opacity-80">Stake</div>
          <div className="font-bold">{game?.bet_amount || 0}</div>
        </div>
        <div className="bg-orange-500 rounded-lg p-2 text-center min-w-[60px]">
          <div className="font-bold text-black">{gameTimer} s</div>
        </div>
      </div>

      {/* Live Ball Display */}
      {lastBall && (
        <div className="text-center py-4">
          <div className="inline-block relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
              {lastBall <= 15 ? 'B' : lastBall <= 30 ? 'I' : lastBall <= 45 ? 'N' : lastBall <= 60 ? 'G' : 'O'}-{lastBall}
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-black animate-bounce shadow-2xl">
              {lastBall}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 pb-24">
        {/* 1-75 Number Grid */}
        <div className="grid grid-cols-10 gap-1 mb-6">
          {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
            <div
              key={num}
              className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-300 ${
                calledNumbers.includes(num) 
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg animate-pulse' 
                  : 'bg-amber-900/60 border-amber-900/80 text-white/80'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Auto-daub Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4 bg-black/30 rounded-full py-3 px-6">
          <span className="text-sm font-medium">Automatic</span>
          <button
            onClick={() => setAutoDaub(!autoDaub)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              autoDaub ? 'bg-green-500' : 'bg-white/20'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                autoDaub ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* BINGO Letters */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {columns.map((letter, index) => (
            <div
              key={letter}
              className={`${bingoColors[index]} text-white text-center py-2 rounded-lg font-bold text-lg`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* User's Bingo Card */}
        {ticket && (
          <div className="grid grid-cols-5 gap-1 mb-4">
            {ticket.map((column, colIndex) => (
              <div key={colIndex} className="flex flex-col gap-1">
                {column.map((cell, rowIndex) => {
                  const cellKey = `${colIndex}-${rowIndex}`;
                  const isMarked = markedCells.includes(cellKey);
                  const isFree = cell === 'FREE';
                  const isCalled = calledNumbers.includes(cell);
                  
                  return (
                    <div
                      key={cellKey}
                      onClick={() => !isFree && toggleCell(colIndex, rowIndex)}
                      className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-white border-2 transition-all duration-300 cursor-pointer ${
                        isFree 
                          ? 'bg-green-500 border-green-500 text-white cursor-default' 
                          : isMarked 
                            ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                            : isCalled 
                              ? 'border-yellow-400 bg-white/10 border-2 shadow-lg'
                              : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {isFree ? '★' : cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Card Number */}
        <div className="text-center bg-amber-900/80 rounded-full py-2 px-4 text-sm font-medium mb-6">
          Cartela No: {Math.floor(Math.random() * 100) + 1}
        </div>

        {/* BINGO Button */}
        <button
          onClick={claimBingo}
          disabled={!bingoEnabled}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
            bingoEnabled
              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-2xl hover:scale-105 animate-pulse'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {bingoEnabled ? '🎉 BINGO!' : `⏳ Wait (${5 - calledNumbers.length} more balls)`}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="flex">
          <button className="flex-1 flex flex-col items-center py-3 text-xs text-white/60 hover:text-white transition-colors">
            <span className="text-lg mb-1">🎮</span>
            <span>Game</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-xs text-white/60 hover:text-white transition-colors">
            <span className="text-lg mb-1">📊</span>
            <span>History</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-xs text-white/60 hover:text-white transition-colors">
            <span className="text-lg mb-1">💰</span>
            <span>Wallet</span>
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-xs text-white/60 hover:text-white transition-colors">
            <span className="text-lg mb-1">👤</span>
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Win Modal */}
      {showWinModal && winData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-md border border-yellow-400/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4 animate-bounce">👑</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">BINGO!</h2>
            <div className="text-lg mb-6">
              🎉 {winData.winners?.length > 1 ? `${winData.winners.length} players won!` : 'You won!'}
            </div>
            
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="text-yellow-400 font-bold mb-2">
                🏆 Winning Cartela: {winData.cardId || Math.floor(Math.random() * 100)}
              </div>
              
              <div className="grid grid-cols-5 gap-1 mb-2">
                {columns.map((letter, index) => (
                  <div key={letter} className={`${bingoColors[index]} text-white text-center py-1 rounded text-sm font-bold`}>
                    {letter}
                  </div>
                ))}
              </div>

              {ticket && (
                <div className="grid grid-cols-5 gap-1">
                  {ticket.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {column.map((cell, rowIndex) => {
                        const cellKey = `${colIndex}-${rowIndex}`;
                        const isMarked = markedCells.includes(cellKey);
                        const isFree = cell === 'FREE';
                        
                        return (
                          <div
                            key={cellKey}
                            className={`aspect-square flex items-center justify-center text-xs rounded ${
                              isFree || isMarked ? 'bg-green-500 text-white' : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {isFree ? '★' : cell}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-white/70 text-sm">
              ● Auto-starting next game in 2s
            </div>
          </div>
        </div>
      )}

      {/* Penalty Modal */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-md border border-red-500/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4 animate-bounce">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">ያልተሟላ መስመር!</h2>
            <p className="text-lg mb-2">{penaltyMessage}</p>
            <p className="text-red-400 font-bold mb-2">ከጨዋታው ታግደዋል።</p>
            <p className="text-white/70">Banned for 30 minutes</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModernBingoGame;