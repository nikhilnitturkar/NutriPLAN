const express = require('express');
const { body, validationResult } = require('express-validator');
const ProgressLog = require('../models/ProgressLog');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get all progress logs for the authenticated trainer
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const progressLogs = await ProgressLog.find({ trainerId: req.trainer._id })
      .populate('clientId', 'personalInfo.name personalInfo.email')
      .select('-__v')
      .sort({ date: -1 });
    
    res.json(progressLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/progress/client/:clientId
// @desc    Get progress logs for a specific client
// @access  Private
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    // Verify client belongs to trainer
    const client = await Client.findOne({ 
      _id: req.params.clientId, 
      trainerId: req.trainer._id 
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const progressLogs = await ProgressLog.find({ 
      clientId: req.params.clientId,
      trainerId: req.trainer._id 
    })
    .select('-__v')
    .sort({ date: -1 });
    
    res.json(progressLogs);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/progress/:id
// @desc    Get progress log by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const progressLog = await ProgressLog.findOne({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    })
    .populate('clientId', 'personalInfo.name personalInfo.email fitnessData')
    .select('-__v');
    
    if (!progressLog) {
      return res.status(404).json({ message: 'Progress log not found' });
    }
    
    res.json(progressLog);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Progress log not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/progress
// @desc    Create a new progress log
// @access  Private
router.post('/', [
  auth,
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('measurements.weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  body('measurements.bodyFatPercentage').optional().isFloat({ min: 2, max: 50 }).withMessage('Body fat percentage must be between 2 and 50'),
  body('mood').optional().isIn(['excellent', 'good', 'okay', 'poor', 'terrible']).withMessage('Invalid mood'),
  body('energy').optional().isIn(['very_high', 'high', 'moderate', 'low', 'very_low']).withMessage('Invalid energy level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify client belongs to trainer
    const client = await Client.findOne({ 
      _id: req.body.clientId, 
      trainerId: req.trainer._id 
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const progressData = {
      ...req.body,
      trainerId: req.trainer._id
    };

    const progressLog = new ProgressLog(progressData);
    await progressLog.save();
    
    const populatedProgressLog = await ProgressLog.findById(progressLog._id)
      .populate('clientId', 'personalInfo.name personalInfo.email');
    
    res.status(201).json(populatedProgressLog);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress log
// @access  Private
router.put('/:id', [
  auth,
  body('measurements.weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  body('measurements.bodyFatPercentage').optional().isFloat({ min: 2, max: 50 }).withMessage('Body fat percentage must be between 2 and 50'),
  body('mood').optional().isIn(['excellent', 'good', 'okay', 'poor', 'terrible']).withMessage('Invalid mood'),
  body('energy').optional().isIn(['very_high', 'high', 'moderate', 'low', 'very_low']).withMessage('Invalid energy level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const progressLog = await ProgressLog.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.trainer._id },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('clientId', 'personalInfo.name personalInfo.email');

    if (!progressLog) {
      return res.status(404).json({ message: 'Progress log not found' });
    }

    res.json(progressLog);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Progress log not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/progress/:id
// @desc    Delete progress log
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const progressLog = await ProgressLog.findOneAndDelete({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    });

    if (!progressLog) {
      return res.status(404).json({ message: 'Progress log not found' });
    }

    res.json({ message: 'Progress log removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Progress log not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/progress/client/:clientId/summary
// @desc    Get progress summary for a client
// @access  Private
router.get('/client/:clientId/summary', auth, async (req, res) => {
  try {
    // Verify client belongs to trainer
    const client = await Client.findOne({ 
      _id: req.params.clientId, 
      trainerId: req.trainer._id 
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const progressLogs = await ProgressLog.find({ 
      clientId: req.params.clientId,
      trainerId: req.trainer._id 
    })
    .select('date measurements fitnessMetrics')
    .sort({ date: -1 })
    .limit(10);

    // Calculate summary statistics
    const summary = {
      totalLogs: progressLogs.length,
      latestWeight: progressLogs[0]?.measurements?.weight || null,
      weightChange: progressLogs.length >= 2 ? 
        progressLogs[0]?.measurements?.weight - progressLogs[progressLogs.length - 1]?.measurements?.weight : null,
      averageWeight: progressLogs.length > 0 ? 
        progressLogs.reduce((sum, log) => sum + (log.measurements?.weight || 0), 0) / progressLogs.length : null,
      recentLogs: progressLogs.slice(0, 5)
    };

    res.json(summary);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 