const DailyStats = require('../models/DailyStats');

/**
 * @desc    Get statistics with date range filter
 * @route   GET /api/stats?from=2024-01-01&to=2026-12-31&region=Kazakhstan
 */
const getStats = async (req, res, next) => {
  try {
    const { from, to, region } = req.query;

    const filter = {};

    // Date range filter
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    if (region) filter.region = region;

    const stats = await DailyStats.find(filter)
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: stats,
      count: stats.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated summary statistics
 * @route   GET /api/stats/summary
 */
const getStatsSummary = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const matchStage = {};
    if (from || to) {
      matchStage.date = {};
      if (from) matchStage.date.$gte = new Date(from);
      if (to) matchStage.date.$lte = new Date(to);
    }

    const summary = await DailyStats.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncidents: { $sum: '$totalIncidents' },
          totalFraud: { $sum: '$fraudCases' },
          totalBullying: { $sum: '$bullyingCases' },
          totalPhishing: { $sum: '$phishingAttempts' },
          totalMalware: { $sum: '$malwareDetected' },
          totalBreaches: { $sum: '$dataBreaches' },
          avgIncidentsPerDay: { $avg: '$totalIncidents' },
          maxIncidentsDay: { $max: '$totalIncidents' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary[0] || {
        totalIncidents: 0,
        totalFraud: 0,
        totalBullying: 0,
        totalPhishing: 0,
        totalMalware: 0,
        totalBreaches: 0,
        avgIncidentsPerDay: 0,
        maxIncidentsDay: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed mock statistics data (2024-2026)
 * @route   POST /api/stats/seed
 */
const seedStats = async (req, res, next) => {
  try {
    // Check if data already exists
    const existingCount = await DailyStats.countDocuments();
    if (existingCount > 0) {
      return res.status(200).json({
        success: true,
        message: `Stats already seeded (${existingCount} records exist)`,
      });
    }

    // Generate monthly mock data for 2024-2026 (36 months)
    const mockData = [];
    const startYear = 2024;
    const endYear = 2026;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        // Simulate a growing trend with seasonal variation
        const baseMultiplier = 1 + (year - startYear) * 0.3;
        const seasonalFactor = 1 + Math.sin((month / 12) * Math.PI * 2) * 0.2;

        const fraud = Math.round((150 + Math.random() * 100) * baseMultiplier * seasonalFactor);
        const bullying = Math.round((80 + Math.random() * 60) * baseMultiplier * seasonalFactor);
        const phishing = Math.round((200 + Math.random() * 150) * baseMultiplier * seasonalFactor);
        const malware = Math.round((50 + Math.random() * 40) * baseMultiplier * seasonalFactor);
        const breaches = Math.round((10 + Math.random() * 15) * baseMultiplier * seasonalFactor);

        mockData.push({
          date: new Date(year, month, 1),
          totalIncidents: fraud + bullying + phishing + malware + breaches,
          fraudCases: fraud,
          bullyingCases: bullying,
          phishingAttempts: phishing,
          malwareDetected: malware,
          dataBreaches: breaches,
          region: 'Kazakhstan',
        });
      }
    }

    await DailyStats.insertMany(mockData);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${mockData.length} monthly records`,
      count: mockData.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getStatsSummary, seedStats };
