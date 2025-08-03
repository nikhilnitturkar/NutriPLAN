const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  measurements: {
    weight: Number,
    bodyFatPercentage: Number,
    muscleMass: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    calves: Number
  },
  fitnessMetrics: {
    bodyWeight: Number,
    benchPress: Number,
    squat: Number,
    deadlift: Number,
    pullUps: Number,
    pushUps: Number,
    plankTime: Number,
    mileTime: Number
  },
  bodyComposition: {
    bodyFatPercentage: Number,
    muscleMass: Number,
    waterPercentage: Number,
    boneMass: Number
  },
  progressPhotos: [{
    type: String,
    description: String,
    date: Date
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
  },
  energy: {
    type: String,
    enum: ['very_high', 'high', 'moderate', 'low', 'very_low']
  },
  sleep: {
    hours: Number,
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  nutrition: {
    adherence: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    notes: String
  },
  workout: {
    completed: Boolean,
    duration: Number,
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high']
    },
    notes: String
  },
  goals: {
    achieved: [String],
    inProgress: [String],
    newGoals: [String]
  }
}, {
  timestamps: true
});

// Index for efficient querying
progressLogSchema.index({ clientId: 1, date: -1 });

module.exports = mongoose.model('ProgressLog', progressLogSchema); 