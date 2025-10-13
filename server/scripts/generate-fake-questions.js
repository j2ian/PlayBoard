
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Question = require('../models/Question');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

// 獲取資料庫連接參數
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDBName = process.env.MONGODB_DB || 'play_board';


console.log(`MongoDB URI: ${mongoURI}`);
console.log(`MongoDB 資料庫: ${mongoDBName}`);

// 引入 db.js 進行連接
const dbConnection = require('../config/db');



// 如果連接成功，創建管理員帳號
setTimeout(async () => {
    try {
        if (dbConnection.readyState === 1) {
            console.log('=== 資料庫連接測試成功 ===');
            console.log('連接狀態:', dbConnection.readyState === 1 ? '已連接' : '未連接');
            console.log('資料庫名稱:', dbConnection.db ? dbConnection.db.databaseName : mongoDBName);
            console.log('資料庫主機:', dbConnection.host || '未知');
            console.log('資料庫端口:', dbConnection.port || '未知');

            //find user 'admin'
            const admin = await User.findOne({ username: 'admin' });
            if (!admin) {
                console.error('找不到 admin 用戶');
                process.exit(1);
            }
            console.log('找到 admin 用戶:', admin);

            // create 20 random  req.body
            for (let i = 0; i < 20; i++) {

                const randomText = Math.random().toString(36).substring(2, 15);
                const randomType = Math.random() < 0.5 ? 'single' : 'multiple';
                const randomOptions = [];
                for (let j = 0; j < 4; j++) {
                    randomOptions.push({ text: Math.random().toString(36).substring(2, 8) });
                }
                const randomCorrectAnswer = [Math.floor(Math.random() * 4)];
       
                const reqBody = {
                    body: {
                        text: randomText,
                        type: 'single',
                        options: randomOptions,
                        correctAnswer: randomCorrectAnswer
                    }
                };
                const questionController = require('../controllers/questionController');
                await questionController.createQuestion(reqBody);
                console.log('建立題目成功');
            }
    


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