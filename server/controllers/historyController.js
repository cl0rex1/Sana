const TestHistory = require('../models/TestHistory');

/**
 * @desc    Save a test session result
 * @route   POST /api/history
 * @access  Private
 */
const saveTestResult = async (req, res, next) => {
  try {
    const { testType, score, totalQuestions, correctAnswers } = req.body;

    if (!testType || score === undefined || !totalQuestions || correctAnswers === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const result = await TestHistory.create({
      user: req.user._id,
      testType,
      score,
      totalQuestions,
      correctAnswers
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user test history
 * @route   GET /api/history
 * @access  Private
 */
const getUserHistory = async (req, res, next) => {
  try {
    const history = await TestHistory.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific history record
 * @route   DELETE /api/history/:id
 * @access  Private
 */
const deleteHistoryItem = async (req, res, next) => {
  try {
    const item = await TestHistory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'History item not found' });
    }

    // Check ownership
    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Record deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveTestResult,
  getUserHistory,
  deleteHistoryItem
};
