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
  const clientEmail = client?.personalInfo?.email || 'N/A';
  
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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
            }
            .header {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                color: white;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                font-size: 2.5em;
                margin-bottom: 10px;
                font-weight: 700;
            }
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
            }
            .section {
                margin-bottom: 30px;
                padding: 25px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                background: #fafafa;
            }
            .section h2 {
                color: #dc2626;
                font-size: 1.5em;
                margin-bottom: 15px;
                border-bottom: 2px solid #dc2626;
                padding-bottom: 8px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .info-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #dc2626;
            }
            .info-item h3 {
                color: #dc2626;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }
            .info-item p {
                font-size: 1.1em;
                font-weight: 600;
                color: #333;
            }
            .goal-badge {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                color: white;
                font-weight: 600;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .meals-section {
                margin-top: 30px;
            }
            .meal {
                background: white;
                margin-bottom: 20px;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }
            .meal-header {
                background: #dc2626;
                color: white;
                padding: 15px 20px;
                font-weight: 600;
                font-size: 1.1em;
            }
            .meal-content {
                padding: 20px;
            }
            .food-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            .food-item:last-child {
                border-bottom: none;
            }
            .food-name {
                font-weight: 500;
                color: #333;
            }
            .food-portion {
                color: #6b7280;
                font-size: 0.9em;
            }
            .macros-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 15px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }
            .macro-item {
                text-align: center;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
            }
            .macro-value {
                font-size: 1.5em;
                font-weight: 700;
                color: #dc2626;
                margin-bottom: 5px;
            }
            .macro-label {
                font-size: 0.8em;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .footer {
                margin-top: 40px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                text-align: center;
                color: #6b7280;
                font-size: 0.9em;
            }
            .footer strong {
                color: #dc2626;
            }
            @media print {
                .header {
                    background: #dc2626 !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .meal-header {
                    background: #dc2626 !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .goal-badge {
                    background: ${getGoalColor(dietPlan.goal)} !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>NutriPlan</h1>
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
                <h2>Daily Nutrition Targets</h2>
                <div class="macros-grid">
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.dailyCalories?.toLocaleString() || 'N/A'}</div>
                        <div class="macro-label">Calories</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.protein || 'N/A'}g</div>
                        <div class="macro-label">Protein</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.carbs || 'N/A'}g</div>
                        <div class="macro-label">Carbs</div>
                    </div>
                    <div class="macro-item">
                        <div class="macro-value">${dietPlan.fat || 'N/A'}g</div>
                        <div class="macro-label">Fat</div>
                    </div>
                </div>
            </div>

            ${dietPlan.dailyMeals && dietPlan.dailyMeals.length > 0 ? `
            <div class="section meals-section">
                <h2>Daily Meal Plan</h2>
                ${dietPlan.dailyMeals.map(meal => `
                    <div class="meal">
                        <div class="meal-header">${meal.mealType}</div>
                        <div class="meal-content">
                            ${meal.foods && meal.foods.length > 0 ? meal.foods.map(food => `
                                <div class="food-item">
                                    <span class="food-name">${food.name}</span>
                                    <span class="food-portion">${food.portion}</span>
                                </div>
                            `).join('') : '<p style="color: #6b7280; font-style: italic;">No foods specified</p>'}
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
      console.log('Starting PDF generation for diet plan:', dietPlan._id);
      
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
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      });
      
      console.log('Browser launched successfully');
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      console.log('Page content set, generating PDF...');
      
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
      
      console.log('PDF generated successfully, size:', pdf.length, 'bytes');
      
      await browser.close();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
      
      res.send(pdf);
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      console.error('Puppeteer error stack:', puppeteerError.stack);
      
      // Try alternative approach with different Chrome flags
      try {
        console.log('Trying alternative Puppeteer configuration...');
        
        const browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--disable-extensions'
          ]
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
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
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
        
        res.send(pdf);
      } catch (secondError) {
        console.error('Second Puppeteer attempt failed:', secondError);
        
        // Final fallback to HTML export
        console.log('Falling back to HTML export');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
        res.send(html);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router; 