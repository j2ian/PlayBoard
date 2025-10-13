# PlayBoard 系統測試計劃與執行順序

## 測試概述

本文檔提供 PlayBoard 系統的完整測試計劃，包括現有測試的執行順序、缺失測試的補充計劃，以及確保所有功能正常運作的測試策略。

## 現有測試覆蓋分析

### ✅ 已完成的測試模組

#### 1. 內容管理系統 (Content)
- **測試文件**: 
  - `server/tests/content.test.js` - 完整的模型和API測試
  - `server/tests/content-simple.test.js` - 簡化功能測試
- **覆蓋範圍**:
  - ✅ Content 模型驗證
  - ✅ CRUD 操作測試
  - ✅ 公開內容查詢
  - ✅ 分類篩選功能
  - ✅ 狀態管理 (draft/published)
  - ✅ 虛擬欄位測試
  - ✅ API 端點測試

#### 2. 測驗系統 (Exam)
- **測試文件**: 
  - `server/tests/done/exam.test.js` - Exam 模型測試
  - `server/tests/done/examApi.test.js` - Exam API 測試
  - `server/tests/done/examController.test.js` - Exam 控制器測試
- **覆蓋範圍**:
  - ✅ Exam 模型驗證
  - ✅ 題目關聯測試
  - ✅ 時間限制功能
  - ✅ 及格分數設定
  - ✅ API 端點測試
  - ✅ 權限控制測試

#### 3. 題目管理系統 (Question)
- **測試文件**: `server/tests/done/question.test.js`
- **覆蓋範圍**:
  - ✅ Question 模型驗證
  - ✅ 單選題測試
  - ✅ 多選題測試
  - ✅ 答案驗證邏輯
  - ✅ 選項數量驗證

#### 4. 問卷調查系統 (Survey)
- **測試文件**: `server/tests/survey.test.js`
- **覆蓋範圍**:
  - ✅ Survey 模型驗證
  - ✅ 單選題問卷測試
  - ✅ 多選題問卷測試
  - ✅ 文字題問卷測試
  - ✅ 李克特量表測試

### ❌ 缺失的測試模組

#### 1. 用戶認證系統 (Auth)
- **缺失文件**: `server/tests/auth.test.js`
- **需要測試**:
  - ❌ User 模型驗證
  - ❌ 密碼加密功能
  - ❌ JWT 令牌生成和驗證
  - ❌ 登入/登出功能
  - ❌ 權限中間件測試
  - ❌ 角色控制測試

#### 2. PlayBook 學習路徑系統
- **缺失文件**: `server/tests/playbook.test.js`
- **需要測試**:
  - ❌ PlayBook 模型驗證
  - ❌ 步驟管理功能
  - ❌ Slug 自動生成
  - ❌ 展示模式測試
  - ❌ 統計功能測試
  - ❌ API 端點測試

#### 3. 進度追蹤系統 (PlayBookProgress)
- **缺失文件**: `server/tests/playbookProgress.test.js`
- **需要測試**:
  - ❌ PlayBookProgress 模型驗證
  - ❌ 進度創建和更新
  - ❌ 步驟完成邏輯
  - ❌ 時間追蹤功能
  - ❌ 完成狀態管理
  - ❌ 統計計算功能

#### 4. 問卷回答系統 (SurveyResponse)
- **缺失文件**: `server/tests/surveyResponse.test.js`
- **需要測試**:
  - ❌ SurveyResponse 模型驗證
  - ❌ 回答提交功能
  - ❌ 統計分析功能
  - ❌ 數據匯出功能

#### 5. 題目分類系統 (QuestionCategory)
- **缺失文件**: `server/tests/questionCategory.test.js`
- **需要測試**:
  - ❌ QuestionCategory 模型驗證
  - ❌ 分類管理功能
  - ❌ 分類統計功能

## 測試執行順序

### 階段一：基礎設施測試 (優先級：高)

#### 1.1 資料庫連接測試
```bash
# 執行順序：1
npm test -- server/tests/test-db-connection.js
```
- **目的**: 確保測試環境的資料庫連接正常
- **依賴**: 無
- **預期結果**: 資料庫連接成功

#### 1.2 測試環境設定驗證
```bash
# 執行順序：2
npm test -- server/tests/test-db.js
```
- **目的**: 驗證測試環境設定正確
- **依賴**: 資料庫連接
- **預期結果**: 測試環境正常運作

### 階段二：核心模型測試 (優先級：高)

#### 2.1 用戶認證系統測試
```bash
# 執行順序：3 (需要創建)
npm test -- server/tests/auth.test.js
```
- **目的**: 驗證用戶認證功能
- **依賴**: 資料庫連接
- **測試內容**:
  - User 模型創建和驗證
  - 密碼加密和驗證
  - JWT 令牌功能
  - 角色權限控制

