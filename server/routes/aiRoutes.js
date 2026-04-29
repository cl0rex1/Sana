const express = require('express');
const router = express.Router();
const {
  generateFact,
  generateScenario,
  generateScenarioBatch,
  cancelAiRequest,
} = require('../controllers/aiController');

// GET /api/ai/fact?lang=ru
router.get('/fact', generateFact);

// GET /api/ai/scenario?lang=ru
router.get('/scenario', generateScenario);

// GET /api/ai/test?lang=ru&count=5
router.get('/test', generateScenarioBatch);

// POST /api/ai/cancel/:requestId
router.post('/cancel/:requestId', cancelAiRequest);

module.exports = router;
