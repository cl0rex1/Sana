const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  feedback: { type: String, required: true }
});

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['standard', 'phishing', 'social', 'device', 'mixed', 'learning'],
    default: 'standard'
  },
  icon: {
    type: String,
    default: '🛡️'
  },
  choices: [choiceSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  aiFeedback: {
    type: String,
    default: ''
  },
  batchId: {
    type: String
  },
  language: {
    type: String,
    enum: ['en', 'ru', 'kz'],
    default: 'en'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Scenario', scenarioSchema);
