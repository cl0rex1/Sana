const CyberFact = require('../models/CyberFact');

/**
 * @desc    Get a random cyber fact
 * @route   GET /api/facts/random
 */
const getRandomFact = async (req, res, next) => {
  try {
    // Use MongoDB aggregation $sample for true random selection
    const facts = await CyberFact.aggregate([{ $sample: { size: 1 } }]);

    if (!facts.length) {
      return res.status(404).json({
        success: false,
        message: 'No cyber facts found. Please run the seed script.',
      });
    }

    res.status(200).json({
      success: true,
      data: facts[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all cyber facts (with optional category filter)
 * @route   GET /api/facts?category=fraud&page=1&limit=10
 */
const getAllFacts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [facts, total] = await Promise.all([
      CyberFact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CyberFact.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: facts,
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

module.exports = { getRandomFact, getAllFacts };
