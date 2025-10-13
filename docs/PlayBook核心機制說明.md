# PlayBook 核心機制說明

## 概述

PlayBook 是 PlayBoard 系統的核心功能，它是一個結構化的學習路徑管理系統。每個 PlayBook 由多個步驟組成，每個步驟可以關聯到不同類型的學習資源（內容、測驗、問卷），為用戶提供系統化的學習體驗。

## 核心概念

### 1. PlayBook 定義
- **學習路徑**: 由多個步驟組成的結構化學習流程
- **步驟類型**: 支援內容學習、測驗評估、問卷調查三種類型
- **進度追蹤**: 記錄用戶在每個步驟的完成情況和學習進度
- **統計分析**: 提供詳細的學習數據和完成率統計

### 2. 步驟類型說明
- **content**: 內容學習步驟，關聯到 Content 模型
- **exam**: 測驗評估步驟，關聯到 Exam 模型  
- **survey**: 問卷調查步驟，關聯到 Survey 模型

## 模型結構

### 1. PlayBook 主模型

**檔案位置**: `server/models/PlayBook.js`

#### 主要欄位說明

| 欄位名稱 | 類型 | 必填 | 預設值 | 說明 |
|---------|------|------|--------|------|
| `title` | String | ✅ | - | PlayBook 標題，最大 100 字元 |
| `slug` | String | ✅ | - | URL 識別符，唯一且符合格式規範 |
| `description` | String | ❌ | - | 描述，最大 1000 字元 |
| `steps` | [PlayBookStep] | ❌ | [] | 步驟陣列 |
| `status` | String | ❌ | 'draft' | 狀態：'draft' \| 'published' |
| `estimatedTime` | Number | ❌ | 0 | 預估完成時間（分鐘） |
| `tags` | [String] | ❌ | [] | 標籤陣列，最多 10 個 |
| `category` | String | ❌ | '一般' | 分類 |
| `difficulty` | String | ❌ | 'beginner' | 難度：'beginner' \| 'intermediate' \| 'advanced' |
| `displayType` | String | ❌ | 'overview' | 展示模式：'overview' \| 'stepByStep' |
| `viewCount` | Number | ❌ | 0 | 瀏覽次數 |
| `completionCount` | Number | ❌ | 0 | 完成次數 |
| `publishedAt` | Date | ❌ | - | 發布時間 |
| `createdBy` | ObjectId | ✅ | - | 創建者 ID |
| `lastModifiedBy` | ObjectId | ❌ | - | 最後修改者 ID |

#### 虛擬欄位

- `totalSteps`: 總步驟數（基於 steps 陣列長度）
- `requiredSteps`: 必須步驟數（基於 isRequired 為 true 的步驟）
- `isPublished`: 是否已發布（status === 'published' 且有 publishedAt）
- `publicUrl`: 公開 URL（`/playbook/${slug}`）
- `completionRate`: 完成率（completionCount / viewCount）

### 2. PlayBookStep 子模型

#### 步驟結構

```javascript
{
  stepNumber: Number,        // 步驟編號，從 1 開始
  type: String,              // 步驟類型：'content' | 'exam' | 'survey'
  resourceId: ObjectId,      // 關聯的資源 ID
  title: String,             // 步驟標題，最大 100 字元
  description: String,       // 步驟描述，最大 500 字元
  isRequired: Boolean,       // 是否為必須步驟，預設 true
  timeLimit: Number          // 時間限制（分鐘），可選
}
```

#### 動態引用機制

```javascript
resourceId: {
  type: Schema.Types.ObjectId,
  required: [true, '資源ID為必填'],
  refPath: 'steps.type' // 動態引用，根據 type 決定引用哪個 Model
}
```

## 自動化機制

### 1. Slug 自動生成

#### 中間件位置
```javascript
PlayBookSchema.pre('validate', function(next) {
  // 當標題變更或 slug 為空時自動生成
  if ((this.isModified('title') || this.slug == null || this.slug === '') && !this.slug) {
    const base = slugify(this.title || '', { lower: true, strict: true });
    let generated = base;

    // 中文標題安全備援
    if (!generated || generated.trim() === '') {
      const random = Math.random().toString(36).slice(2, 8);
      generated = `pb-${random}`;
    }

    this.slug = generated;
  }
  next();
});
```

#### 生成規則
- 使用 `slugify` 函數處理英文/數字
- 中文標題使用隨機字串備援（`pb-xxxxxx` 格式）
- 確保 slug 唯一性

### 2. 發布時間自動設置

```javascript
PlayBookSchema.pre('save', function(next) {
  // 發布時自動設置發布時間
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'published' && this.publishedAt) {
    this.publishedAt = undefined;
  }
  
  // 步驟變更時自動計算預估時間
  if (this.isModified('steps')) {
    this.estimatedTime = this.calculateEstimatedTime();
  }
  
  next();
});
```

