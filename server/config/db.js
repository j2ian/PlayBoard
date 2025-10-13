// config/db.js - 數據庫連接配置
const mongoose = require('mongoose');

// 從環境變數中獲取 MongoDB 連接參數
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDBName = process.env.MONGODB_DB || 'play_board';

console.log(`使用資料庫名稱: ${mongoDBName}`);

// 連接 MongoDB
mongoose.connect(`${mongoURI}`, {
  dbName: mongoDBName
})
  .then(() => {
    console.log(`MongoDB 連接成功，資料庫: ${mongoDBName}`);
  })
  .catch((err) => {
    console.error('MongoDB 連接失敗:', err.message);
    // 在嚴重錯誤時退出應用程序
    process.exit(1);
  });

// 當連接中斷時的處理
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 連接中斷');
});

// 當連接發生錯誤時的處理
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 連接錯誤:', err);
});

// 捕捉程序終止信號，關閉數據庫連接
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB 連接已關閉');
  process.exit(0);
});

module.exports = mongoose.connection;
