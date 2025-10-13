// test-db-connection.js - 測試資料庫連接
const dotenv = require('dotenv');
const path = require('path');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('測試 db.js 的資料庫連接功能');
console.log(`MongoDB URI: ${process.env.MONGODB_URI || '未設定'}`);

// 引入 db.js 進行測試
const dbConnection = require('../config/db');

// 如果連接成功，顯示連接信息
setTimeout(() => {
  if (dbConnection.readyState === 1) {
    console.log('=== 資料庫連接測試成功 ===');
    console.log('連接狀態:', dbConnection.readyState === 1 ? '已連接' : '未連接');
    console.log('資料庫名稱:', dbConnection.db ? dbConnection.db.databaseName : '未知');
    console.log('資料庫主機:', dbConnection.host || '未知');
    console.log('資料庫端口:', dbConnection.port || '未知');
    
    // 測試完成後關閉連接
    dbConnection.close()
      .then(() => {
        console.log('資料庫連接已關閉');
        process.exit(0);
      })
      .catch(err => {
        console.error('關閉資料庫連接時出錯:', err);
        process.exit(1);
      });
  } else {
    console.error('資料庫連接失敗');
    process.exit(1);
  }
}, 3000); // 等待 3 秒，確保連接已完成 