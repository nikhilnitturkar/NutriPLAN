const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DietPlan = require('../models/DietPlan');
const Client = require('../models/Client');
const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');

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
// @desc    Export diet plan as PDF using PDFKit (faster and more reliable)
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

    // Generate PDF using PDFKit (much faster and more reliable)
    const pdfBuffer = await generateDietPlanPDF(dietPlan);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid diet plan data' });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    // Fallback to HTML if PDF generation fails
    try {
      const dietPlan = await DietPlan.findOne({ 
        _id: req.params.id, 
        trainerId: req.trainer._id 
      })
      .populate('clientId', 'personalInfo.name personalInfo.email fitnessData fitnessGoals medicalInfo');
      
      if (dietPlan) {
        const html = generateDietPlanHTML(dietPlan);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/\s+/g, '-').toLowerCase()}.html"`);
        res.send(html);
      } else {
        res.status(500).json({ message: 'Error generating PDF. Please try again later.' });
      }
    } catch (fallbackError) {
      console.error('HTML fallback also failed:', fallbackError);
      res.status(500).json({ message: 'Error generating PDF. Please try again later.' });
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

// Helper function to generate PDF using PDFKit
const generateDietPlanPDF = (dietPlan) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      const client = dietPlan.clientId;
      const clientName = client?.personalInfo?.name || 'Client';
      
      // Header with red accent line
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#dc2626').text('Diet Plan', { align: 'center' });
      doc.moveDown(0.5);
      
      // Red accent line
      doc.rect(40, doc.y, 515, 3).fill('#dc2626');
      doc.moveDown(1);
      
      // Plan name
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#333').text(dietPlan.name, { align: 'center' });
      doc.moveDown(2);
      
      // Client Information Section
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('Client Information');
      doc.moveDown(0.5);
      
      // Client info box
      const clientBoxY = doc.y;
      doc.rect(40, clientBoxY, 515, 60).fill('#f9fafb');
      doc.fontSize(12).font('Helvetica').fillColor('#333');
      doc.text(`Name: ${clientName}`, 50, clientBoxY + 10);
      doc.text(`Email: ${client?.personalInfo?.email || 'N/A'}`, 50, clientBoxY + 25);
      doc.text(`Phone: ${client?.personalInfo?.phone || 'N/A'}`, 50, clientBoxY + 40);
      doc.moveDown(3);
      
      // Plan Details Section
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('Plan Details');
      doc.moveDown(0.5);
      
      // Plan details box
      const planBoxY = doc.y;
      doc.rect(40, planBoxY, 515, 80).fill('#f9fafb');
      doc.fontSize(12).font('Helvetica').fillColor('#333');
      doc.text(`Goal: ${dietPlan.goal || 'N/A'}`, 50, planBoxY + 10);
      doc.text(`Daily Calories: ${dietPlan.dailyCalories || 'N/A'} cal`, 50, planBoxY + 25);
      doc.text(`Duration: ${dietPlan.duration || 'N/A'} weeks`, 50, planBoxY + 40);
      doc.text(`Created: ${new Date(dietPlan.createdAt).toLocaleDateString()}`, 50, planBoxY + 55);
      doc.moveDown(4);
      
      // Macronutrients Section
      if (dietPlan.macros) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('Macronutrients');
        doc.moveDown(0.5);
        
        // Macros grid
        const macrosY = doc.y;
        const boxWidth = 165;
        const boxHeight = 50;
        
        // Protein box
        doc.rect(40, macrosY, boxWidth, boxHeight).fill('#f3f4f6');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Protein', 50, macrosY + 10);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(`${dietPlan.macros.protein || 'N/A'}g`, 50, macrosY + 25);
        
        // Carbs box
        doc.rect(215, macrosY, boxWidth, boxHeight).fill('#f3f4f6');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Carbs', 225, macrosY + 10);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(`${dietPlan.macros.carbs || 'N/A'}g`, 225, macrosY + 25);
        
        // Fat box
        doc.rect(390, macrosY, boxWidth, boxHeight).fill('#f3f4f6');
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#dc2626').text('Fat', 400, macrosY + 10);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text(`${dietPlan.macros.fat || 'N/A'}g`, 400, macrosY + 25);
        
        doc.moveDown(4);
      }
      
      // Meals Section
      if (dietPlan.dailyMeals && dietPlan.dailyMeals.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#374151').text('Daily Meals');
        doc.moveDown(0.5);
        
        dietPlan.dailyMeals.forEach((meal, index) => {
          if (meal && meal.name) {
            // Meal box
            const mealBoxY = doc.y;
            doc.rect(40, mealBoxY, 515, 120).fill('#ffffff');
            doc.rect(40, mealBoxY, 515, 120).stroke('#e5e7eb');
            
            // Meal type header
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#dc2626').text(meal.mealType || `Meal ${index + 1}`, 50, mealBoxY + 10);
            
            // Meal name
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text(meal.name, 50, mealBoxY + 30);
            
            // Meal details
            doc.fontSize(10).font('Helvetica').fillColor('#6b7280');
            if (meal.description) doc.text(`Description: ${meal.description}`, 50, mealBoxY + 45);
            
            // Nutrition info
            doc.fontSize(10).font('Helvetica').fillColor('#333');
            doc.text(`Calories: ${meal.calories || 'N/A'}`, 50, mealBoxY + 60);
            doc.text(`Protein: ${meal.protein || 'N/A'}g`, 200, mealBoxY + 60);
            doc.text(`Carbs: ${meal.carbs || 'N/A'}g`, 350, mealBoxY + 60);
            doc.text(`Fat: ${meal.fat || 'N/A'}g`, 450, mealBoxY + 60);
            
            if (meal.ingredients) doc.text(`Ingredients: ${meal.ingredients}`, 50, mealBoxY + 75);
            if (meal.instructions) doc.text(`Instructions: ${meal.instructions}`, 50, mealBoxY + 90);
            
            doc.moveDown(6);
          }
        });
      } else {
        doc.fontSize(12).font('Helvetica').fillColor('#6b7280').text('No meals added yet.');
        doc.moveDown(1);
      }
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Test PDF generation endpoint
router.get('/test-pdf', auth, async (req, res) => {
  try {
    const testDietPlan = {
      name: 'Test Diet Plan',
      goal: 'Weight Loss',
      dailyCalories: 2000,
      duration: 4,
      macros: { protein: 150, carbs: 200, fat: 67 },
      dailyMeals: [
        {
          mealType: 'Breakfast',
          name: 'Oatmeal with Berries',
          calories: 300,
          protein: 12,
          carbs: 45,
          fat: 8
        }
      ],
      clientId: { personalInfo: { name: 'Test Client', email: 'test@example.com' } }
    };
    
    const pdfBuffer = await generateDietPlanPDF(testDietPlan);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-diet-plan.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Test PDF error:', error);
    res.status(500).json({ message: 'Test PDF generation failed', error: error.message });
  }
});

module.exports = router; 