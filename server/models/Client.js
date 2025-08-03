const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  personalInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 10,
      max: 100
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  fitnessData: {
    currentWeight: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    bmi: {
      type: Number,
      calculated: true
    },
    bodyFatPercentage: Number,
    muscleMass: Number,
    targetWeight: Number
  },
  fitnessGoals: {
    primaryGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness', 'sports_performance'],
      required: true
    },
    secondaryGoals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness', 'sports_performance']
    }],
    targetDate: Date,
    notes: String
  },
  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String],
    injuries: [String],
    restrictions: [String]
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'moderately_active'
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_hold'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Calculate BMI before saving
clientSchema.pre('save', function(next) {
  if (this.fitnessData.currentWeight && this.fitnessData.height) {
    const heightInMeters = this.fitnessData.height / 100;
    this.fitnessData.bmi = (this.fitnessData.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  next();
});

module.exports = mongoose.model('Client', clientSchema); 