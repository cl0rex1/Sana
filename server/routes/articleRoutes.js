const express = require('express');
const router = express.Router();
const {
  getArticles,
  getAdminArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getUserArticles,
  remoderateArticle,
  markAsRead,
  getReadHistory,
} = require('../controllers/articleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getArticles)
  .post(protect, createArticle);

router.get('/history/read', protect, getReadHistory);
router.post('/:id/read', protect, markAsRead);
router.get('/admin', protect, admin, getAdminArticles);
router.get('/my', protect, getUserArticles);
router.put('/:id/moderate', protect, admin, remoderateArticle);

router.route('/:id')
  .get(getArticle)
  .put(protect, updateArticle)
  .delete(protect, admin, deleteArticle);

module.exports = router;
