// controllers/authController.js - 身份驗證控制器
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

/**
 * 生成JWT令牌
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * @desc    註冊新用戶
 * @route   POST /api/auth/register
 * @access  公開
 */
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 檢查用戶是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: '用戶名或電子郵件已被使用' });
    }

    // 創建用戶
    const user = await User.create({
      username,
      email,
      password,
      role: 'user' // 默認為普通用戶
    });

    // 生成令牌
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    用戶登入
 * @route   POST /api/auth/login
 * @access  公開
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 檢查用戶名和密碼是否提供
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請提供用戶名和密碼' });
    }

    // 查找用戶並選擇密碼
    const user = await User.findOne({ username }).select('+password');

    // 檢查用戶是否存在
    if (!user) {
      return res.status(401).json({ success: false, message: '無效的憑證' });
    }

    // 驗證密碼
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '無效的憑證' });
    }

    // 生成令牌
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    獲取當前用戶信息
 * @route   GET /api/auth/me
 * @access  私有
 */
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

/**
 * @desc    創建管理員帳號
 * @route   POST /api/auth/create-admin
 * @access  私有/僅限初始化
 */
exports.createAdmin = async (req, res, next) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // 驗證管理員代碼 (簡單的安全措施，實際上應該使用更安全的方式)
    const validAdminCode = process.env.ADMIN_CODE || 'admin123';
    
    if (adminCode !== validAdminCode) {
      return res.status(401).json({ success: false, message: '無效的管理員代碼' });
    }

    // 檢查用戶是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: '用戶名或電子郵件已被使用' });
    }

    // 創建管理員用戶
    const user = await User.create({
      username,
      email,
      password,
      role: 'admin' // 設置為管理員
    });

    // 生成令牌
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}; 