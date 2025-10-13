# PlayBoard 客製化頁面功能設計

## 功能概述

客製化頁面功能允許教師上傳 ZIP 檔案，包含完整的 HTML/CSS/JavaScript 頁面，並在 PlayBook 學習路徑中使用。這個功能擴展了現有的內容管理系統，提供更豐富的互動學習體驗。

## 系統架構設計

### 1. 新增模型：CustomPage

#### 模型結構
```javascript
// server/models/CustomPage.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const CustomPageSchema = new Schema({
  title: {
    type: String,
    required: [true, '頁面標題為必填'],
    trim: true,
    maxlength: [200, '標題不能超過200個字元']
  },
  slug: {
    type: String,
    unique: true,
    required: [true, 'URL識別符為必填'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL識別符格式不正確']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '描述不能超過500個字元']
  },
  // ZIP 檔案資訊
  zipFile: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadPath: {
      type: String,
      required: true
    }
  },
  // 解壓後的檔案結構
  extractedFiles: [{
    filename: {
      type: String,
      required: true
    },
    relativePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['html', 'css', 'js', 'image', 'font', 'other'],
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  // 主入口檔案
  entryFile: {
    type: String,
    required: true,
    default: 'index.html'
  },
  // 頁面設定
  settings: {
    allowFullscreen: {
      type: Boolean,
      default: false
    },
    allowNavigation: {
      type: Boolean,
      default: true
    },
    autoProgress: {
      type: Boolean,
      default: false
    },
    progressTrigger: {
      type: String,
      enum: ['manual', 'timer', 'interaction', 'completion'],
      default: 'manual'
    },
    progressDelay: {
      type: Number,
      default: 0 // 秒數
    },
    completionCriteria: {
      type: String,
      trim: true
    }
  },
  // 狀態管理
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error', 'archived'],
    default: 'uploading'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  // 分類和標籤
  category: {
    type: String,
    trim: true,
    default: '客製化頁面'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: '標籤數量不能超過10個'
    }
  },
  // 統計資訊
  viewCount: {
    type: Number,
    default: 0
  },
  // 創建者資訊
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
CustomPageSchema.index({ slug: 1 }, { unique: true });
CustomPageSchema.index({ status: 1 });
CustomPageSchema.index({ createdBy: 1 });
CustomPageSchema.index({ category: 1 });

// 虛擬欄位
CustomPageSchema.virtual('publicUrl').get(function() {
  return `/custom-pages/${this.slug}`;
});

CustomPageSchema.virtual('isReady').get(function() {
  return this.status === 'ready';
});

// 中間件：自動生成 slug
CustomPageSchema.pre('validate', function(next) {
  if ((this.isModified('title') || !this.slug) && this.title) {
    const base = slugify(this.title, { lower: true, strict: true });
    let generated = base;
    
    if (!generated || generated.trim() === '') {
      const random = Math.random().toString(36).slice(2, 8);
      generated = `custom-page-${random}`;
    }
    
    this.slug = generated;
  }
  next();
});

// 靜態方法：獲取可用的客製化頁面
CustomPageSchema.statics.getAvailablePages = function() {
  return this.find({ status: 'ready' })
    .select('title slug description category tags')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('CustomPage', CustomPageSchema);
```

### 2. 擴展 PlayBook 模型

#### 更新步驟類型
```javascript
// 在 server/models/PlayBook.js 中更新 PlayBookStepSchema
const PlayBookStepSchema = new Schema({
  stepNumber: {
    type: Number,
    required: [true, '步驟編號為必填'],
    min: 1
  },
  type: {
    type: String,
    enum: ['content', 'exam', 'survey', 'customPage'], // 新增 customPage
    required: [true, '步驟類型為必填']
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: [true, '資源ID為必填'],
    refPath: 'steps.type' // 動態引用
  },
  // ... 其他欄位保持不變
});
```

#### 更新資源驗證方法
```javascript
// 在 PlayBook 模型中更新 validateStepResources 方法
PlayBookSchema.statics.validateStepResources = async function(steps) {
  const Content = mongoose.model('Content');
  const Exam = mongoose.model('Exam');
  const Survey = mongoose.model('Survey');
  const CustomPage = mongoose.model('CustomPage'); // 新增
  
  for (const step of steps) {
    let model;
    switch (step.type) {
      case 'content':
        model = Content;
        break;
      case 'exam':
        model = Exam;
        break;
      case 'survey':
        model = Survey;
        break;
      case 'customPage': // 新增
        model = CustomPage;
        break;
      default:
        throw new Error(`未知的步驟類型: ${step.type}`);
    }
    
    const resource = await model.findById(step.resourceId);
    if (!resource) {
      throw new Error(`找不到${step.type}資源: ${step.resourceId}`);
    }
    
    // 檢查資源是否可用
    if (step.type === 'content' && resource.status !== 'published') {
      throw new Error(`內容資源未發布: ${step.resourceId}`);
    }
    
    if (step.type === 'customPage' && resource.status !== 'ready') {
      throw new Error(`客製化頁面未準備就緒: ${step.resourceId}`);
    }
  }
  
  return true;
};
```

