const express = require('express');
const router = express.Router();
const { getStats, getStatsSummary, seedStats } = require('../controllers/statsController');

// GET /api/stats — Get stats with date range filter
router.get('/', getStats);

// GET /api/stats/summary — Get aggregated summary
router.get('/summary', getStatsSummary);

// POST /api/stats/seed — Seed mock statistics data
router.post('/seed', seedStats);

module.exports = router;
