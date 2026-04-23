import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

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
      
      // Auto-daub if enabled
      if (autoDaub && ticket) {
        autoMarkNumbers(data.calledNumbers);
      }
      
      // Enable BINGO button if 5+ balls drawn
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
        
        // Auto-daub the new number if enabled
        if (autoDaub && ticket) {
          autoMarkNumber(data.number);
        }
        
        // Enable BINGO button after 5 balls
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
      
      // Check if user is playing or spectating
      const statusResponse = await axios.get(`${API_URL}/api/game/${gameId}/status`, {
        headers: { 'x-telegram-init-data': initData }
      });
      
      setIsSpectator(statusResponse.data.isSpectator);
      
      if (statusResponse.data.isPlaying) {
        const ticketResponse = await axios.get(`${API_URL}/api/game/${gameId}/ticket`, {
          headers: { 'x-telegram-init-data': initData }
        });
        setTicket(JSON.parse(ticketResponse.data.ticket.grid_data));
        
        // Load existing marked cells
        const existingMarked = JSON.parse(ticketResponse.data.ticket.marked_cells || '[]');
        setMarkedCells(existingMarked);
      }
    } catch (error) {
      console.error('Fetch game data error:', error);
      // If no ticket found, user is spectator
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
    if (isSpectator || autoDaub) return; // Can't manually mark if auto-daub is on
    
    const cell = ticket[col][row];
    
    // Can't toggle FREE space
    if (cell === 'FREE') return;
    
    // Can only mark numbers that have been called
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
        // Unmark
        return prev.filter(c => c !== cellKey);
      }
      // Mark
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
    
    // Save marked cells before claiming
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
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  // Spectator view - show called numbers only
  if (isSpectator) {
    return (
      <div className="beteseb-game spectator-mode">
        {/* Game Header - Beteseb Style */}
        <div className="beteseb-header">
          <button className="back-btn" onClick={onLeave}>← Back</button>
          <button className="refresh-btn">⟲ Refresh</button>
        </div>

        {/* Game Info Bar */}
        <div className="game-info-bar">
          <div className="info-item">
            <div className="info-label">Game ID</div>
            <div className="info-value">KEB{String(gameId).padStart(6, '0')}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Players</div>
            <div className="info-value">{game?.current_players || 0}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Bet</div>
            <div className="info-value">{game?.bet_amount || 0}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Derash</div>
            <div className="info-value">{game?.prize_pool || 0}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Called</div>
            <div className="info-value">{calledNumbers.length}</div>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="beteseb-layout">
          {/* Left Side - 1-75 Number Grid */}
          <div className="numbers-grid-75">
            {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
              <div
                key={num}
                className={`grid-number ${calledNumbers.includes(num) ? 'called' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Right Side - Spectator Area */}
          <div className="game-area">
            {/* Live Ball Display */}
            {lastBall && (
              <div className="live-ball-display">
                <div className="ball-container">
                  <div className="ball-letter">
                    {lastBall <= 15 ? 'B' : lastBall <= 30 ? 'I' : lastBall <= 45 ? 'N' : lastBall <= 60 ? 'G' : 'O'}-{lastBall}
                  </div>
                  <div className="ball-animation">{lastBall}</div>
                </div>
              </div>
            )}

            <div className="spectator-message">
              <h2>👁️ Spectator Mode</h2>
              <p>You are watching this game</p>
              <p>Join a game to play and win prizes!</p>
            </div>

            <button className="btn btn-primary btn-large" onClick={onLeave}>
              🎮 Join a Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="beteseb-game">
      {/* Game Header - Beteseb Style */}
      <div className="beteseb-header">
        <button className="back-btn" onClick={onLeave}>← Back</button>
        <button className="refresh-btn">⟲ Refresh</button>
      </div>

      {/* Game Info Bar */}
      <div className="game-info-bar">
        <div className="info-item">
          <div className="info-label">Main Wallet</div>
          <div className="info-value">{Math.floor(user.main_wallet_balance)}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Play Wallet</div>
          <div className="info-value">{Math.floor(user.play_wallet_balance)}</div>
        </div>
        <div className="info-item">
          <div className="info-label">Stake</div>
          <div className="info-value">{game?.bet_amount || 0}</div>
        </div>
        <div className="info-item timer">
          <div className="info-value">{gameTimer} s</div>
        </div>
      </div>

      {/* Main Game Layout */}
      <div className="beteseb-layout">
        {/* Left Side - 1-75 Number Grid */}
        <div className="numbers-grid-75">
          {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
            <div
              key={num}
              className={`grid-number ${calledNumbers.includes(num) ? 'called' : ''}`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Right Side - Game Area */}
        <div className="game-area">
          {/* Live Ball Display */}
          {lastBall && (
            <div className="live-ball-display">
              <div className="ball-container">
                <div className="ball-letter">
                  {lastBall <= 15 ? 'B' : lastBall <= 30 ? 'I' : lastBall <= 45 ? 'N' : lastBall <= 60 ? 'G' : 'O'}-{lastBall}
                </div>
                <div className="ball-animation">{lastBall}</div>
              </div>
            </div>
          )}

          {/* Auto-daub Toggle */}
          <div className="auto-daub-control">
            <span>Automatic</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoDaub}
                onChange={(e) => setAutoDaub(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* BINGO Letters Header */}
          <div className="bingo-letters">
            {columns.map((letter, index) => (
              <div key={letter} className={`bingo-letter letter-${letter.toLowerCase()}`}>
                {letter}
              </div>
            ))}
          </div>

          {/* User's Bingo Card */}
          <div className="user-bingo-card">
            {ticket && ticket.map((column, colIndex) => (
              <div key={colIndex} className="card-column">
                {column.map((cell, rowIndex) => {
                  const cellKey = `${colIndex}-${rowIndex}`;
                  const isMarked = markedCells.includes(cellKey);
                  const isFree = cell === 'FREE';
                  const isCalled = calledNumbers.includes(cell);
                  
                  return (
                    <div
                      key={cellKey}
                      className={`bingo-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free' : ''} ${isCalled && !isMarked ? 'called' : ''}`}
                      onClick={() => !isFree && toggleCell(colIndex, rowIndex)}
                    >
                      {isFree ? '★' : cell}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Card Number */}
          <div className="card-number">
            Cartela No: {Math.floor(Math.random() * 100) + 1}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="bottom-actions">
        <button className="action-btn leave-btn" onClick={onLeave}>
          Leave
        </button>
        <button className="action-btn refresh-btn">
          ⟲ Refresh
        </button>
        <button 
          className={`action-btn auto-btn ${autoDaub ? 'active' : ''}`}
          onClick={() => setAutoDaub(!autoDaub)}
        >
          Automatic
        </button>
      </div>

      {/* Win Modal */}
      {showWinModal && winData && (
        <div className="win-modal">
          <div className="win-content">
            <div className="crown-icon">👑</div>
            <h2 className="win-title">BINGO!</h2>
            <div className="win-info">
              🎉 {winData.winners?.length > 1 ? `${winData.winners.length} players won!` : 'You won!'}
            </div>
            
            <div className="winner-badges">
              {winData.winners?.slice(0, 2).map((winner, index) => (
                <div key={index} className="winner-badge">
                  <span className="winner-initial">{winner.username?.charAt(0) || 'W'}</span>
                  <span className="winner-number">#{winner.cardId || (index + 1)}</span>
                </div>
              ))}
            </div>

            <div className="winning-card">
              <div className="winning-card-title">🏆 Winning Cartela: {winData.cardId || Math.floor(Math.random() * 100)}</div>
              
              <div className="winning-bingo-letters">
                {columns.map((letter, index) => (
                  <div key={letter} className={`winning-letter letter-${letter.toLowerCase()}`}>
                    {letter}
                  </div>
                ))}
              </div>

              {/* Show winning pattern on card */}
              <div className="winning-bingo-card">
                {ticket && ticket.map((column, colIndex) => (
                  <div key={colIndex} className="winning-column">
                    {column.map((cell, rowIndex) => {
                      const cellKey = `${colIndex}-${rowIndex}`;
                      const isMarked = markedCells.includes(cellKey);
                      const isFree = cell === 'FREE';
                      
                      return (
                        <div
                          key={cellKey}
                          className={`winning-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free' : ''}`}
                        >
                          {isFree ? '★' : cell}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="auto-start-notice">
              ● Auto-starting next game in 2s
            </div>
          </div>
        </div>
      )}

      {/* Penalty Modal */}
      {showPenaltyModal && (
        <div className="penalty-modal">
          <div className="modal-content penalty">
            <div className="penalty-icon">⚠️</div>
            <h2>ያልተሟላ መስመር!</h2>
            <p className="penalty-text">{penaltyMessage}</p>
            <p className="ban-notice">ከጨዋታው ታግደዋል።</p>
            <p className="ban-duration">Banned for 30 minutes</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BingoGame;
