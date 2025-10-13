# PlayBook 進度記錄機制說明

## 概述

PlayBook 進度記錄系統是一個完整的學習路徑追蹤機制，用於記錄用戶在 PlayBook 學習過程中的進度、完成情況、時間花費等詳細資訊。系統採用 MongoDB 作為資料庫，使用 Mongoose ODM 進行資料建模和操作。

## 核心模型結構

### 1. PlayBookProgress 模型

**檔案位置**: `server/models/PlayBookProgress.js`

#### 主要欄位說明

| 欄位名稱 | 類型 | 必填 | 預設值 | 說明 |
|---------|------|------|--------|------|
| `playBook` | ObjectId | ✅ | - | PlayBook 的 ID，關聯到 PlayBook 模型 |
| `userId` | String | ✅ | - | 用戶唯一識別符 |
| `userName` | String | ❌ | '匿名用戶' | 用戶顯示名稱 |
| `currentStep` | Number | ❌ | 1 | 當前正在進行的步驟編號 |
| `completedSteps` | [Number] | ❌ | [] | 已完成的步驟編號陣列 |
| `stepResults` | Map | ❌ | new Map() | 每個步驟的詳細結果記錄 |
| `totalSteps` | Number | ✅ | - | PlayBook 的總步驟數 |
| `startedAt` | Date | ❌ | Date.now | 開始學習的時間 |
| `lastActiveAt` | Date | ❌ | Date.now | 最後活動時間 |
| `completedAt` | Date | ❌ | - | 完成時間（僅在完成時設置） |
| `timeSpent` | Number | ❌ | 0 | 總花費時間（秒） |
| `isCompleted` | Boolean | ❌ | false | 是否已完成整個 PlayBook |
| `completionRate` | Number | ❌ | 0 | 完成率百分比 |

#### 虛擬欄位

- `progressPercentage`: 進度百分比（基於已完成步驟數）
- `remainingSteps`: 剩餘步驟數
- `isNewUser`: 是否為新用戶（尚未完成任何步驟）

#### 索引設置

```javascript
// 複合索引：確保每個用戶在每個 PlayBook 中只有一條進度記錄
PlayBookProgressSchema.index({ playBook: 1, userId: 1 }, { unique: true });

// 用於統計查詢的索引
PlayBookProgressSchema.index({ playBook: 1, isCompleted: 1 });
PlayBookProgressSchema.index({ userId: 1, lastActiveAt: -1 });
```

### 2. PlayBook 模型

**檔案位置**: `server/models/PlayBook.js`

#### 步驟結構 (PlayBookStepSchema)

```javascript
{
  stepNumber: Number,        // 步驟編號
  type: String,              // 步驟類型：'content' | 'exam' | 'survey'
  resourceId: ObjectId,      // 關聯的資源 ID
  title: String,             // 步驟標題
  description: String,       // 步驟描述
  isRequired: Boolean,       // 是否為必須步驟
  timeLimit: Number          // 時間限制（分鐘）
}
```

#### 統計相關欄位

- `viewCount`: 瀏覽次數
- `completionCount`: 完成次數
- `estimatedTime`: 預估完成時間（分鐘）

## 進度記錄機制

### 1. 進度創建與獲取

#### API 端點
```
POST /api/playbooks/:id/progress
```

#### 機制說明
- 當用戶首次訪問 PlayBook 時，系統會自動創建進度記錄
- 如果進度記錄已存在，則返回現有記錄
- 使用 `createOrGet` 靜態方法處理

```javascript
// 創建或獲取進度記錄
const progress = await PlayBookProgress.createOrGet(playBookId, userId, userName);
```

### 2. 步驟完成機制

#### API 端點
```
PUT /api/playbooks/:id/progress/:stepNumber
```

#### 完成流程
1. **權限檢查**: 驗證用戶是否可以訪問該步驟
2. **步驟完成**: 將步驟編號加入 `completedSteps` 陣列
3. **結果記錄**: 儲存步驟的詳細結果到 `stepResults`
4. **進度更新**: 更新 `currentStep` 為下一步
5. **時間記錄**: 累計花費時間
6. **完成檢查**: 檢查是否完成整個 PlayBook

#### 核心方法
```javascript
// 完成指定步驟
await progress.completeStep(stepNumber, result);

// 新增時間記錄
await progress.addTimeSpent(seconds);
```

### 3. 進度重置機制

#### API 端點
```
POST /api/playbooks/:id/progress/reset
```

