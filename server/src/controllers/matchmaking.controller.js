const matchmakingService = require('../services/matchmaking.service');

/**
 * @route   POST api/matchmaking/lobbies
 * @desc    Create a new lobby
 * @access  Private
 */
exports.createLobby = async (req, res) => {
  try {
    const { isPrivate, settings } = req.body;
    const hostId = req.user.id;
    
    const lobby = await matchmakingService.createLobby(
      hostId, 
      isPrivate, 
      settings
    );
    
    res.status(201).json({
      success: true,
      message: 'Lobby created successfully',
      data: {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        players: lobby.players.length,
        isPrivate: lobby.isPrivate
      }
    });
  } catch (err) {
    console.error('Error creating lobby:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/matchmaking/lobbies/:code/join
 * @desc    Join an existing lobby
 * @access  Private
 */
exports.joinLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.params;
    
    const lobby = await matchmakingService.joinLobby(userId, code);
    
    res.json({
      success: true,
      message: 'Successfully joined lobby',
      data: {
        lobbyId: lobby._id,
        lobbyCode: lobby.lobbyCode,
        hostId: lobby.hostId,
        playerCount: lobby.players.length,
        players: lobby.players
      }
    });
  } catch (err) {
    console.error('Error joining lobby:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/matchmaking/lobbies/:code/leave
 * @desc    Leave a lobby
 * @access  Private
 */
exports.leaveLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.params;
    
    const result = await matchmakingService.leaveLobby(userId, code);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    console.error('Error leaving lobby:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   GET api/matchmaking/lobbies
 * @desc    Get available public lobbies
 * @access  Private
 */
exports.getPublicLobbies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const lobbies = await matchmakingService.findPublicLobbies(limit);
    
    res.json({
      success: true,
      count: lobbies.length,
      data: lobbies
    });
  } catch (err) {
    console.error('Error fetching lobbies:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   GET api/matchmaking/lobbies/:code
 * @desc    Get details of a specific lobby
 * @access  Private
 */
exports.getLobbyDetails = async (req, res) => {
  try {
    const { code } = req.params;
    const includePlayerDetails = req.query.players !== 'false';
    
    const lobby = await matchmakingService.getLobbyDetails(code, includePlayerDetails);
    
    res.json({
      success: true,
      data: lobby
    });
  } catch (err) {
    console.error('Error fetching lobby details:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/matchmaking/lobbies/:code/start
 * @desc    Start a game from a lobby
 * @access  Private
 */
exports.startGame = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { code } = req.params;
    
    const result = await matchmakingService.startGame(hostId, code);
    
    res.json({
      success: true,
      message: 'Game starting',
      data: result
    });
  } catch (err) {
    console.error('Error starting game:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   PUT api/matchmaking/lobbies/:code/settings
 * @desc    Update lobby settings
 * @access  Private
 */
exports.updateSettings = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { code } = req.params;
    const settings = req.body;
    
    const lobby = await matchmakingService.updateLobbySettings(hostId, code, settings);
    
    res.json({
      success: true,
      message: 'Lobby settings updated',
      data: lobby
    });
  } catch (err) {
    console.error('Error updating lobby settings:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}; 