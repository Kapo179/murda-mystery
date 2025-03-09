const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobby.controller');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all public lobbies
router.get('/', lobbyController.getPublicLobbies);

// Get a specific lobby by code
router.get('/:code', lobbyController.getLobbyByCode);

// Create a new lobby
router.post('/', lobbyController.createLobby);

// Join a lobby by code (in request body)
router.post('/join', lobbyController.joinLobby);

// Leave a specific lobby
router.post('/:code/leave', lobbyController.leaveLobby);

// Start a game from a lobby (host only)
router.post('/:code/start', lobbyController.startGame);

module.exports = router; 