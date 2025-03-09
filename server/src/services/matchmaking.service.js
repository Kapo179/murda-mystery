const Lobby = require('../models/Lobby');
const User = require('../models/User');

/**
 * Generate a random lobby code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} The generated lobby code
 */
function generateLobbyCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new lobby with a host
 * @param {string} hostId - The user ID of the host
 * @param {boolean} isPrivate - Whether the lobby is private (default: false)
 * @param {Object} settings - Optional game settings
 * @returns {Object} The created lobby object
 */
async function createLobby(hostId, isPrivate = false, settings = {}) {
  // Generate unique code
  let code = generateLobbyCode();
  let codeExists = await Lobby.findOne({ lobbyCode: code });
  
  // Ensure code is unique
  while (codeExists) {
    code = generateLobbyCode();
    codeExists = await Lobby.findOne({ lobbyCode: code });
  }
  
  // Set default settings
  const gameSettings = {
    numberOfMurderers: settings.numberOfMurderers || 1,
    numberOfDetectives: settings.numberOfDetectives || 1
  };
  
  // Create lobby
  const lobby = await Lobby.create({
    hostId,
    lobbyCode: code,
    isPrivate,
    players: [hostId],
    gameSettings,
    maxPlayers: settings.maxPlayers || 16
  });
  
  // Populate host details
  const populatedLobby = await Lobby.findById(lobby._id)
    .populate('hostId', 'username avatar')
    .populate('players', 'username avatar');
    
  return populatedLobby;
}

/**
 * Join an existing lobby
 * @param {string} userId - The user ID of the player joining
 * @param {string} code - The lobby code to join
 * @returns {Object} The updated lobby object
 */
async function joinLobby(userId, code) {
  const lobby = await Lobby.findOne({ lobbyCode: code });
  if (!lobby) throw new Error('Lobby not found');
  if (lobby.status !== 'waiting') throw new Error('Lobby is no longer accepting players');
  if (lobby.players.length >= lobby.maxPlayers) throw new Error('Lobby is full');
  
  // Check if player is already in the lobby
  if (lobby.players.includes(userId)) {
    // Player is already in the lobby, just return the lobby
    return await Lobby.findById(lobby._id)
      .populate('hostId', 'username avatar')
      .populate('players', 'username avatar');
  }
  
  // Add player to lobby
  lobby.players.push(userId);
  await lobby.save();
  
  // Return populated lobby
  return await Lobby.findById(lobby._id)
    .populate('hostId', 'username avatar')
    .populate('players', 'username avatar');
}

/**
 * Leave a lobby
 * @param {string} userId - The user ID of the player leaving
 * @param {string} code - The lobby code
 * @returns {Object} Result including status and message
 */
async function leaveLobby(userId, code) {
  const lobby = await Lobby.findOne({ lobbyCode: code });
  if (!lobby) throw new Error('Lobby not found');
  
  // If player is not in the lobby
  if (!lobby.players.includes(userId)) {
    throw new Error('You are not in this lobby');
  }
  
  // If leaving user is the host
  if (lobby.hostId.toString() === userId) {
    // If there are other players, assign a new host
    if (lobby.players.length > 1) {
      // Find first player who isn't the current host
      const newHostId = lobby.players.find(id => id.toString() !== userId);
      lobby.hostId = newHostId;
      
      // Remove the leaving user
      lobby.players = lobby.players.filter(id => id.toString() !== userId);
      await lobby.save();
      
      return {
        status: 'transferred',
        message: 'Left lobby. Host privileges transferred.',
        newHostId,
        lobbyId: lobby._id
      };
    } else {
      // Host is the only player, delete the lobby
      await Lobby.findByIdAndDelete(lobby._id);
      return {
        status: 'deleted',
        message: 'Lobby deleted as you were the only player.'
      };
    }
  } else {
    // Not the host, just remove from players array
    lobby.players = lobby.players.filter(id => id.toString() !== userId);
    await lobby.save();
    
    return {
      status: 'left',
      message: 'Successfully left the lobby.',
      lobbyId: lobby._id
    };
  }
}

/**
 * Find available public lobbies for matchmaking
 * @param {number} limit - Maximum number of lobbies to return
 * @returns {Array} List of available lobbies
 */
async function findPublicLobbies(limit = 10) {
  const lobbies = await Lobby.find({
    isPrivate: false,
    status: 'waiting'
  })
  .populate('hostId', 'username avatar')
  .sort({ createdAt: -1 })
  .limit(limit);
  
  return lobbies;
}

/**
 * Get detailed information about a lobby
 * @param {string} code - The lobby code
 * @param {boolean} includePlayerDetails - Whether to include detailed player info
 * @returns {Object} The lobby with details
 */
async function getLobbyDetails(code, includePlayerDetails = true) {
  let query = Lobby.findOne({ lobbyCode: code })
    .populate('hostId', 'username avatar');
    
  if (includePlayerDetails) {
    query = query.populate('players', 'username avatar');
  }
  
  const lobby = await query;
  if (!lobby) throw new Error('Lobby not found');
  
  return lobby;
}

/**
 * Start a game from a lobby
 * @param {string} hostId - ID of the user attempting to start
 * @param {string} code - The lobby code
 * @returns {Object} Game start result with status
 */
async function startGame(hostId, code) {
  const lobby = await Lobby.findOne({ lobbyCode: code });
  if (!lobby) throw new Error('Lobby not found');
  
  // Verify the user is the host
  if (lobby.hostId.toString() !== hostId) {
    throw new Error('Only the host can start the game');
  }
  
  // Verify minimum players
  if (lobby.players.length < 4) {
    throw new Error('Need at least 4 players to start a game');
  }
  
  // Change lobby status
  lobby.status = 'starting';
  await lobby.save();
  
  // Return updated lobby (this is where you would generate game state)
  return {
    status: 'starting',
    message: 'Game is starting',
    lobby: await Lobby.findById(lobby._id)
      .populate('hostId', 'username avatar')
      .populate('players', 'username avatar')
  };
}

/**
 * Update lobby settings
 * @param {string} hostId - ID of the host making changes
 * @param {string} code - The lobby code
 * @param {Object} settings - New settings to apply
 * @returns {Object} The updated lobby
 */
async function updateLobbySettings(hostId, code, settings) {
  const lobby = await Lobby.findOne({ lobbyCode: code });
  if (!lobby) throw new Error('Lobby not found');
  
  // Verify the user is the host
  if (lobby.hostId.toString() !== hostId) {
    throw new Error('Only the host can update lobby settings');
  }
  
  // Update allowed settings
  if (typeof settings.isPrivate === 'boolean') {
    lobby.isPrivate = settings.isPrivate;
  }
  
  if (settings.maxPlayers && settings.maxPlayers >= 4 && settings.maxPlayers <= 16) {
    lobby.maxPlayers = settings.maxPlayers;
  }
  
  if (settings.gameSettings) {
    if (settings.gameSettings.numberOfMurderers) {
      lobby.gameSettings.numberOfMurderers = settings.gameSettings.numberOfMurderers;
    }
    
    if (settings.gameSettings.numberOfDetectives) {
      lobby.gameSettings.numberOfDetectives = settings.gameSettings.numberOfDetectives;
    }
  }
  
  await lobby.save();
  
  // Return updated lobby with populated references
  return await Lobby.findById(lobby._id)
    .populate('hostId', 'username avatar')
    .populate('players', 'username avatar');
}

module.exports = { 
  generateLobbyCode, 
  createLobby, 
  joinLobby,
  leaveLobby,
  findPublicLobbies,
  getLobbyDetails,
  startGame,
  updateLobbySettings
}; 