### 3. 預估時間自動計算

```javascript
PlayBookSchema.methods.calculateEstimatedTime = function() {
  const timeByType = {
    content: 5,   // 內容平均 5 分鐘
    exam: 10,     // 測驗平均 10 分鐘
    survey: 3     // 問卷平均 3 分鐘
  };
  
  if (!this.steps || !Array.isArray(this.steps)) {
    return 0;
  }
  
  return this.steps.reduce((total, step) => {
    return total + (timeByType[step.type] || 5);
  }, 0);
};
```

## 步驟管理機制

### 1. 步驟操作方法

#### 新增步驟
```javascript
PlayBookSchema.methods.addStep = function(stepData) {
  if (!this.steps || !Array.isArray(this.steps)) {
    this.steps = [];
  }
  const nextStepNumber = this.steps.length + 1;
  const newStep = {
    stepNumber: nextStepNumber,
    ...stepData
  };
  this.steps.push(newStep);
  return this.save();
};
```

#### 移除步驟
```javascript
PlayBookSchema.methods.removeStep = function(stepNumber) {
  this.steps = this.steps.filter(step => step.stepNumber !== stepNumber);
  // 重新編號
  this.steps.forEach((step, index) => {
    step.stepNumber = index + 1;
  });
  return this.save();
};
```

#### 重新排序步驟
```javascript
PlayBookSchema.methods.reorderSteps = function(newOrder) {
  const reorderedSteps = newOrder.map((stepId, index) => {
    const step = this.steps.id(stepId);
    step.stepNumber = index + 1;
    return step;
  });
  
  this.steps = reorderedSteps;
  return this.save();
};
```

### 2. 資源驗證機制

#### 靜態驗證方法
```javascript
PlayBookSchema.statics.validateStepResources = async function(steps) {
  const Content = mongoose.model('Content');
  const Exam = mongoose.model('Exam');
  const Survey = mongoose.model('Survey');
  
  for (const step of steps) {
    let model;
    switch (step.type) {
      case 'content': model = Content; break;
      case 'exam': model = Exam; break;
      case 'survey': model = Survey; break;
      default: throw new Error(`未知的步驟類型: ${step.type}`);
    }
    
    const resource = await model.findById(step.resourceId);
    if (!resource) {
      throw new Error(`找不到${step.type}資源: ${step.resourceId}`);
    }
    
    // 檢查資源是否可用
    if (step.type === 'content' && resource.status !== 'published') {
      throw new Error(`內容資源未發布: ${step.resourceId}`);
    }
  }
  
  return true;
};
```

## API 機制

### 1. 管理員 API

#### 獲取 PlayBook 列表
```
GET /api/playbooks
```

**查詢參數**:
- `page`: 頁碼（預設 1）
- `pageSize`: 每頁數量（預設 10）
- `search`: 搜尋關鍵字
- `status`: 狀態篩選（'all', 'draft', 'published'）
- `category`: 分類篩選
- `difficulty`: 難度篩選
- `sortBy`: 排序方式

**排序選項**:
- `latest`: 最新創建
- `oldest`: 最早創建
- `titleAsc/Desc`: 標題升序/降序
- `publishedDesc/Asc`: 發布時間降序/升序
- `viewCount`: 瀏覽次數
- `completionCount`: 完成次數

#### 創建 PlayBook
```
POST /api/playbooks
```

**請求體**:
```javascript
{
  title: String,
  description: String,
  category: String,
  difficulty: String,
  displayType: String,
  tags: [String],
  steps: [PlayBookStep],
  status: String,
  isPublic: Boolean
}
```

#### 更新 PlayBook
```
PUT /api/playbooks/:id
```

**更新機制**:
- 支援部分更新
- 自動驗證步驟資源
- 記錄最後修改者

### 2. 公開 API

#### 獲取公開 PlayBook 列表
```
GET /api/playbooks/public
```

**篩選條件**:
- 僅返回 `status: 'published'` 的 PlayBook
- 按發布時間降序排列

#### 根據 Slug 獲取公開 PlayBook
```
GET /api/playbooks/public/:slug
```

**特殊處理**:
- 自動增加瀏覽次數
- 填充創建者資訊

### 3. 統計 API

#### 獲取 PlayBook 統計
```
GET /api/playbooks/:id/stats
```

**統計內容**:
- 總用戶數
- 完成用戶數
- 完成率
- 平均進度
- 平均時間

## 展示模式

### 1. Overview 模式
- **特點**: 顯示總覽頁面，用戶可以看到所有步驟
- **適用**: 適合自由學習，用戶可選擇任意步驟
- **URL**: `/playbook/:slug`

### 2. StepByStep 模式
- **特點**: 直接進入步驟，逐步完成，不顯示總覽
- **適用**: 適合線性學習，強制按順序完成
- **URL**: `/playbook/:slug/step/:stepNumber`

## 前端整合

