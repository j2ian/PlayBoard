// server.js - 後端入口文件
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// 載入環境變數
dotenv.config();

console.log('嘗試連接資料庫...');
console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017'}`);
console.log(`MongoDB 資料庫: ${process.env.MONGODB_DB || 'play_board'}`);

// 連接數據庫
require('./config/db');

// 創建 Express 應用
const app = express();

// 中間件
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, 'public')));

// 載入路由文件
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const questionRoutes = require('./routes/questionRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const contentRoutes = require('./routes/contentRoutes');
const playBookRoutes = require('./routes/playBookRoutes');
const customPageRoutes = require('./routes/customPageRoutes');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/playbooks', playBookRoutes);
app.use('/api/custom-pages', customPageRoutes);

// 靜態檔案服務 - 為客製化頁面提供資源檔案
app.use('/api/custom-pages/public/:slug/assets', (req, res, next) => {
  const slug = req.params.slug;
  const assetPath = req.path.replace(`/api/custom-pages/public/${slug}/assets`, '');
  
  // 構建實際的檔案路徑
  const filePath = path.join(__dirname, 'public/custom-pages', slug, assetPath);
  
  // 檢查檔案是否存在
  if (fs.existsSync(filePath)) {
    // 根據檔案擴展名設定 Content-Type
    const ext = path.extname(assetPath).toLowerCase();
    const mimeTypes = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // 發送檔案
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: '找不到資源檔案'
    });
  }
});

// 測試路由
app.get('/api/test', (req, res) => {
  res.json({ message: '資料庫連接測試成功！' });
});

// 處理 404 錯誤
app.use((req, res) => {
  res.status(404).json({ message: '未找到請求的資源' });
});

// 處理服務器錯誤
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服務器內部錯誤', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});

// 設置端口並啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服務器在 http://localhost:${PORT} 上運行`);
  console.log('資料庫連接測試完成，可透過瀏覽器訪問 http://localhost:3000/api/test 確認連接狀態');
});