#### 2.2 題目分類系統測試
```bash
# 執行順序：4 (需要創建)
npm test -- server/tests/questionCategory.test.js
```
- **目的**: 驗證題目分類功能
- **依賴**: 用戶認證系統
- **測試內容**:
  - QuestionCategory 模型驗證
  - 分類 CRUD 操作
  - 分類統計功能

#### 2.3 題目管理系統測試
```bash
# 執行順序：5
npm test -- server/tests/done/question.test.js
```
- **目的**: 驗證題目管理功能
- **依賴**: 用戶認證、題目分類
- **測試內容**:
  - Question 模型驗證
  - 單選/多選題測試
  - 答案驗證邏輯

### 階段三：內容管理測試 (優先級：高)

#### 3.1 內容管理系統測試
```bash
# 執行順序：6
npm test -- server/tests/content.test.js
```
- **目的**: 驗證內容管理功能
- **依賴**: 用戶認證
- **測試內容**:
  - Content 模型驗證
  - CRUD 操作測試
  - 公開內容查詢
  - 狀態管理

#### 3.2 內容簡化功能測試
```bash
# 執行順序：7
npm test -- server/tests/content-simple.test.js
```
- **目的**: 驗證內容簡化功能
- **依賴**: 內容管理系統
- **測試內容**:
  - 內容生命周期測試
  - 分類統計功能
  - 查詢功能測試

### 階段四：測驗系統測試 (優先級：高)

#### 4.1 測驗模型測試
```bash
# 執行順序：8
npm test -- server/tests/done/exam.test.js
```
- **目的**: 驗證測驗模型功能
- **依賴**: 用戶認證、題目管理
- **測試內容**:
  - Exam 模型驗證
  - 題目關聯測試
  - 時間限制功能

#### 4.2 測驗控制器測試
```bash
# 執行順序：9
npm test -- server/tests/done/examController.test.js
```
- **目的**: 驗證測驗控制器功能
- **依賴**: 測驗模型
- **測試內容**:
  - 控制器邏輯測試
  - 業務邏輯驗證

#### 4.3 測驗 API 測試
```bash
# 執行順序：10
npm test -- server/tests/done/examApi.test.js
```
- **目的**: 驗證測驗 API 功能
- **依賴**: 測驗控制器
- **測試內容**:
  - API 端點測試
  - 權限控制測試
  - 整合測試

### 階段五：問卷系統測試 (優先級：中)

#### 5.1 問卷模型測試
```bash
# 執行順序：11
npm test -- server/tests/survey.test.js
```
- **目的**: 驗證問卷模型功能
- **依賴**: 用戶認證
- **測試內容**:
  - Survey 模型驗證
  - 多種題型測試
  - 李克特量表測試

#### 5.2 問卷回答系統測試
```bash
# 執行順序：12 (需要創建)
npm test -- server/tests/surveyResponse.test.js
```
- **目的**: 驗證問卷回答功能
- **依賴**: 問卷模型
- **測試內容**:
  - SurveyResponse 模型驗證
  - 回答提交功能
  - 統計分析功能

### 階段六：PlayBook 系統測試 (優先級：中)

#### 6.1 PlayBook 模型測試
```bash
# 執行順序：13 (需要創建)
npm test -- server/tests/playbook.test.js
```
- **目的**: 驗證 PlayBook 模型功能
- **依賴**: 用戶認證、內容管理、測驗、問卷
- **測試內容**:
  - PlayBook 模型驗證
  - 步驟管理功能
  - Slug 自動生成
  - 展示模式測試

#### 6.2 進度追蹤系統測試
```bash
# 執行順序：14 (需要創建)
npm test -- server/tests/playbookProgress.test.js
```
- **目的**: 驗證進度追蹤功能
- **依賴**: PlayBook 模型
- **測試內容**:
  - PlayBookProgress 模型驗證
  - 進度創建和更新
  - 時間追蹤功能
  - 完成狀態管理

### 階段七：整合測試 (優先級：低)

#### 7.1 完整流程測試
```bash
# 執行順序：15 (需要創建)
npm test -- server/tests/integration.test.js
```
- **目的**: 驗證完整系統流程
- **依賴**: 所有模組測試
- **測試內容**:
  - 端到端流程測試
  - 跨模組整合測試
  - 效能測試

## 需要創建的測試文件

