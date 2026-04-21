const express = require('express');
const router = express.Router();
const { getRandomFact, getAllFacts } = require('../controllers/factController');

// GET /api/facts/random — Get a random cyber fact
router.get('/random', getRandomFact);

// GET /api/facts — Get all facts (paginated, filterable)
router.get('/', getAllFacts);

module.exports = router;
