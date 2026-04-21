const express = require('express');
const router = express.Router();
const { saveResult, getResults, getQuizStats } = require('../controllers/quizController');

// POST /api/quiz/results — Save a quiz result
router.post('/results', saveResult);

// GET /api/quiz/results — Get results with filters
router.get('/results', getResults);

// GET /api/quiz/stats — Get aggregated quiz statistics
router.get('/stats', getQuizStats);

module.exports = router;
