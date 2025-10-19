# PlayBook 主題系統實作計畫

## 概述
實作類似 WordPress 的主題系統，讓 playbook 可以選擇和自訂主題，並支援主題上傳功能。

---

## 一、需要新增的文件

### 後端 (Server)

#### 1. 模型 (Models)
**`server/models/Theme.js`** - 主題模型
```javascript
const ThemeSchema = new mongoose.Schema({
  name: String,              // 主題名稱
  slug: String,              // URL 友好的唯一識別碼
  description: String,       // 主題描述
  version: String,           // 版本號
  author: Object,            // 作者資訊
  preview: String,           // 預覽圖路徑
  zipFile: Object,           // ZIP 檔案資訊
  config: {
    colors: Object,          // 顏色配置
    typography: Object,      // 字型配置
    spacing: Object,         // 間距配置
    borderRadius: Object,    // 圓角配置
    shadows: Object,         // 陰影配置
    layout: Object          // 佈局配置
  },
  customCSS: String,         // 自訂 CSS
  assets: Array,             // 資源檔案列表
  status: String,            // 狀態
  isDefault: Boolean,        // 是否為預設主題
  usageCount: Number,        // 使用次數
  createdBy: ObjectId        // 創建者
});
```

#### 2. 控制器 (Controllers)
**`server/controllers/themeController.js`** - 主題 CRUD 操作
- 上傳主題 ZIP 檔案
- 解析和驗證主題結構
- 主題列表、詳情、更新、刪除
- 主題預覽功能

#### 3. 路由 (Routes)
**`server/routes/theme.js`** - 主題相關 API 路由
- `POST /api/themes` - 上傳主題
- `GET /api/themes` - 取得主題列表
- `GET /api/themes/:id` - 取得主題詳情
- `PUT /api/themes/:id` - 更新主題
- `DELETE /api/themes/:id` - 刪除主題
- `GET /api/themes/:id/preview` - 預覽主題

#### 4. 中介層 (Middleware)
**`server/middleware/themeUpload.js`** - 處理主題檔案上傳
- ZIP 檔案驗證
- 檔案大小限制（建議 10MB）
- 解壓縮和檔案結構驗證
- 安全性檢查

#### 5. 服務 (Services)
**`server/services/themeService.js`** - 主題處理邏輯
- ZIP 解壓縮
- theme.json 解析和驗證
- CSS 變數提取
- 主題檔案管理和清理

#### 6. 驗證器 (Validators)
**`server/validators/themeValidator.js`** - 主題資料驗證
- theme.json 結構驗證
- CSS 變數格式驗證
- 必要檔案檢查（theme.json, preview.png）

### 前端 (Client)

#### 1. 視圖 (Views)
**`client/src/views/ThemeManage.vue`** - 主題管理頁面
- 顯示所有可用主題（卡片式）
- 上傳新主題
- 刪除主題
- 預覽和啟用主題

**`client/src/views/ThemeEditor.vue`** - 主題編輯器（進階功能）
- 視覺化編輯主題樣式
- 即時預覽
- 匯出主題

#### 2. 組件 (Components)
**`client/src/components/theme/ThemeSelector.vue`** - 主題選擇器
- 在 PlayBook 編輯時選擇主題
- 顯示主題預覽圖和資訊
- 支援搜尋和篩選

**`client/src/components/theme/ThemePreview.vue`** - 主題預覽組件
- 展示主題效果（顏色、字型、佈局）
- 顯示主題詳細資訊

**`client/src/components/theme/ThemeUploader.vue`** - 主題上傳組件
- ZIP 檔案拖放上傳
- 上傳進度顯示
- 驗證錯誤提示

**`client/src/components/theme/ThemeProvider.vue`** - 主題提供者
- 動態注入主題 CSS 變數
- 管理主題狀態
- 套用到所有子組件

**`client/src/components/theme/ThemeCustomizer.vue`** - 主題自訂器
- 顏色選擇器
- 字型選擇
- 即時預覽

