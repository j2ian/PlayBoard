// routes/authRoutes.js - 身份驗證路由
const express = require('express');
const router = express.Router();
const { register, login, getMe, createAdmin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// 公開路由
router.post('/register', register);
router.post('/login', login);

// 需要身份驗證的路由
router.get('/me', protect, getMe);

// 僅限初始設置的管理員創建路由
router.post('/create-admin', createAdmin);

module.exports = router; 