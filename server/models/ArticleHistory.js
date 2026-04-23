const mongoose = require('mongoose');

const articleHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same user/article
articleHistorySchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('ArticleHistory', articleHistorySchema);