#### 3. 服務 (Services)
**`client/src/services/theme.service.js`** - 主題 API 服務
- 與後端 API 通訊
- 主題 CRUD 操作
- 檔案上傳處理

#### 4. 組合式函數 (Composables)
**`client/src/composables/useTheme.js`** - 主題邏輯
```javascript
export function useTheme() {
  const currentTheme = ref(null);
  const loadTheme = async (themeId) => { /* ... */ };
  const applyTheme = (themeConfig) => { /* ... */ };
  const resetTheme = () => { /* ... */ };
  return { currentTheme, loadTheme, applyTheme, resetTheme };
}
```

#### 5. 設定檔案
**`client/src/config/defaultThemes.js`** - 預設主題定義
- 3-5 個預設主題（專業、活潑、簡約等）

**`client/src/config/themeTemplate.js`** - 主題範本
- 開發者參考範本

---

## 二、需要修改的文件

### 後端 (Server)

#### 1. `server/models/PlayBook.js`
新增欄位：
```javascript
theme: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Theme',
  default: null  // null 表示使用預設主題
},
customThemeSettings: {
  type: Object,
  default: {}  // 允許覆寫特定 CSS 變數
}
```

#### 2. `server/controllers/playBookController.js`
- 在建立和更新 playbook 時處理主題設定
- 在查詢 playbook 時 populate theme 資料
```javascript
.populate('theme', 'name slug config preview')
```

#### 3. `server/routes/playbook.js`
- 確保路由支援主題參數

#### 4. `server/app.js` 或主要設定檔
- 註冊主題路由
- 設定靜態檔案服務（主題檔案存取）
```javascript
app.use('/themes', express.static(path.join(__dirname, 'uploads/themes')));
app.use('/api/themes', require('./routes/theme'));
```

### 前端 (Client)

#### 1. `client/src/views/PlayBookPlayer.vue`
修改：載入 playbook 時取得主題資料並套用
```vue
<template>
  <ThemeProvider :theme="playbook.theme" :customSettings="playbook.customThemeSettings">
    <!-- 現有內容 -->
  </ThemeProvider>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme';
const { applyTheme } = useTheme();

onMounted(() => {
  if (playbook.value.theme) {
    applyTheme(playbook.value.theme.config, playbook.value.customThemeSettings);
  }
});
</script>
```

#### 2. `client/src/views/PlayBookStepPlayer.vue`
- 套用主題樣式
- 進度條使用主題顏色 `var(--pb-color-primary)`

#### 3. `client/src/views/PlayBookStepContentView.vue`
- 內容區域套用主題字型和顏色
- Markdown 渲染使用主題樣式

#### 4. `client/src/views/SurveyTake.vue`
- 問卷元素套用主題樣式
- 按鈕、輸入框使用主題顏色
- Likert 量表使用主題配色

#### 5. `client/src/views/ExamTake.vue`
- 測驗介面套用主題樣式
- 選項、按鈕、進度條使用主題顏色

#### 6. `client/src/views/CustomPagePlayer.vue`
- 容器套用主題背景
- 支援傳遞主題資訊到 iframe（透過 postMessage）
```javascript
iframe.contentWindow.postMessage({
  type: 'THEME_UPDATE',
  theme: themeConfig
}, '*');
```

#### 7. `client/src/views/PlayBookCompletedView.vue`
- 完成頁面套用主題樣式
- 慶祝元素、按鈕使用主題顏色

#### 8. `client/src/views/PlayBookCreate.vue` 和 `PlayBookEdit.vue`
- 新增主題選擇區塊
```vue
<el-form-item label="主題">
  <ThemeSelector v-model="form.theme" />
</el-form-item>
<el-form-item label="自訂顏色（選填）">
  <ThemeCustomizer v-model="form.customThemeSettings" :base-theme="form.theme" />
</el-form-item>
```

