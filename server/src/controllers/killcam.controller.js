const KillCam = require('../models/KillCam');

/**
 * @route   POST api/killcam/save
 * @desc    Save a new killcam record
 * @access  Private
 */
exports.saveKillCam = async (req, res) => {
  try {
    const killerId = req.user.id;
    const { gameId, victimId, videoUrl, thumbnailUrl, location } = req.body;
    
    // Validate required fields
    if (!gameId || !victimId || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: gameId, victimId, and videoUrl are required'
      });
    }
    
    // Create new killcam record
    const killCam = new KillCam({
      gameId,
      killerId,
      victimId,
      videoUrl,
      thumbnailUrl,
      location
    });
    
    await killCam.save();
    
    res.status(201).json({
      success: true,
      message: 'KillCam saved successfully',
      data: {
        id: killCam._id,
        gameId: killCam.gameId,
        victimId: killCam.victimId,
        createdAt: killCam.createdAt
      }
    });
  } catch (err) {
    console.error('Error saving killcam:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error saving killcam',
      error: err.message
    });
  }
};

/**
 * @route   GET api/killcam/list
 * @desc    Get all killcams for the current user (as killer or victim)
 * @access  Private
 */
exports.getUserKillCams = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all', limit = 20, offset = 0 } = req.query;
    
    let query = {};
    
    // Determine which killcams to fetch based on type
    if (type === 'killer') {
      query.killerId = userId;
    } else if (type === 'victim') {
      query.victimId = userId;
    } else {
      // For 'all', find where user is either killer or victim
      query = {
        $or: [{ killerId: userId }, { victimId: userId }]
      };
    }
    
    // Get total count for pagination
    const total = await KillCam.countDocuments(query);
    
    // Fetch killcams with pagination
    const killCams = await KillCam.find(query)
      .populate('victimId', 'username avatar')
      .populate('killerId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        total,
        offset: parseInt(offset),
        limit: parseInt(limit),
        killCams
      }
    });
  } catch (err) {
    console.error('Error fetching killcams:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching killcams',
      error: err.message
    });
  }
};

/**
 * @route   GET api/killcam/:id
 * @desc    Get a specific killcam by ID
 * @access  Private
 */
exports.getKillCamById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const killCam = await KillCam.findById(id)
      .populate('victimId', 'username avatar')
      .populate('killerId', 'username avatar')
      .populate('gameId', 'code');
    
    if (!killCam) {
      return res.status(404).json({
        success: false,
        message: 'KillCam not found'
      });
    }
    
    // Mark as viewed if viewed by victim
    if (req.user.id === killCam.victimId.toString() && !killCam.viewed) {
      killCam.viewed = true;
      await killCam.save();
    }
    
    res.json({
      success: true,
      data: killCam
    });
  } catch (err) {
    console.error('Error fetching killcam:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching killcam',
      error: err.message
    });
  }
}; 