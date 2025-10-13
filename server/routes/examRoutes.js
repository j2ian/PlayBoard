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

// 所有測驗相關的路由都需要身份驗證
router.use(protect);

// 獲取所有測驗
router.get('/', getExams);

// 獲取單個測驗
router.get('/:id', getExam);

// 以下路由需要管理員權限
router.post('/', authorize('admin'), createExam);
router.put('/:id', authorize('admin'), updateExam);
router.delete('/:id', authorize('admin'), deleteExam);

module.exports = router; 