#### 9. `client/src/assets/tailwind.css`
- 確保 CSS 變數可以被動態覆寫
- 新增主題相關的類別
```css
:root {
  /* 可被覆寫的主題變數 */
  --pb-color-primary: #A15C38;
  --pb-color-secondary: #8F5233;
  --pb-text-primary: #262220;
  --pb-surface: #FFFFFF;
  --pb-font-family: 'Inter, system-ui, sans-serif';
  /* ... 更多變數 */
}

/* 主題相關類別 */
.theme-primary-bg { background-color: var(--pb-color-primary); }
.theme-primary-text { color: var(--pb-color-primary); }
.theme-primary-border { border-color: var(--pb-color-primary); }
```

#### 10. `client/src/router/index.js`
新增路由：
```javascript
{
  path: '/admin/themes',
  name: 'ThemeManage',
  component: () => import('../views/ThemeManage.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
},
{
  path: '/admin/themes/editor',
  name: 'ThemeEditor',
  component: () => import('../views/ThemeEditor.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

#### 11. `client/src/services/playbook.service.js`
- 確保 API 請求包含主題資料
- 新增取得主題詳情的方法

---

## 三、主題檔案結構

### WordPress 風格的主題 ZIP 結構
```
theme-professional/
├── theme.json          # 主題配置檔案（必須）
├── preview.png         # 預覽圖（必須，建議 1200x800px）
├── styles.css          # 主題樣式（可選）
├── fonts/              # 自訂字型（可選）
│   ├── custom-font-regular.woff2
│   └── custom-font-bold.woff2
└── assets/             # 資源檔案（可選）
    ├── background.jpg
    ├── pattern.svg
    └── logo.svg
