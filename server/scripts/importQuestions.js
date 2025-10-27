/**
 * 題目和測驗導入腳本
 * 根據 Sunshine-main 的前測和後測題目建立 Question 和 Exam 資料
 */

const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

// 引入模型
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// 引入資料庫連接
const dbConnection = require('../config/db');

console.log('開始匯入前測和後測題目...\n');

// 建立 readline 介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 前測題目資料
const pretestData = [
  {
    text: "01.有關處理即將過期的食物哪種方法最好?",
    type: 'single',
    options: ["丟掉它們", "送到食物銀行或是社區愛心冰箱", "放著不管它們", "以上皆是"],
    correctAnswer: "送到食物銀行或是社區愛心冰箱"
  },
  {
    text: "02.哪個單位主要在幫忙分享物資?",
    type: 'single',
    options: ["銀行", "百貨公司", "連鎖超商", "食物銀行"],
    correctAnswer: "食物銀行"
  },
  {
    text: "03.物資分享可以直接產生何種正面影響?",
    type: 'single',
    options: ["增加資源浪費", "減少資源過度利用", "延長物品的使用壽命", "加速自然資源的消耗"],
    correctAnswer: "減少資源過度利用"
  },
  {
    text: "04.小陽陪家長去超市購物，哪種做法最正確?",
    type: 'single',
    options: ["只要家長買特價商品", "提醒家長食物保存期限適當選購", "不管缺什麼，看到的都想買", "只買外觀完美的水果和蔬菜"],
    correctAnswer: "提醒家長食物保存期限適當選購"
  },
  {
    text: "05.何者是最能減少食物浪費的購物習慣?",
    type: 'single',
    options: ["大量購買儲放起來", "選購新鮮食材並即時使用", "購買過期或降價的商品", "只在特價時購物，不論是否需要"],
    correctAnswer: "選購新鮮食材並即時使用"
  },
  {
    text: "06.哪種作法不是聰明購物0浪費?",
    type: 'single',
    options: ["購物前先做購物清單，只購買所需物品", "購物時查看保存期限，適量購買", "購物時看到特價一定要買", "購物後要分類保存，盡快善用"],
    correctAnswer: "購物時看到特價一定要買"
  },
  {
    text: "07.何種購物習慣可以減少塑膠浪費?",
    type: 'single',
    options: ["使用大量一次性塑膠袋", "購買商品時拒絕使用再生袋", "自備環保袋，避免買商店的購物袋", "為了方便將商品分開使用多個袋子"],
    correctAnswer: "自備環保袋，避免買商店的購物袋"
  },
  {
    text: "08.何者不是減少塑膠使用的方法?",
    type: 'single',
    options: ["隨身攜帶購物袋", "優先購買非塑膠包裝的產品", "購物只看產品，不管包裝", "將塑膠包裝分類回收或再利用"],
    correctAnswer: "購物只看產品，不管包裝"
  },
  {
    text: "09.哪種不是支持零塑生活的方式?",
    type: 'single',
    options: ["喝飲料自備環保杯", "認識塑膠的危害", "使用無塑替代用品", "吃飯愛用免洗用具"],
    correctAnswer: "吃飯愛用免洗用具"
  },
  {
    text: "10.在日常生活中哪種行為可以減少塑膠使用?",
    type: 'single',
    options: ["購買簡化包裝商品", "使用可再生的包裝", "用自備吸管喝飲料", "以上皆是"],
    correctAnswer: "以上皆是"
  }
];

