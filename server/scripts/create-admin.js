// scripts/create-admin.js - 建立初始管理員帳號

const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

// 獲取資料庫連接參數
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDBName = process.env.MONGODB_DB || 'play_board';

console.log('開始初始化管理員帳號');
console.log(`MongoDB URI: ${mongoURI}`);
console.log(`MongoDB 資料庫: ${mongoDBName}`);

// 引入 db.js 進行連接
const dbConnection = require('../config/db');

// 管理員資訊
const adminData = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@playboard.com',
  role: 'admin'
};

// 如果連接成功，創建管理員帳號
setTimeout(async () => {
  try {
    if (dbConnection.readyState === 1) {
      console.log('=== 資料庫連接測試成功 ===');
      console.log('連接狀態:', dbConnection.readyState === 1 ? '已連接' : '未連接');
      console.log('資料庫名稱:', dbConnection.db ? dbConnection.db.databaseName : mongoDBName);
      console.log('資料庫主機:', dbConnection.host || '未知');
      console.log('資料庫端口:', dbConnection.port || '未知');
      
      // 執行創建管理員帳號
      await createAdmin();
      
      // 完成後退出程序
      console.log('腳本執行完成');
      process.exit(0);
    } else {
      console.error('資料庫連接失敗');
      process.exit(1);
    }
  } catch (error) {
    console.error('執行過程中出錯:', error);
    process.exit(1);
  }
}, 3000); // 等待 3 秒，確保連接已完成

// 創建管理員函數
async function createAdmin() {
  try {
    // 檢查管理員是否已存在
    const existingAdmin = await User.findOne({ username: adminData.username });

    if (existingAdmin) {
      console.log('管理員帳號已存在');
      return;
    }

    // 創建新管理員
    const admin = new User(adminData);
    await admin.save();

    console.log('管理員帳號創建成功：');
    console.log(`用戶名: ${adminData.username}`);
    console.log(`密碼: ${adminData.password}`);
    console.log(`角色: ${adminData.role}`);
    console.log(`資料庫: ${mongoDBName}`);
  } catch (error) {
    console.error('創建管理員帳號失敗:', error);
    throw error;
  }
}