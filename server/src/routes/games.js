const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// @route   POST api/games
// @desc    Create a new game
// @access  Private
router.post('/', async (req, res) => {
  try {
    // Note: This would normally use auth middleware to get the user ID
    // For now, we'll use a placeholder
    const creatorId = '000000000000000000000000'; // Placeholder user ID
    
    const { location, settings } = req.body;
    
    // Generate a unique 6-character game code
    const generateGameCode = () => {
      const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return code;
    };
    
    let code = generateGameCode();
    let codeExists = await Game.findOne({ code });
    
    // Ensure code is unique
    while (codeExists) {
      code = generateGameCode();
      codeExists = await Game.findOne({ code });
    }
    
    // Create new game
    const game = new Game({
      code,
      creator: creatorId,
      players: [{ user: creatorId, role: 'citizen', isReady: false }],
      location,
      settings
    });
    
    await game.save();
    
    res.status(201).json({
      game: {
        id: game._id,
        code: game.code,
        players: game.players.length,
        status: game.status
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/games/:code
// @desc    Get game by code
// @access  Public
router.get('/:code', async (req, res) => {
  try {
    const game = await Game.findOne({ code: req.params.code }).populate('players.user', 'username avatar');
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    res.json(game);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/games/:code/join
// @desc    Join a game
// @access  Private
router.post('/:code/join', async (req, res) => {
  try {
    // Note: This would normally use auth middleware to get the user ID
    // For now, we'll use a placeholder
    const userId = '000000000000000000000000'; // Placeholder user ID
    
    const game = await Game.findOne({ code: req.params.code });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Cannot join a game that is already in progress or completed' });
    }
    
    if (game.players.length >= game.settings.maxPlayers) {
      return res.status(400).json({ message: 'Game is full' });
    }
    
    // Check if user is already in the game
    const existingPlayer = game.players.find(player => player.user.toString() === userId);
    if (existingPlayer) {
      return res.status(400).json({ message: 'You are already in this game' });
    }
    
    // Add user to game
    game.players.push({
      user: userId,
      role: 'citizen',
      isReady: false
    });
    
    await game.save();
    
    res.json({
      message: 'Successfully joined game',
      game: {
        id: game._id,
        code: game.code,
        players: game.players.length,
        status: game.status
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/games/:code/start
// @desc    Start a game
// @access  Private
router.put('/:code/start', async (req, res) => {
  try {
    // Note: This would normally use auth middleware to get the user ID
    // For now, we'll use a placeholder
    const userId = '000000000000000000000000'; // Placeholder user ID
    
    const game = await Game.findOne({ code: req.params.code });
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Verify user is the creator
    if (game.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the game creator can start the game' });
    }
    
    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Game has already started or ended' });
    }
    
    if (game.players.length < game.settings.minPlayers) {
      return res.status(400).json({ 
        message: `Not enough players. Minimum required: ${game.settings.minPlayers}` 
      });
    }
    
    // Assign roles
    const playerCount = game.players.length;
    const murdererCount = game.settings.numberOfMurderers;
    const detectiveCount = game.settings.numberOfDetectives;
    
    // Randomly assign roles
    const playerIndices = Array.from({ length: playerCount }, (_, i) => i);
    const shuffledIndices = playerIndices.sort(() => Math.random() - 0.5);
    
    // Assign murderers
    for (let i = 0; i < murdererCount; i++) {
      game.players[shuffledIndices[i]].role = 'murderer';
    }
    
    // Assign detectives
    for (let i = murdererCount; i < murdererCount + detectiveCount; i++) {
      game.players[shuffledIndices[i]].role = 'detective';
    }
    
    // Update game status
    game.status = 'in-progress';
    
    await game.save();
    
    res.json({
      message: 'Game started successfully',
      game: {
        id: game._id,
        code: game.code,
        status: game.status
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 