// 後測題目資料
const protestData = [
  {
    text: "01.哪種不是處理即將過期食物的好方法?",
    type: 'single',
    options: ["分享給親友", "送到食物銀行或是社區愛心冰箱", "放著不管它們", "盡快使用它們"],
    correctAnswer: "放著不管它們"
  },
  {
    text: "02.多出來的物資可以透過哪個單位幫忙分享?",
    type: 'single',
    options: ["大型超市", "信用合作社", "食物銀行", "百貨公司"],
    correctAnswer: "食物銀行"
  },
  {
    text: "03.下列何者不是物資分享的影響?",
    type: 'single',
    options: ["可以讓物資被好好使用", "減少資源被浪費", "延長物品的使用壽命", "加速自然資源的消耗"],
    correctAnswer: "加速自然資源的消耗"
  },
  {
    text: "04.小陽陪家長去超市購物，哪種做法不聰明?",
    type: 'single',
    options: ["水果或蔬菜的外觀是否完美都可以買", "看清楚保存期限，只買需要的數量", "只購買需要的食材與物品", "特價商品一定要買"],
    correctAnswer: "特價商品一定要買"
  },
  {
    text: "05.何者是聰明購物0浪費的好習慣?",
    type: 'single',
    options: ["大量購買並放在冰箱中", "購買過期或降價的商品", "選購新鮮食材並即時使用", "特價品一定要買，不管是否需要"],
    correctAnswer: "選購新鮮食材並即時使用"
  },
  {
    text: "06.哪種做法可以讓自己聰明購物0浪費?",
    type: 'single',
    options: ["購物前做好購物清單，只買需要物品", "購物時查看保存期限，只買需要的量", "購物後要分類保存，盡快善用", "以上皆是"],
    correctAnswer: "以上皆是"
  },
  {
    text: "07.何種購物習慣可以減少塑膠浪費?",
    type: 'single',
    options: ["大量使用一次性塑膠袋", "購買商品時拒絕使用再生袋", "為了方便將商品分開使用多個袋子", "自備環保袋，避免買商店的購物袋"],
    correctAnswer: "自備環保袋，避免買商店的購物袋"
  },
  {
    text: "08.何者是減少塑膠使用的方法?",
    type: 'single',
    options: ["隨身攜帶購物袋", "優先購買非塑膠包裝的產品", "將塑膠包裝分類回收或再利用", "以上皆是"],
    correctAnswer: "以上皆是"
  },
  {
    text: "09.哪種是支持零塑生活的方式?",
    type: 'single',
    options: ["喝飲料自備環保杯", "外食使用自備環保餐具", "使用無塑替代用品", "以上皆是"],
    correctAnswer: "以上皆是"
  },
  {
    text: "10.日常生活中哪種不是減少塑膠使用的行為?",
    type: 'single',
    options: ["使用可再生包裝", "用自備吸管喝飲料", "愛用塑膠小包裝的商品", "使用再生材料餐具"],
    correctAnswer: "愛用塑膠小包裝的商品"
  }
];

