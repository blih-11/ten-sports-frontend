const express = require('express');
const router = express.Router();
const { getArticles, getArticle, getAdminArticles, createArticle, updateArticle, deleteArticle, getRelated } = require('../controllers/articleController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getArticles);
router.get('/:slug', getArticle);
router.get('/:id/related', getRelated);

// Protected routes
router.get('/admin/all', protect, getAdminArticles);
router.post('/', protect, authorize('admin', 'editor', 'writer'), createArticle);
router.put('/:id', protect, authorize('admin', 'editor', 'writer'), updateArticle);
router.delete('/:id', protect, authorize('admin', 'editor'), deleteArticle);

module.exports = router;
