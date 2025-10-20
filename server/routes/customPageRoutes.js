const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  uploadMiddleware,
  uploadCustomPage,
  getCustomPages,
  getCustomPage,
  updateCustomPage,
  deleteCustomPage,
  getAvailableCustomPages,
  serveCustomPage,
  serveCustomPageAsset
} = require('../controllers/customPageController');

// 管理員路由（需要認證）
router.post('/upload', protect, authorize('admin'), uploadMiddleware, uploadCustomPage);
router.get('/', protect, authorize('admin'), getCustomPages);
router.get('/available', protect, authorize('admin'), getAvailableCustomPages);
router.get('/:id', protect, authorize('admin'), getCustomPage);
router.put('/:id', protect, authorize('admin'), updateCustomPage);
router.delete('/:id', protect, authorize('admin'), deleteCustomPage);

// 公開路由
router.get('/public/available', getAvailableCustomPages);
router.get('/public/:slug', serveCustomPage);
// 靜態資源路由（支援相對路徑資源）
// 使用 use 綁定到固定前綴，避免在路由字串使用萬用字元語法
router.use('/public/:slug/assets', (req, res, next) => {
  // router.use 已經移除了 '/public/:slug/assets' 前綴
  // req.path 現在只包含剩餘的路徑，例如 '/stage1Intro.jpg'
  // 移除開頭的 '/'
  req.assetPath = req.path.startsWith('/') ? req.path.slice(1) : req.path;
  return serveCustomPageAsset(req, res, next);
});

module.exports = router;