```

### theme.json 格式規範
```json
{
  "name": "Professional Theme",
  "version": "1.0.0",
  "author": {
    "name": "PlayBoard Team",
    "email": "team@playboard.com",
    "url": "https://playboard.com"
  },
  "description": "專業商務風格主題，適合企業培訓使用",
  "preview": "preview.png",
  "config": {
    "colors": {
      "primary": "#2563eb",
      "secondary": "#7c3aed",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#1e293b",
      "textSecondary": "#64748b",
      "border": "#e2e8f0",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "info": "#3b82f6"
    },
    "typography": {
      "fontFamily": "'Inter', system-ui, sans-serif",
      "headingFont": "'Poppins', sans-serif",
      "fontSize": {
        "base": "16px",
        "small": "14px",
        "large": "18px",
        "h1": "2.5rem",
        "h2": "2rem",
        "h3": "1.5rem",
        "h4": "1.25rem"
      },
      "lineHeight": {
        "base": "1.6",
        "heading": "1.2"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      }
    },
    "spacing": {
      "container": "1.5rem",
      "section": "3rem",
      "element": "1rem",
      "tight": "0.5rem",
      "loose": "2rem"
    },
    "borderRadius": {
      "small": "0.375rem",
      "medium": "0.5rem",
      "large": "1rem",
      "full": "9999px"
    },
    "shadows": {
      "small": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "medium": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "large": "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    },
    "transitions": {
      "duration": "200ms",
      "timing": "ease-in-out"
    },
    "layout": {
      "maxWidth": "1200px",
      "sidebarWidth": "280px",
      "headerHeight": "64px",
      "contentPadding": "2rem"
    }
  },
  "assets": {
    "fonts": ["fonts/Inter-Regular.woff2", "fonts/Poppins-Bold.woff2"],
    "images": ["assets/background.jpg"],
    "icons": []
  },
  "customCSS": "styles.css"
}
```

---

## 四、實作步驟

### Phase 1: 後端基礎（第 1-2 週）

#### 步驟 1: 建立 Theme 模型
- 定義完整的 schema
- 建立索引（slug, status）
- 設定驗證規則
- 位置：`server/models/Theme.js`

#### 步驟 2: 實作主題服務
- ZIP 解壓縮功能
- theme.json 解析和驗證
- 檔案管理（儲存、刪除）
- 安全性檢查（檔案類型、大小）
- 位置：`server/services/themeService.js`

#### 步驟 3: 建立主題控制器
- 上傳主題 API
- CRUD 操作
- 主題預覽
- 位置：`server/controllers/themeController.js`

#### 步驟 4: 設定路由和中介層
- 註冊主題路由
- 設定檔案上傳中介層（multer）
- 靜態檔案服務
- 位置：`server/routes/theme.js`, `server/middleware/themeUpload.js`

#### 步驟 5: 修改 PlayBook 模型
- 新增 theme 和 customThemeSettings 欄位
- 更新控制器以支援主題
- 位置：`server/models/PlayBook.js`, `server/controllers/playBookController.js`

#### 步驟 6: API 測試
- 使用 Postman 測試所有端點
- 驗證檔案上傳和解析
- 測試主題套用到 playbook

### Phase 2: 前端基礎（第 3-4 週）

#### 步驟 7: 建立主題服務和組合式函數
- API 通訊層：`client/src/services/theme.service.js`
- useTheme composable：`client/src/composables/useTheme.js`
- 動態 CSS 注入邏輯

#### 步驟 8: 開發核心組件
- ThemeProvider：`client/src/components/theme/ThemeProvider.vue`
- ThemeSelector：`client/src/components/theme/ThemeSelector.vue`
- ThemeUploader：`client/src/components/theme/ThemeUploader.vue`
- ThemePreview：`client/src/components/theme/ThemePreview.vue`
- ThemeCustomizer：`client/src/components/theme/ThemeCustomizer.vue`

#### 步驟 9: 修改 PlayBook 編輯頁面
- 整合 ThemeSelector 到 PlayBookCreate.vue
- 整合 ThemeSelector 到 PlayBookEdit.vue
- 新增主題自訂選項
- 新增即時預覽功能

#### 步驟 10: 套用主題到播放器
- 修改 PlayBookPlayer.vue：載入和套用主題
- 修改 PlayBookStepPlayer.vue：步驟頁面套用主題
- 修改 PlayBookStepContentView.vue：內容頁面套用主題
- 修改 PlayBookCompletedView.vue：完成頁面套用主題

#### 步驟 11: 套用主題到互動組件
- 修改 SurveyTake.vue：問卷套用主題
- 修改 ExamTake.vue：測驗套用主題
- 修改 CustomPagePlayer.vue：自訂頁面支援主題

#### 步驟 12: 更新 CSS 系統
- 更新 tailwind.css：新增主題 CSS 變數
- 確保所有組件使用 CSS 變數
- 建立主題相關的 utility classes

### Phase 3: 管理介面（第 5 週）

#### 步驟 13: 主題管理頁面
- 建立 ThemeManage.vue
- 主題列表展示（卡片式）
- 上傳功能
- 刪除和啟用功能
- 註冊路由

#### 步驟 14: 主題編輯器（進階，可選）
- 建立 ThemeEditor.vue
- 視覺化編輯器
- 即時預覽
- 匯出功能

### Phase 4: 預設主題開發（第 6 週）

#### 步驟 15: 建立預設主題
建立 3-5 個預設主題：
1. **Default（預設）** - 藍色系，適合一般用途
2. **Professional（專業）** - 深藍商務風，適合企業培訓
3. **Creative（活潑）** - 多彩活潑，適合創意課程
4. **Minimal（極簡）** - 黑白簡約，適合技術文件
5. **Nature（自然）** - 綠色自然風，適合環保主題

每個主題包含：
- 完整的 theme.json
- 預覽圖 preview.png
- 打包成 ZIP 檔案
- 位置：`docs/default-themes/`

#### 步驟 16: 主題範本和文件
- 建立主題開發範本
- 撰寫主題開發指南
- 提供範例和最佳實踐
- 位置：`docs/theme-development-guide.md`

### Phase 5: 測試與優化（第 7 週）

#### 步驟 17: 測試
- 單元測試（後端 API、前端 composables）
- 整合測試（主題上傳、套用流程）
- E2E 測試（完整使用者流程）
- 不同主題相容性測試
- 無障礙測試（顏色對比度）

#### 步驟 18: 效能優化
- 主題快取機制
- 延遲載入主題檔案
- CSS 最小化
- 圖片優化

#### 步驟 19: 文件和發布
- API 文件
- 使用者手冊
- 開發者文件
- 更新 CHANGELOG

---

## 五、技術實作細節

### 1. 動態 CSS 變數注入

```javascript
// client/src/composables/useTheme.js
export function useTheme() {
  const applyTheme = (themeConfig, customSettings = {}) => {
    const root = document.documentElement;

    // 合併主題設定和自訂設定
    const finalConfig = merge(themeConfig, customSettings);

    // 套用顏色
    if (finalConfig.colors) {
      Object.entries(finalConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(`--pb-color-${key}`, value);
      });
    }

    // 套用字型
    if (finalConfig.typography) {
      root.style.setProperty('--pb-font-family', finalConfig.typography.fontFamily);
      root.style.setProperty('--pb-heading-font', finalConfig.typography.headingFont);

      if (finalConfig.typography.fontSize) {
        Object.entries(finalConfig.typography.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--pb-font-size-${key}`, value);
        });
      }
    }

    // 套用間距
    if (finalConfig.spacing) {
      Object.entries(finalConfig.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--pb-spacing-${key}`, value);
      });
    }

    // 套用圓角
    if (finalConfig.borderRadius) {
      Object.entries(finalConfig.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--pb-radius-${key}`, value);
      });
    }

    // 載入自訂字型（如果有）
    if (finalConfig.assets && finalConfig.assets.fonts) {
      loadCustomFonts(finalConfig.assets.fonts);
    }
  };

  const loadCustomFonts = (fonts) => {
    fonts.forEach(fontPath => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/themes/${fontPath}`;
      document.head.appendChild(link);
    });
  };

  const resetTheme = () => {
    // 重置為預設值
    const root = document.documentElement;
    root.style.cssText = '';
  };

  return { applyTheme, resetTheme };
}
```

### 2. 主題上傳和解析流程

```javascript
// server/services/themeService.js
const AdmZip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');

