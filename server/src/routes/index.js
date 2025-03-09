const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const lobbyController = require('../controllers/lobby.controller');
const killcamController = require('../controllers/killcam.controller');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Token Routes
router.get('/tokens/balance', tokenController.getBalance);
router.post('/tokens/daily', tokenController.claimDaily);
router.post('/tokens/adReward', tokenController.claimAdReward);
router.post('/tokens/spend', tokenController.spendTokens);

// Lobby Routes
router.get('/lobbies', lobbyController.getPublicLobbies);
router.get('/lobbies/:code', lobbyController.getLobbyByCode);
router.post('/lobbies/create', lobbyController.createLobby);
router.post('/lobbies/join', lobbyController.joinLobby);
router.post('/lobbies/:code/leave', lobbyController.leaveLobby);
router.post('/lobbies/:code/start', lobbyController.startGame);

// KillCam Routes
router.post('/killcam/save', killcamController.saveKillCam);
router.get('/killcam/list', killcamController.getUserKillCams);
router.get('/killcam/:id', killcamController.getKillCamById);

module.exports = router; 