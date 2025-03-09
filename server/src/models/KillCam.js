const mongoose = require('mongoose');

const KillCamSchema = new mongoose.Schema({
  gameId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game',
    required: true
  },
  killerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  victimId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  videoUrl: { 
    type: String,
    required: true 
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  viewed: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('KillCam', KillCamSchema); 