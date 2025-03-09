const express = require('express');
const router = express.Router();
const KillCam = require('../models/KillCam');
const auth = require('../middleware/auth');

// @route   POST api/killcams
// @desc    Create a new KillCam entry
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { gameId, victimId, videoUrl, location, thumbnailUrl } = req.body;
    
    // Create a new KillCam entry with the authenticated user as killer
    const killCam = new KillCam({
      gameId,
      killerId: req.user.id,
      victimId,
      videoUrl,
      thumbnailUrl,
      location
    });
    
    await killCam.save();
    
    res.status(201).json({
      success: true,
      killCam
    });
  } catch (err) {
    console.error('Error creating KillCam entry:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET api/killcams/game/:gameId
// @desc    Get all KillCam entries for a game
// @access  Private
router.get('/game/:gameId', auth, async (req, res) => {
  try {
    const killCams = await KillCam.find({ gameId: req.params.gameId })
      .populate('killerId', 'username avatar')
      .populate('victimId', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: killCams.length,
      killCams
    });
  } catch (err) {
    console.error('Error fetching KillCam entries:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET api/killcams/killer/:userId
// @desc    Get all KillCam entries by a specific killer
// @access  Private
router.get('/killer/:userId', auth, async (req, res) => {
  try {
    const killCams = await KillCam.find({ killerId: req.params.userId })
      .populate('victimId', 'username avatar')
      .populate('gameId', 'code')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: killCams.length,
      killCams
    });
  } catch (err) {
    console.error('Error fetching killer KillCam entries:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET api/killcams/victim/:userId
// @desc    Get all KillCam entries for a specific victim
// @access  Private
router.get('/victim/:userId', auth, async (req, res) => {
  try {
    const killCams = await KillCam.find({ victimId: req.params.userId })
      .populate('killerId', 'username avatar')
      .populate('gameId', 'code')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: killCams.length,
      killCams
    });
  } catch (err) {
    console.error('Error fetching victim KillCam entries:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET api/killcams/:id
// @desc    Get a KillCam entry by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const killCam = await KillCam.findById(req.params.id)
      .populate('killerId', 'username avatar')
      .populate('victimId', 'username avatar')
      .populate('gameId', 'code');
    
    if (!killCam) {
      return res.status(404).json({ 
        success: false, 
        message: 'KillCam entry not found' 
      });
    }
    
    // Mark as viewed if it's the victim viewing it
    if (req.user.id === killCam.victimId.toString() && !killCam.viewed) {
      killCam.viewed = true;
      await killCam.save();
    }
    
    res.json({
      success: true,
      killCam
    });
  } catch (err) {
    console.error('Error fetching KillCam entry:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   DELETE api/killcams/:id
// @desc    Delete a KillCam entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const killCam = await KillCam.findById(req.params.id);
    
    if (!killCam) {
      return res.status(404).json({ 
        success: false, 
        message: 'KillCam entry not found' 
      });
    }
    
    // Check if user is the killer or has admin rights (to be implemented)
    if (killCam.killerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this KillCam entry' 
      });
    }
    
    await killCam.remove();
    
    res.json({
      success: true,
      message: 'KillCam entry deleted'
    });
  } catch (err) {
    console.error('Error deleting KillCam entry:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router; 