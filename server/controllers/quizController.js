const QuizResult = require('../models/QuizResult');

/**
 * @desc    Save a quiz/simulation result
 * @route   POST /api/quiz/results
 */
const saveResult = async (req, res, next) => {
  try {
    const { username, scenarioId, choiceId, isCorrect, score, totalScenarios } = req.body;

    // Validate required fields
    if (!username || !scenarioId || !choiceId || isCorrect === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, scenarioId, choiceId, isCorrect, score',
      });
    }

    const result = await QuizResult.create({
      username: username.trim(),
      scenarioId,
      choiceId,
      isCorrect,
      score,
      totalScenarios: totalScenarios || 0,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz results with optional filters
 * @route   GET /api/quiz/results?username=John&from=2024-01-01&to=2026-12-31
 */
const getResults = async (req, res, next) => {
  try {
    const { username, from, to, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (username) filter.username = new RegExp(username, 'i');

    // Date range filter
    if (from || to) {
      filter.completedAt = {};
      if (from) filter.completedAt.$gte = new Date(from);
      if (to) filter.completedAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [results, total] = await Promise.all([
      QuizResult.find(filter)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      QuizResult.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated quiz statistics
 * @route   GET /api/quiz/stats
 */
const getQuizStats = async (req, res, next) => {
  try {
    const stats = await QuizResult.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          wrongAnswers: { $sum: { $cond: ['$isCorrect', 0, 1] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalAttempts: 0,
        averageScore: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveResult, getResults, getQuizStats };