### 1. 用戶認證系統測試
**文件**: `server/tests/auth.test.js`
```javascript
// 需要測試的功能
describe('Auth System Test', () => {
  // User 模型測試
  describe('User Model', () => {
    it('應能創建有效用戶')
    it('應能加密密碼')
    it('應能驗證密碼')
    it('應能驗證角色權限')
  })
  
  // JWT 功能測試
  describe('JWT Functions', () => {
    it('應能生成有效令牌')
    it('應能驗證令牌')
    it('應能處理過期令牌')
  })
  
  // 認證中間件測試
  describe('Auth Middleware', () => {
    it('應能保護需要認證的路由')
    it('應能驗證角色權限')
    it('應能處理無效令牌')
  })
})
```

### 2. PlayBook 系統測試
**文件**: `server/tests/playbook.test.js`
```javascript
// 需要測試的功能
describe('PlayBook System Test', () => {
  // PlayBook 模型測試
  describe('PlayBook Model', () => {
    it('應能創建有效 PlayBook')
    it('應能自動生成 slug')
    it('應能管理步驟')
    it('應能計算預估時間')
  })
  
  // 步驟管理測試
  describe('Step Management', () => {
    it('應能新增步驟')
    it('應能移除步驟')
    it('應能重新排序步驟')
    it('應能驗證步驟資源')
  })
  
  // 統計功能測試
  describe('Statistics', () => {
    it('應能計算瀏覽次數')
    it('應能計算完成次數')
    it('應能計算完成率')
  })
})
```

### 3. 進度追蹤系統測試
**文件**: `server/tests/playbookProgress.test.js`
```javascript
// 需要測試的功能
describe('PlayBookProgress System Test', () => {
  // PlayBookProgress 模型測試
  describe('PlayBookProgress Model', () => {
    it('應能創建進度記錄')
    it('應能更新進度')
    it('應能計算完成率')
    it('應能記錄時間')
  })
  
  // 步驟完成測試
  describe('Step Completion', () => {
    it('應能完成步驟')
    it('應能記錄步驟結果')
    it('應能更新當前步驟')
    it('應能檢查完成狀態')
  })
  
  // 時間追蹤測試
  describe('Time Tracking', () => {
    it('應能記錄開始時間')
    it('應能記錄結束時間')
    it('應能計算花費時間')
    it('應能格式化時間顯示')
  })
})
```

### 4. 問卷回答系統測試
**文件**: `server/tests/surveyResponse.test.js`
```javascript
// 需要測試的功能
describe('SurveyResponse System Test', () => {
  // SurveyResponse 模型測試
  describe('SurveyResponse Model', () => {
    it('應能創建回答記錄')
    it('應能驗證回答格式')
    it('應能關聯問卷和學生')
  })
  
  // 統計分析測試
  describe('Statistics Analysis', () => {
    it('應能計算李克特量表統計')
    it('應能分析選擇題分布')
    it('應能匯出統計數據')
  })
})
```

### 5. 題目分類系統測試
**文件**: `server/tests/questionCategory.test.js`
```javascript
// 需要測試的功能
describe('QuestionCategory System Test', () => {
  // QuestionCategory 模型測試
  describe('QuestionCategory Model', () => {
    it('應能創建分類')
    it('應能更新分類')
    it('應能刪除分類')
    it('應能統計分類使用情況')
  })
})
```

## 測試執行腳本

### 完整測試執行腳本
**文件**: `server/scripts/run-all-tests.js`
```javascript
const { execSync } = require('child_process');

const testOrder = [
  'server/tests/test-db-connection.js',
  'server/tests/test-db.js',
  'server/tests/auth.test.js',
  'server/tests/questionCategory.test.js',
  'server/tests/done/question.test.js',
  'server/tests/content.test.js',
  'server/tests/content-simple.test.js',
  'server/tests/done/exam.test.js',
  'server/tests/done/examController.test.js',
  'server/tests/done/examApi.test.js',
  'server/tests/survey.test.js',
  'server/tests/surveyResponse.test.js',
  'server/tests/playbook.test.js',
  'server/tests/playbookProgress.test.js',
  'server/tests/integration.test.js'
];

console.log('🚀 開始執行 PlayBoard 系統完整測試...\n');

testOrder.forEach((testFile, index) => {
  try {
    console.log(`[${index + 1}/${testOrder.length}] 執行測試: ${testFile}`);
    execSync(`npm test -- ${testFile}`, { stdio: 'inherit' });
    console.log(`✅ ${testFile} 測試通過\n`);
  } catch (error) {
    console.error(`❌ ${testFile} 測試失敗:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 所有測試執行完成！');
```

### 分階段測試執行腳本
**文件**: `server/scripts/run-stage-tests.js`
```javascript
const { execSync } = require('child_process');

