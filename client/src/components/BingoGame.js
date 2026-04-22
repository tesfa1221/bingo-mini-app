import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

function BingoGame({ gameId, user, socket, initData, onLeave }) {
  const [game, setGame] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [markedCells, setMarkedCells] = useState([]);
  const [autoDaub, setAutoDaub] = useState(true);
  const [lastBall, setLastBall] = useState(null);

  useEffect(() => {
    fetchGameData();
    
    socket.emit('join_game', { gameId, userId: user.id });
    
    socket.on('game_state', (data) => {
      setGame(data.game);
      setCalledNumbers(data.calledNumbers);
    });
    
    socket.on('ball_drawn', (data) => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      setLastBall(data.number);
      setCalledNumbers(prev => [...prev, data.number]);
      
      if (autoDaub && ticket) {
        autoMarkNumber(data.number);
      }
      
      setTimeout(() => setLastBall(null), 3000);
    });
    
    socket.on('game_won', (data) => {
      alert(`🎉 ${data.winnerName} won ${data.prizeAmount} ETB!`);
      onLeave();
    });
    
    socket.on('bingo_error', (data) => {
      alert('❌ ' + data.message);
    });
    
    return () => {
      socket.off('game_state');
      socket.off('ball_drawn');
      socket.off('game_won');
      socket.off('bingo_error');
    };
  }, [gameId, user.id, socket, autoDaub, ticket]);

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
    } catch (error) {
      console.error('Fetch game data error:', error);
    }
  };

  const autoMarkNumber = (number) => {
    if (!ticket) return;
    
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        if (ticket[col][row] === number) {
          const cellKey = `${col}-${row}`;
          setMarkedCells(prev => {
            if (!prev.includes(cellKey)) {
              return [...prev, cellKey];
            }
            return prev;
          });
        }
      }
    }
  };

  const toggleCell = (col, row) => {
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

  const claimBingo = () => {
    socket.emit('claim_bingo', { gameId, userId: user.id });
  };

  if (!game || !ticket) {
    return <div className="loading-screen"><div className="spinner"></div></div>;
  }

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="bingo-game">
      <div className="game-header">
        <button className="btn btn-secondary" onClick={onLeave}>← Back</button>
        <div className="game-stats">
          <span>Prize: {game.prize_pool} ETB</span>
          <span>Called: {calledNumbers.length}</span>
        </div>
      </div>

      {lastBall && (
        <div className="last-ball-display">
          <div className="ball-animation">{lastBall}</div>
        </div>
      )}

      <div className="auto-daub-toggle">
        <label>
          <input
            type="checkbox"
            checked={autoDaub}
            onChange={(e) => setAutoDaub(e.target.checked)}
          />
          Auto-Daub
        </label>
      </div>

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
                    className={`bingo-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free' : ''} ${isCalled ? 'called' : ''}`}
                    onClick={() => !isFree && toggleCell(colIndex, rowIndex)}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-success btn-large" onClick={claimBingo}>
        🎉 BINGO!
      </button>

      <div className="called-numbers">
        <h4>Called Numbers</h4>
        <div className="numbers-grid">
          {calledNumbers.map((num, idx) => (
            <span key={idx} className="called-number">{num}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BingoGame;
