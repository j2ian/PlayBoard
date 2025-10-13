# PlayBoard 系統功能模組整理

## 專案概述

PlayBoard 是一個基於 Node.js + Vue 3 的互動式數位教材平台，支援測驗、問卷調查、內容管理、PlayBook 學習路徑等多種學習工具。系統採用前後端分離架構，使用 MongoDB 作為資料庫，提供完整的學習管理和進度追蹤功能。

## 技術架構

### 後端技術棧
- **框架**: Node.js + Express.js
- **資料庫**: MongoDB + Mongoose ODM
- **認證**: JWT (JSON Web Token) + bcryptjs
- **檔案處理**: Multer (檔案上傳)
- **工具**: slugify (URL 友善化)、cors (跨域處理)
- **測試**: Jest + mongodb-memory-server + supertest

### 前端技術棧
- **框架**: Vue 3 + Vite
- **UI 框架**: Element Plus
- **樣式**: TailwindCSS
- **路由**: Vue Router 4
- **HTTP 客戶端**: Axios
- **富文本編輯**: Vue Quill (@vueup/vue-quill)
- **Markdown 處理**: marked

## 系統角色

### 1. 管理者 (Admin)
- 系統管理與維護
- 用戶權限管理
- 系統配置管理

### 2. 教師 (Teacher)
- 內容建立與管理
- PlayBook 設計與管理
- 學習數據分析
- 學生進度監控

### 3. 學生 (Student)
- 透過姓名識別進行學習
- 無需註冊或登入
- 參與 PlayBook 學習路徑
- 完成測驗和問卷

## 核心功能模組

### 1. 用戶認證系統

#### 功能特色
- JWT 身份驗證
- 密碼加密存儲 (bcryptjs)
- 角色權限控制
- 自動登入狀態管理

#### 相關文件
- **模型**: `server/models/User.js`
- **控制器**: `server/controllers/authController.js`
- **路由**: `server/routes/authRoutes.js`
- **中間件**: `server/middleware/auth.js`
- **前端服務**: `client/src/services/auth.service.js`
- **前端頁面**: `client/src/views/Login.vue`

#### API 端點
```
POST /api/auth/login     # 用戶登入
POST /api/auth/logout    # 用戶登出
GET  /api/auth/profile   # 獲取用戶資料
```

### 2. 內容管理系統 (Content Management)

#### 功能特色
- 富文本內容編輯 (Vue Quill)
- Markdown 支援
- 圖片上傳與管理
- 內容版本控制
- 分類標籤管理
- 發布狀態控制

#### 相關文件
- **模型**: `server/models/Content.js`
- **控制器**: `server/controllers/contentController.js`
- **路由**: `server/routes/contentRoutes.js`
- **前端服務**: `client/src/services/content.service.js`
- **管理頁面**: 
  - `client/src/views/admin/ContentList.vue`
  - `client/src/views/admin/ContentCreate.vue`
  - `client/src/views/admin/ContentEdit.vue`
  - `client/src/views/admin/ContentRead.vue`
- **公開頁面**: 
  - `client/src/views/ContentList.vue`
  - `client/src/views/ContentView.vue`

#### API 端點
```
GET    /api/content              # 獲取內容列表
POST   /api/content              # 創建新內容
GET    /api/content/:id          # 獲取內容詳情
PUT    /api/content/:id          # 更新內容
DELETE /api/content/:id          # 刪除內容
POST   /api/content/:id/images   # 上傳圖片
```

### 3. 測驗系統 (Exam System)

#### 功能特色
- 題目分類管理
- 多種題型支援 (單選、多選、圖文題)
- 測驗時間限制
- 及格分數設定
- 自動批改功能
- 公開測驗連結
- 測驗結果統計

#### 相關文件
- **模型**: 
  - `server/models/Exam.js`
  - `server/models/Question.js`
  - `server/models/QuestionCategory.js`
- **控制器**: 
  - `server/controllers/examController.js`
  - `server/controllers/questionController.js`
- **路由**: 
  - `server/routes/examRoutes.js`
  - `server/routes/questionRoutes.js`
- **前端服務**: 
  - `client/src/services/exam.service.js`
  - `client/src/services/question.service.js`
- **管理頁面**: 
  - `client/src/views/admin/ExamList.vue`
  - `client/src/views/admin/ExamCreate.vue`
  - `client/src/views/admin/ExamEdit.vue`
  - `client/src/views/admin/ExamRead.vue`
  - `client/src/views/admin/QuestionList.vue`
  - `client/src/views/admin/QuestionCreate.vue`
  - `client/src/views/admin/QuestionEdit.vue`
  - `client/src/views/admin/QuestionRead.vue`
- **公開頁面**: `client/src/views/ExamTake.vue`

#### API 端點
```
# 測驗管理
GET    /api/exams                # 獲取測驗列表
POST   /api/exams                # 創建測驗
GET    /api/exams/:id            # 獲取測驗詳情
PUT    /api/exams/:id            # 更新測驗
DELETE /api/exams/:id            # 刪除測驗

# 題目管理
GET    /api/questions            # 獲取題目列表
POST   /api/questions            # 創建題目
GET    /api/questions/:id        # 獲取題目詳情
PUT    /api/questions/:id        # 更新題目
DELETE /api/questions/:id        # 刪除題目

# 公開測驗
GET    /api/exams/:id/take       # 獲取公開測驗
POST   /api/exams/:id/submit     # 提交測驗答案
```

### 4. 問卷調查系統 (Survey System)

#### 功能特色
- 多種題型支援 (單選、多選、文字、李克特量表)
- 李克特 5 階級量表 (非常不同意 → 非常同意)
- 問卷統計分析
- 回答數據匯出
- 公開問卷連結
- 即時統計圖表

#### 相關文件
- **模型**: 
  - `server/models/Survey.js`
  - `server/models/SurveyResponse.js`
- **控制器**: `server/controllers/surveyController.js`
- **路由**: `server/routes/surveyRoutes.js`
- **前端服務**: `client/src/services/survey.service.js`
- **管理頁面**: 
  - `client/src/views/admin/SurveyList.vue`
  - `client/src/views/admin/SurveyCreate.vue`
  - `client/src/views/admin/SurveyEdit.vue`
  - `client/src/views/admin/SurveyRead.vue`
  - `client/src/views/admin/SurveyResponses.vue`
- **公開頁面**: `client/src/views/SurveyTake.vue`

#### API 端點
```
# 問卷管理
GET    /api/surveys              # 獲取問卷列表
POST   /api/surveys              # 創建問卷
GET    /api/surveys/:id          # 獲取問卷詳情
PUT    /api/surveys/:id          # 更新問卷
DELETE /api/surveys/:id          # 刪除問卷
GET    /api/surveys/:id/responses # 獲取回答統計

# 公開問卷
POST   /api/surveys/:id/responses # 提交問卷回答
```

### 5. PlayBook 學習路徑系統

#### 功能特色
- 結構化學習路徑管理
- 多步驟組合 (內容、測驗、問卷)
- 兩種展示模式 (總覽模式、逐步模式)
- 進度追蹤與統計
- 時間記錄功能
- 學習數據分析
- 結果下載功能 (JSON/CSV)

#### 相關文件
- **模型**: 
  - `server/models/PlayBook.js`
  - `server/models/PlayBookProgress.js`
- **控制器**: `server/controllers/playBookController.js`
- **路由**: `server/routes/playBookRoutes.js`
- **前端服務**: `client/src/services/playbook.service.js`
- **管理頁面**: 
  - `client/src/views/admin/PlayBookList.vue`
  - `client/src/views/admin/PlayBookCreate.vue`
  - `client/src/views/admin/PlayBookEdit.vue`
  - `client/src/views/admin/PlayBookRead.vue`
  - `client/src/views/admin/PlayBookStats.vue`
- **公開頁面**: 
  - `client/src/views/PlayBookPlayer.vue`
  - `client/src/views/PlayBookStepPlayer.vue`
  - `client/src/views/PlayBookStepContentView.vue`
  - `client/src/views/PlayBookCompletedView.vue`

#### API 端點
```
# 管理員 API
GET    /api/playbooks            # 獲取 PlayBook 列表
POST   /api/playbooks            # 創建 PlayBook
GET    /api/playbooks/:id        # 獲取 PlayBook 詳情
PUT    /api/playbooks/:id        # 更新 PlayBook
DELETE /api/playbooks/:id        # 刪除 PlayBook
GET    /api/playbooks/:id/stats  # 獲取統計數據
GET    /api/playbooks/:id/download # 下載結果

# 公開 API
GET    /api/playbooks/public     # 獲取公開 PlayBook 列表
GET    /api/playbooks/public/:slug # 根據 slug 獲取 PlayBook
GET    /api/playbooks/categories # 獲取分類列表

# 進度管理
POST   /api/playbooks/:id/progress # 獲取或創建進度
PUT    /api/playbooks/:id/progress/:stepNumber # 更新步驟進度
POST   /api/playbooks/:id/progress/reset # 重置進度
```

### 6. 進度追蹤系統

#### 功能特色
- 基於姓名的用戶識別
- 步驟級別進度記錄
- 時間追蹤功能
- 完成狀態管理
- 學習數據統計
- 離線進度保存

