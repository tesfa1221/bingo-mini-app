const express = require('express');
const router = express.Router();
const { checkAuth, checkAdmin } = require('../middleware/auth');
const { startGame } = require('../socket/gameSocket');

router.post('/game/start/:gameId', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { io } = require('../index');
    
    await startGame(io, gameId);
    
    res.json({ message: 'Game started successfully' });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

module.exports = router;