class ThemeService {
  async processThemeUpload(file) {
    // 1. 驗證 ZIP 檔案
    if (path.extname(file.originalname) !== '.zip') {
      throw new Error('只支援 ZIP 格式');
    }

    // 2. 解壓縮
    const zip = new AdmZip(file.path);
    const extractPath = path.join(__dirname, '../uploads/themes', Date.now().toString());
    zip.extractAllTo(extractPath, true);

    // 3. 驗證主題結構
    const themeJsonPath = path.join(extractPath, 'theme.json');
    if (!fs.existsSync(themeJsonPath)) {
      throw new Error('找不到 theme.json');
    }

    // 4. 解析 theme.json
    const themeConfig = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));

    // 5. 驗證必要欄位
    if (!themeConfig.name || !themeConfig.version) {
      throw new Error('theme.json 缺少必要欄位');
    }

    // 6. 掃描資源檔案
    const assets = await this.scanAssets(extractPath);

    // 7. 建立主題記錄
    return {
      config: themeConfig,
      extractPath,
      assets
    };
  }

  async scanAssets(themePath) {
    const assets = [];
    const files = fs.readdirSync(themePath, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile() && file.name !== 'theme.json') {
        const stats = fs.statSync(path.join(themePath, file.name));
        assets.push({
          name: file.name,
          path: file.name,
          size: stats.size,
          type: this.getAssetType(file.name)
        });
      } else if (file.isDirectory()) {
        // 遞迴掃描子目錄
        const subAssets = await this.scanAssets(path.join(themePath, file.name));
        assets.push(...subAssets.map(a => ({
          ...a,
          path: path.join(file.name, a.path)
        })));
      }
    }

    return assets;
  }

  getAssetType(filename) {
    const ext = path.extname(filename).toLowerCase();
    if (['.woff', '.woff2', '.ttf', '.otf'].includes(ext)) return 'font';
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg'].includes(ext)) return 'image';
    if (['.css'].includes(ext)) return 'style';
    return 'other';
  }
}
```

### 3. ThemeProvider 組件

```vue
<!-- client/src/components/theme/ThemeProvider.vue -->
<template>
  <div class="theme-provider" :data-theme="theme?.slug">
    <slot />
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps({
  theme: {
    type: Object,
    default: null
  },
  customSettings: {
    type: Object,
    default: () => ({})
  }
});

