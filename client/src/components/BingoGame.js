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

  useEffect(() => {
    fetchGameData();
    
    socket.emit('join_game', { gameId, userId: user.id });
    
    socket.on('game_state', (data) => {
      setGame(data.game);
      setCalledNumbers(data.calledNumbers);
      
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
        
        // Enable BINGO button after 5 balls
        if (updated.length >= 5) {
          setBingoEnabled(true);
        }
        
        return updated;
      });
      
      setTimeout(() => setLastBall(null), 3000);
    });
    
    socket.on('game_won', (data) => {
      const message = data.winners.length > 1
        ? `🎉 ${data.winners.length} winners! Each won ${data.prizePerWinner} ETB!`
        : `🎉 ${data.winnerName} won ${data.prizeAmount} ETB!`;
      
      alert(message);
      setTimeout(() => onLeave(), 2000);
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
  }, [gameId, user.id, socket]);

  const fetchGameData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/${gameId}`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setGame(response.data.game);
      
      const ticketResponse = await axios.get(`${API_URL}/api/game/${gameId}/ticket`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setTicket(JSON.parse(ticketResponse.data.ticket.grid_data));
      
      // Load existing marked cells
      const existingMarked = JSON.parse(ticketResponse.data.ticket.marked_cells || '[]');
      setMarkedCells(existingMarked);
    } catch (error) {
      console.error('Fetch game data error:', error);
    }
  };

  const toggleCell = (col, row) => {
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

  if (!game || !ticket) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="bingo-game">
      <div className="game-header">
        <button className="btn btn-secondary" onClick={onLeave}>← Leave</button>
        <div className="game-stats">
          <span className="prize-display">ደራሽ: {game.prize_pool} ETB</span>
          <span className="timer-display">⏱️ {gameTimer}s</span>
        </div>
      </div>

      {lastBall && (
        <div className="last-ball-display">
          <div className="ball-animation">{lastBall}</div>
          <div className="ball-label">Live Ball</div>
        </div>
      )}

      <div className="bingo-card">
        <div className="card-header">
          {columns.map(letter => (
            <div key={letter} className="column-header">{letter}</div>
          ))}
        </div>
        <div className="card-grid">
          {ticket.map((column, colIndex) => (
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
                    {cell}
                    {isMarked && !isFree && <div className="mark-indicator">●</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button 
        className={`btn btn-bingo ${bingoEnabled ? 'enabled' : 'disabled'}`}
        onClick={claimBingo}
        disabled={!bingoEnabled}
      >
        {bingoEnabled ? '🎉 BINGO!' : `⏳ Wait (${5 - calledNumbers.length} more balls)`}
      </button>

      <div className="called-numbers-section">
        <h4>Called Numbers ({calledNumbers.length}/75)</h4>
        <div className="numbers-grid">
          {calledNumbers.map((num, idx) => (
            <span key={idx} className="called-number">{num}</span>
          ))}
        </div>
      </div>

      <div className="game-instructions">
        <p>📌 Click numbers on your card to mark them (only called numbers)</p>
        <p>🎯 Complete any pattern: Row, Column, Diagonal, or Four Corners</p>
        <p>⚠️ False BINGO = Ejection + 30min ban!</p>
      </div>

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
