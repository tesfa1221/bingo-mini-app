import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function BingoGame({ gameId, user, socket, initData, onLeave }) {
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
      <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-kebrchacha-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const columns = ['B', 'I', 'N', 'G', 'O'];

  // Spectator view
  if (isSpectator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white">
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

        {/* Game Info Bar */}
        <div className="grid grid-cols-5 gap-2 p-4 bg-black/20">
          <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
            <div className="text-xs text-white/60">Game ID</div>
            <div className="font-bold text-kebrchacha-gold">KEB{String(gameId).padStart(6, '0')}</div>
          </div>
          <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
            <div className="text-xs text-white/60">Players</div>
            <div className="font-bold">{game?.current_players || 0}</div>
          </div>
          <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
            <div className="text-xs text-white/60">Bet</div>
            <div className="font-bold">{game?.bet_amount || 0}</div>
          </div>
          <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
            <div className="text-xs text-white/60">Prize</div>
            <div className="font-bold text-kebrchacha-green">{game?.prize_pool || 0}</div>
          </div>
          <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
            <div className="text-xs text-white/60">Called</div>
            <div className="font-bold text-kebrchacha-orange">{calledNumbers.length}</div>
          </div>
        </div>

        <div className="p-6">
          {/* Live Ball Display */}
          {lastBall && (
            <div className="text-center mb-6">
              <div className="inline-block relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-kebrchacha-green text-black text-xs px-2 py-1 rounded-full font-bold z-10">
                  {lastBall <= 15 ? 'B' : lastBall <= 30 ? 'I' : lastBall <= 45 ? 'N' : lastBall <= 60 ? 'G' : 'O'}-{lastBall}
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-kebrchacha-gold to-kebrchacha-orange rounded-full flex items-center justify-center text-2xl font-bold text-black animate-bounce shadow-2xl">
                  {lastBall}
                </div>
              </div>
            </div>
          )}

          {/* 1-75 Number Grid */}
          <div className="grid grid-cols-10 gap-1 mb-8">
            {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
              <div
                key={num}
                className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-300 ${
                  calledNumbers.includes(num) 
                    ? 'bg-kebrchacha-orange border-kebrchacha-orange text-white shadow-lg animate-pulse' 
                    : 'bg-kebrchacha-dark/60 border-kebrchacha-dark/80 text-white/80 border'
                }`}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Spectator Message */}
          <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-bold mb-2 text-kebrchacha-gold">Spectator Mode</h2>
            <p className="text-white/70 mb-4">You are watching this game</p>
            <p className="text-white/60 mb-6">Join a game to play and win prizes!</p>
            <button 
              className="bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-all duration-300"
              onClick={onLeave}
            >
              🎮 Join a Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-kebrchacha-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kebrchacha-darker via-kebrchacha-dark to-kebrchacha-gray text-white">
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
      <div className="grid grid-cols-4 gap-2 p-4 bg-black/20">
        <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
          <div className="text-xs text-white/60">Main Wallet</div>
          <div className="font-bold text-kebrchacha-gold">{Math.floor(user.main_wallet_balance)}</div>
        </div>
        <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
          <div className="text-xs text-white/60">Play Wallet</div>
          <div className="font-bold text-kebrchacha-green">{Math.floor(user.play_wallet_balance)}</div>
        </div>
        <div className="bg-kebrchacha-dark/80 rounded-lg p-2 text-center">
          <div className="text-xs text-white/60">Stake</div>
          <div className="font-bold">{game?.bet_amount || 0}</div>
        </div>
        <div className="bg-kebrchacha-orange rounded-lg p-2 text-center">
          <div className="font-bold text-black">{gameTimer} s</div>
        </div>
      </div>

      <div className="p-4">
        {/* Live Ball Display */}
        {lastBall && (
          <div className="text-center mb-4">
            <div className="inline-block relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-kebrchacha-green text-black text-xs px-2 py-1 rounded-full font-bold z-10">
                {lastBall <= 15 ? 'B' : lastBall <= 30 ? 'I' : lastBall <= 45 ? 'N' : lastBall <= 60 ? 'G' : 'O'}-{lastBall}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-kebrchacha-gold to-kebrchacha-orange rounded-full flex items-center justify-center text-xl font-bold text-black animate-bounce shadow-2xl">
                {lastBall}
              </div>
            </div>
          </div>
        )}

        {/* 1-75 Number Grid */}
        <div className="grid grid-cols-10 gap-1 mb-4">
          {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
            <div
              key={num}
              className={`aspect-square flex items-center justify-center rounded text-xs font-semibold transition-all duration-300 ${
                calledNumbers.includes(num) 
                  ? 'bg-kebrchacha-orange border-kebrchacha-orange text-white shadow-lg animate-pulse' 
                  : 'bg-kebrchacha-dark/60 border-kebrchacha-dark/80 text-white/80 border'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Auto-daub Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4 bg-black/30 rounded-full py-2 px-4">
          <span className="text-sm font-medium">Automatic</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoDaub}
              onChange={(e) => setAutoDaub(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-kebrchacha-green"></div>
          </label>
        </div>

        {/* BINGO Letters */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {columns.map((letter, index) => (
            <div
              key={letter}
              className={`text-center py-2 rounded font-bold text-sm ${
                index === 0 ? 'bg-bingo-b' :
                index === 1 ? 'bg-bingo-i' :
                index === 2 ? 'bg-bingo-n' :
                index === 3 ? 'bg-bingo-g' : 'bg-bingo-o'
              } text-white`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* User's Bingo Card */}
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
                    className={`aspect-square flex items-center justify-center rounded text-sm font-semibold border-2 transition-all duration-300 cursor-pointer ${
                      isFree 
                        ? 'bg-kebrchacha-green border-kebrchacha-green text-black cursor-default' 
                        : isMarked 
                          ? 'bg-kebrchacha-green border-kebrchacha-green text-black shadow-lg' 
                          : isCalled 
                            ? 'border-kebrchacha-gold bg-white/10 shadow-lg'
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

        {/* Card Number */}
        <div className="text-center bg-kebrchacha-dark/80 rounded-full py-2 px-4 text-sm font-medium mb-4">
          Cartela No: {Math.floor(Math.random() * 100) + 1}
        </div>

        {/* BINGO Button */}
        <button
          onClick={claimBingo}
          disabled={!bingoEnabled}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all duration-300 ${
            bingoEnabled
              ? 'bg-gradient-to-r from-kebrchacha-gold to-kebrchacha-orange text-black shadow-2xl hover:scale-105 animate-pulse'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          {bingoEnabled ? '🎉 BINGO!' : `⏳ Wait (${5 - calledNumbers.length} more balls)`}
        </button>
      </div>

      {/* Win Modal */}
      {showWinModal && winData && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-kebrchacha-dark/90 backdrop-blur-md border border-kebrchacha-gold/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-6xl mb-4 animate-bounce">👑</div>
            <h2 className="text-3xl font-bold text-kebrchacha-gold mb-4">BINGO!</h2>
            <div className="text-lg mb-6">
              🎉 {winData.winners?.length > 1 ? `${winData.winners.length} players won!` : 'You won!'}
            </div>
            
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="text-kebrchacha-gold font-bold mb-2">
                🏆 Winning Cartela: {winData.cardId || Math.floor(Math.random() * 100)}
              </div>
              
              <div className="grid grid-cols-5 gap-1 mb-2">
                {columns.map((letter, index) => (
                  <div key={letter} className={`text-center py-1 rounded text-xs font-bold ${
                    index === 0 ? 'bg-bingo-b' :
                    index === 1 ? 'bg-bingo-i' :
                    index === 2 ? 'bg-bingo-n' :
                    index === 3 ? 'bg-bingo-g' : 'bg-bingo-o'
                  } text-white`}>
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
                              isFree || isMarked ? 'bg-kebrchacha-green text-black' : 'bg-white/10 text-white/60'
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
          <div className="bg-kebrchacha-dark/90 backdrop-blur-md border border-red-500/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
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

export default BingoGame;