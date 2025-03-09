const matchmakingService = require('../services/matchmaking.service');

/**
 * @route   POST api/lobbies
 * @desc    Create a new game lobby
 * @access  Private
 */
exports.createLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isPrivate, maxPlayers, gameSettings } = req.body;
    
    const lobby = await matchmakingService.createLobby(
      userId, 
      isPrivate, 
      { maxPlayers, ...gameSettings }
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Lobby created successfully',
      lobby: {
        id: lobby._id,
        code: lobby.lobbyCode,
        isPrivate: lobby.isPrivate,
        players: lobby.players,
        host: lobby.hostId,
        maxPlayers: lobby.maxPlayers
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
 * @route   POST api/lobbies/join
 * @desc    Join an existing lobby by code
 * @access  Private
 */
exports.joinLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Lobby code is required'
      });
    }
    
    const lobby = await matchmakingService.joinLobby(userId, code);
    
    res.json({ 
      success: true, 
      message: 'Successfully joined lobby',
      lobby: {
        id: lobby._id,
        code: lobby.lobbyCode,
        players: lobby.players,
        host: lobby.hostId,
        maxPlayers: lobby.maxPlayers
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
 * @route   GET api/lobbies
 * @desc    Get list of available public lobbies
 * @access  Private
 */
exports.getPublicLobbies = async (req, res) => {
  try {
    const lobbies = await matchmakingService.findPublicLobbies();
    
    res.json({
      success: true,
      count: lobbies.length,
      lobbies
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
 * @route   GET api/lobbies/:code
 * @desc    Get details about a specific lobby
 * @access  Private
 */
exports.getLobbyByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const lobby = await matchmakingService.getLobbyDetails(code);
    
    res.json({
      success: true,
      lobby
    });
  } catch (err) {
    console.error('Error fetching lobby:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * @route   POST api/lobbies/:code/leave
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
      message: result.message
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
 * @route   POST api/lobbies/:code/start
 * @desc    Start a game from lobby (host only)
 * @access  Private
 */
exports.startGame = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { code } = req.params;
    
    const result = await matchmakingService.startGame(hostId, code);
    
    res.json({
      success: true,
      message: 'Game started successfully',
      gameStatus: result.status
    });
  } catch (err) {
    console.error('Error starting game:', err.message);
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
}; 