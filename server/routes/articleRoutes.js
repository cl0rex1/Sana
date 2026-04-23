const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getArticles)
  .post(protect, createArticle);

router.route('/:id')
  .get(getArticle)
  .put(protect, admin, updateArticle)
  .delete(protect, admin, deleteArticle);

module.exports = router;
