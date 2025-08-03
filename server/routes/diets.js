const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const DietPlan = require('../models/DietPlan');
const Client = require('../models/Client');
const puppeteer = require('puppeteer');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Test endpoint to check if any diet plans exist (no auth required)
router.get('/test-check-plans', async (req, res) => {
  try {
    // Get all diet plans without filtering by trainer
    const allDietPlans = await DietPlan.find({})
      .populate('clientId', 'personalInfo.name personalInfo.email')
      .select('_id name goal dailyCalories clientId trainerId createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      message: 'All diet plans in database',
      count: allDietPlans.length,
      dietPlans: allDietPlans.map(plan => ({
        _id: plan._id,
        name: plan.name,
        goal: plan.goal,
        dailyCalories: plan.dailyCalories,
        clientName: plan.clientId?.personalInfo?.name || 'No client',
        trainerId: plan.trainerId,
        createdAt: plan.createdAt
      }))
    });
  } catch (error) {
    console.error('Error checking diet plans:', error);
    res.status(500).json({ message: 'Error checking diet plans', error: error.message });
  }
});

// Test endpoint to check authentication status (no auth required)
router.get('/test-auth', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader);
    
    if (!authHeader) {
      return res.json({ 
        message: 'No authorization header',
        status: 'unauthenticated'
      });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.json({ 
        message: 'Invalid authorization format',
        status: 'invalid_format'
      });
    }
    
    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // Try to verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        message: 'Token is valid',
        status: 'authenticated',
        trainerId: decoded.trainer.id,
        trainerEmail: decoded.trainer.email
      });
    } catch (jwtError) {
      res.json({
        message: 'Token is not valid',
        status: 'invalid_token',
        error: jwtError.message
      });
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    res.status(500).json({ message: 'Error checking authentication' });
  }
});

