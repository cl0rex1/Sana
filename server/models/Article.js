const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['phishing', 'standard', 'device', 'social', 'network', 'general'],
      default: 'general',
    },
    tag: {
      type: String,
      default: 'General',
    },
    icon: {
      type: String,
      default: 'BookOpen',
    },
    language: {
      type: String,
      enum: ['en', 'ru', 'kz'],
      default: 'ru',
    },
    practiceScenario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scenario',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    aiFeedback: {
      type: String,
      trim: true,
    },
    moderatedBy: {
      type: String,
      enum: ['ai', 'human'],
      default: 'ai'
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Article', articleSchema);
