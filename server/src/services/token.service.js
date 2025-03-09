const User = require('../models/User');

/**
 * Claim daily tokens for a user
 * @param {string} userId - The user's ID
 * @param {number} tokens - Number of tokens to award (default: 50)
 * @param {number} cooldownHours - Hours before user can claim again (default: 24)
 * @returns {number} New token balance
 */
async function claimDailyTokens(userId, tokens = 50, cooldownHours = 24) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();
  if (user.lastTokenClaimTime && (now - user.lastTokenClaimTime) < cooldownHours * 60 * 60 * 1000) {
    const timeLeft = cooldownHours * 60 * 60 * 1000 - (now - user.lastTokenClaimTime);
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    throw new Error(`Daily reward already claimed. Available again in ${hoursLeft}h ${minutesLeft}m.`);
  }

  user.tokenBalance += tokens;
  user.lastTokenClaimTime = now;
  await user.save();
  return {
    tokenBalance: user.tokenBalance,
    tokensAdded: tokens,
    nextClaimTime: new Date(now.getTime() + cooldownHours * 60 * 60 * 1000)
  };
}

/**
 * Award tokens to a user for watching an ad
 * @param {string} userId - The user's ID
 * @param {number} tokens - Number of tokens to award (default: 20)
 * @returns {number} New token balance
 */
async function applyAdReward(userId, tokens = 20) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // TODO: Implement validation with ad network callback
  // For now, we're just awarding tokens directly

  user.tokenBalance += tokens;
  user.totalAdsWatched += 1;
  await user.save();
  
  return {
    tokenBalance: user.tokenBalance,
    tokensAdded: tokens,
    totalAdsWatched: user.totalAdsWatched
  };
}

/**
 * Get the current token balance for a user
 * @param {string} userId - The user's ID
 * @returns {Object} Token details with balance and next claim time
 */
async function getTokenBalance(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  // Calculate time until next daily claim
  let nextClaimTime = null;
  let canClaimDaily = true;
  
  if (user.lastTokenClaimTime) {
    const cooldownHours = 24;
    const now = new Date();
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const lastClaim = new Date(user.lastTokenClaimTime);
    
    if ((now - lastClaim) < cooldownMs) {
      canClaimDaily = false;
      nextClaimTime = new Date(lastClaim.getTime() + cooldownMs);
    }
  }
  
  return {
    tokenBalance: user.tokenBalance,
    canClaimDaily,
    nextClaimTime,
    totalAdsWatched: user.totalAdsWatched
  };
}

/**
 * Spend tokens on a purchase
 * @param {string} userId - The user's ID
 * @param {number} amount - Amount of tokens to spend
 * @param {string} item - What the tokens are being spent on
 * @returns {Object} New token balance and purchase details
 */
async function spendTokens(userId, amount, item) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  if (user.tokenBalance < amount) {
    throw new Error('Insufficient tokens for this purchase');
  }
  
  user.tokenBalance -= amount;
  await user.save();
  
  // TODO: Implement purchase history tracking
  
  return {
    tokenBalance: user.tokenBalance,
    tokensSpent: amount,
    item
  };
}

module.exports = { 
  claimDailyTokens, 
  applyAdReward, 
  getTokenBalance,
  spendTokens
}; 