const { applyTheme, resetTheme } = useTheme();

onMounted(() => {
  if (props.theme) {
    applyTheme(props.theme.config, props.customSettings);
  }
});

watch(() => props.theme, (newTheme) => {
  if (newTheme) {
    applyTheme(newTheme.config, props.customSettings);
  } else {
    resetTheme();
  }
}, { deep: true });

watch(() => props.customSettings, (newSettings) => {
  if (props.theme) {
    applyTheme(props.theme.config, newSettings);
  }
}, { deep: true });
</script>
```

---

## 六、安全性考量

### 1. 檔案上傳安全
- 限制檔案大小：最大 10MB
- 限制檔案類型：只允許 ZIP
- 掃描病毒和惡意程式碼
- 驗證 ZIP 內容：只允許特定類型（CSS, JSON, 圖片, 字型）

### 2. CSS 注入防護
- 清理和驗證 CSS 內容
- 禁止 JavaScript 執行（`javascript:`, `eval()`, `expression()`）
- 使用 CSP (Content Security Policy)
- 過濾危險的 CSS 屬性

### 3. 權限控制
- 只有管理員可以上傳主題
- 使用者可以選擇公開主題
- 私有主題只有創建者可見

### 4. 資源隔離
- 主題檔案儲存在隔離目錄
- 使用唯一的檔案名稱（時間戳 + UUID）
- 防止路徑遍歷攻擊

```javascript
// 檔案路徑驗證
function validateFilePath(filePath) {
  const normalized = path.normalize(filePath);
  if (normalized.includes('..')) {
    throw new Error('Invalid file path');
  }
  return normalized;
}
```

---

## 七、優先順序建議

### P0（必須，第 1-4 週）
- ✅ 步驟 1-5：後端基礎（Theme 模型、服務、API）
- ✅ 步驟 7-10：前端基礎（組件、播放器套用）
- ✅ 步驟 15：建立 3 個預設主題

### P1（重要，第 5-6 週）
- ✅ 步驟 11：互動組件套用主題
- ✅ 步驟 13：主題管理頁面
- ✅ 步驟 17-18：測試和優化

### P2（進階功能，第 7+ 週）
- 🔄 步驟 14：主題編輯器
- 🔄 步驟 16：完整文件
- 🔄 主題市場（社群分享）
- 🔄 AI 輔助主題生成

---

## 八、成功指標

- ✅ 使用者可以上傳 ZIP 格式的主題
- ✅ 使用者可以在建立 playbook 時選擇主題
- ✅ 所有內容類型（內容、問卷、測驗、自訂頁面、完成頁面）正確套用主題
- ✅ 主題切換不影響功能正常運作
- ✅ 提供至少 3 個預設主題
- ✅ 主題上傳和套用速度 < 2 秒
- ✅ 通過所有安全性測試
- ✅ 完整的 API 文件和使用者手冊

---

## 九、未來擴展

### 1. 主題市場
- 社群分享主題
- 評分和評論系統
- 付費主題支援
- 主題更新通知

### 2. 進階主題功能
- 動態主題（dark/light 模式自動切換）
- 響應式主題設定
- 動畫和過場效果自訂
- 主題繼承（子主題系統）

### 3. AI 輔助
- AI 生成主題配色
- 自動適配品牌色彩
- 智慧主題推薦

### 4. 整合功能
- 從品牌網站自動提取主題色
- 與設計工具整合（Figma, Adobe XD）
- 主題版本控制

---

**文件版本**: 2.0
**最後更新**: 2025-10-16
**負責人**: PlayBoard 開發團隊
