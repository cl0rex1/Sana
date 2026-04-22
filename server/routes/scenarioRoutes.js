const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const { protect } = require('../middleware/authMiddleware');

// Get all approved scenarios (public)
router.get('/approved', scenarioController.getApprovedScenarios);

// Get scenarios created by the user
router.get('/my', protect, scenarioController.getUserScenarios);

// Submit a new scenario for moderation
router.post('/submit', protect, scenarioController.submitScenario);

module.exports = router;
