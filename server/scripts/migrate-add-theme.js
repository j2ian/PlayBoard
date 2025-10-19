// scripts/migrate-add-theme.js - 為現有的 PlayBook 添加 theme 欄位

const dotenv = require('dotenv');
const path = require('path');
const PlayBook = require('../models/PlayBook');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

// 獲取資料庫連接參數
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDBName = process.env.MONGODB_DB || 'play_board';

console.log('開始遷移 PlayBook 資料 - 添加 theme 欄位');
console.log(`MongoDB URI: ${mongoURI}`);
console.log(`MongoDB 資料庫: ${mongoDBName}`);

// 引入 db.js 進行連接
const dbConnection = require('../config/db');

// 如果連接成功，執行遷移
setTimeout(async () => {
  try {
    if (dbConnection.readyState === 1) {
      console.log('=== 資料庫連接測試成功 ===');
      console.log('連接狀態:', dbConnection.readyState === 1 ? '已連接' : '未連接');
      console.log('資料庫名稱:', dbConnection.db ? dbConnection.db.databaseName : mongoDBName);
      console.log('資料庫主機:', dbConnection.host || '未知');
      console.log('資料庫端口:', dbConnection.port || '未知');

      // 執行遷移
      await migratePlayBooks();

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

// 遷移 PlayBook 函數
async function migratePlayBooks() {
  try {
    console.log('\n開始查找需要更新的 PlayBook...');

    // 找出所有沒有 theme 欄位的 PlayBook
    const playBooksWithoutTheme = await PlayBook.find({
      theme: { $exists: false }
    });

    console.log(`找到 ${playBooksWithoutTheme.length} 個需要更新的 PlayBook`);

    if (playBooksWithoutTheme.length === 0) {
      console.log('所有 PlayBook 都已經有 theme 欄位，無需更新');
      return;
    }

    // 使用 bulkWrite 進行批量更新，效率更高
    const bulkOperations = playBooksWithoutTheme.map(playbook => ({
      updateOne: {
        filter: { _id: playbook._id },
        update: { $set: { theme: 'default' } }
      }
    }));

    const result = await PlayBook.bulkWrite(bulkOperations);

    console.log('\n=== 遷移結果 ===');
    console.log(`成功更新: ${result.modifiedCount} 個 PlayBook`);
    console.log(`匹配數量: ${result.matchedCount} 個`);

    // 驗證遷移結果
    const remainingWithoutTheme = await PlayBook.countDocuments({
      theme: { $exists: false }
    });

    console.log(`剩餘未更新: ${remainingWithoutTheme} 個`);

    if (remainingWithoutTheme === 0) {
      console.log('\n✓ 所有 PlayBook 已成功添加 theme 欄位！');
    } else {
      console.warn('\n⚠ 警告：仍有部分 PlayBook 未更新');
    }

  } catch (error) {
    console.error('遷移 PlayBook 失敗:', error);
    throw error;
  }
}
