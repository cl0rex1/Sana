const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get scenarios created by the user (Static route must be above dynamic /:id)
router.get('/my', protect, scenarioController.getUserScenarios);

// Admin routes
router.get('/', protect, admin, scenarioController.getAllScenarios);
router.put('/:id', protect, admin, scenarioController.updateScenarioStatus);
router.delete('/:id', protect, admin, scenarioController.deleteScenario);

// Public routes
router.get('/approved', scenarioController.getApprovedScenarios);
router.get('/:id', scenarioController.getScenario);
router.put('/:id/moderate', protect, admin, scenarioController.remoderateScenario);

// Submission routes
router.post('/submit', protect, scenarioController.submitScenario);
router.post('/submit-batch', protect, scenarioController.submitScenarioBatch);

module.exports = router;