## ZIP 檔案規範

### 1. 檔案命名規則

#### 基本命名格式
```
[頁面名稱]-[版本號]-[日期].zip
```

#### 命名範例
```
互動式數學遊戲-v1.0-20241201.zip
科學實驗模擬器-v2.1-20241201.zip
英語單字練習-v1.5-20241201.zip
```

#### 命名規則詳細說明
- **頁面名稱**: 使用英文、數字、連字號，不包含空格或特殊字符
- **版本號**: 格式為 `v[主版本].[次版本]`，例如 `v1.0`, `v2.1`
- **日期**: 格式為 `YYYYMMDD`，例如 `20241201`
- **檔案副檔名**: 必須為 `.zip`

### 2. ZIP 檔案結構要求

#### 必要檔案結構
```
custom-page-name/
├── index.html          # 主入口檔案 (必要)
├── assets/             # 資源目錄 (可選)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   │   └── logo.png
│   └── fonts/
│       └── custom-font.woff2
├── README.md           # 說明文件 (建議)
└── config.json         # 設定檔案 (可選)
```

#### 檔案大小限制
- **ZIP 檔案總大小**: 最大 50MB
- **單一檔案大小**: 最大 10MB
- **檔案數量**: 最多 1000 個檔案

#### 支援的檔案類型
- **HTML**: `.html`, `.htm`
- **CSS**: `.css`
- **JavaScript**: `.js`
- **圖片**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- **字體**: `.woff`, `.woff2`, `.ttf`, `.otf`
- **其他**: `.json`, `.txt`, `.md`

### 3. 設定檔案規範

#### config.json 格式
```json
{
  "pageInfo": {
    "title": "互動式數學遊戲",
    "description": "透過遊戲學習數學概念",
    "version": "1.0.0",
    "author": "教師姓名"
  },
  "settings": {
    "entryFile": "index.html",
    "allowFullscreen": false,
    "allowNavigation": true,
    "autoProgress": false,
    "progressTrigger": "manual",
    "progressDelay": 0,
    "completionCriteria": "完成所有關卡"
  },
  "requirements": {
    "minWidth": 800,
    "minHeight": 600,
    "browserSupport": ["chrome", "firefox", "safari", "edge"]
  }
}
```

## 進度控制規則

### 1. 進度觸發類型

#### Manual (手動觸發)
- **說明**: 用戶必須手動點擊「下一步」按鈕
- **適用場景**: 需要用戶確認完成的情況
- **設定**: `progressTrigger: "manual"`

#### Timer (計時觸發)
- **說明**: 經過指定時間後自動進入下一步
- **適用場景**: 展示型內容、動畫播放
- **設定**: `progressTrigger: "timer"`, `progressDelay: 30` (30秒)

#### Interaction (互動觸發)
- **說明**: 用戶完成特定互動後觸發
- **適用場景**: 點擊、拖拽、輸入等互動
- **設定**: `progressTrigger: "interaction"`, `completionCriteria: "點擊開始按鈕"`

#### Completion (完成觸發)
- **說明**: 完成特定任務後自動觸發
- **適用場景**: 遊戲通關、測驗完成
- **設定**: `progressTrigger: "completion"`, `completionCriteria: "達到100分"`

### 2. 進度通訊機制

#### 前端到後端的通訊
```javascript
// 在客製化頁面中觸發進度更新
window.parent.postMessage({
  type: 'CUSTOM_PAGE_PROGRESS',
  action: 'complete', // 或 'next', 'previous'
  data: {
    score: 100,
    timeSpent: 120,
    customData: { /* 自定義數據 */ }
  }
}, '*');
```

#### 後端處理進度更新
```javascript
// 在 PlayBook 控制器中處理進度更新
const updateCustomPageProgress = async (req, res) => {
  try {
    const { playBookId, stepNumber, progressData } = req.body;
    
    // 更新進度記錄
    const progress = await PlayBookProgress.findOneAndUpdate(
      { playBook: playBookId, userId: req.user.id },
      {
        $set: {
          [`stepResults.${stepNumber}`]: {
            completed: true,
            completedAt: new Date(),
            customData: progressData
          }
        }
      },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## API 端點設計

### 1. 客製化頁面管理 API

#### 上傳 ZIP 檔案
```
POST /api/custom-pages/upload
Content-Type: multipart/form-data

