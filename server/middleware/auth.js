// middleware/auth.js - 身份驗證中間件
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * 保護路由 - 驗證用戶是否已登入
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 從請求頭中獲取token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // 或從Cookie中獲取
      token = req.cookies.token;
    }
    
    // 檢查token是否存在
    if (!token) {
      return res.status(401).json({ success: false, message: '請先登入以訪問此資源' });
    }
    
    try {
      // 驗證token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // 檢查用戶是否存在
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ success: false, message: '此令牌對應的用戶不存在' });
      }
      
      // 將用戶信息新增到請求對象
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: '無效的令牌' });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * 授權特定角色
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `用戶角色 ${req.user.role} 沒有權限訪問此資源`
      });
    }
    next();
  };
}; 