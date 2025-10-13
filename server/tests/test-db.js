// test-db.js - 測試資料庫連接
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 載入環境變數
dotenv.config();

// 從環境變數中獲取 MongoDB URI，如果未設置則使用默認值
const mongoURI = "mongodb+srv://jinny:RmXruyvMIrkuX5mr@cluster0.8rvdluf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log('嘗試連接到 MongoDB...');
console.log(`連接 URI: ${mongoURI}`);

// 連接 MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB 連接成功！');
    console.log('資料庫名稱:', mongoose.connection.name);
    console.log('資料庫主機:', mongoose.connection.host);
    console.log('資料庫端口:', mongoose.connection.port);
    
    // 關閉連接
    mongoose.connection.close();
    console.log('測試完成，連接已關閉');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB 連接失敗:', err.message);
    process.exit(1);
  });
