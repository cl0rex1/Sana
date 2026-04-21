const express = require('express');
const router = express.Router();
const { generateFact, generateScenario } = require('../controllers/aiController');

// GET /api/ai/fact?lang=ru
router.get('/fact', generateFact);

// GET /api/ai/scenario?lang=ru
router.get('/scenario', generateScenario);

module.exports = router;