// Test endpoints (no auth required for testing)
// Test endpoint to verify HTML generation (no auth for testing)
router.get('/test-html/:id', async (req, res) => {
  try {
    const dietPlan = await DietPlan.findById(req.params.id).populate('clientId', 'personalInfo.name personalInfo.email');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    // Generate the same HTML as PDF endpoint
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test - ${dietPlan.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; background-color: #4a90e2; color: white; padding: 20px; }
            .meal { margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${dietPlan.name}</h1>
            <p><strong>Goal:</strong> ${dietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${dietPlan.dailyCalories?.toLocaleString() || 0} cal</p>
          </div>
          <div>
            <h2>Test Content</h2>
            <p>This is a test to verify HTML generation is working.</p>
            <p>Diet plan has ${dietPlan.dailyMeals?.length || 0} meals.</p>
            ${(dietPlan.dailyMeals || []).map(meal => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <p><strong>${meal.name}</strong></p>
                <p>Calories: ${meal.calories || 0} | Protein: ${meal.protein || 0}g | Carbs: ${meal.carbs || 0}g | Fat: ${meal.fat || 0}g</p>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating test HTML:', error);
    res.status(500).json({ message: 'Error generating test HTML' });
  }
});

// Test PDF endpoint (no auth for testing)
router.get('/test-pdf/:id', async (req, res) => {
  let browser;
  try {
    const dietPlan = await DietPlan.findById(req.params.id).populate('clientId', 'personalInfo.name personalInfo.email');

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    console.log('Test PDF generation for diet plan:', req.params.id);

    // Generate simple HTML for testing
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Diet Plan - ${dietPlan.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; background-color: #4a90e2; color: white; padding: 20px; }
            .meal { margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${dietPlan.name}</h1>
            <p><strong>Goal:</strong> ${dietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${dietPlan.dailyCalories?.toLocaleString() || 0} cal</p>
          </div>
          
          <div>
            <h2>Client Information</h2>
            <p><strong>Name:</strong> ${dietPlan.clientId?.personalInfo?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> ${dietPlan.clientId?.personalInfo?.email || 'Unknown'}</p>
          </div>

          <div>
            <h2>Nutrition Summary</h2>
            <p><strong>Protein:</strong> ${dietPlan.macronutrients?.protein || 0}g</p>
            <p><strong>Carbs:</strong> ${dietPlan.macronutrients?.carbs || 0}g</p>
            <p><strong>Fat:</strong> ${dietPlan.macronutrients?.fat || 0}g</p>
          </div>

          <div>
            <h2>Daily Meal Plan</h2>
            ${(dietPlan.dailyMeals || []).map(meal => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <p><strong>${meal.name}</strong></p>
                ${meal.description ? `<p>${meal.description}</p>` : ''}
                <p>Calories: ${meal.calories || 0} | Protein: ${meal.protein || 0}g | Carbs: ${meal.carbs || 0}g | Fat: ${meal.fat || 0}g</p>
                ${meal.ingredients ? `<p><strong>Ingredients:</strong> ${meal.ingredients}</p>` : ''}
                ${meal.instructions ? `<p><strong>Instructions:</strong> ${meal.instructions}</p>` : ''}
              </div>
            `).join('')}
          </div>

          <div>
            <h2>Daily Totals</h2>
            <table>
              <tr>
                <th>Meal</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
              </tr>
              ${(dietPlan.dailyMeals || []).map(meal => `
                <tr>
                  <td>${meal.mealType}</td>
                  <td>${meal.calories || 0}</td>
                  <td>${meal.protein || 0}</td>
                  <td>${meal.carbs || 0}</td>
                  <td>${meal.fat || 0}</td>
                </tr>
              `).join('')}
              <tr style="font-weight: bold; background-color: #e3f2fd;">
                <td><strong>Total</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.protein || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.carbs || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.fat || 0), 0)}</strong></td>
              </tr>
            </table>
          </div>

          ${dietPlan.restrictions ? `
            <div>
              <h2>Dietary Restrictions</h2>
              <p>${dietPlan.restrictions}</p>
            </div>
          ` : ''}

          ${dietPlan.supplements ? `
            <div>
              <h2>Supplements</h2>
              <p>${dietPlan.supplements}</p>
            </div>
          ` : ''}

          ${dietPlan.hydration ? `
            <div>
              <h2>Hydration</h2>
              <p>${dietPlan.hydration}</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    console.log('HTML content length:', html.length, 'characters');

    // Generate PDF using Puppeteer - SIMPLIFIED APPROACH
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('Puppeteer launched successfully');
      
      const page = await browser.newPage();
      console.log('Page created, setting content...');
      
      // Set a simple viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set content with basic wait
      await page.setContent(html);
      console.log('Content set, waiting for rendering...');
      
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
        printBackground: true
      });
      console.log('PDF generated, size:', pdf.length, 'bytes');
      await browser.close();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
      res.end(pdf, 'binary');
      console.log('PDF sent successfully');
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      
      console.log('Falling back to HTML export...');
      // Fallback: Return HTML content that can be printed to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/[^a-zA-Z0-9]/g, '-')}.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Error generating test PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Error generating test PDF' });
  }
});

// Simple PDF test endpoint
router.get('/simple-pdf-test', async (req, res) => {
  let browser;
  try {
    console.log('Simple PDF test...');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Simple Test</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: blue; }
          </style>
        </head>
        <body>
          <h1>Simple PDF Test</h1>
          <p>This is a simple test to verify PDF generation works.</p>
          <p>If you can see this in a PDF, then Puppeteer is working!</p>
        </body>
      </html>
    `;

    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html);
    await page.waitForTimeout(1000);
    
    const pdf = await page.pdf({ 
      format: 'A4', 
      margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
      printBackground: true
    });
    
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="simple-test.pdf"');
    res.end(pdf, 'binary');
    console.log('Simple PDF test completed successfully');
  } catch (error) {
    console.error('Simple PDF test failed:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Simple PDF test failed', error: error.message });
  }
});

// Simple test endpoint to create sample data and test PDF/HTML
router.get('/test-create-sample', async (req, res) => {
  try {
    // Create a sample diet plan for testing
    const sampleDietPlan = {
      name: 'Test Weight Loss Plan',
      goal: 'Weight Loss',
      dailyCalories: 1800,
      dailyMeals: [
        {
          mealType: 'Breakfast',
          name: 'Oatmeal with Berries',
          description: 'Healthy breakfast with oats and fresh berries',
          calories: 300,
          protein: 12,
          carbs: 45,
          fat: 8,
          ingredients: 'Oats, berries, honey, almond milk',
          instructions: 'Cook oats with almond milk, top with berries and honey'
        },
        {
          mealType: 'Lunch',
          name: 'Grilled Chicken Salad',
          description: 'Protein-rich salad with vegetables',
          calories: 400,
          protein: 35,
          carbs: 15,
          fat: 12,
          ingredients: 'Chicken breast, mixed greens, tomatoes, cucumber, olive oil',
          instructions: 'Grill chicken, chop vegetables, mix with olive oil dressing'
        }
      ],
      macronutrients: {
        protein: 120,
        carbs: 180,
        fat: 60
      },
      restrictions: 'No dairy, gluten-free',
      supplements: 'Vitamin D, Omega-3',
      hydration: '8-10 glasses of water daily'
    };

    // Generate HTML for the sample diet plan
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${sampleDietPlan.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 30px; 
              border-radius: 10px;
            }
            .meal { 
              margin-bottom: 20px; 
              padding: 20px; 
              border: 1px solid #ddd; 
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .meal h3 {
              color: #667eea;
              margin-bottom: 10px;
            }
            .nutrition {
              background: #e8f4fd;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
            .info-box {
              background: #f0f8ff;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #667eea;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              background-color: #e8f4fd;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sampleDietPlan.name}</h1>
            <p><strong>Goal:</strong> ${sampleDietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${sampleDietPlan.dailyCalories.toLocaleString()} cal</p>
          </div>

          <div class="info-box">
            <h2>Client Information</h2>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
          </div>

          <div class="info-box">
            <h2>Nutrition Summary</h2>
            <p><strong>Protein:</strong> ${sampleDietPlan.macronutrients.protein}g</p>
            <p><strong>Carbs:</strong> ${sampleDietPlan.macronutrients.carbs}g</p>
            <p><strong>Fat:</strong> ${sampleDietPlan.macronutrients.fat}g</p>
          </div>

          <div>
            <h2>Daily Meal Plan</h2>
            ${sampleDietPlan.dailyMeals.map(meal => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <p><strong>${meal.name}</strong></p>
                <p>${meal.description}</p>
                <div class="nutrition">
                  <strong>Nutrition:</strong> Calories: ${meal.calories} | Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g
                </div>
                <p><strong>Ingredients:</strong> ${meal.ingredients}</p>
                <p><strong>Instructions:</strong> ${meal.instructions}</p>
              </div>
            `).join('')}
          </div>

          <div class="info-box">
            <h2>Daily Totals</h2>
            <table>
              <tr>
                <th>Meal</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
              </tr>
              ${sampleDietPlan.dailyMeals.map(meal => `
                <tr>
                  <td>${meal.mealType}</td>
                  <td>${meal.calories}</td>
                  <td>${meal.protein}</td>
                  <td>${meal.carbs}</td>
                  <td>${meal.fat}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.calories, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.protein, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.carbs, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.fat, 0)}</strong></td>
              </tr>
            </table>
          </div>

          <div class="info-box">
            <h2>Dietary Restrictions</h2>
            <p>${sampleDietPlan.restrictions}</p>
          </div>

          <div class="info-box">
            <h2>Supplements</h2>
            <p>${sampleDietPlan.supplements}</p>
          </div>

          <div class="info-box">
            <h2>Hydration</h2>
            <p>${sampleDietPlan.hydration}</p>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error generating sample HTML:', error);
    res.status(500).json({ message: 'Error generating sample HTML' });
  }
});

// PDF test endpoint with sample data
router.get('/test-pdf-sample', async (req, res) => {
  let browser;
  try {
    console.log('Testing PDF generation with sample data...');
    
    // Sample diet plan data
    const sampleDietPlan = {
      name: 'Test Weight Loss Plan',
      goal: 'Weight Loss',
      dailyCalories: 1800,
      dailyMeals: [
        {
          mealType: 'Breakfast',
          name: 'Oatmeal with Berries',
          description: 'Healthy breakfast with oats and fresh berries',
          calories: 300,
          protein: 12,
          carbs: 45,
          fat: 8,
          ingredients: 'Oats, berries, honey, almond milk',
          instructions: 'Cook oats with almond milk, top with berries and honey'
        },
        {
          mealType: 'Lunch',
          name: 'Grilled Chicken Salad',
          description: 'Protein-rich salad with vegetables',
          calories: 400,
          protein: 35,
          carbs: 15,
          fat: 12,
          ingredients: 'Chicken breast, mixed greens, tomatoes, cucumber, olive oil',
          instructions: 'Grill chicken, chop vegetables, mix with olive oil dressing'
        }
      ],
      macronutrients: {
        protein: 120,
        carbs: 180,
        fat: 60
      },
      restrictions: 'No dairy, gluten-free',
      supplements: 'Vitamin D, Omega-3',
      hydration: '8-10 glasses of water daily'
    };

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${sampleDietPlan.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 30px; 
              border-radius: 10px;
            }
            .meal { 
              margin-bottom: 20px; 
              padding: 20px; 
              border: 1px solid #ddd; 
              background-color: #f9f9f9;
              border-radius: 8px;
            }
            .meal h3 {
              color: #667eea;
              margin-bottom: 10px;
            }
            .nutrition {
              background: #e8f4fd;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
            .info-box {
              background: #f0f8ff;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              border-left: 4px solid #667eea;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              background-color: #e8f4fd;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sampleDietPlan.name}</h1>
            <p><strong>Goal:</strong> ${sampleDietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${sampleDietPlan.dailyCalories.toLocaleString()} cal</p>
          </div>

          <div class="info-box">
            <h2>Client Information</h2>
            <p><strong>Name:</strong> John Doe</p>
            <p><strong>Email:</strong> john.doe@example.com</p>
          </div>

          <div class="info-box">
            <h2>Nutrition Summary</h2>
            <p><strong>Protein:</strong> ${sampleDietPlan.macronutrients.protein}g</p>
            <p><strong>Carbs:</strong> ${sampleDietPlan.macronutrients.carbs}g</p>
            <p><strong>Fat:</strong> ${sampleDietPlan.macronutrients.fat}g</p>
          </div>

          <div>
            <h2>Daily Meal Plan</h2>
            ${sampleDietPlan.dailyMeals.map(meal => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <p><strong>${meal.name}</strong></p>
                <p>${meal.description}</p>
                <div class="nutrition">
                  <strong>Nutrition:</strong> Calories: ${meal.calories} | Protein: ${meal.protein}g | Carbs: ${meal.carbs}g | Fat: ${meal.fat}g
                </div>
                <p><strong>Ingredients:</strong> ${meal.ingredients}</p>
                <p><strong>Instructions:</strong> ${meal.instructions}</p>
              </div>
            `).join('')}
          </div>

          <div class="info-box">
            <h2>Daily Totals</h2>
            <table>
              <tr>
                <th>Meal</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
              </tr>
              ${sampleDietPlan.dailyMeals.map(meal => `
                <tr>
                  <td>${meal.mealType}</td>
                  <td>${meal.calories}</td>
                  <td>${meal.protein}</td>
                  <td>${meal.carbs}</td>
                  <td>${meal.fat}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.calories, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.protein, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.carbs, 0)}</strong></td>
                <td><strong>${sampleDietPlan.dailyMeals.reduce((sum, meal) => sum + meal.fat, 0)}</strong></td>
              </tr>
            </table>
          </div>

          <div class="info-box">
            <h2>Dietary Restrictions</h2>
            <p>${sampleDietPlan.restrictions}</p>
          </div>

          <div class="info-box">
            <h2>Supplements</h2>
            <p>${sampleDietPlan.supplements}</p>
          </div>

          <div class="info-box">
            <h2>Hydration</h2>
            <p>${sampleDietPlan.hydration}</p>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    console.log('HTML content length:', html.length, 'characters');

    // Generate PDF using Puppeteer
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('Puppeteer launched successfully');
      
      const page = await browser.newPage();
      console.log('Page created, setting content...');
      
      // Set a simple viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set content with basic wait
      await page.setContent(html);
      console.log('Content set, waiting for rendering...');
      
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
        printBackground: true
      });
      console.log('PDF generated, size:', pdf.length, 'bytes');
      await browser.close();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sample-diet-plan.pdf"`);
      res.end(pdf, 'binary');
      console.log('PDF sent successfully');
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      
      console.log('Falling back to HTML export...');
      // Fallback: Return HTML content that can be printed to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="sample-diet-plan.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Error generating sample PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Error generating sample PDF' });
  }
});

// Test endpoint to create sample diet plan and test PDF generation
router.get('/test-pdf-real', auth, async (req, res) => {
  let browser;
  try {
    console.log('Testing PDF generation with real diet plan data...');
    
    // Create a sample diet plan object that matches the database structure
    const sampleDietPlan = {
      _id: 'test-diet-plan-123',
      name: 'Real Test Weight Loss Plan',
      goal: 'Weight Loss',
      dailyCalories: 1800,
      dailyMeals: [
        {
          mealType: 'Breakfast',
          name: 'Oatmeal with Berries',
          description: 'Healthy breakfast with oats and fresh berries',
          calories: 300,
          protein: 12,
          carbs: 45,
          fat: 8,
          ingredients: 'Oats, berries, honey, almond milk',
          instructions: 'Cook oats with almond milk, top with berries and honey'
        },
        {
          mealType: 'Lunch',
          name: 'Grilled Chicken Salad',
          description: 'Protein-rich salad with vegetables',
          calories: 400,
          protein: 35,
          carbs: 15,
          fat: 12,
          ingredients: 'Chicken breast, mixed greens, tomatoes, cucumber, olive oil',
          instructions: 'Grill chicken, chop vegetables, mix with olive oil dressing'
        },
        {
          mealType: 'Dinner',
          name: 'Salmon with Quinoa',
          description: 'Omega-3 rich dinner with whole grains',
          calories: 500,
          protein: 40,
          carbs: 35,
          fat: 20,
          ingredients: 'Salmon fillet, quinoa, broccoli, olive oil, lemon',
          instructions: 'Grill salmon, cook quinoa, steam broccoli, serve with lemon'
        }
      ],
      macronutrients: {
        protein: 120,
        carbs: 180,
        fat: 60
      },
      restrictions: 'No dairy, gluten-free',
      supplements: 'Vitamin D, Omega-3',
      hydration: '8-10 glasses of water daily',
      clientId: {
        _id: 'test-client-123',
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      }
    };

    // Generate HTML for PDF using the same template as the main route
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Diet Plan - ${sampleDietPlan.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #000;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding: 20px;
              background-color: #4a90e2;
              color: white;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 14px; }
            .section { 
              margin-bottom: 25px; 
              padding: 15px;
              border: 1px solid #ddd;
            }
            .section h2 { 
              color: #4a90e2; 
              border-bottom: 2px solid #4a90e2; 
              padding-bottom: 5px;
              margin-top: 0;
              font-size: 18px;
            }
            .meal { 
              margin-bottom: 15px; 
              padding: 10px; 
              border: 1px solid #ccc; 
              background-color: #f9f9f9;
            }
            .meal h3 { 
              color: #28a745; 
              margin: 0 0 8px 0;
              font-size: 16px;
            }
            .nutrition { 
              margin-top: 10px;
            }
            .nutrition span { 
              display: inline-block;
              background-color: #e9ecef; 
              padding: 4px 8px; 
              margin-right: 10px;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .summary { 
              background-color: #e3f2fd; 
              padding: 15px; 
              margin-bottom: 20px;
              border-left: 4px solid #2196f3;
            }
            .client-info { 
              background-color: #fff3cd; 
              padding: 15px; 
              margin-bottom: 20px;
              border-left: 4px solid #ffc107;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #e3f2fd;
            }
            .meal-name {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .meal-description {
              color: #666;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .ingredients, .instructions {
              margin-top: 8px;
              padding: 8px;
              background-color: #f8f9fa;
              border-left: 3px solid #28a745;
              font-size: 12px;
            }
            .ingredients h6, .instructions h6 {
              margin: 0 0 4px 0;
              color: #28a745;
              font-size: 11px;
            }
            .ingredients p, .instructions p {
              margin: 0;
              font-size: 11px;
              color: #555;
            }
            .info-box {
              background-color: #f8f9fa;
              padding: 10px;
              margin-bottom: 15px;
              border: 1px solid #dee2e6;
            }
            .info-box h4 {
              margin: 0 0 8px 0;
              color: #495057;
              font-size: 14px;
            }
            .info-box p {
              margin: 4px 0;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sampleDietPlan.name}</h1>
            <p><strong>Goal:</strong> ${sampleDietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${sampleDietPlan.dailyCalories?.toLocaleString() || 0} cal</p>
          </div>

          <div class="client-info">
            <h2>Client Information</h2>
            <p><strong>Name:</strong> ${sampleDietPlan.clientId?.personalInfo?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> ${sampleDietPlan.clientId?.personalInfo?.email || 'Unknown'}</p>
          </div>

          <div class="summary">
            <h2>Nutrition Summary</h2>
            <div class="nutrition">
              <span><strong>Protein:</strong> ${sampleDietPlan.macronutrients?.protein || 0}g</span>
              <span><strong>Carbs:</strong> ${sampleDietPlan.macronutrients?.carbs || 0}g</span>
              <span><strong>Fat:</strong> ${sampleDietPlan.macronutrients?.fat || 0}g</span>
            </div>
          </div>

          <div class="section">
            <h2>Daily Meal Plan</h2>
            ${(sampleDietPlan.dailyMeals || []).map((meal, index) => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <div class="meal-name">${meal.name}</div>
                ${meal.description ? `<div class="meal-description">${meal.description}</div>` : ''}
                <div class="nutrition">
                  <span><strong>Calories:</strong> ${meal.calories || 0} cal</span>
                  <span><strong>Protein:</strong> ${meal.protein || 0}g</span>
                  <span><strong>Carbs:</strong> ${meal.carbs || 0}g</span>
                  <span><strong>Fat:</strong> ${meal.fat || 0}g</span>
                </div>
                ${meal.ingredients ? `
                  <div class="ingredients">
                    <h6>Ingredients:</h6>
                    <p>${meal.ingredients}</p>
                  </div>
                ` : ''}
                ${meal.instructions ? `
                  <div class="instructions">
                    <h6>Instructions:</h6>
                    <p>${meal.instructions}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${sampleDietPlan.restrictions ? `
            <div class="info-box">
              <h4>Dietary Restrictions</h4>
              <p>${sampleDietPlan.restrictions}</p>
            </div>
          ` : ''}

          ${sampleDietPlan.supplements ? `
            <div class="info-box">
              <h4>Supplements</h4>
              <p>${sampleDietPlan.supplements}</p>
            </div>
          ` : ''}

          ${sampleDietPlan.hydration ? `
            <div class="info-box">
              <h4>Hydration</h4>
              <p>${sampleDietPlan.hydration}</p>
            </div>
          ` : ''}

          <div class="section">
            <h2>Daily Totals</h2>
            <table>
              <tr>
                <th>Meal</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
              </tr>
              ${(sampleDietPlan.dailyMeals || []).map(meal => `
                <tr>
                  <td>${meal.mealType}</td>
                  <td>${meal.calories || 0}</td>
                  <td>${meal.protein || 0}</td>
                  <td>${meal.carbs || 0}</td>
                  <td>${meal.fat || 0}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${(sampleDietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0)}</strong></td>
                <td><strong>${(sampleDietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.protein || 0), 0)}</strong></td>
                <td><strong>${(sampleDietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.carbs || 0), 0)}</strong></td>
                <td><strong>${(sampleDietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.fat || 0), 0)}</strong></td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;
    
    console.log('HTML content length:', html.length, 'characters');

    // Generate PDF using Puppeteer
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('Puppeteer launched successfully');
      
      const page = await browser.newPage();
      console.log('Page created, setting content...');
      
      // Set a simple viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set content with basic wait
      await page.setContent(html);
      console.log('Content set, waiting for rendering...');
      
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
        printBackground: true
      });
      console.log('PDF generated, size:', pdf.length, 'bytes');
      await browser.close();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="real-test-diet-plan.pdf"`);
      res.end(pdf, 'binary');
      console.log('PDF sent successfully');
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      
      console.log('Falling back to HTML export...');
      // Fallback: Return HTML content that can be printed to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="real-test-diet-plan.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Error generating real test PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Error generating real test PDF' });
  }
});

// Test endpoint to simulate the exact PDF generation process without auth
router.get('/test-pdf-exact', async (req, res) => {
  let browser;
  try {
    console.log('Testing exact PDF generation process...');
    
    // Simulate a diet plan object exactly like the database would return
    const dietPlan = {
      _id: 'test-diet-plan-exact',
      name: 'Exact Test Weight Loss Plan',
      goal: 'Weight Loss',
      dailyCalories: 1800,
      dailyMeals: [
        {
          mealType: 'Breakfast',
          name: 'Oatmeal with Berries',
          description: 'Healthy breakfast with oats and fresh berries',
          calories: 300,
          protein: 12,
          carbs: 45,
          fat: 8,
          ingredients: 'Oats, berries, honey, almond milk',
          instructions: 'Cook oats with almond milk, top with berries and honey'
        },
        {
          mealType: 'Lunch',
          name: 'Grilled Chicken Salad',
          description: 'Protein-rich salad with vegetables',
          calories: 400,
          protein: 35,
          carbs: 15,
          fat: 12,
          ingredients: 'Chicken breast, mixed greens, tomatoes, cucumber, olive oil',
          instructions: 'Grill chicken, chop vegetables, mix with olive oil dressing'
        }
      ],
      macronutrients: {
        protein: 120,
        carbs: 180,
        fat: 60
      },
      restrictions: 'No dairy, gluten-free',
      supplements: 'Vitamin D, Omega-3',
      hydration: '8-10 glasses of water daily',
      clientId: {
        _id: 'test-client-exact',
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        }
      }
    };

    console.log('Diet plan object created:', {
      id: dietPlan._id,
      name: dietPlan.name,
      clientId: dietPlan.clientId,
      hasClient: !!dietPlan.clientId,
      clientName: dietPlan.clientId?.personalInfo?.name
    });

    // Generate HTML for PDF using the EXACT same template as the main route
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Diet Plan - ${dietPlan.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #000;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding: 20px;
              background-color: #4a90e2;
              color: white;
            }
            .header h1 { margin: 0 0 10px 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 14px; }
            .section { 
              margin-bottom: 25px; 
              padding: 15px;
              border: 1px solid #ddd;
            }
            .section h2 { 
              color: #4a90e2; 
              border-bottom: 2px solid #4a90e2; 
              padding-bottom: 5px;
              margin-top: 0;
              font-size: 18px;
            }
            .meal { 
              margin-bottom: 15px; 
              padding: 10px; 
              border: 1px solid #ccc; 
              background-color: #f9f9f9;
            }
            .meal h3 { 
              color: #28a745; 
              margin: 0 0 8px 0;
              font-size: 16px;
            }
            .nutrition { 
              margin-top: 10px;
            }
            .nutrition span { 
              display: inline-block;
              background-color: #e9ecef; 
              padding: 4px 8px; 
              margin-right: 10px;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .summary { 
              background-color: #e3f2fd; 
              padding: 15px; 
              margin-bottom: 20px;
              border-left: 4px solid #2196f3;
            }
            .client-info { 
              background-color: #fff3cd; 
              padding: 15px; 
              margin-bottom: 20px;
              border-left: 4px solid #ffc107;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .total-row {
              font-weight: bold;
              background-color: #e3f2fd;
            }
            .meal-name {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .meal-description {
              color: #666;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .ingredients, .instructions {
              margin-top: 8px;
              padding: 8px;
              background-color: #f8f9fa;
              border-left: 3px solid #28a745;
              font-size: 12px;
            }
            .ingredients h6, .instructions h6 {
              margin: 0 0 4px 0;
              color: #28a745;
              font-size: 11px;
            }
            .ingredients p, .instructions p {
              margin: 0;
              font-size: 11px;
              color: #555;
            }
            .info-box {
              background-color: #f8f9fa;
              padding: 10px;
              margin-bottom: 15px;
              border: 1px solid #dee2e6;
            }
            .info-box h4 {
              margin: 0 0 8px 0;
              color: #495057;
              font-size: 14px;
            }
            .info-box p {
              margin: 4px 0;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${dietPlan.name}</h1>
            <p><strong>Goal:</strong> ${dietPlan.goal}</p>
            <p><strong>Daily Calories:</strong> ${dietPlan.dailyCalories?.toLocaleString() || 0} cal</p>
          </div>

          <div class="client-info">
            <h2>Client Information</h2>
            <p><strong>Name:</strong> ${dietPlan.clientId?.personalInfo?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> ${dietPlan.clientId?.personalInfo?.email || 'Unknown'}</p>
          </div>

          <div class="summary">
            <h2>Nutrition Summary</h2>
            <div class="nutrition">
              <span><strong>Protein:</strong> ${dietPlan.macronutrients?.protein || 0}g</span>
              <span><strong>Carbs:</strong> ${dietPlan.macronutrients?.carbs || 0}g</span>
              <span><strong>Fat:</strong> ${dietPlan.macronutrients?.fat || 0}g</span>
            </div>
          </div>

          <div class="section">
            <h2>Daily Meal Plan</h2>
            ${(dietPlan.dailyMeals || []).map((meal, index) => `
              <div class="meal">
                <h3>${meal.mealType}</h3>
                <div class="meal-name">${meal.name}</div>
                ${meal.description ? `<div class="meal-description">${meal.description}</div>` : ''}
                <div class="nutrition">
                  <span><strong>Calories:</strong> ${meal.calories || 0} cal</span>
                  <span><strong>Protein:</strong> ${meal.protein || 0}g</span>
                  <span><strong>Carbs:</strong> ${meal.carbs || 0}g</span>
                  <span><strong>Fat:</strong> ${meal.fat || 0}g</span>
                </div>
                ${meal.ingredients ? `
                  <div class="ingredients">
                    <h6>Ingredients:</h6>
                    <p>${meal.ingredients}</p>
                  </div>
                ` : ''}
                ${meal.instructions ? `
                  <div class="instructions">
                    <h6>Instructions:</h6>
                    <p>${meal.instructions}</p>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${dietPlan.restrictions ? `
            <div class="info-box">
              <h4>Dietary Restrictions</h4>
              <p>${dietPlan.restrictions}</p>
            </div>
          ` : ''}

          ${dietPlan.supplements ? `
            <div class="info-box">
              <h4>Supplements</h4>
              <p>${dietPlan.supplements}</p>
            </div>
          ` : ''}

          ${dietPlan.hydration ? `
            <div class="info-box">
              <h4>Hydration</h4>
              <p>${dietPlan.hydration}</p>
            </div>
          ` : ''}

          <div class="section">
            <h2>Daily Totals</h2>
            <table>
              <tr>
                <th>Meal</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
              </tr>
              ${(dietPlan.dailyMeals || []).map(meal => `
                <tr>
                  <td>${meal.mealType}</td>
                  <td>${meal.calories || 0}</td>
                  <td>${meal.protein || 0}</td>
                  <td>${meal.carbs || 0}</td>
                  <td>${meal.fat || 0}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.protein || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.carbs || 0), 0)}</strong></td>
                <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.fat || 0), 0)}</strong></td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;
    
    console.log('HTML content length:', html.length, 'characters');

    // Generate PDF using Puppeteer - EXACT same process as main route
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('Puppeteer launched successfully');
      
      const page = await browser.newPage();
      console.log('Page created, setting content...');
      
      // Set a simple viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set content with basic wait
      await page.setContent(html);
      console.log('Content set, waiting for rendering...');
      
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
        printBackground: true
      });
      console.log('PDF generated, size:', pdf.length, 'bytes');
      await browser.close();

      // Set response headers - EXACT same as main route
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="exact-test-diet-plan.pdf"`);
      res.end(pdf, 'binary');
      console.log('PDF sent successfully');
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      
      console.log('Falling back to HTML export...');
      // Fallback: Return HTML content that can be printed to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="exact-test-diet-plan.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Error generating exact test PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Error generating exact test PDF', error: error.message });
  }
});

// Test endpoint to check diet plan data structure
router.get('/test-data/:id', auth, async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({
      _id: req.params.id,
      trainerId: req.trainer._id
    }).populate('clientId', 'personalInfo.name personalInfo.email');
    
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    res.json({
      message: 'Diet plan data structure',
      dietPlan: {
        _id: dietPlan._id,
        name: dietPlan.name,
        clientId: dietPlan.clientId,
        clientIdType: typeof dietPlan.clientId,
        clientIdIsObject: typeof dietPlan.clientId === 'object',
        clientName: dietPlan.clientId?.personalInfo?.name,
        goal: dietPlan.goal,
        dailyCalories: dietPlan.dailyCalories
      }
    });
  } catch (error) {
    console.error('Error fetching diet plan data:', error);
    res.status(500).json({ message: 'Error fetching diet plan data' });
  }
});

// Test endpoint to list all diet plans for debugging
router.get('/test-list-all', auth, async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({ trainerId: req.trainer._id })
      .populate('clientId', 'personalInfo.name personalInfo.email')
      .select('_id name goal dailyCalories clientId createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'All diet plans for trainer',
      trainerId: req.trainer._id,
      count: dietPlans.length,
      dietPlans: dietPlans.map(plan => ({
        _id: plan._id,
        name: plan.name,
        goal: plan.goal,
        dailyCalories: plan.dailyCalories,
        clientName: plan.clientId?.personalInfo?.name || 'No client',
        createdAt: plan.createdAt
      }))
    });
  } catch (error) {
    console.error('Error listing diet plans:', error);
    res.status(500).json({ message: 'Error listing diet plans' });
  }
});

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
    console.log('Diet plan creation request received:', {
      body: req.body,
      trainer: req.trainer._id,
      headers: req.headers
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify client belongs to trainer
    const client = await Client.findOne({ 
      _id: req.body.clientId, 
      trainerId: req.trainer._id 
    });
    
    console.log('Client lookup result:', {
      clientId: req.body.clientId,
      trainerId: req.trainer._id,
      clientFound: !!client
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const dietPlanData = {
      ...req.body,
      trainerId: req.trainer._id,
      dailyCalories: Number(req.body.dailyCalories)
    };

    console.log('Creating diet plan with data:', dietPlanData);

    const dietPlan = new DietPlan(dietPlanData);
    await dietPlan.save();
    
    const populatedDietPlan = await DietPlan.findById(dietPlan._id)
      .populate('clientId', 'personalInfo.name personalInfo.email');
    
    console.log('Diet plan created successfully:', populatedDietPlan._id);
    res.status(201).json(populatedDietPlan);
  } catch (error) {
    console.error('Error creating diet plan:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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
  let browser;
  try {
    console.log('PDF export requested for diet plan:', req.params.id);
    console.log('Trainer ID:', req.trainer._id);
    
    const dietPlan = await DietPlan.findOne({
      _id: req.params.id,
      trainerId: req.trainer._id
    }).populate('clientId');

    // Fetch complete client information
    let client = null;
    if (dietPlan && dietPlan.clientId) {
      try {
        const Client = require('../models/Client');
        client = await Client.findById(dietPlan.clientId._id || dietPlan.clientId);
      } catch (clientError) {
        console.error('Error fetching client details:', clientError);
      }
    }

    if (!dietPlan) {
      console.log('Diet plan not found for ID:', req.params.id);
      console.log('Available diet plans for trainer:', await DietPlan.find({ trainerId: req.trainer._id }).select('_id name'));
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    console.log('Diet plan found:', {
      id: dietPlan._id,
      name: dietPlan.name,
      clientId: dietPlan.clientId,
      hasClient: !!dietPlan.clientId,
      clientName: dietPlan.clientId?.personalInfo?.name
    });

    // Generate HTML for PDF - PROFESSIONAL NETFLIX-STYLE DARK THEME
    console.log('Generating HTML content...');
    
    // Create a professional, client-friendly Netflix-style dark theme HTML template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Diet Plan - ${dietPlan.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6;
              color: #000000;
              background: #ffffff;
              min-height: 100vh;
              padding: 20px;
              font-size: 14px;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              border: 2px solid #000000;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .header {
              background: #000000;
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.2;
            }
            
            .header h1 { 
              font-size: 42px; 
              font-weight: 800;
              margin-bottom: 15px;
              position: relative;
              z-index: 1;
              letter-spacing: -0.5px;
            }
            
            .header .subtitle {
              font-size: 18px;
              opacity: 0.95;
              margin-bottom: 30px;
              position: relative;
              z-index: 1;
              font-weight: 400;
            }
            
            .header-stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 25px;
              margin-top: 40px;
              position: relative;
              z-index: 1;
            }
            
            .stat-card {
              background: #ffffff;
              border: 2px solid #000000;
              padding: 15px;
              text-align: center;
              color: #000000;
            }
            
            .stat-card .value {
              font-size: 20px;
              font-weight: 700;
              display: block;
              margin-bottom: 5px;
              color: #000000;
            }
            
            .stat-card .label {
              font-size: 13px;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 500;
            }
            
            .content {
              padding: 30px;
              background: #ffffff;
            }
            
            .section {
              margin-bottom: 30px;
              background: #ffffff;
              border: 2px solid #000000;
              padding: 25px;
            }
            
            .section h2 { 
              color: #000000; 
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
              letter-spacing: -0.3px;
            }
            
            .section h2::before {
              content: '';
              width: 4px;
              height: 20px;
              background: #dc2626;
              border-radius: 2px;
            }
            
            .client-info {
              background: #f8f8f8;
              border: 1px solid #dddddd;
            }
            
            .nutrition-summary {
              background: #f8f8f8;
              border: 1px solid #dddddd;
            }
            
            .meal-plan {
              background: #f8f8f8;
              border: 1px solid #dddddd;
            }
            
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 35px;
            }
            
            .info-group {
              background: #ffffff;
              border: 1px solid #dddddd;
              padding: 20px;
            }
            
            .info-group h4 {
              color: #dc2626;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.2px;
            }
            
            .info-group h4::before {
              content: '•';
              color: #dc2626;
              font-weight: bold;
              font-size: 20px;
            }
            
            .info-group p {
              margin-bottom: 8px;
              font-size: 13px;
              color: #333333;
              line-height: 1.5;
            }
            
            .info-group strong {
              color: #000000;
              font-weight: 600;
            }
            
            .nutrition-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            
            .nutrition-item {
              background: #ffffff;
              border: 1px solid #dddddd;
              padding: 15px;
              text-align: center;
            }
            
            .nutrition-item .value {
              font-size: 18px;
              font-weight: 700;
              color: #000000;
              display: block;
              margin-bottom: 5px;
              letter-spacing: -0.5px;
            }
            
            .nutrition-item .label {
              font-size: 11px;
              color: #666666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 500;
            }
            
            .meal {
              background: #ffffff;
              border: 1px solid #dddddd;
              padding: 20px;
              margin-bottom: 20px;
            }
            
            .meal h3 { 
              color: #dc2626; 
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
              letter-spacing: -0.3px;
            }
            
            .meal h3::before {
              content: '🍽️';
              font-size: 18px;
            }
            
            .meal-name {
              font-weight: 700;
              font-size: 16px;
              color: #000000;
              margin-bottom: 8px;
              letter-spacing: -0.2px;
            }
            
            .meal-description {
              color: #333333;
              font-size: 13px;
              margin-bottom: 15px;
              line-height: 1.5;
            }
            
            .meal-nutrition {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-top: 20px;
            }
            
            .nutrition-badge {
              background: #f8f8f8;
              border: 1px solid #dddddd;
              padding: 8px 12px;
              text-align: center;
              font-size: 12px;
            }
            
            .nutrition-badge .value {
              font-weight: 700;
              color: #000000;
              display: block;
              font-size: 14px;
              margin-bottom: 3px;
            }
            
            .nutrition-badge .label {
              color: #666666;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              font-weight: 500;
            }
            
            .meal-details {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #dddddd;
            }
            
            .ingredients, .instructions {
              background: #f8f8f8;
              padding: 15px;
              margin-top: 10px;
              border-left: 3px solid #dc2626;
            }
            
            .ingredients h6, .instructions h6 {
              color: #dc2626;
              font-size: 14px;
              font-weight: 600;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
              letter-spacing: -0.2px;
            }
            
            .ingredients h6::before {
              content: '📝';
              font-size: 16px;
            }
            
            .instructions h6::before {
              content: '👨‍🍳';
              font-size: 16px;
            }
            
            .ingredients p, .instructions p {
              color: #333333;
              font-size: 12px;
              line-height: 1.5;
            }
            
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px;
              background: #ffffff;
              border: 1px solid #dddddd;
            }
            
            th, td { 
              padding: 10px; 
              text-align: left;
              font-size: 12px;
              border-bottom: 1px solid #dddddd;
            }
            
            th { 
              background: #f8f8f8;
              color: #000000;
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .total-row {
              font-weight: 700;
              background: #dc2626;
              color: #ffffff;
              font-size: 14px;
            }
            
            .footer {
              background: #f8f8f8;
              color: #000000;
              padding: 20px;
              text-align: center;
              margin-top: 30px;
              border-top: 1px solid #dddddd;
            }
            
            .footer p {
              margin-bottom: 8px;
              font-size: 12px;
              opacity: 0.9;
              line-height: 1.5;
            }
            
            .footer .generated-info {
              font-size: 13px;
              opacity: 0.7;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #2a2a2a;
            }
            
            .badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 25px;
              font-size: 13px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }
            
            .badge-active {
              background: #dc2626;
              color: #ffffff;
            }
            
            .badge-inactive {
              background: #6b7280;
              color: #ffffff;
            }
            
            .macro-distribution {
              margin-top: 30px;
            }
            
            .macro-distribution h4 {
              color: #dc2626;
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              letter-spacing: -0.2px;
            }
            
            .important-note {
              background: #dc2626;
              color: white;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              text-align: center;
              font-weight: 600;
              font-size: 14px;
            }
            
            @media print {
              body {
                background: #000000;
                padding: 0;
                font-size: 14px;
              }
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              .section {
                margin-bottom: 30px;
                padding: 25px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${dietPlan.name}</h1>
              <div class="subtitle">Your Personalized Nutrition Plan by NutriPlan</div>
              <div class="header-stats">
                <div class="stat-card">
                  <span class="value">${dietPlan.dailyCalories?.toLocaleString() || 0}</span>
                  <span class="label">Daily Calories</span>
                </div>
                <div class="stat-card">
                  <span class="value">${dietPlan.goal}</span>
                  <span class="label">Your Goal</span>
                </div>
                <div class="stat-card">
                  <span class="value">${new Date(dietPlan.createdAt).toLocaleDateString()}</span>
                  <span class="label">Plan Created</span>
                </div>
                <div class="stat-card">
                  <span class="value badge ${dietPlan.isActive ? 'badge-active' : 'badge-inactive'}">${dietPlan.isActive ? 'Active' : 'Inactive'}</span>
                  <span class="label">Status</span>
                </div>
              </div>
            </div>
            
            <div class="content">
              <div class="important-note">
                📋 This is your personalized nutrition plan. Follow it consistently for best results!
              </div>
            
              <div class="section client-info">
                <h2>👤 Your Information</h2>
                ${client ? `
                  <div class="grid-2">
                    <div class="info-group">
                      <h4>Personal Details</h4>
                      <p><strong>Name:</strong> ${client.personalInfo?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> ${client.personalInfo?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> ${client.personalInfo?.phone || 'N/A'}</p>
                      <p><strong>Age:</strong> ${client.personalInfo?.age || 'N/A'} years</p>
                      <p><strong>Gender:</strong> ${client.personalInfo?.gender || 'N/A'}</p>
                      ${client.personalInfo?.address ? `<p><strong>Address:</strong> ${client.personalInfo.address}</p>` : ''}
                    </div>
                    <div class="info-group">
                      <h4>Fitness Profile</h4>
                      <p><strong>Current Weight:</strong> ${client.fitnessData?.currentWeight || 'N/A'} kg</p>
                      <p><strong>Height:</strong> ${client.fitnessData?.height || 'N/A'} cm</p>
                      <p><strong>BMI:</strong> ${client.fitnessData?.bmi || 'N/A'}</p>
                      <p><strong>Target Weight:</strong> ${client.fitnessData?.targetWeight || 'N/A'} kg</p>
                      <p><strong>Body Fat %:</strong> ${client.fitnessData?.bodyFatPercentage || 'N/A'}%</p>
                      <p><strong>Activity Level:</strong> ${client.activityLevel || 'N/A'}</p>
                    </div>
                  </div>
                  ${client.fitnessGoals ? `
                    <div class="info-group" style="margin-top: 25px;">
                      <h4>Your Goals</h4>
                      <p><strong>Primary Goal:</strong> ${client.fitnessGoals.primaryGoal || 'N/A'}</p>
                      <p><strong>Target Date:</strong> ${client.fitnessGoals.targetDate ? new Date(client.fitnessGoals.targetDate).toLocaleDateString() : 'N/A'}</p>
                      ${client.fitnessGoals.notes ? `<p><strong>Notes:</strong> ${client.fitnessGoals.notes}</p>` : ''}
                    </div>
                  ` : ''}
                  ${client.medicalInfo ? `
                    <div class="info-group" style="margin-top: 25px;">
                      <h4>Medical Information</h4>
                      ${client.medicalInfo.conditions?.length > 0 ? `<p><strong>Medical Conditions:</strong> ${client.medicalInfo.conditions.join(', ')}</p>` : ''}
                      ${client.medicalInfo.medications?.length > 0 ? `<p><strong>Medications:</strong> ${client.medicalInfo.medications.join(', ')}</p>` : ''}
                      ${client.medicalInfo.allergies?.length > 0 ? `<p><strong>Allergies:</strong> ${client.medicalInfo.allergies.join(', ')}</p>` : ''}
                      ${client.medicalInfo.injuries?.length > 0 ? `<p><strong>Injuries:</strong> ${client.medicalInfo.injuries.join(', ')}</p>` : ''}
                    </div>
                  ` : ''}
                  ${client.personalInfo?.emergencyContact ? `
                    <div class="info-group" style="margin-top: 25px;">
                      <h4>Emergency Contact</h4>
                      <p><strong>Name:</strong> ${client.personalInfo.emergencyContact.name || 'N/A'}</p>
                      <p><strong>Phone:</strong> ${client.personalInfo.emergencyContact.phone || 'N/A'}</p>
                      ${client.personalInfo.emergencyContact.relationship ? `<p><strong>Relationship:</strong> ${client.personalInfo.emergencyContact.relationship}</p>` : ''}
                    </div>
                  ` : ''}
                ` : `
                  <div class="info-group">
                    <p><strong>Name:</strong> ${dietPlan.clientId?.personalInfo?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> ${dietPlan.clientId?.personalInfo?.email || 'Unknown'}</p>
                  </div>
                `}
              </div>

              <div class="section nutrition-summary">
                <h2>📊 Your Daily Nutrition</h2>
                <div class="nutrition-grid">
                  <div class="nutrition-item">
                    <span class="value">${dietPlan.dailyCalories?.toLocaleString() || 0}</span>
                    <span class="label">Total Calories</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="value">${dietPlan.macronutrients?.protein || dietPlan.protein || 0}g</span>
                    <span class="label">Protein</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="value">${dietPlan.macronutrients?.carbs || dietPlan.carbs || 0}g</span>
                    <span class="label">Carbohydrates</span>
                  </div>
                  <div class="nutrition-item">
                    <span class="value">${dietPlan.macronutrients?.fat || dietPlan.fat || 0}g</span>
                    <span class="label">Fat</span>
                  </div>
                </div>
                
                <div class="macro-distribution">
                  <h4>Macro Distribution</h4>
                  <div class="nutrition-grid">
                    ${(() => {
                      const totalCals = dietPlan.dailyCalories || 0;
                      const protein = dietPlan.macronutrients?.protein || dietPlan.protein || 0;
                      const carbs = dietPlan.macronutrients?.carbs || dietPlan.carbs || 0;
                      const fat = dietPlan.macronutrients?.fat || dietPlan.fat || 0;
                      
                      const proteinCals = protein * 4;
                      const carbsCals = carbs * 4;
                      const fatCals = fat * 9;
                      
                      const proteinPct = totalCals > 0 ? ((proteinCals / totalCals) * 100).toFixed(1) : 0;
                      const carbsPct = totalCals > 0 ? ((carbsCals / totalCals) * 100).toFixed(1) : 0;
                      const fatPct = totalCals > 0 ? ((fatCals / totalCals) * 100).toFixed(1) : 0;
                      
                      return `
                        <div class="nutrition-item">
                          <span class="value">${proteinPct}%</span>
                          <span class="label">Protein (${proteinCals} cal)</span>
                        </div>
                        <div class="nutrition-item">
                          <span class="value">${carbsPct}%</span>
                          <span class="label">Carbs (${carbsCals} cal)</span>
                        </div>
                        <div class="nutrition-item">
                          <span class="value">${fatPct}%</span>
                          <span class="label">Fat (${fatCals} cal)</span>
                        </div>
                      `;
                    })()}
                  </div>
                </div>
              </div>

              <div class="section meal-plan">
                <h2>🍽️ Your Daily Meals</h2>
                ${(dietPlan.dailyMeals || []).map((meal, index) => `
                  <div class="meal">
                    <h3>${meal.mealType}</h3>
                    <div class="meal-name">${meal.name}</div>
                    ${meal.description ? `<div class="meal-description">${meal.description}</div>` : ''}
                    <div class="meal-nutrition">
                      <div class="nutrition-badge">
                        <span class="value">${meal.calories || 0}</span>
                        <span class="label">Calories</span>
                      </div>
                      <div class="nutrition-badge">
                        <span class="value">${meal.protein || 0}g</span>
                        <span class="label">Protein</span>
                      </div>
                      <div class="nutrition-badge">
                        <span class="value">${meal.carbs || 0}g</span>
                        <span class="label">Carbs</span>
                      </div>
                      <div class="nutrition-badge">
                        <span class="value">${meal.fat || 0}g</span>
                        <span class="label">Fat</span>
                      </div>
                    </div>
                    ${meal.ingredients ? `
                      <div class="meal-details">
                        <div class="ingredients">
                          <h6>Ingredients</h6>
                          <p>${meal.ingredients}</p>
                        </div>
                      </div>
                    ` : ''}
                    ${meal.instructions ? `
                      <div class="meal-details">
                        <div class="instructions">
                          <h6>Instructions</h6>
                          <p>${meal.instructions}</p>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>

              ${dietPlan.restrictions ? `
                <div class="section">
                  <h2>⚠️ Dietary Restrictions</h2>
                  <div class="info-group">
                    <p>${dietPlan.restrictions}</p>
                  </div>
                </div>
              ` : ''}

              ${dietPlan.supplements ? `
                <div class="section">
                  <h2>💊 Supplements</h2>
                  <div class="info-group">
                    <p>${dietPlan.supplements}</p>
                  </div>
                </div>
              ` : ''}

              ${dietPlan.hydration ? `
                <div class="section">
                  <h2>💧 Hydration</h2>
                  <div class="info-group">
                    <p>${dietPlan.hydration}</p>
                  </div>
                </div>
              ` : ''}

              <div class="section">
                <h2>📈 Daily Summary</h2>
                <table>
                  <tr>
                    <th>Meal</th>
                    <th>Calories</th>
                    <th>Protein (g)</th>
                    <th>Carbs (g)</th>
                    <th>Fat (g)</th>
                  </tr>
                  ${(dietPlan.dailyMeals || []).map(meal => `
                    <tr>
                      <td>${meal.mealType}</td>
                      <td>${meal.calories || 0}</td>
                      <td>${meal.protein || 0}</td>
                      <td>${meal.carbs || 0}</td>
                      <td>${meal.fat || 0}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.calories || 0), 0)}</strong></td>
                    <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.protein || 0), 0)}</strong></td>
                    <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.carbs || 0), 0)}</strong></td>
                    <td><strong>${(dietPlan.dailyMeals || []).reduce((sum, meal) => sum + (meal.fat || 0), 0)}</strong></td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</strong></p>
              <p>This personalized nutrition plan is designed specifically for you. Follow it consistently for optimal results.</p>
              <p>For questions or modifications, please contact your nutritionist or trainer.</p>
              <div class="generated-info">
                <p>Document ID: ${dietPlan._id}</p>
                <p>Trainer: ${req.trainer.name || 'Professional Trainer'}</p>
                <p><strong>Powered by NutriPlan by A S T R A</strong></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    console.log('HTML content length:', html.length, 'characters');
    console.log('HTML preview (first 500 chars):', html.substring(0, 500));

    // Generate PDF using Puppeteer - SIMPLIFIED APPROACH
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      console.log('Puppeteer launched successfully');
      
      const page = await browser.newPage();
      console.log('Page created, setting content...');
      
      // Set a simple viewport
      await page.setViewport({ width: 800, height: 600 });
      
      // Set content with basic wait
      await page.setContent(html);
      console.log('Content set, waiting for rendering...');
      
      // Wait for content to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({ 
        format: 'A4', 
        margin: { top: '15px', right: '15px', bottom: '15px', left: '15px' },
        printBackground: true
      });
      console.log('PDF generated, size:', pdf.length, 'bytes');
      await browser.close();

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
      res.end(pdf, 'binary');
      console.log('PDF sent successfully');
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      
      console.log('Falling back to HTML export...');
      // Fallback: Return HTML content that can be printed to PDF
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="diet-plan-${dietPlan.name.replace(/[^a-zA-Z0-9]/g, '-')}.html"`);
      res.send(html);
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (browser) {
      await browser.close();
    }
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
});

module.exports = router; 