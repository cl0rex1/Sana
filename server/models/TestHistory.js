const mongoose = require('mongoose');

const testHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testType: {
      type: String,
      required: true,
      enum: ['phishing', 'standard', 'social', 'device', 'mixed', 'ai', 'learning', 'specific'],
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
testHistorySchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('TestHistory', testHistorySchema);
