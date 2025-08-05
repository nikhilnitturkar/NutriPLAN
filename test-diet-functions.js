const axios = require('axios');

// Test configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }
});

// Test diet plan update
async function testDietPlanUpdate() {
  try {
    console.log('Testing diet plan update...');
    
    const updateData = {
      name: 'Updated Test Diet Plan',
      goal: 'Weight Loss',
      dailyCalories: 2000,
      description: 'Updated description for testing'
    };
    
    // Replace with actual diet plan ID
    const dietPlanId = 'your-diet-plan-id';
    
    const response = await api.put(`/api/diets/${dietPlanId}`, updateData);
    console.log('✅ Diet plan update successful:', response.data);
    
  } catch (error) {
    console.error('❌ Diet plan update failed:', error.response?.data || error.message);
  }
}

// Test PDF export
async function testPDFExport() {
  try {
    console.log('Testing PDF export...');
    
    // Replace with actual diet plan ID
    const dietPlanId = 'your-diet-plan-id';
    
    const response = await api.get(`/api/diets/${dietPlanId}/pdf`, {
      responseType: 'blob'
    });
    
    console.log('✅ PDF export successful');
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length']);
    
  } catch (error) {
    console.error('❌ PDF export failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Running diet plan function tests...\n');
  
  await testDietPlanUpdate();
  console.log('');
  await testPDFExport();
  
  console.log('\n✅ Tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDietPlanUpdate, testPDFExport }; 