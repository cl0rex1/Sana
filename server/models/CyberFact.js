const mongoose = require('mongoose');

/**
 * CyberFact Schema
 * Stores cybersecurity facts about internet fraud in Kazakhstan/CIS.
 * Used by the Cyber-Fact Generator feature.
 */
const cyberFactSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Fact text is required'],
      trim: true,
      maxlength: [1000, 'Fact text cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['fraud', 'phishing', 'cyberbullying', 'data-breach', 'identity-theft', 'malware'],
    },
    source: {
      type: String,
      trim: true,
      default: 'Sana Research',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CyberFact', cyberFactSchema);
