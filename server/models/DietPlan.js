const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  mealType: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  ingredients: String,
  instructions: String
});

const dietPlanSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  goal: {
    type: String,
    enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Performance', 'General Health'],
    required: true
  },
  dailyCalories: {
    type: Number,
    required: true
  },
  macronutrients: {
    protein: Number,
    fat: Number,
    carbs: Number
  },
  dailyMeals: [mealSchema],
  restrictions: String,
  supplements: String,
  hydration: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema); 