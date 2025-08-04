const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DietPlan = require('../models/DietPlan');
const Client = require('../models/Client');
const puppeteer = require('puppeteer');

const router = express.Router();

// Function to generate HTML for PDF export
const generateDietPlanHTML = (dietPlan) => {
  const client = dietPlan.clientId;
  const clientName = client?.personalInfo?.name || 'Client';
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'Weight Loss': return '#dc2626';
      case 'Muscle Gain': return '#9333ea';
      case 'Maintenance': return '#16a34a';
      default: return '#6b7280';
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Diet Plan - ${dietPlan.name}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; background: white; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 2em; margin-bottom: 5px; }
            .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
            .section h2 { color: #dc2626; font-size: 1.3em; margin-bottom: 10px; border-bottom: 2px solid #dc2626; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px; }
            .info-item { background: white; padding: 10px; border-radius: 6px; border-left: 3px solid #dc2626; }
            .info-item h3 { color: #dc2626; font-size: 0.8em; text-transform: uppercase; margin-bottom: 3px; }
            .info-item p { font-size: 1em; font-weight: 600; color: #333; }
            .goal-badge { display: inline-block; padding: 5px 10px; border-radius: 15px; color: white; font-weight: 600; font-size: 0.8em; }
            .macros-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 15px; }
            .macro-item { text-align: center; padding: 10px; background: #f8fafc; border-radius: 6px; }
            .macro-value { font-size: 1.3em; font-weight: 700; color: #dc2626; margin-bottom: 3px; }
            .macro-label { font-size: 0.7em; color: #6b7280; text-transform: uppercase; }
            .meal { background: white; margin-bottom: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
            .meal-header { background: #dc2626; color: white; padding: 10px 15px; font-weight: 600; }
            .meal-content { padding: 15px; }
            .food-item { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
            .food-item:last-child { border-bottom: none; }
            .food-name { font-weight: 500; color: #333; }
            .food-portion { color: #6b7280; font-size: 0.9em; }
            .footer { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 6px; text-align: center; color: #6b7280; font-size: 0.8em; }
            .footer strong { color: #dc2626; }
            .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .medical-info { background: #fef3c7; border-left: 3px solid #f59e0b; }
            .medical-info h3 { color: #d97706; }
            .fitness-info { background: #dbeafe; border-left: 3px solid #3b82f6; }
            .fitness-info h3 { color: #1d4ed8; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>NutriPlan by A S T R A</h1>
            <p>Personalized Nutrition Plan</p>
        </div>
        
        <div class="container">
            <div class="section">
                <h2>Plan Overview</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <h3>Plan Name</h3>
                        <p>${dietPlan.name}</p>
                    </div>
                    <div class="info-item">
                        <h3>Client Name</h3>
                        <p>${clientName}</p>
                    </div>
                    <div class="info-item">
                        <h3>Goal</h3>
                        <p><span class="goal-badge" style="background: ${getGoalColor(dietPlan.goal)}">${dietPlan.goal}</span></p>
                    </div>
                    <div class="info-item">
                        <h3>Created Date</h3>
                        <p>${formatDate(dietPlan.createdAt)}</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Client Information</h2>
                <div class="two-column">
                    <div>
                        <h3>Personal Details</h3>
                        <div class="info-grid">
                            ${client?.personalInfo?.age ? `
                            <div class="info-item">
                                <h3>Age</h3>
                                <p>${client.personalInfo.age} years</p>
                            </div>
                            ` : ''}
                            ${client?.personalInfo?.gender ? `
                            <div class="info-item">
                                <h3>Gender</h3>
                                <p>${client.personalInfo.gender}</p>
                            </div>
                            ` : ''}
                            ${client?.personalInfo?.email ? `
                            <div class="info-item">
                                <h3>Email</h3>
                                <p>${client.personalInfo.email}</p>
                            </div>
                            ` : ''}
                            ${client?.personalInfo?.phone ? `
                            <div class="info-item">
                                <h3>Phone</h3>
                                <p>${client.personalInfo.phone}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div>
                        <h3>Fitness Profile</h3>
                        <div class="info-grid">
                            ${client?.activityLevel ? `
                            <div class="info-item">
                                <h3>Activity Level</h3>
                                <p>${client.activityLevel}</p>
                            </div>
                            ` : ''}
                            ${client?.experienceLevel ? `
                            <div class="info-item">
                                <h3>Experience Level</h3>
                                <p>${client.experienceLevel}</p>
                            </div>
                            ` : ''}
                            ${client?.fitnessGoals?.primaryGoal ? `
                            <div class="info-item">
                                <h3>Primary Goal</h3>
                                <p>${client.fitnessGoals.primaryGoal}</p>
                            </div>
                            ` : ''}
                            ${client?.fitnessGoals?.targetDate ? `
                            <div class="info-item">
                                <h3>Target Date</h3>
                                <p>${formatDate(client.fitnessGoals.targetDate)}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            ${client?.fitnessData ? `
            <div class="section">
                <h2>Fitness Data</h2>
                <div class="info-grid">
                    ${client.fitnessData.currentWeight ? `
                    <div class="info-item fitness-info">
                        <h3>Current Weight</h3>
                        <p>${client.fitnessData.currentWeight} kg</p>
                    </div>
                    ` : ''}
                    ${client.fitnessData.targetWeight ? `
                    <div class="info-item fitness-info">
                        <h3>Target Weight</h3>
                        <p>${client.fitnessData.targetWeight} kg</p>
                    </div>
                    ` : ''}
                    ${client.fitnessData.height ? `
                    <div class="info-item fitness-info">
                        <h3>Height</h3>
                        <p>${client.fitnessData.height} cm</p>
                    </div>
                    ` : ''}
                    ${client.fitnessData.bodyFatPercentage ? `
                    <div class="info-item fitness-info">
                        <h3>Body Fat %</h3>
                        <p>${client.fitnessData.bodyFatPercentage}%</p>
                    </div>
                    ` : ''}
                    ${client.fitnessData.muscleMass ? `
                    <div class="info-item fitness-info">
                        <h3>Muscle Mass</h3>
                        <p>${client.fitnessData.muscleMass} kg</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            ${client?.medicalInfo ? `
            <div class="section">
                <h2>Medical Information</h2>
                <div class="info-grid">
                    ${client.medicalInfo.conditions && client.medicalInfo.conditions.length > 0 ? `
                    <div class="info-item medical-info">
                        <h3>Medical Conditions</h3>
                        <p>${client.medicalInfo.conditions.join(', ')}</p>
                    </div>
                    ` : ''}
                    ${client.medicalInfo.medications && client.medicalInfo.medications.length > 0 ? `
                    <div class="info-item medical-info">
                        <h3>Medications</h3>
                        <p>${client.medicalInfo.medications.join(', ')}</p>
                    </div>
                    ` : ''}
                    ${client.medicalInfo.allergies && client.medicalInfo.allergies.length > 0 ? `
                    <div class="info-item medical-info">
                        <h3>Allergies</h3>
                        <p>${client.medicalInfo.allergies.join(', ')}</p>
                    </div>
                    ` : ''}
                    ${client.medicalInfo.injuries && client.medicalInfo.injuries.length > 0 ? `
                    <div class="info-item medical-info">
                        <h3>Injuries</h3>
                        <p>${client.medicalInfo.injuries.join(', ')}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>Daily Nutrition Targets</h2>
                <div class="macros-grid">
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.dailyCalories?.toLocaleString() || 'N/A'}</div>
                        <div class="macro-label">Calories</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.macronutrients?.protein || dietPlan.protein || 'N/A'}g</div>
                        <div class="macro-label">Protein</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.macronutrients?.carbs || dietPlan.carbs || 'N/A'}g</div>
                        <div class="macro-label">Carbs</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.macronutrients?.fat || dietPlan.fat || 'N/A'}g</div>
                        <div class="macro-label">Fat</div>
                    </div>
                </div>
            </div>

            ${dietPlan.description ? `
            <div class="section">
                <h2>Plan Description</h2>
                <div class="info-item">
                    <p>${dietPlan.description}</p>
                </div>
            </div>
            ` : ''}

            ${dietPlan.restrictions ? `
            <div class="section">
                <h2>Dietary Restrictions</h2>
                <div class="info-item">
                    <p>${dietPlan.restrictions}</p>
                </div>
            </div>
            ` : ''}

            ${dietPlan.supplements ? `
            <div class="section">
                <h2>Recommended Supplements</h2>
                <div class="info-item">
                    <p>${dietPlan.supplements}</p>
                </div>
            </div>
            ` : ''}

            ${dietPlan.hydration ? `
            <div class="section">
                <h2>Hydration Guidelines</h2>
                <div class="info-item">
                    <p>${dietPlan.hydration}</p>
                </div>
            </div>
            ` : ''}

            ${dietPlan.dailyMeals && dietPlan.dailyMeals.length > 0 ? `
            <div class="section">
                <h2>Daily Meal Plan</h2>
                ${dietPlan.dailyMeals.map(meal => `
                    <div class="meal">
                        <div class="meal-header">${meal.mealType} - ${meal.calories || 0} calories</div>
                        <div class="meal-content">
                            <h4 style="color: #dc2626; margin-bottom: 10px;">${meal.name}</h4>
                            ${meal.description ? `<p style="color: #6b7280; margin-bottom: 10px; font-style: italic;">${meal.description}</p>` : ''}
                            
                            ${meal.foods && meal.foods.length > 0 ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #374151; margin-bottom: 8px;">Foods:</h5>
                                ${meal.foods.map(food => `
                                    <div class="food-item">
                                        <span class="food-name">${food.name}</span>
                                        <span class="food-portion">${food.portion}</span>
                                    </div>
                                `).join('')}
                            </div>
                            ` : ''}
                            
                            ${meal.ingredients ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #374151; margin-bottom: 8px;">Ingredients:</h5>
                                <p style="color: #6b7280; font-size: 0.9em;">${meal.ingredients}</p>
                            </div>
                            ` : ''}
                            
                            ${meal.instructions ? `
                            <div style="margin-bottom: 15px;">
                                <h5 style="color: #374151; margin-bottom: 8px;">Instructions:</h5>
                                <p style="color: #6b7280; font-size: 0.9em;">${meal.instructions}</p>
                            </div>
                            ` : ''}
                            
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
                                <div style="text-align: center; padding: 8px; background: #f8fafc; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #dc2626;">${meal.protein || 0}g</div>
                                    <div style="font-size: 0.7em; color: #6b7280;">Protein</div>
                                </div>
                                <div style="text-align: center; padding: 8px; background: #f8fafc; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #dc2626;">${meal.carbs || 0}g</div>
                                    <div style="font-size: 0.7em; color: #6b7280;">Carbs</div>
                                </div>
                                <div style="text-align: center; padding: 8px; background: #f8fafc; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #dc2626;">${meal.fat || 0}g</div>
                                    <div style="font-size: 0.7em; color: #6b7280;">Fat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div class="footer">
                <p><strong>NutriPlan by A S T R A</strong> - Personalized nutrition planning for optimal health and fitness results.</p>
                <p>Generated on ${formatDate(new Date())}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// @route   GET /api/diets
// @desc    Get all diet plans for the authenticated trainer
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({ trainerId: req.trainer._id })
      .populate('clientId', 'personalInfo.name personalInfo.email')
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(dietPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diets/client/:clientId
// @desc    Get diet plans for a specific client
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

    const dietPlans = await DietPlan.find({ 
      clientId: req.params.clientId,
      trainerId: req.trainer._id 
    })
    .select('-__v')
    .sort({ createdAt: -1 });
    
    res.json(dietPlans);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diets/:id
// @desc    Get diet plan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    })
    .populate('clientId', 'personalInfo.name personalInfo.email fitnessData')
    .select('-__v');
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    res.json(dietPlan);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/diets
// @desc    Create a new diet plan
// @access  Private
router.post('/', [
  auth,
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('name').notEmpty().withMessage('Diet plan name is required'),
  body('goal').isIn(['Weight Loss', 'Muscle Gain', 'Maintenance', 'Performance', 'General Health']).withMessage('Invalid goal'),
  body('dailyCalories')
    .custom((value) => {
      const num = Number(value);
      if (isNaN(num) || num < 800 || num > 5000) {
        throw new Error('Daily calories must be a number between 800 and 5000');
      }
      return true;
    })
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

    const dietPlanData = {
      ...req.body,
      trainerId: req.trainer._id
    };

    const dietPlan = new DietPlan(dietPlanData);
    const savedDietPlan = await dietPlan.save();
    
    const populatedDietPlan = await DietPlan.findById(savedDietPlan._id)
      .populate('clientId', 'personalInfo.name personalInfo.email');
    
    res.status(201).json(populatedDietPlan);
  } catch (error) {
    console.error('Error creating diet plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/diets/:id
// @desc    Update diet plan
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Diet plan name cannot be empty'),
  body('goal').optional().isIn(['Weight Loss', 'Muscle Gain', 'Maintenance', 'Performance', 'General Health']).withMessage('Invalid goal'),
  body('dailyCalories')
    .optional()
    .custom((value) => {
      const num = Number(value);
      if (isNaN(num) || num < 800 || num > 5000) {
        throw new Error('Daily calories must be a number between 800 and 5000');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };
    if (updateData.dailyCalories) {
      updateData.dailyCalories = Number(updateData.dailyCalories);
    }

    const dietPlan = await DietPlan.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.trainer._id },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('clientId', 'personalInfo.name personalInfo.email');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json(dietPlan);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/diets/:id
// @desc    Delete diet plan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOneAndDelete({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    });

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json({ message: 'Diet plan removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diets/:id/pdf
// @desc    Export diet plan as PDF
// @access  Private
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    })
    .populate('clientId', 'personalInfo.name personalInfo.email fitnessData fitnessGoals medicalInfo');
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Generate HTML content for PDF
    const html = generateDietPlanHTML(dietPlan);
    
    try {
      // Launch Puppeteer with Render-compatible settings
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });
      
      await browser.close();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
      
      res.send(pdf);
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      // Fallback to HTML export
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
      res.send(html);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router; 