### 1. 服務層 (PlayBookService)

#### 核心方法
```javascript
// 管理員 API
getPlayBooks(params)           // 獲取列表
getPlayBook(id)               // 獲取單個
createPlayBook(data)          // 創建
updatePlayBook(id, data)      // 更新
deletePlayBook(id)            // 刪除
getPlayBookStats(id)          // 獲取統計

// 公開 API
getPublicPlayBooks(params)    // 獲取公開列表
getPublicPlayBook(slug)       // 根據 slug 獲取
getCategories()               // 獲取分類

// 進度 API
getOrCreateProgress(playBookId, userId, userName)  // 獲取或創建進度
resetProgress(playBookId, userId)                  // 重置進度
```

#### 工具方法
```javascript
// 驗證方法
validateStep(step)            // 驗證步驟
validatePlayBook(playBook)    // 驗證 PlayBook

// 進度計算
calculateProgress(completedSteps, totalSteps)  // 計算進度百分比
getNextStep(currentStep, totalSteps)           // 獲取下一步
canAccessStep(stepNumber, completedSteps)      // 檢查步驟訪問權限

// 標籤處理
tagsToString(tags)            // 標籤轉字串
parseTags(tagsString)         // 字串轉標籤
```

### 2. 本地儲存機制

#### 進度儲存
```javascript
// 儲存進度到 localStorage
saveProgress(playBookId, progress) {
  const key = `playbook_progress_${playBookId}`;
  localStorage.setItem(key, JSON.stringify(progress));
}

// 讀取進度
loadProgress(playBookId) {
  const key = `playbook_progress_${playBookId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}
```

#### 用戶資料管理
```javascript
// 儲存用戶資料
saveUserData(userId, userName) {
  localStorage.setItem('playbook_user_id', userId);
  localStorage.setItem('playbook_user_name', userName);
}

// 清除用戶資料
clearUserData() {
  localStorage.removeItem('playbook_user_id');
  // 清除所有進度
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('playbook_progress_')) {
      localStorage.removeItem(key);
    }
  });
}
```

## 索引優化

### 1. 資料庫索引
```javascript
// 唯一索引
PlayBookSchema.index({ slug: 1 }, { unique: true });

// 查詢索引
PlayBookSchema.index({ status: 1, publishedAt: -1 });
PlayBookSchema.index({ category: 1 });
PlayBookSchema.index({ tags: 1 });
PlayBookSchema.index({ difficulty: 1 });
```

### 2. 查詢優化
- 使用 `populate` 填充關聯資料
- 支援分頁和排序
- 使用聚合查詢進行統計

## 資料驗證

### 1. Schema 驗證
- 必填欄位檢查
- 字元長度限制
- 枚舉值驗證
- 自定義驗證器

### 2. 業務邏輯驗證
- 步驟資源存在性檢查
- 資源狀態驗證
- 步驟順序驗證

## 錯誤處理

### 1. 驗證錯誤
```javascript
if (error.name === 'ValidationError') {
  const errors = Object.values(error.errors).map(err => err.message);
  return res.status(400).json({
    success: false,
    message: '資料驗證失敗',
    errors
  });
}
```

### 2. 業務錯誤
- PlayBook 不存在
- 資源不存在或未發布
- 步驟訪問權限不足

## 效能考量

### 1. 查詢優化
- 使用適當的索引
- 限制返回欄位
- 支援分頁查詢

### 2. 快取策略
- 統計資料可考慮快取
- 公開 PlayBook 列表可快取
- 進度資料即時更新

## 擴展性

### 1. 步驟類型擴展
- 可輕鬆新增新的步驟類型
- 支援自定義步驟驗證邏輯
- 靈活的資源關聯機制

### 2. 展示模式擴展
- 可新增新的展示模式
- 支援自定義步驟流程
- 靈活的用戶體驗設計

### 3. 統計功能擴展
- 支援更多統計維度
- 可新增學習分析功能
- 支援自定義報表

## 注意事項

1. **Slug 唯一性**: 確保 slug 在系統中唯一
2. **資源狀態**: 內容資源必須為 published 狀態
3. **步驟編號**: 步驟編號從 1 開始，移除步驟時需重新編號
4. **時間單位**: estimatedTime 使用分鐘，timeLimit 使用分鐘
5. **資料一致性**: 更新步驟時需驗證資源存在性

## 相關檔案

- **模型**: `server/models/PlayBook.js`
- **控制器**: `server/controllers/playBookController.js`
- **路由**: `server/routes/playBookRoutes.js`
- **前端服務**: `client/src/services/playbook.service.js`
- **管理頁面**: `client/src/views/admin/PlayBookList.vue`
- **編輯頁面**: `client/src/views/admin/PlayBookEdit.vue`
- **統計頁面**: `client/src/views/admin/PlayBookStats.vue`
- **公開頁面**: `client/src/views/PlayBookPlayer.vue`
