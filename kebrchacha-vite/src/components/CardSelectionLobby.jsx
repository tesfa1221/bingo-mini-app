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
    
    if (isSelected) return 'bg-kebrchacha-green text-black border-kebrchacha-green';
    if (status === 'confirmed' || status === 'selected') return 'bg-white/20 text-white/50 border-white/20 cursor-not-allowed';
    return 'bg-white/10 text-white border-white/20 hover:bg-kebrchacha-green/20 hover:border-kebrchacha-green cursor-pointer';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const columns = ['B', 'I', 'N', 'G', 'O'];

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
        <div className="text-center">
          <div className="text-sm text-white/70">Registration Timer</div>
          <div className={`text-xl font-bold ${timer <= 10 ? 'text-red-400 animate-pulse' : 'text-kebrchacha-green'}`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-kebrchacha-gold">መጫወቻ ካርድ - Select Your Card</h2>
          <p className="text-white/70">
            {isSpectator 
              ? '👁️ Spectator Mode - Watching players select cards...' 
              : confirmed 
                ? '✅ Card confirmed! Waiting for game to start...' 
                : 'Choose a card from 1-100'}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-10 gap-2 mb-8">
          {Array.from({ length: 100 }, (_, i) => i + 1).map(cardId => (
            <button
              key={cardId}
              className={`aspect-square flex items-center justify-center rounded-lg font-semibold text-sm border-2 transition-all duration-300 ${getCardClass(cardId)}`}
              onClick={() => handleCardClick(cardId)}
              disabled={isSpectator || confirmed}
            >
              {cardId}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/10 border border-white/20 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 border border-white/20 rounded"></div>
            <span>Taken</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-kebrchacha-green border border-kebrchacha-green rounded"></div>
            <span>Your Card</span>
          </div>
        </div>
      </div>

      {/* Card Preview Modal */}
      {showPreview && previewCard && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-kebrchacha-dark/90 backdrop-blur-md border border-kebrchacha-gold/30 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-kebrchacha-gold">Card #{selectedCard} Preview</h3>
              <button 
                className="text-white/60 hover:text-white text-2xl"
                onClick={handleCancelPreview}
              >
                ×
              </button>
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
            
            {/* Card Grid */}
            <div className="grid grid-cols-5 gap-1 mb-6">
              {previewCard.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {column.map((cell, rowIndex) => (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      className={`aspect-square flex items-center justify-center rounded text-sm font-semibold ${
                        cell === 'FREE' 
                          ? 'bg-kebrchacha-green text-black' 
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      {cell === 'FREE' ? '★' : cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 bg-white/10 text-white font-bold py-3 px-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                onClick={handleCancelPreview}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-gradient-to-r from-kebrchacha-green to-kebrchacha-blue text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                onClick={handleConfirmSelection}
              >
                ✅ Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardSelectionLobby;