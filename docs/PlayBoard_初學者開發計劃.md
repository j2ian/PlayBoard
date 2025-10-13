# PlayBoard 初學者兩週開發計劃 (姓名識別版本)

## 專案概述
針對完全不熟悉Node.js和Vue的初學者，本計劃提供簡化的開發路徑，專注於兩週內建立基礎功能架構。本系統特點是學生只需輸入姓名即可開始使用Playbook進行學習，系統會記錄該姓名的學習進度。

---

## 目前進度總結（2024/06/09）

- [x] 測驗（Exam/Quiz）CRUD 後台功能（新增、編輯、刪除、詳情、列表、分頁、搜尋、排序）
- [x] 題目（Question）CRUD 後台功能（含分類、排序、綁定檢查）
- [x] 刪除題目時檢查綁定，並顯示綁定測驗清單
- [x] 前台公開測驗作答頁（/exams/:id/take，無需登入）
- [x] 測驗詳情頁可一鍵開啟公開作答連結
- [x] 所有表單驗證、錯誤提示、UI優化
- [x] 搜尋、排序、分頁功能（題目/測驗皆支援）
- [x] 權限驗證（後台需登入，前台作答免登入）
- [ ] 其他內容（Playbook、知識頁、問卷、遊戲等）待開發

---

## 開發環境設置 (第1天)

