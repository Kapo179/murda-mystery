const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  lobbyCode: { 
    type: String, 
    unique: true,
    required: true
  },
  isPrivate: { 
    type: Boolean, 
    default: false 
  },
  players: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: { 
    type: String, 
    enum: ['waiting', 'starting', 'in-game', 'ended'],
    default: 'waiting' 
  },
  maxPlayers: {
    type: Number,
    default: 16
  },
  gameSettings: {
    numberOfMurderers: { 
      type: Number, 
      default: 1 
    },
    numberOfDetectives: { 
      type: Number, 
      default: 1 
    }
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Lobby', LobbySchema); 