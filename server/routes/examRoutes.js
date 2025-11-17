// server/routes/examRoutes.js - 測驗路由
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam
} = require('../controllers/examController');

// 獲取所有測驗（公開）
router.get('/', getExams);

// 獲取單個測驗（公開）
router.get('/:id', getExam);

// 以下路由需要身份驗證和管理員權限
router.post('/', protect, authorize('admin'), createExam);
router.put('/:id', protect, authorize('admin'), updateExam);
router.delete('/:id', protect, authorize('admin'), deleteExam);

module.exports = router; 