### 工具安裝
- [v] 安裝Node.js和npm (https://nodejs.org/zh-tw/download/)
- [v] 安裝Visual Studio Code編輯器 (https://code.visualstudio.com/) 
- [v] 安裝Git (https://git-scm.com/downloads)
- [v] 安裝Vue CLI: `npm install -g @vue/cli`
- [v] 安裝MongoDB (https://www.mongodb.com/try/download/community) 或註冊免費MongoDB Atlas雲端帳戶

### 學習資源 (自學參考)
- 基礎Node.js: https://nodejs.dev/learn
- Vue快速入門: https://v3.cn.vuejs.org/guide/introduction.html
- Express基礎: https://expressjs.com/zh-tw/starter/installing.html

## 第一週: 後端基礎開發

### 第1-2天: 專案初始化和設置
- [x] 建立專案資料夾結構
- [x] 初始化前後端專案
- [x] 設置基本環境變數和配置文件
- [x] 設置基本資料庫連接

#### 指令參考
```bash
# 建立專案資料夾
mkdir PlayBoard
cd PlayBoard

# 初始化後端
mkdir server
cd server
npm init -y
npm install express mongoose cors dotenv multer

# 建立基本目錄結構
mkdir config controllers models routes middleware public public/games public/knowledge

# 返回根目錄並初始化前端
cd ..
vue create client
cd client
npm install axios vue-router@4 chart.js
```

### 第3-4天: 後端核心模型設計
- [ ] 設計並實現Playbook模型 (教學路線)
- [ ] 設計並實現PlaybookStep模型 (步驟)
- [ ] 設計並實現知識頁面模型 (Knowledge)
- [x] 設計並實現測驗模型 (Quiz/Exam)
- [ ] 設計並實現問卷模型 (Survey)
- [ ] 設計並實現遊戲模型 (Game)
- [ ] 設計並實現進度追踪模型 (Progress)

### 第5-7天: 核心API開發
- [ ] 實現學生姓名管理API (註冊/驗證)
- [ ] 實現Playbook基本CRUD API
- [ ] 實現PlaybookStep管理API
- [ ] 實現知識頁面管理API (上傳HTML)
- [x] 實現測驗管理API（CRUD、搜尋、排序、分頁、題目綁定檢查）
- [ ] 實現問卷管理API
- [ ] 實現遊戲上傳API (ZIP處理)
- [ ] 實現基於姓名的學習進度追踪API

## 第二週: 前端開發與整合

### 第8-10天: 前端頁面開發
- [ ] 實現首頁與姓名輸入表單
- [x] 實現教師後台測驗管理頁面（Exam CRUD、詳情、分頁、搜尋、排序、複製/開啟連結）
- [x] 實現教師後台題目管理頁面（Question CRUD、排序、分頁、綁定檢查）
- [ ] 實現知識頁面管理界面
- [x] 實現公開測驗作答頁（/exams/:id/take，無需登入）
- [ ] 實現問卷管理界面
- [ ] 實現遊戲上傳管理界面
- [ ] 實現Playbook編輯界面
- [ ] 實現學生Playbook執行流程頁面

### 第11-12天: 功能整合
- [x] 連接前後端API（測驗/題目）
- [ ] 實現姓名儲存機制 (本地存儲+後端驗證)
- [ ] 實現基本的Playbook流程執行功能
- [ ] 實現各類型內容的展示和互動
- [ ] 測試並修復主要流程問題

### 第13-14天: 測試與部署
- [ ] 進行系統測試
- [ ] 測試各種內容類型的整合
- [ ] 修復發現的問題
- [ ] 準備基本部署文檔
- [ ] 部署到開發環境

---

## 新增功能紀錄
- [x] 題目刪除時自動檢查綁定測驗，並彈窗顯示所有綁定清單
- [x] 測驗詳情頁可一鍵開啟公開作答連結
- [x] 前台公開作答頁支援單選/複選自動批改與分數顯示
- [x] 所有表單、列表、彈窗皆已中文化與優化

---

## 下一步建議
- 完成學生姓名識別與進度追蹤
- 開發Playbook、知識頁、問卷、遊戲等內容管理與執行功能
- 增加學生端學習流程與進度記錄
- 強化測驗/題目分析與報表
- 增加自動化測試與部署腳本

## 簡化的專案結構

```
PlayBoard/
│
├── server/                  # 後端代碼
│   ├── config/              # 配置文件
│   │   └── db.js            # 資料庫連接配置
│   │   └── config.js        # 系統配置
│   │
│   ├── controllers/         # 控制器
│   │   ├── studentController.js   # 學生相關
│   │   ├── playbookController.js  # Playbook相關
│   │   ├── knowledgeController.js # 知識頁面相關
│   │   ├── quizController.js      # 測驗相關
│   │   ├── surveyController.js    # 問卷相關
│   │   ├── gameController.js      # 遊戲相關
│   │   └── progressController.js  # 進度相關
│   │
│   ├── models/              # 資料模型
│   │   ├── Student.js       # 學生模型
│   │   ├── Playbook.js      # Playbook模型
│   │   ├── PlaybookStep.js  # Playbook步驟模型
│   │   ├── Knowledge.js     # 知識頁面模型
│   │   ├── Quiz.js          # 測驗模型
│   │   ├── Survey.js        # 問卷模型
│   │   ├── Game.js          # 遊戲模型
│   │   └── Progress.js      # 進度模型
│   │
│   ├── routes/              # API路由
│   │   ├── students.js      # 學生路由
│   │   ├── playbooks.js     # Playbook相關路由
│   │   ├── knowledge.js     # 知識頁面相關路由
│   │   ├── quizzes.js       # 測驗相關路由
│   │   ├── surveys.js       # 問卷相關路由
│   │   ├── games.js         # 遊戲相關路由
│   │   └── progress.js      # 進度相關路由
│   │
│   ├── middleware/          # 中間件
│   │   ├── student.js       # 學生驗證中間件
│   │   └── upload.js        # 文件上傳中間件
│   │
│   ├── public/              # 靜態資源目錄
│   │   ├── games/           # 遊戲文件存儲
│   │   └── knowledge/       # 知識頁面存儲
│   │
│   ├── .env                 # 環境變數
│   ├── package.json         # 後端依賴
│   └── server.js            # 入口文件
│
└── client/                  # Vue前端
    ├── public/              # 靜態資源
    │
    ├── src/
    │   ├── assets/          # 靜態資源
    │   ├── components/      # Vue組件
    │   │   ├── common/      # 通用組件
    │   │   ├── playbook/    # Playbook相關組件
    │   │   ├── student/     # 學生相關組件
    │   │   ├── knowledge/   # 知識頁面相關組件
    │   │   ├── quiz/        # 測驗相關組件
    │   │   ├── survey/      # 問卷相關組件
    │   │   └── game/        # 遊戲相關組件
    │   │
    │   ├── views/           # 頁面視圖
    │   │   ├── Home.vue     # 首頁
    │   │   ├── StudentInput.vue   # 姓名輸入頁
    │   │   ├── teacher/     # 教師後台相關頁面
    │   │   │   ├── Dashboard.vue       # 教師儀表板
    │   │   │   ├── KnowledgeManage.vue # 知識頁面管理
    │   │   │   ├── QuizManage.vue      # 測驗管理
    │   │   │   ├── SurveyManage.vue    # 問卷管理
    │   │   │   ├── GameManage.vue      # 遊戲管理
    │   │   │   └── PlaybookManage.vue  # Playbook管理
    │   │   │
    │   │   └── student/     # 學生相關頁面
    │   │       ├── PlaybookList.vue    # Playbook列表
    │   │       ├── PlaybookPlay.vue    # Playbook執行頁
    │   │       ├── KnowledgeView.vue   # 知識頁面查看
    │   │       ├── QuizTake.vue        # 測驗參與頁
    │   │       ├── SurveyTake.vue      # 問卷填寫頁
    │   │       └── GamePlay.vue        # 遊戲頁面
    │   │
    │   ├── router/          # 路由配置
    │   ├── store/           # 狀態管理
    │   ├── services/        # API服務
    │   ├── utils/           # 工具函數
    │   │   └── student.js   # 學生姓名管理
    │   ├── App.vue          # 根組件
    │   └── main.js          # 入口文件
    │
    ├── package.json         # 前端依賴
    └── vue.config.js        # Vue配置
```

## 核心功能實現指南

### 學生姓名識別機制
- 首次訪問時要求輸入姓名
- 姓名存儲在本地存儲(localStorage)以便後續訪問
- 後端驗證姓名，若不存在則創建新記錄
- 所有學習操作都基於姓名識別學生

### 內容類型管理

#### 知識頁面管理
- 允許上傳HTML靜態頁面
- 設置標題、描述和分類
- 預覽功能

#### 測驗管理
- 創建測驗題目
- 支持單選、多選、圖文題
- 設定正確答案和解析

#### 問卷管理
- 創建問卷調查
- 支持不同類型的問題
- 設定基本屬性

#### 遊戲管理
- 上傳HTML/JS遊戲壓縮包
- 自動解壓到公開目錄
- 設定遊戲基本信息

### Playbook管理
- 創建Playbook並命名
- 新增多個步驟，支援四種內容類型
- 設定步驟順序
- 生成分享連結

### 學習進度追踪
- 記錄學生當前進行到的步驟
- 儲存每個步驟的完成狀態
- 記錄測驗結果和問卷回覆
- 所有數據存儲在MongoDB

## 每日檢查清單

### 每天開始前
- [ ] 回顧昨天的進度和今天的目標
- [ ] 確認今天需要完成的具體任務
- [ ] 準備好所需資源和參考文檔

### 每天結束時
- [ ] 總結今天的進度
- [ ] 記錄遇到的問題和解決方法
- [ ] 確認明天的計劃和目標

## 資料模型參考

### Student模型
```javascript
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
```

### Playbook模型
```javascript
const mongoose = require('mongoose');

const PlaybookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  creatorId: {
    type: String,
    required: true
  },
  shareCode: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Playbook', PlaybookSchema);
```

### PlaybookStep模型
```javascript
const mongoose = require('mongoose');

const PlaybookStepSchema = new mongoose.Schema({
  playbookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playbook',
    required: true
  },
  stepNumber: {
    type: Number,
    required: true
  },
  stepType: {
    type: String,
    enum: ['quiz', 'survey', 'game', 'knowledge'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

module.exports = mongoose.model('PlaybookStep', PlaybookStepSchema);
```

### Progress模型
```javascript
const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    ref: 'Student'
  },
  playbookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Playbook'
  },
  currentStep: {
    type: Number,
    default: 0
  },
  completedSteps: [{
    type: Number
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  completionTime: Date,
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
```

## 核心API參考

### 學生API
```
POST /api/student/register-name - 學生輸入姓名開始學習
GET /api/student/verify/:name - 驗證學生姓名是否存在
```

### Playbook學習API
```
GET /api/playbook/:code - 獲取特定Playbook詳情
GET /api/playbook/:code/next-step - 獲取下一個學習步驟
POST /api/playbook/:code/step-done - 標記步驟完成
GET /api/playbook/:code/status - 獲取整體進度
```

### 內容管理API
```
// 知識頁面
POST /api/knowledge/upload - 上傳知識頁面
GET /api/knowledge - 獲取知識頁面列表
GET /api/knowledge/:id - 獲取特定知識頁面

// 測驗
GET /api/quizzes - 獲取測驗列表
POST /api/quizzes - 創建測驗
POST /api/quizzes/:id/questions - 新增測驗題目

// 問卷
GET /api/surveys - 獲取問卷列表
POST /api/surveys - 創建問卷
POST /api/surveys/:id/questions - 新增問卷題目

// 遊戲
POST /api/games/upload - 上傳遊戲壓縮包
GET /api/games - 獲取遊戲列表
GET /api/games/:slug - 獲取特定遊戲
```

## 開發優先順序
1. 建立基本專案架構和資料庫連接
2. 實現學生姓名識別系統
3. 實現最基本的知識頁面上傳與顯示
4. 實現簡單的Playbook創建與步驟管理
5. 實現Playbook學習流程和進度追踪
6. 逐步新增其他內容類型 (測驗、問卷、遊戲)

這個簡化版實現專注於核心功能，確保初學者能在兩週內完成基本開發框架。 