// server/routes/contentRoutes.js - 一般內容路由
const express = require('express');
const {
  getContents,
  getContent,
  getPublicContent,
  getPublicContentById,
  getPublicContents,
  createContent,
  updateContent,
  deleteContent,
  uploadImage,
  getCategories,
  getTags
} = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 公開路由（無需認證）
router.get('/public', getPublicContents);
router.get('/public/:slug', getPublicContent);
router.get('/public/by-id/:id', getPublicContentById);
router.get('/categories', getCategories);
router.get('/tags', getTags);

// 管理員路由（需要身份驗證和管理員權限）
router.route('/')
  .get(protect, authorize('admin'), getContents)
  .post(protect, authorize('admin'), createContent);

router.post('/upload-image', protect, authorize('admin'), uploadImage);

router.route('/:id')
  .get(protect, authorize('admin'), getContent)
  .put(protect, authorize('admin'), updateContent)
  .delete(protect, authorize('admin'), deleteContent);

module.exports = router;
