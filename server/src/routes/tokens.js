const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const auth = require('../middleware/auth');

// All token routes require authentication
router.use(auth);

// Get token balance and status
router.get('/balance', tokenController.getBalance);

// Claim daily token reward
router.post('/claim-daily', tokenController.claimDaily);

// Claim ad reward
router.post('/claim-ad-reward', tokenController.claimAdReward);

// Spend tokens
router.post('/spend', tokenController.spendTokens);

module.exports = router; 