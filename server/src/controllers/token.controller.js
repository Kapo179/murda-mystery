const tokenService = require('../services/token.service');

/**
 * @route   GET api/tokens/balance
 * @desc    Get user's token balance and status
 * @access  Private
 */
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenData = await tokenService.getTokenBalance(userId);
    res.json({
      success: true,
      data: tokenData
    });
  } catch (err) {
    console.error('Error getting token balance:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/tokens/claim-daily
 * @desc    Claim daily token reward
 * @access  Private
 */
exports.claimDaily = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await tokenService.claimDailyTokens(userId);
    res.json({
      success: true,
      message: 'Daily tokens claimed successfully!',
      data: result
    });
  } catch (err) {
    console.error('Error claiming daily tokens:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/tokens/claim-ad-reward
 * @desc    Claim reward for watching an ad
 * @access  Private
 */
exports.claimAdReward = async (req, res) => {
  try {
    const userId = req.user.id;
    // You could include validation data from the ad network
    const adValidationData = req.body.validationData;
    
    // For now, we're not validating with the ad network
    const result = await tokenService.applyAdReward(userId);
    
    res.json({
      success: true,
      message: 'Ad reward claimed successfully!',
      data: result
    });
  } catch (err) {
    console.error('Error claiming ad reward:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/tokens/spend
 * @desc    Spend tokens on an item
 * @access  Private
 */
exports.spendTokens = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, item } = req.body;
    
    if (!amount || !item) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both amount and item'
      });
    }
    
    const result = await tokenService.spendTokens(userId, amount, item);
    
    res.json({
      success: true,
      message: `Successfully purchased ${item}`,
      data: result
    });
  } catch (err) {
    console.error('Error spending tokens:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}; 