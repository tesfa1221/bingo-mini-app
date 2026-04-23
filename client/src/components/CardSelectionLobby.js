import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://bingo-mini-app-sily.onrender.com';

function CardSelectionLobby({ gameId, user, socket, initData, onStartGame, onLeave }) {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [previewCard, setPreviewCard] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [timer, setTimer] = useState(60);
  const [confirmed, setConfirmed] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  useEffect(() => {
    checkPlayerStatus();
    fetchCardStatus();
    
    socket.emit('join_card_lobby', { gameId, userId: user.id });
    
    socket.on('card_status_update', (data) => {
      setCards(data.cards);
    });
    
    socket.on('registration_timer', (data) => {
      setTimer(data.timeLeft);
      
      if (data.timeLeft === 0) {
        // Timer expired, start game
        onStartGame();
      }
    });
    
    socket.on('game_starting', () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      onStartGame();
    });
    
    return () => {
      socket.off('card_status_update');
      socket.off('registration_timer');
      socket.off('game_starting');
    };
  }, [gameId, user.id, socket]);

  const checkPlayerStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/${gameId}/status`, {
        headers: { 'x-telegram-init-data': initData }
      });
      
      setIsSpectator(response.data.isSpectator);
      setConfirmed(response.data.isPlaying);
      
      if (response.data.isPlaying && response.data.ticket) {
        // User already has a card selected
        setSelectedCard(response.data.ticket.card_id);
      }
    } catch (error) {
      console.error('Check player status error:', error);
    }
  };

  const fetchCardStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/game/${gameId}/cards`, {
        headers: { 'x-telegram-init-data': initData }
      });
      setCards(response.data.cards);
    } catch (error) {
      console.error('Fetch card status error:', error);
    }
  };

  const handleCardClick = async (cardId) => {
    if (confirmed || isSpectator) return;
    
    const card = cards.find(c => c.card_id === cardId);
    if (card && card.status !== 'available') return;
    
    // Fetch card preview
    try {
      const response = await axios.get(`${API_URL}/api/game/card/${cardId}/preview`, {
        headers: { 'x-telegram-init-data': initData }
      });
      
      setPreviewCard(response.data.card);
      setSelectedCard(cardId);
      setShowPreview(true);
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (error) {
      console.error('Fetch card preview error:', error);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedCard) return;
    
    try {
      await axios.post(
        `${API_URL}/api/game/${gameId}/select-card`,
        { cardId: selectedCard },
        { headers: { 'x-telegram-init-data': initData } }
      );
      
      setConfirmed(true);
      setShowPreview(false);
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      socket.emit('card_selected', { gameId, cardId: selectedCard, userId: user.id });
    } catch (error) {
      console.error('Confirm selection error:', error);
      alert('Failed to select card: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewCard(null);
  };

  const getCardStatus = (cardId) => {
    const card = cards.find(c => c.card_id === cardId);
    if (!card) return 'available';
    return card.status;
  };

  const getCardClass = (cardId) => {
    const status = getCardStatus(cardId);
    const isSelected = selectedCard === cardId && confirmed;
    
    if (isSelected) return 'card-item selected-confirmed';
    if (status === 'confirmed' || status === 'selected') return 'card-item taken';
    return 'card-item available';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="card-selection-lobby">
      <div className="lobby-header">
        <button className="btn btn-secondary" onClick={onLeave}>← Back</button>
        <div className="timer-display">
          <span className="timer-label">Registration Timer</span>
          <span className={`timer-value ${timer <= 10 ? 'urgent' : ''}`}>
            {formatTime(timer)}
          </span>
        </div>
      </div>

      <div className="lobby-title">
        <h2>መጫወቻ ካርድ - Select Your Card</h2>
        <p className="subtitle">
          {isSpectator 
            ? '👁️ Spectator Mode - Watching players select cards...' 
            : confirmed 
              ? '✅ Card confirmed! Waiting for game to start...' 
              : 'Choose a card from 1-100'}
        </p>
      </div>

      <div className="cards-grid-100">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(cardId => (
          <div
            key={cardId}
            className={getCardClass(cardId)}
            onClick={() => handleCardClick(cardId)}
          >
            {cardId}
          </div>
        ))}
      </div>

      {showPreview && previewCard && (
        <div className="card-preview-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Card #{selectedCard} Preview</h3>
              <button className="close-btn" onClick={handleCancelPreview}>×</button>
            </div>
            
            <div className="preview-card">
              <div className="card-header">
                {columns.map(letter => (
                  <div key={letter} className="column-header">{letter}</div>
                ))}
              </div>
              <div className="card-grid">
                {previewCard.map((column, colIndex) => (
                  <div key={colIndex} className="card-column">
                    {column.map((cell, rowIndex) => (
                      <div
                        key={`${colIndex}-${rowIndex}`}
                        className={`bingo-cell ${cell === 'FREE' ? 'free' : ''}`}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancelPreview}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmSelection}>
                ✅ Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color taken"></span>
          <span>Taken</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Your Card</span>
        </div>
      </div>
    </div>
  );
}

export default CardSelectionLobby;
