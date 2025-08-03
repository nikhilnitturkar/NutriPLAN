const express = require('express');
const { body, validationResult } = require('express-validator');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients for the authenticated trainer
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ trainerId: req.trainer._id })
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    }).select('-__v');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/', [
  auth,
  body('personalInfo.name').notEmpty().withMessage('Name is required'),
  body('personalInfo.age').isInt({ min: 10, max: 100 }).withMessage('Age must be between 10 and 100'),
  body('personalInfo.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('fitnessData.currentWeight').isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  body('fitnessData.height').isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm'),
  body('fitnessGoals.primaryGoal').isIn(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness', 'sports_performance']).withMessage('Invalid primary goal')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const clientData = {
      ...req.body,
      trainerId: req.trainer._id
    };

    const client = new Client(clientData);
    await client.save();
    
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', [
  auth,
  body('personalInfo.name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('personalInfo.age').optional().isInt({ min: 10, max: 100 }).withMessage('Age must be between 10 and 100'),
  body('personalInfo.gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('fitnessData.currentWeight').optional().isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
  body('fitnessData.height').optional().isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100 and 250 cm')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.trainer._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({ message: 'Client removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/search/:query
// @desc    Search clients by name
// @access  Private
router.get('/search/:query', auth, async (req, res) => {
  try {
    const clients = await Client.find({
      trainerId: req.trainer._id,
      'personalInfo.name': { $regex: req.params.query, $options: 'i' }
    }).select('-__v');
    
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 