const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DietPlan = require('../models/DietPlan');
const Client = require('../models/Client');
const puppeteer = require('puppeteer');

const router = express.Router();

// Helper function to generate HTML for PDF export
const generateDietPlanHTML = (dietPlan) => {
  const client = dietPlan.clientId;
  const clientName = client?.personalInfo?.name || 'Client';
  
  const formatMacros = (macros) => {
    if (!macros) return '';
    return `
      <div style="margin: 20px 0;">
        <h3 style="color: #dc2626; margin-bottom: 10px;">Macronutrients</h3>
        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
          <div style="flex: 1; background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <strong>Protein:</strong> ${macros.protein}g
          </div>
          <div style="flex: 1; background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <strong>Carbs:</strong> ${macros.carbs}g
          </div>
          <div style="flex: 1; background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <strong>Fat:</strong> ${macros.fat}g
          </div>
        </div>
      </div>
    `;
  };

  const formatMeals = (meals) => {
    if (!meals || meals.length === 0) return '<p style="color: #6b7280; font-style: italic;">No meals added yet.</p>';
    
    return meals.map((meal, index) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h4 style="color: #dc2626; margin-bottom: 10px;">${meal.mealType}</h4>
        <h5 style="font-weight: bold; margin-bottom: 5px;">${meal.name}</h5>
        ${meal.description ? `<p style="color: #6b7280; margin-bottom: 10px;">${meal.description}</p>` : ''}
        <div style="display: flex; gap: 15px; margin-bottom: 10px; font-size: 14px;">
          <span><strong>Calories:</strong> ${meal.calories}</span>
          <span><strong>Protein:</strong> ${meal.protein}g</span>
          <span><strong>Carbs:</strong> ${meal.carbs}g</span>
          <span><strong>Fat:</strong> ${meal.fat}g</span>
        </div>
        ${meal.ingredients ? `<p style="margin-bottom: 5px;"><strong>Ingredients:</strong> ${meal.ingredients}</p>` : ''}
        ${meal.instructions ? `<p><strong>Instructions:</strong> ${meal.instructions}</p>` : ''}
      </div>
    `).join('');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Diet Plan - ${dietPlan.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #dc2626;
          margin-bottom: 10px;
        }
        .client-info {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .plan-details {
          margin-bottom: 30px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
          font-weight: bold;
          color: #374151;
        }
        .detail-value {
          color: #6b7280;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h3 {
          color: #dc2626;
          border-bottom: 2px solid #dc2626;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${dietPlan.name}</h1>
        <p>Personalized Nutrition Plan</p>
      </div>

      <div class="client-info">
        <h3 style="color: #dc2626; margin-bottom: 10px;">Client Information</h3>
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${clientName}</span>
        </div>
        ${client?.personalInfo?.email ? `
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${client.personalInfo.email}</span>
        </div>
        ` : ''}
      </div>

      <div class="plan-details">
        <h3 style="color: #dc2626; margin-bottom: 15px;">Plan Details</h3>
        <div class="detail-row">
          <span class="detail-label">Goal:</span>
          <span class="detail-value">${dietPlan.goal}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Daily Calories:</span>
          <span class="detail-value">${dietPlan.dailyCalories.toLocaleString()}</span>
        </div>
        ${dietPlan.description ? `
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${dietPlan.description}</span>
        </div>
        ` : ''}
      </div>

      ${formatMacros(dietPlan.macronutrients)}

      <div class="section">
        <h3>Daily Meals</h3>
        ${formatMeals(dietPlan.dailyMeals)}
      </div>

      ${dietPlan.restrictions ? `
      <div class="section">
        <h3>Dietary Restrictions</h3>
        <p>${dietPlan.restrictions}</p>
      </div>
      ` : ''}

      ${dietPlan.supplements ? `
      <div class="section">
        <h3>Supplements</h3>
        <p>${dietPlan.supplements}</p>
      </div>
      ` : ''}

      ${dietPlan.hydration ? `
      <div class="section">
        <h3>Hydration Guidelines</h3>
        <p>${dietPlan.hydration}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>This plan is personalized for ${clientName} and should be followed under professional guidance.</p>
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
    console.error('Error updating diet plan:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => {
        // Provide more user-friendly error messages
        const field = err.path;
        if (field.includes('dailyMeals')) {
          const mealIndex = field.match(/dailyMeals\.(\d+)\./)?.[1];
          const fieldName = field.split('.').pop();
          if (fieldName === 'name') {
            return `Meal ${parseInt(mealIndex) + 1} name is required`;
          }
          return `Meal ${parseInt(mealIndex) + 1} ${fieldName} is required`;
        }
        return err.message;
      });
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors.map(msg => ({ msg }))
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A diet plan with this name already exists' });
    }
    
    res.status(500).json({ message: 'Server error. Please try again later.' });
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

    // Clean up dailyMeals - remove meals with empty names
    if (updateData.dailyMeals && Array.isArray(updateData.dailyMeals)) {
      updateData.dailyMeals = updateData.dailyMeals.filter(meal => 
        meal && meal.name && meal.name.trim() !== ''
      );
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
  let browser = null;
  
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
      // Launch Puppeteer with Render-optimized settings
      browser = await puppeteer.launch({
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
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        timeout: 45000 // 45 second timeout for Render
      });
      
      const page = await browser.newPage();
      
      // Set viewport and timeout
      await page.setViewport({ width: 1200, height: 800 });
      page.setDefaultTimeout(45000); // 45 second timeout
      
      // Set content with timeout
      await page.setContent(html, { 
        waitUntil: 'domcontentloaded',
        timeout: 45000 
      });
      
      // Wait a bit for any dynamic content
      await page.waitForTimeout(1000);
      
      // Generate PDF with timeout
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        timeout: 45000
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      
      res.send(pdf);
      
          } catch (puppeteerError) {
        console.error('Puppeteer error:', puppeteerError);
        
        // Try fallback with simpler settings
        try {
          if (browser) await browser.close();
          
          browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ],
            timeout: 30000
          });
          
          const page = await browser.newPage();
          await page.setContent(html, { waitUntil: 'domcontentloaded' });
          
          const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
          });
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
          res.setHeader('Content-Length', pdf.length);
          
          res.send(pdf);
          
        } catch (fallbackError) {
          console.error('Fallback PDF generation failed:', fallbackError);
          
          // Final fallback: return HTML
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
          res.send(html);
        }
      }
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid diet plan data' });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    res.status(500).json({ message: 'Error generating PDF. Please try again later.' });
  } finally {
    // Always close browser
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
});

// @route   GET /api/diets/:id/html
// @desc    Export diet plan as HTML (fallback option)
// @access  Private
router.get('/:id/html', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ 
      _id: req.params.id, 
      trainerId: req.trainer._id 
    })
    .populate('clientId', 'personalInfo.name personalInfo.email fitnessData fitnessGoals medicalInfo');
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Generate HTML content
    const html = generateDietPlanHTML(dietPlan);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
    
    res.send(html);
  } catch (error) {
    console.error('Error generating HTML:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    res.status(500).json({ message: 'Error generating HTML export. Please try again later.' });
  }
});

// Test PDF generation endpoint
router.get('/test-pdf', auth, async (req, res) => {
  try {
    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>Test PDF Generation</h1>
        <p>This is a test PDF to verify Puppeteer is working correctly.</p>
        <p>Generated at: ${new Date().toISOString()}</p>
      </body>
      </html>
    `;
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      timeout: 30000
    });
    
    const page = await browser.newPage();
    await page.setContent(testHtml);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error('Test PDF error:', error);
    res.status(500).json({ message: 'Test PDF generation failed', error: error.message });
  }
});

module.exports = router; 