const testStages = {
  'infrastructure': [
    'server/tests/test-db-connection.js',
    'server/tests/test-db.js'
  ],
  'core-models': [
    'server/tests/auth.test.js',
    'server/tests/questionCategory.test.js',
    'server/tests/done/question.test.js'
  ],
  'content-management': [
    'server/tests/content.test.js',
    'server/tests/content-simple.test.js'
  ],
  'exam-system': [
    'server/tests/done/exam.test.js',
    'server/tests/done/examController.test.js',
    'server/tests/done/examApi.test.js'
  ],
  'survey-system': [
    'server/tests/survey.test.js',
    'server/tests/surveyResponse.test.js'
  ],
  'playbook-system': [
    'server/tests/playbook.test.js',
    'server/tests/playbookProgress.test.js'
  ],
  'integration': [
    'server/tests/integration.test.js'
  ]
};

const stage = process.argv[2];

if (!stage || !testStages[stage]) {
  console.log('可用測試階段:');
  Object.keys(testStages).forEach(key => {
    console.log(`  - ${key}`);
  });
  process.exit(1);
}

console.log(`🚀 執行 ${stage} 階段測試...\n`);

testStages[stage].forEach((testFile, index) => {
  try {
    console.log(`[${index + 1}/${testStages[stage].length}] 執行測試: ${testFile}`);
    execSync(`npm test -- ${testFile}`, { stdio: 'inherit' });
    console.log(`✅ ${testFile} 測試通過\n`);
  } catch (error) {
    console.error(`❌ ${testFile} 測試失敗:`, error.message);
    process.exit(1);
  }
});

console.log(`🎉 ${stage} 階段測試完成！`);
```

## 測試執行命令

### 1. 執行所有現有測試
```bash
cd server
npm test
```

### 2. 執行特定測試文件
```bash
cd server
npm test -- server/tests/content.test.js
```

### 3. 執行分階段測試
```bash
cd server
node scripts/run-stage-tests.js infrastructure
node scripts/run-stage-tests.js core-models
node scripts/run-stage-tests.js content-management
node scripts/run-stage-tests.js exam-system
node scripts/run-stage-tests.js survey-system
node scripts/run-stage-tests.js playbook-system
node scripts/run-stage-tests.js integration
```

### 4. 執行完整測試流程
```bash
cd server
node scripts/run-all-tests.js
```

### 5. 監聽模式測試 (開發時使用)
```bash
cd server
npm test -- --watch
```

## 測試覆蓋率檢查

### 安裝測試覆蓋率工具
```bash
cd server
npm install --save-dev jest-coverage
```

### 執行覆蓋率測試
```bash
cd server
npm test -- --coverage
```

### 覆蓋率報告
測試完成後會生成覆蓋率報告，包含：
- 行覆蓋率 (Line Coverage)
- 函數覆蓋率 (Function Coverage)
- 分支覆蓋率 (Branch Coverage)
- 語句覆蓋率 (Statement Coverage)

## 測試最佳實踐

### 1. 測試命名規範
- 使用描述性的測試名稱
- 遵循 "應能..." 的命名模式
- 清楚說明測試的預期行為

### 2. 測試結構
- 使用 Arrange-Act-Assert 模式
- 每個測試只驗證一個功能點
- 保持測試的獨立性

### 3. 測試數據管理
- 使用 beforeEach/afterEach 清理測試數據
- 創建可重用的測試數據工廠
- 避免測試間的數據依賴

### 4. 錯誤處理測試
- 測試正常流程和異常流程
- 驗證錯誤訊息的正確性
- 測試邊界條件

## 持續整合建議

### 1. GitHub Actions 配置
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd server && npm install
      - run: cd server && npm test
```

### 2. 測試報告
- 自動生成測試報告
- 發送測試結果通知
- 追蹤測試覆蓋率趨勢

## 總結

### 當前狀態
- ✅ 已完成 4 個核心模組的測試
- ❌ 需要補充 5 個重要模組的測試
- 📊 總測試覆蓋率約 60%

### 優先執行順序
1. **高優先級**: 創建認證系統和 PlayBook 系統測試
2. **中優先級**: 創建進度追蹤和問卷回答系統測試
3. **低優先級**: 創建整合測試和效能測試

### 預期結果
完成所有測試後，系統將達到：
- 📈 測試覆蓋率 > 90%
- 🔒 所有核心功能都有測試保護
- 🚀 持續整合和部署的基礎
- 🛡️ 代碼品質和穩定性保證

---

**測試是確保系統品質的重要環節，建議按照本計劃逐步完善測試覆蓋，確保 PlayBoard 系統的穩定性和可靠性。**
