const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Trainer = require('../models/Trainer');
const Client = require('../models/Client');
const DietPlan = require('../models/DietPlan');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new trainer
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, specialization, experience } = req.body;

    // Check if trainer already exists
    let trainer = await Trainer.findOne({ email });
    if (trainer) {
      return res.status(400).json({ message: 'Trainer already exists' });
    }

    // Create new trainer
    trainer = new Trainer({
      name,
      email,
      password,
      phone,
      specialization,
      experience
    });

    await trainer.save();

    // Create JWT token
    const payload = {
      trainerId: trainer._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      token,
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        experience: trainer.experience
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate trainer & get token
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if trainer exists
    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await trainer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      trainerId: trainer._id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      token,
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        experience: trainer.experience
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current trainer
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.trainer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update trainer profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
  body('experience').optional().isNumeric().withMessage('Experience must be a number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, specialization, experience, bio } = req.body;

    // Get trainer from auth middleware
    const trainer = await Trainer.findById(req.trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== trainer.email) {
      const existingTrainer = await Trainer.findOne({ email });
      if (existingTrainer) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update trainer fields
    if (name) trainer.name = name;
    if (email) trainer.email = email;
    if (phone) trainer.phone = phone;
    if (specialization) trainer.specialization = specialization;
    if (experience) trainer.experience = experience;
    if (bio) trainer.bio = bio;

    await trainer.save();

    res.json({
      id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      experience: trainer.experience,
      bio: trainer.bio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/export-data
// @desc    Export trainer's data (clients and diet plans)
// @access  Private
router.get('/export-data', auth, async (req, res) => {
  try {
    const trainerId = req.trainerId;

    // Get trainer data
    const trainer = await Trainer.findById(trainerId).select('-password');
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Get all clients for this trainer
    const clients = await Client.find({ trainerId });

    // Get all diet plans for this trainer
    const dietPlans = await DietPlan.find({ trainerId });

    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        specialization: trainer.specialization,
        experience: trainer.experience,
        bio: trainer.bio,
        createdAt: trainer.createdAt,
        updatedAt: trainer.updatedAt
      },
      clients: clients.map(client => ({
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
        personalInfo: client.personalInfo,
        fitnessData: client.fitnessData,
        fitnessGoals: client.fitnessGoals,
        medicalInfo: client.medicalInfo,
        activityLevel: client.activityLevel,
        experienceLevel: client.experienceLevel,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      })),
      dietPlans: dietPlans.map(plan => ({
        id: plan._id,
        clientId: plan.clientId,
        name: plan.name,
        description: plan.description,
        goal: plan.goal,
        dailyCalories: plan.dailyCalories,
        macronutrients: plan.macronutrients,
        dailyMeals: plan.dailyMeals,
        restrictions: plan.restrictions,
        supplements: plan.supplements,
        hydration: plan.hydration,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      })),
      summary: {
        totalClients: clients.length,
        totalDietPlans: dietPlans.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        activeDietPlans: dietPlans.filter(p => p.isActive).length
      }
    };

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="nutriplan-data-${new Date().toISOString().split('T')[0]}.json"`);
    
    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

module.exports = router; 