#### 重置內容
- 重置 `currentStep` 為 1
- 清空 `completedSteps` 陣列
- 清空 `stepResults` Map
- 重置 `timeSpent` 為 0
- 設置 `isCompleted` 為 false
- 清空 `completedAt`
- 更新 `startedAt` 為當前時間

## 自動化機制

### 1. 中間件自動處理

#### 儲存前中間件 (pre-save)
```javascript
PlayBookProgressSchema.pre('save', function(next) {
  // 更新最後活動時間
  this.lastActiveAt = new Date();
  
  // 確保 completedSteps 是陣列
  if (!Array.isArray(this.completedSteps)) {
    this.completedSteps = [];
  }
  
  // 計算完成率
  if (this.totalSteps > 0) {
    this.completionRate = (this.completedSteps.length / this.totalSteps) * 100;
  }
  
  // 檢查是否完成
  if (this.completedSteps.length === this.totalSteps && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  next();
});
```

### 2. 完成狀態自動更新

當用戶完成所有步驟時：
1. 自動設置 `isCompleted` 為 `true`
2. 記錄 `completedAt` 時間
3. 增加 PlayBook 的 `completionCount`

## 統計功能

### 1. PlayBook 統計

#### API 端點
```
GET /api/playbooks/:id/stats
```

#### 統計內容
- **總用戶數**: 參與該 PlayBook 的用戶總數
- **完成用戶數**: 已完成整個 PlayBook 的用戶數
- **完成率**: 完成用戶數 / 總用戶數
- **平均進度**: 所有用戶的平均完成進度
- **平均時間**: 所有用戶的平均完成時間

#### 實現方式
使用 MongoDB 聚合查詢：
```javascript
const stats = await PlayBookProgress.aggregate([
  { $match: { playBook: new mongoose.Types.ObjectId(playBookId) } },
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      completedUsers: { $sum: { $cond: { if: '$isCompleted', then: 1, else: 0 } } },
      averageProgress: { $avg: '$completionRate' },
      averageTimeSpent: { $avg: '$timeSpent' }
    }
  }
]);
```

### 2. 步驟統計

#### 統計內容
- 每個步驟的完成人數
- 每個步驟的完成率

#### 實現方式
```javascript
const stepStats = await PlayBookProgress.getStepStats(playBookId);
// 返回格式: { "1": 5, "2": 3, "3": 1 } // 步驟編號 -> 完成人數
```

## 資料完整性保障

### 1. 資料驗證
- 使用 Mongoose Schema 驗證欄位類型
- 設置必填欄位和預設值
- 使用索引確保資料唯一性

### 2. 錯誤處理
- 檢查 PlayBook 是否存在
- 驗證步驟編號的有效性
- 確保進度記錄的完整性

### 3. 資料一致性
- 使用中間件自動更新相關欄位
- 確保 `completedSteps` 始終為陣列
- 自動計算完成率和進度百分比

## 前端整合

### 1. 進度顯示
- 顯示當前步驟和總步驟數
- 顯示完成進度條
- 顯示已完成的步驟

### 2. 統計展示
- 總覽統計卡片
- 步驟完成統計
- 完成率分析
- 平均進度分析

### 3. 互動功能
- 步驟切換
- 進度重置
- 統計資料重新整理

## 效能考量

### 1. 索引優化
- 複合索引支援常用查詢
- 統計查詢使用聚合管道

### 2. 資料結構
- 使用 Map 儲存步驟結果，支援動態鍵值
- 使用陣列儲存已完成步驟，便於查詢

### 3. 快取策略
- 統計資料可考慮快取
- 進度資料即時更新

## 擴展性

### 1. 支援的步驟類型
- **content**: 內容學習
- **exam**: 測驗評估
- **survey**: 問卷調查

### 2. 可擴展功能
- 步驟依賴關係
- 分支學習路徑
- 學習時間分析
- 用戶行為追蹤

## 注意事項

1. **ObjectId 處理**: 所有 MongoDB ObjectId 必須使用 `new mongoose.Types.ObjectId()` 創建
2. **陣列安全**: 始終檢查 `completedSteps` 是否為陣列
3. **時間單位**: `timeSpent` 使用秒為單位，顯示時轉換為分鐘
4. **統計精度**: 完成率計算時注意除零錯誤
5. **並發處理**: 多用戶同時操作時確保資料一致性

## 相關檔案

- **模型**: `server/models/PlayBookProgress.js`
- **控制器**: `server/controllers/playBookController.js`
- **路由**: `server/routes/playBookRoutes.js`
- **前端服務**: `client/src/services/playbook.service.js`
- **統計頁面**: `client/src/views/admin/PlayBookStats.vue`
