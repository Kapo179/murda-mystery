const express = require('express');
const router = express.Router();
const matchmakingController = require('../controllers/matchmaking.controller');
const auth = require('../middleware/auth');

// All matchmaking routes require authentication
router.use(auth);

// Get all public lobbies
router.get('/lobbies', matchmakingController.getPublicLobbies);

// Get details for a specific lobby
router.get('/lobbies/:code', matchmakingController.getLobbyDetails);

// Create a new lobby
router.post('/lobbies', matchmakingController.createLobby);

// Join a lobby
router.post('/lobbies/:code/join', matchmakingController.joinLobby);

// Leave a lobby
router.post('/lobbies/:code/leave', matchmakingController.leaveLobby);

// Start a game from a lobby
router.post('/lobbies/:code/start', matchmakingController.startGame);

// Update lobby settings
router.put('/lobbies/:code/settings', matchmakingController.updateSettings);

module.exports = router; 