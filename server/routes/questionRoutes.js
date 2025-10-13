// server/routes/questionRoutes.js - 單一題目路由
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

// 所有題目相關的路由都需要身份驗證
router.use(protect);

// 取得所有題目
router.get('/', getQuestions);
// 取得單一題目
router.get('/:id', getQuestion);
// 以下路由需要管理員權限
router.post('/', authorize('admin'), createQuestion);
router.put('/:id', authorize('admin'), updateQuestion);
router.delete('/:id', authorize('admin'), deleteQuestion);

module.exports = router; 