// 等待資料庫連接完成
setTimeout(async () => {
  try {
    if (dbConnection.readyState === 1) {
      console.log('=== 資料庫連接測試成功 ===\n');

      // 詢問使用者是否清空資料庫
      rl.question('是否清空既有的題目和測驗資料？(y/n): ', async (answer) => {
        try {
          const shouldClear = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
          await importData(shouldClear);
          console.log('\n✓ 腳本執行完成');
          rl.close();
          process.exit(0);
        } catch (error) {
          console.error('✗ 執行過程中出錯:', error);
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

async function importData(shouldClear = true) {
  try {
    // 根據使用者選擇決定是否刪除既有資料
    if (shouldClear) {
      console.log('\n清空既有資料中...');
      await Question.deleteMany({});
      await Exam.deleteMany({});
      console.log('✓ 既有題目和測驗資料已清除');
    } else {
      console.log('\n保留既有資料，開始新增題目...');
    }

    // 建立前測題目
    console.log('\n開始建立前測題目...');
    const pretestQuestions = await createQuestions(pretestData);
    console.log(`✓ 前測題目建立完成 (${pretestQuestions.length} 筆)`);

    // 建立後測題目
    console.log('\n開始建立後測題目...');
    const protestQuestions = await createQuestions(protestData);
    console.log(`✓ 後測題目建立完成 (${protestQuestions.length} 筆)`);

    // 建立前測測驗
    console.log('\n開始建立前測測驗...');
    const pretestExam = await Exam.create({
      title: '前測-食物浪費與塑膠減量知識評量',
      description: '此測驗評量學生對食物銀行、物資分享與聰明購物的基本概念理解',
      questions: pretestQuestions.map(q => q._id),
      timeLimit: 0,
      passingScore: 60,
      allowFailToContinue: false,
      isActive: true
    });
    console.log(`✓ 前測測驗建立完成: ${pretestExam.title}`);

    // 建立後測測驗
    console.log('\n開始建立後測測驗...');
    const protestExam = await Exam.create({
      title: '後測-食物浪費與塑膠減量知識評量',
      description: '此測驗評量學生在課程後對食物銀行、物資分享與聰明購物的概念理解',
      questions: protestQuestions.map(q => q._id),
      timeLimit: 0,
      passingScore: 60,
      allowFailToContinue: false,
      isActive: true
    });
    console.log(`✓ 後測測驗建立完成: ${protestExam.title}`);

    console.log('\n=== 匯入統計 ===');
    console.log(`前測題目: ${pretestQuestions.length} 筆`);
    console.log(`後測題目: ${protestQuestions.length} 筆`);
    console.log(`前測測驗: 1 筆`);
    console.log(`後測測驗: 1 筆`);
  } catch (err) {
    console.error('✗ 匯入過程中出錯:', err.message);
    throw err;
  }
}

async function createQuestions(questionsData) {
  const createdQuestions = [];

  for (const data of questionsData) {
    try {
      // 找出正確答案的索引
      const correctAnswerIndex = data.options.indexOf(data.correctAnswer);
      if (correctAnswerIndex === -1) {
        throw new Error(`找不到正確答案: ${data.correctAnswer} in ${data.text}`);
      }

      // 建立選項陣列（初始時使用空的 correctAnswer）
      const options = data.options.map(optionText => ({
        text: optionText
      }));

      // 第一步：建立題目並保存（跳過驗證以獲得 options 的 _id）
      const tempQuestion = new Question({
        text: data.text,
        type: data.type,
        options: options,
        correctAnswer: [] // 臨時設為空陣列，待後續更新
      });

      // 跳過驗證直接保存
      await tempQuestion.save({ validateBeforeSave: false });

      // 第二步：重新查詢以獲得完整的 options 及其 _id
      const savedQuestion = await Question.findById(tempQuestion._id);

      if (!savedQuestion || !savedQuestion.options || savedQuestion.options.length === 0) {
        throw new Error(`無法獲得選項資訊`);
      }

      // 第三步：獲得正確選項的 _id
      const correctOptionId = savedQuestion.options[correctAnswerIndex]._id;

      console.log(`  [除錯] 題目ID: ${savedQuestion._id}`);
      console.log(`  [除錯] 題目類型: ${savedQuestion.type}`);
      console.log(`  [除錯] 選項總數: ${savedQuestion.options.length}`);
      console.log(`  [除錯] 正確答案索引: ${correctAnswerIndex}`);
      console.log(`  [除錯] 正確選項文本: ${savedQuestion.options[correctAnswerIndex].text}`);
      console.log(`  [除錯] 正確選項ID: ${correctOptionId}`);
      console.log(`  [除錯] 選項ID類型: ${typeof correctOptionId}`);

      // 第四步：直接修改並保存（使用 markModified 確保 mongoose 知道有變化）
      savedQuestion.correctAnswer = [correctOptionId];
      savedQuestion.markModified('correctAnswer');

      console.log(`  [除錯] 即將保存，correctAnswer: ${savedQuestion.correctAnswer}`);

      try {
        await savedQuestion.save();
        createdQuestions.push(savedQuestion);
        console.log(`  ✓ ${data.text.substring(0, 40)}...`);
      } catch (innerErr) {
        console.error(`  [除錯] 內部保存失敗: ${innerErr.message}`);
        throw innerErr;
      }
    } catch (err) {
      console.error(`  ✗ 建立題目失敗: ${data.text}`);
      console.error(`    錯誤: ${err.message}`);
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          console.error(`    ${key}: ${err.errors[key].message}`);
        });
      }
      throw err;
    }
  }

  return createdQuestions;
}
