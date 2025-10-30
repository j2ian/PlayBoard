/**
 * 遷移腳本：為 Survey.questions 新增 isPositive、isRequired 和 order 欄位
 */

const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

// 引入模型
const Survey = require('../models/Survey');

// 引入資料庫連接
const dbConnection = require('../config/db');

console.log('開始遷移 Survey 問卷欄位...\n');

// 建立 readline 介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 等待資料庫連接完成
setTimeout(async () => {
  try {
    if (dbConnection.readyState === 1) {
      console.log('=== 資料庫連接成功 ===\n');

      // 詢問使用者是否執行遷移
      rl.question('是否執行遷移？此操作將為所有 Survey 問題新增 isPositive、isRequired 和 order 欄位(y/n): ', async (answer) => {
        try {
          const shouldMigrate = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';

          if (shouldMigrate) {
            await migrateSurveys();
            console.log('\n✓ 遷移完成');
          } else {
            console.log('\n取消遷移');
          }

          rl.close();
          process.exit(0);
        } catch (error) {
          console.error('✗ 執行過程中出錯:', error.message);
          rl.close();
          process.exit(1);
        }
      });
    } else {
      console.error('✗ 資料庫連接失敗');
      rl.close();
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ 執行過程中出錯:', error);
    rl.close();
    process.exit(1);
  }
}, 3000);

async function migrateSurveys() {
  try {
    console.log('\n正在檢查既有的 Survey 文檔...');

    // 找出所有 Survey 文檔
    const allSurveys = await Survey.find();

    console.log(`找到 ${allSurveys.length} 個 Survey 文檔\n`);

    if (allSurveys.length === 0) {
      console.log('✓ 沒有 Survey 文檔需要更新');
      return;
    }

    let updatedCount = 0;
    let questionUpdatedCount = 0;

    // 更新每個 Survey 的 questions
    for (const survey of allSurveys) {
      let surveyNeedsUpdate = false;

      if (survey.questions && Array.isArray(survey.questions)) {
        // 遍歷每個問題
        for (let i = 0; i < survey.questions.length; i++) {
          const question = survey.questions[i];

          // 為遺失的欄位設定預設值
          if (question.isPositive === undefined) {
            question.isPositive = true;
            surveyNeedsUpdate = true;
            questionUpdatedCount++;
          }

          if (question.isRequired === undefined) {
            question.isRequired = false;
            surveyNeedsUpdate = true;
            questionUpdatedCount++;
          }

          if (question.order === undefined) {
            question.order = i; // 使用索引作為順序
            surveyNeedsUpdate = true;
            questionUpdatedCount++;
          }
        }
      }

      // 如果此 Survey 有更新，則保存
      if (surveyNeedsUpdate) {
        await survey.save();
        updatedCount++;
        console.log(`  ✓ 已更新 Survey: ${survey.title} (共 ${survey.questions.length} 個問題)`);
      }
    }

    console.log(`\n✓ 成功更新 ${updatedCount} 個 Survey 文檔`);
    console.log(`✓ 共更新 ${questionUpdatedCount} 個問題欄位\n`);

    // 驗證更新結果
    const surveysWithCompleteQuestions = await Survey.find({
      'questions.isPositive': { $exists: true },
      'questions.isRequired': { $exists: true },
      'questions.order': { $exists: true }
    });

    console.log(`=== 遷移統計 ===`);
    console.log(`總 Survey 數: ${allSurveys.length}`);
    console.log(`包含完整欄位的 Survey 數: ${surveysWithCompleteQuestions.length}`);

    if (surveysWithCompleteQuestions.length === allSurveys.length) {
      console.log('✓ 遷移成功！所有 Survey 都已更新');
    } else {
      console.warn(`⚠ 警告：仍有 ${allSurveys.length - surveysWithCompleteQuestions.length} 個 Survey 未完全更新`);
    }
  } catch (err) {
    console.error('✗ 遷移失敗:', err.message);
    throw err;
  }
}
