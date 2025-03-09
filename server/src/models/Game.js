const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['murderer', 'detective', 'citizen'],
      default: 'citizen'
    },
    isReady: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting'
  },
  location: {
    latitude: Number,
    longitude: Number,
    name: String
  },
  settings: {
    maxPlayers: {
      type: Number,
      default: 16
    },
    minPlayers: {
      type: Number,
      default: 5
    },
    numberOfMurderers: {
      type: Number,
      default: 1
    },
    numberOfDetectives: {
      type: Number,
      default: 2
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Game', GameSchema); 