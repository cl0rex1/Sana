const mongoose = require('mongoose');

/**
 * QuizResult Schema
 * Records user performance in the Life Scenario simulation.
 * Tracks individual scenario choices and overall scores.
 */
const quizResultSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    scenarioId: {
      type: String,
      required: [true, 'Scenario ID is required'],
    },
    choiceId: {
      type: String,
      required: [true, 'Choice ID is required'],
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
    },
    totalScenarios: {
      type: Number,
      default: 0,
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

// Index for efficient queries by username and date
quizResultSchema.index({ username: 1, completedAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