#### 時間追蹤功能
- **步驟時間追蹤**: 記錄每個步驟的開始和結束時間
- **內容閱讀時間**: 實時顯示內容閱讀進度
- **詳細時間統計**: 提供步驟級別和整體的時間分析
- **離線支援**: 網路中斷時仍能記錄時間數據
- **時間格式化**: 智能顯示分鐘、小時等時間單位

#### 統計分析功能
- **總用戶數**: 參與該 PlayBook 的用戶總數
- **完成用戶數**: 已完成整個 PlayBook 的用戶數
- **完成率**: 完成用戶數 / 總用戶數
- **平均進度**: 所有用戶的平均完成進度
- **時間統計**: 平均完成時間、最短/最長完成時間

## 資料庫設計

### 核心模型

#### 1. User (用戶)
```javascript
{
  username: String,      // 用戶名
  password: String,      // 加密密碼
  role: String,          // 角色 (admin/teacher)
  email: String,         // 電子郵件
  createdAt: Date,       // 創建時間
  lastLogin: Date        // 最後登入時間
}
```

#### 2. Content (內容)
```javascript
{
  title: String,         // 標題
  slug: String,          // URL 識別符
  description: String,   // 描述
  content: String,       // 內容 (HTML/Markdown)
  status: String,        // 狀態 (draft/published)
  tags: [String],        // 標籤
  images: [Object],      // 圖片資訊
  createdBy: ObjectId,   // 創建者
  timestamps: true       // 自動時間戳
}
```

#### 3. Exam (測驗)
```javascript
{
  title: String,         // 測驗標題
  description: String,   // 描述
  questions: [ObjectId], // 題目陣列
  timeLimit: Number,     // 時間限制 (分鐘)
  passingScore: Number,  // 及格分數
  status: String,        // 狀態
  createdBy: ObjectId,   // 創建者
  timestamps: true       // 自動時間戳
}
```

#### 4. Question (題目)
```javascript
{
  text: String,          // 題目內容
  type: String,          // 題型 (single/multiple)
  options: [String],     // 選項
  correctAnswers: [Number], // 正確答案索引
  explanation: String,   // 解析
  category: ObjectId,    // 分類
  difficulty: String,    // 難度
  createdBy: ObjectId,   // 創建者
  timestamps: true       // 自動時間戳
}
```

#### 5. Survey (問卷)
```javascript
{
  title: String,         // 問卷標題
  description: String,   // 描述
  questions: [{          // 問題陣列
    text: String,        // 問題內容
    type: String,        // 題型 (single/multiple/text/likert)
    options: [String],   // 選項 (僅單選/多選使用)
    isPositive: Boolean  // 正面/負面題目標記
  }],
  createdBy: ObjectId,   // 創建者
  timestamps: true       // 自動時間戳
}
```

#### 6. SurveyResponse (問卷回答)
```javascript
{
  survey: ObjectId,      // 關聯問卷
  studentName: String,   // 學生姓名
  playbook: ObjectId,    // 關聯學習路徑 (可選)
  responses: Map,        // 回答內容
  completionTime: Date,  // 完成時間
  timestamps: true       // 自動時間戳
}
```

#### 7. PlayBook (學習路徑)
```javascript
{
  title: String,         // PlayBook 標題
  slug: String,          // URL 識別符
  description: String,   // 描述
  steps: [{              // 步驟陣列
    stepNumber: Number,  // 步驟編號
    type: String,        // 步驟類型 (content/exam/survey)
    resourceId: ObjectId, // 關聯的資源 ID
    title: String,       // 步驟標題
    description: String, // 步驟描述
    isRequired: Boolean, // 是否為必須步驟
    timeLimit: Number    // 時間限制 (分鐘)
  }],
  status: String,        // 狀態 (draft/published)
  displayType: String,   // 展示模式 (overview/stepByStep)
  estimatedTime: Number, // 預估完成時間 (分鐘)
  tags: [String],        // 標籤
  category: String,      // 分類
  difficulty: String,    // 難度
  viewCount: Number,     // 瀏覽次數
  completionCount: Number, // 完成次數
  createdBy: ObjectId,   // 創建者
  timestamps: true       // 自動時間戳
}
```

#### 8. PlayBookProgress (學習進度)
```javascript
{
  playBook: ObjectId,    // PlayBook ID
  userId: String,        // 用戶唯一識別符
  userName: String,      // 用戶顯示名稱
  currentStep: Number,   // 當前步驟編號
  completedSteps: [Number], // 已完成步驟陣列
  stepResults: Map,      // 每個步驟的詳細結果
  totalSteps: Number,    // 總步驟數
  startedAt: Date,       // 開始時間
  lastActiveAt: Date,    // 最後活動時間
  completedAt: Date,     // 完成時間
  timeSpent: Number,     // 總花費時間 (秒)
  isCompleted: Boolean,  // 是否已完成
  completionRate: Number // 完成率百分比
}
```

