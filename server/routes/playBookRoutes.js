const express = require('express');
const {
  getPlayBooks,
  getPlayBook,
  createPlayBook,
  updatePlayBook,
  deletePlayBook,
  getPublicPlayBooks,
  getPublicPlayBook,
  getOrCreateProgress,
  updateStepProgress,
  updateCustomPageProgress,
  resetProgress,
  getPlayBookStats,
  downloadPlayBookResults,
  getCategories
} = require('../controllers/playBookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 公開路由（無需認證）
router.get('/public', getPublicPlayBooks);
router.get('/public/:slug', getPublicPlayBook);
router.get('/categories', getCategories);

// 公開路由（用戶進度相關）
router.post('/:id/progress', getOrCreateProgress);
router.put('/:id/progress/:stepNumber', updateStepProgress);
router.put('/:id/progress/custom-page/:stepNumber', updateCustomPageProgress);
router.post('/:id/progress/reset', resetProgress);

// 管理員路由（需要認證和管理員權限）
router.route('/')
  .get(protect, authorize('admin'), getPlayBooks)
  .post(protect, authorize('admin'), createPlayBook);

router.route('/:id')
  .get(protect, authorize('admin'), getPlayBook)
  .put(protect, authorize('admin'), updatePlayBook)
  .delete(protect, authorize('admin'), deletePlayBook);

router.get('/:id/stats', protect, authorize('admin'), getPlayBookStats);
router.get('/:id/download', protect, authorize('admin'), downloadPlayBookResults);

module.exports = router;