Body:
- file: ZIP檔案
- title: 頁面標題
- description: 頁面描述
- category: 分類
- tags: 標籤陣列
```

#### 獲取客製化頁面列表
```
GET /api/custom-pages
Query Parameters:
- page: 頁碼
- pageSize: 每頁數量
- search: 搜尋關鍵字
- category: 分類篩選
- status: 狀態篩選
```

#### 獲取單個客製化頁面
```
GET /api/custom-pages/:id
```

#### 更新客製化頁面
```
PUT /api/custom-pages/:id
Body:
- title: 標題
- description: 描述
- settings: 設定
- category: 分類
- tags: 標籤
```

#### 刪除客製化頁面
```
DELETE /api/custom-pages/:id
```

### 2. 公開訪問 API

#### 獲取可用的客製化頁面
```
GET /api/custom-pages/available
```

#### 訪問客製化頁面
```
GET /api/custom-pages/public/:slug
```

## 前端整合

### 1. 管理員頁面

#### 客製化頁面列表
```vue
<!-- client/src/views/admin/CustomPageList.vue -->
<template>
  <div class="custom-page-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客製化頁面管理</span>
          <el-button type="primary" @click="showUploadDialog = true">
            上傳新頁面
          </el-button>
        </div>
      </template>
      
      <el-table :data="customPages" v-loading="loading">
        <el-table-column prop="title" label="標題" />
        <el-table-column prop="slug" label="識別符" />
        <el-table-column prop="status" label="狀態">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="創建時間" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="viewPage(row)">查看</el-button>
            <el-button size="small" @click="editPage(row)">編輯</el-button>
            <el-button size="small" type="danger" @click="deletePage(row)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 上傳對話框 -->
    <CustomPageUploadDialog 
      v-model="showUploadDialog"
      @success="loadCustomPages"
    />
  </div>
</template>
```

#### 上傳對話框
```vue
<!-- client/src/components/admin/CustomPageUploadDialog.vue -->
<template>
  <el-dialog v-model="visible" title="上傳客製化頁面" width="600px">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="頁面標題" prop="title">
        <el-input v-model="form.title" placeholder="請輸入頁面標題" />
      </el-form-item>
      
      <el-form-item label="頁面描述" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="3"
          placeholder="請輸入頁面描述"
        />
      </el-form-item>
      
      <el-form-item label="ZIP檔案" prop="file">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept=".zip"
          :limit="1"
        >
          <el-button type="primary">選擇ZIP檔案</el-button>
          <template #tip>
            <div class="el-upload__tip">
              只能上傳ZIP檔案，且不超過50MB
            </div>
          </template>
        </el-upload>
      </el-form-item>
      
      <el-form-item label="分類" prop="category">
        <el-input v-model="form.category" placeholder="請輸入分類" />
      </el-form-item>
      
      <el-form-item label="標籤" prop="tags">
        <el-tag
          v-for="tag in form.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          @keyup.enter="addTag"
          @blur="addTag"
        />
        <el-button v-else size="small" @click="showInput">+ 新增標籤</el-button>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleUpload" :loading="uploading">
        上傳
      </el-button>
    </template>
  </el-dialog>
</template>
```

### 2. 學生端頁面

#### 客製化頁面播放器
```vue
<!-- client/src/views/CustomPagePlayer.vue -->
<template>
  <div class="custom-page-player">
    <div class="page-header">
      <h2>{{ customPage.title }}</h2>
      <p>{{ customPage.description }}</p>
    </div>
    
    <div class="page-container">
      <iframe
        ref="pageFrame"
        :src="pageUrl"
        :style="iframeStyle"
        @load="onPageLoad"
      />
    </div>
    
    <div class="page-controls" v-if="showControls">
      <el-button @click="goBack">返回</el-button>
      <el-button type="primary" @click="goNext" :disabled="!canProceed">
        下一步
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomPagePlayer',
  data() {
    return {
      customPage: null,
      canProceed: false,
      showControls: true,
      iframeStyle: {
        width: '100%',
        height: '600px',
        border: 'none'
      }
    }
  },
  computed: {
    pageUrl() {
      return `/api/custom-pages/public/${this.customPage.slug}`;
    }
  },
  mounted() {
    this.loadCustomPage();
    this.setupMessageListener();
  },
  methods: {
    async loadCustomPage() {
      try {
        const response = await this.$api.get(`/custom-pages/${this.$route.params.id}`);
        this.customPage = response.data;
      } catch (error) {
        this.$message.error('載入頁面失敗');
      }
    },
    
    setupMessageListener() {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'CUSTOM_PAGE_PROGRESS') {
          this.handleProgressUpdate(event.data);
        }
      });
    },
    
    handleProgressUpdate(data) {
      switch (data.action) {
        case 'complete':
          this.canProceed = true;
          this.updateProgress(data.data);
          break;
        case 'next':
          this.goNext();
          break;
        case 'previous':
          this.goBack();
          break;
      }
    },
    
    async updateProgress(progressData) {
      try {
        await this.$api.put(`/playbooks/${this.playBookId}/progress/${this.stepNumber}`, {
          progressData
        });
      } catch (error) {
        console.error('更新進度失敗:', error);
      }
    },
    
    onPageLoad() {
      // 頁面載入完成後的處理
      console.log('客製化頁面載入完成');
    },
    
    goNext() {
      this.$emit('next-step');
    },
    
    goBack() {
      this.$emit('previous-step');
    }
  }
}
</script>
```

## 實作計劃

### 階段一：後端基礎功能 (1-2天)

#### 1.1 創建 CustomPage 模型
- [ ] 定義資料庫 Schema
- [ ] 設定索引和驗證
- [ ] 實作虛擬欄位和方法

#### 1.2 實作檔案上傳功能
- [ ] 設定 Multer 配置
- [ ] 實作 ZIP 檔案驗證
- [ ] 實作檔案解壓功能
- [ ] 實作檔案結構分析

#### 1.3 創建控制器
- [ ] 實作上傳 API
- [ ] 實作 CRUD API
- [ ] 實作公開訪問 API
- [ ] 實作檔案服務 API

### 階段二：PlayBook 整合 (1天)

#### 2.1 更新 PlayBook 模型
- [ ] 新增 customPage 步驟類型
- [ ] 更新資源驗證方法
- [ ] 更新步驟填充邏輯

#### 2.2 更新 PlayBook 控制器
- [ ] 更新步驟資源驗證
- [ ] 更新進度追蹤邏輯
- [ ] 更新統計功能

### 階段三：前端管理介面 (2-3天)

#### 3.1 管理員頁面
- [ ] 客製化頁面列表頁面
- [ ] 上傳對話框組件
- [ ] 編輯頁面組件
- [ ] 預覽功能

#### 3.2 服務層
- [ ] 客製化頁面服務
- [ ] 檔案上傳服務
- [ ] 進度更新服務

### 階段四：學生端整合 (1-2天)

#### 4.1 播放器組件
- [ ] 客製化頁面播放器
- [ ] 進度通訊機制
- [ ] 控制按鈕組件

#### 4.2 PlayBook 整合
- [ ] 更新步驟播放器
- [ ] 整合進度追蹤
- [ ] 更新統計顯示

### 階段五：測試和優化 (1-2天)

#### 5.1 功能測試
- [ ] 上傳功能測試
- [ ] 播放功能測試
- [ ] 進度追蹤測試

#### 5.2 效能優化
- [ ] 檔案壓縮優化
- [ ] 載入速度優化
- [ ] 記憶體使用優化

## 安全考量

### 1. 檔案安全
- **檔案類型驗證**: 嚴格限制上傳檔案類型
- **檔案大小限制**: 防止過大檔案上傳
- **病毒掃描**: 建議整合病毒掃描服務
- **檔案隔離**: 將上傳檔案隔離在安全目錄

### 2. 內容安全
- **XSS 防護**: 過濾 HTML 內容中的危險腳本
- **CSP 政策**: 設定內容安全政策
- **沙盒模式**: 使用 iframe 沙盒模式
- **權限控制**: 限制檔案訪問權限

### 3. 系統安全
- **上傳限制**: 限制上傳頻率和數量
- **資源監控**: 監控系統資源使用
- **日誌記錄**: 記錄所有上傳和訪問活動
- **備份策略**: 定期備份上傳檔案

## 效能考量

### 1. 檔案處理
- **非同步處理**: 使用非同步方式處理檔案解壓
- **進度回報**: 提供上傳和處理進度
- **錯誤處理**: 完善的錯誤處理機制
- **重試機制**: 失敗時自動重試

### 2. 載入優化
- **快取策略**: 快取靜態資源
- **壓縮傳輸**: 使用 Gzip 壓縮
- **CDN 整合**: 考慮使用 CDN 加速
- **延遲載入**: 按需載入資源

### 3. 儲存優化
- **檔案去重**: 避免重複檔案儲存
- **定期清理**: 清理未使用的檔案
- **壓縮儲存**: 壓縮儲存檔案
- **分層儲存**: 使用分層儲存策略

## 總結

客製化頁面功能將為 PlayBoard 系統帶來以下優勢：

### 功能優勢
- **豐富的互動體驗**: 支援複雜的 HTML5 應用
- **靈活的進度控制**: 多種進度觸發方式
- **完整的內容管理**: 統一的內容管理介面
- **無縫的 PlayBook 整合**: 與現有系統完美整合

### 技術優勢
- **模組化設計**: 易於維護和擴展
- **安全性保障**: 多層安全防護
- **效能優化**: 高效的檔案處理和載入
- **用戶體驗**: 直觀的管理和播放介面

這個功能將大大增強 PlayBoard 系統的教學能力，讓教師能夠創建更豐富、更互動的學習內容。
