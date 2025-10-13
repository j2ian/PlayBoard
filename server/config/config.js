// config/config.js - 系統配置
const path = require('path');

// 從環境變數中獲取配置
const config = {
  // 應用配置
  app: {
    name: 'PlayBoard',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // 數據庫配置
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/playboard',
    user: process.env.MONGODB_USER || '',
    pass: process.env.MONGODB_PASS || ''
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 文件上傳配置
  upload: {
    path: path.resolve(process.env.UPLOAD_PATH || 'public/uploads'),
    maxSize: parseInt(process.env.MAX_FILE_SIZE || 10000000) // 10MB
  },
  
  // 日誌配置
  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;
