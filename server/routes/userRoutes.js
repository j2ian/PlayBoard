// routes/userRoutes.js - 用戶路由
const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// 所有路由都需要身份驗證和管理員權限
router.use(protect);
router.use(authorize('admin'));

// 用戶路由
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
