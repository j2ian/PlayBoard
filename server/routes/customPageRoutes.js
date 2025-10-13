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
  const slug = req.params.slug || ''
  const prefix = `/public/${slug}/assets`
  // 從 path 去掉前綴取得實際資源相對路徑
  req.assetPath = req.path.startsWith(prefix)
    ? req.path.slice(prefix.length)
    : req.path
  return serveCustomPageAsset(req, res, next)
});

module.exports = router;
