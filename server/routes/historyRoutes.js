const express = require('express');
const router = express.Router();
const { saveTestResult, getUserHistory, deleteHistoryItem } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All history routes are protected

router.route('/')
  .post(saveTestResult)
  .get(getUserHistory);

router.route('/:id')
  .delete(deleteHistoryItem);

module.exports = router;
