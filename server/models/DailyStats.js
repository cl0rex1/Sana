const mongoose = require('mongoose');

/**
 * DailyStats Schema
 * Stores daily cybersecurity incident statistics for Kazakhstan/CIS.
 * Powers the interactive statistics dashboard.
 */
const dailyStatsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    totalIncidents: {
      type: Number,
      required: true,
      min: 0,
    },
    fraudCases: {
      type: Number,
      required: true,
      min: 0,
    },
    bullyingCases: {
      type: Number,
      required: true,
      min: 0,
    },
    phishingAttempts: {
      type: Number,
      required: true,
      min: 0,
    },
    malwareDetected: {
      type: Number,
      default: 0,
      min: 0,
    },
    dataBreaches: {
      type: Number,
      default: 0,
      min: 0,
    },
    region: {
      type: String,
      default: 'Kazakhstan',
      enum: ['Kazakhstan', 'Russia', 'Uzbekistan', 'Kyrgyzstan', 'CIS'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for date-range + region queries
dailyStatsSchema.index({ date: 1, region: 1 });

module.exports = mongoose.model('DailyStats', dailyStatsSchema);
