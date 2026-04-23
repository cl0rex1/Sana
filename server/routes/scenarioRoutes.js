const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.get('/', protect, admin, scenarioController.getAllScenarios);
router.put('/:id', protect, admin, scenarioController.updateScenarioStatus);
router.delete('/:id', protect, admin, scenarioController.deleteScenario);

// Get all approved scenarios (public)
router.get('/approved', scenarioController.getApprovedScenarios);
router.get('/:id', scenarioController.getScenario);
router.put('/:id/moderate', protect, admin, scenarioController.remoderateScenario);



// Get scenarios created by the user
router.get('/my', protect, scenarioController.getUserScenarios);

// Submit a new scenario for moderation
router.post('/submit', protect, scenarioController.submitScenario);
router.post('/submit-batch', protect, scenarioController.submitScenarioBatch);

module.exports = router;