## 前端組件架構

### 管理員組件
- **AdminLayout.vue**: 管理員佈局組件
- **AdminSidebar.vue**: 側邊欄導航
- **RichTextEditor.vue**: 富文本編輯器
- **SearchFilterBar.vue**: 搜尋篩選欄
- **StatCard.vue**: 統計卡片
- **TagInput.vue**: 標籤輸入組件

### 頁面組件
- **Dashboard.vue**: 管理員儀表板
- **各種 CRUD 頁面**: 列表、創建、編輯、詳情頁面
- **統計分析頁面**: 數據統計和圖表展示
- **公開頁面**: 學生端學習介面

## 系統特色功能

### 1. 滿意度調查功能
- **李克特量表**: 5階級滿意度評分 (非常不同意 → 非常同意)
- **簡述題**: 開放式文字回答
- **即時統計**: 自動生成回答統計與視覺化圖表
- **資料匯出**: 支援 JSON 格式匯出

### 2. 時間追蹤功能
- **步驟時間追蹤**: 記錄每個步驟的開始和結束時間
- **內容閱讀時間**: 實時顯示內容閱讀進度
- **詳細時間統計**: 提供步驟級別和整體的時間分析
- **離線支援**: 網路中斷時仍能記錄時間數據

### 3. 統計分析與下載功能
- **詳細時間統計**: 記錄每個用戶的學習時間
- **步驟級別分析**: 追蹤每個步驟的完成情況
- **多格式下載**: 支援 JSON 和 CSV 格式下載
- **完整數據導出**: 包含用戶進度、時間記錄等完整信息

### 4. 公開邏輯控制
- **狀態控制**: 僅由 `status` 控制公開與否
- **前端設定**: 可透過設定檔控制功能顯示
- **展示模式**: 支援總覽模式和逐步模式

## 測試系統

### 測試工具
- **Jest**: JavaScript 測試框架
- **mongodb-memory-server**: 記憶體 MongoDB 伺服器
- **Supertest**: HTTP 伺服器測試

### 測試覆蓋
- **模型測試**: Mongoose Model 驗證
- **API 測試**: 路由端點測試
- **整合測試**: 前後端整合測試

## 部署與配置

### 環境變數
- **資料庫連接**: MongoDB 連接字串
- **JWT 密鑰**: 身份驗證密鑰
- **檔案上傳**: 上傳目錄配置
- **CORS 設定**: 跨域請求配置

### 開發環境
```bash
# 後端
cd server
npm install
npm run dev

# 前端
cd client
npm install
npm run dev
```

### 生產環境
1. 建置前端：`npm run build`
2. 設定環境變數
3. 啟動後端服務
4. 配置反向代理

## 系統優勢

### 1. 技術優勢
- **現代化技術棧**: Vue 3 + Node.js + MongoDB
- **前後端分離**: 清晰的架構設計
- **響應式設計**: 支援桌面和移動設備
- **模組化設計**: 易於維護和擴展

### 2. 功能優勢
- **無需註冊**: 學生只需輸入姓名即可學習
- **靈活組合**: PlayBook 支援多種內容類型組合
- **進度追蹤**: 完整的學習進度記錄
- **數據分析**: 豐富的統計分析功能

### 3. 用戶體驗優勢
- **直觀介面**: 使用 Element Plus 提供良好的 UI
- **即時反饋**: 測驗自動批改、進度即時更新
- **離線支援**: 網路中斷時仍能記錄進度
- **多格式支援**: 支援多種內容格式和匯出格式

## 未來發展方向

### 功能擴展
- [ ] 問卷模板系統
- [ ] 批量匯入問題
- [ ] 更多統計圖表類型
- [ ] 自動報告生成
- [ ] 問卷有效期設定
- [ ] 遊戲上傳功能
- [ ] 多語言支援

### 效能優化
- [ ] 大量回答資料分頁
- [ ] 統計資料快取
- [ ] 資料庫索引優化
- [ ] 圖片壓縮優化

### 系統增強
- [ ] 自動化測試覆蓋
- [ ] 部署自動化
- [ ] 監控與日誌系統
- [ ] 備份與恢復機制

---

**PlayBoard 系統** - 讓教育回饋更簡單、更有效！提供完整的數位學習解決方案，支援多種學習工具和進度追蹤功能。
