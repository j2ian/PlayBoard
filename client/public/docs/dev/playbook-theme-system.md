# PlayBook 主題切換系統

## 概述

PlayBook 主題切換系統允許為不同的 PlayBook 指定不同的視覺主題，提供更豐富的使用者體驗。每個 PlayBook 可以選擇不同的主題樣式，系統會自動載入對應主題資料夾中的 Vue 元件。

## 系統架構

### 1. 資料夾結構

```
client/src/
├── views/
│   ├── PlayBookPlayer.vue              # 包裝器元件
│   ├── PlayBookStepPlayer.vue          # 包裝器元件
│   ├── PlayBookStepContentView.vue     # 包裝器元件
│   ├── PlayBookCompletedView.vue       # 包裝器元件
│   ├── ExamTake.vue                    # 包裝器元件
│   ├── SurveyTake.vue                  # 包裝器元件
│   └── themes/
│       ├── default/                    # 預設主題
│       │   ├── images/                 # 主題圖片資源
│       │   ├── styles/                 # 主題樣式檔案
│       │   ├── PlayBookPlayer.vue
│       │   ├── PlayBookStepPlayer.vue
│       │   ├── PlayBookStepContentView.vue
│       │   ├── PlayBookCompletedView.vue
│       │   ├── ExamTake.vue
│       │   ├── SurveyTake.vue
│       │   └── README.md
│       ├── jungle/                     # 叢林主題
│       │   ├── images/                 # 主題圖片資源
│       │   │   ├── bg_none.jpg
│       │   │   ├── bg_menu.jpg
│       │   │   └── bg_full.jpg
│       │   ├── styles/                 # 主題樣式檔案
│       │   │   └── theme.css
│       │   ├── PlayBookPlayer.vue
│       │   ├── PlayBookStepPlayer.vue
│       │   ├── PlayBookStepContentView.vue
│       │   ├── PlayBookCompletedView.vue
│       │   ├── ExamTake.vue
│       │   ├── SurveyTake.vue
│       │   └── README.md
│       └── ocean/                      # 海洋主題
│           ├── images/                 # 主題圖片資源
│           ├── styles/                 # 主題樣式檔案
│           ├── PlayBookPlayer.vue
│           ├── PlayBookStepPlayer.vue
│           ├── PlayBookStepContentView.vue
│           ├── PlayBookCompletedView.vue
│           ├── ExamTake.vue
│           ├── SurveyTake.vue
│           └── README.md
└── utils/
    └── themeLoader.js                  # 主題管理工具
```

### 2. 核心元件說明

#### 包裝器元件 (Wrapper Components)
位於 `client/src/views/` 下的元件是**包裝器元件**，它們的職責是：
- 根據 PlayBook 的 `theme` 欄位決定要載入哪個主題
- 動態載入 `themes/{theme}/` 下對應的實際元件
- 使用 `<component :is="ThemeComponent">` 渲染實際的主題元件

#### 主題元件 (Theme Components)
位於 `client/src/views/themes/{theme}/` 下的元件是**實際的主題元件**，包含：
- PlayBookPlayer.vue - PlayBook 首頁
- PlayBookStepPlayer.vue - 步驟播放器
- PlayBookStepContentView.vue - 內容顯示頁面
- PlayBookCompletedView.vue - 完成頁面
- ExamTake.vue - 測驗頁面
- SurveyTake.vue - 問卷頁面

### 3. 主題管理工具

`client/src/utils/themeLoader.js` 提供以下功能：

```javascript
// 主題設定清單（單一資料來源）
const THEME_CONFIG = [
  {
    value: 'default',
    label: '預設主題',
    description: '系統預設的主題樣式'
  },
  {
    value: 'jungle',
    label: '叢林主題',
    description: '充滿自然氣息的叢林風格主題'
  },
  {
    value: 'ocean',
    label: '海洋主題',
    description: '海洋風格主題'
  }
]

// 取得所有可用主題名稱
getAvailableThemes()

// 取得完整主題設定（包含 label 和 description）
getThemeOptions()

// 動態載入指定主題的元件
loadThemeComponent(theme, componentName)

// 驗證主題是否存在
isThemeAvailable(theme)
```

## 運作機制

### 1. PlayBook 主要頁面載入流程

```
使用者訪問 PlayBook
    ↓
包裝器元件 (PlayBookPlayer.vue) 啟動
    ↓
透過 route.params.slug 取得 PlayBook 資料
    ↓
讀取 playbook.theme 欄位 (例如: 'jungle')
    ↓
呼叫 loadThemeComponent('jungle', 'PlayBookPlayer')
    ↓
動態 import('../views/themes/jungle/PlayBookPlayer.vue')
    ↓
使用 <component :is="ThemeComponent"> 渲染
```

### 2. Exam/Survey 頁面載入流程

```
使用者從 PlayBook 進入 Exam/Survey
    ↓
包裝器元件 (ExamTake.vue/SurveyTake.vue) 啟動
    ↓
檢查 route.query.playbook 是否存在
    ├─ 存在（從 PlayBook 進入）
    │   ↓
    │   透過 route.query.playbookSlug 取得 PlayBook 資料
    │   ↓
    │   讀取 playbook.theme 欄位
    │   ↓
    │   載入 themes/{theme}/ExamTake.vue
    │
    └─ 不存在（獨立進入）
        ↓
        使用預設主題 'default'
```

### 3. 後端資料儲存

PlayBook Model (`server/models/PlayBook.js`)：
```javascript
theme: {
  type: String,
  default: 'default',
  trim: true
}
```

後端 Controller (`server/controllers/playBookController.js`)：
- `createPlayBook` - 接收並儲存 theme 欄位
- `updatePlayBook` - 接收並更新 theme 欄位

## 如何新增主題

### 步驟 1：建立主題資料夾

在 `client/src/views/themes/` 下建立新的主題資料夾，例如 `theme-a`：

```bash
mkdir client/src/views/themes/theme-a
```

### 步驟 2：複製預設主題的檔案

將 `default` 資料夾中的所有 Vue 檔案複製到新主題資料夾：

```bash
# Windows
xcopy client\src\views\themes\default\*.vue client\src\views\themes\theme-a\ /Y

# Linux/Mac
cp client/src/views/themes/default/*.vue client/src/views/themes/theme-a/
```

複製後應該包含以下檔案：
- PlayBookPlayer.vue
- PlayBookStepPlayer.vue
- PlayBookStepContentView.vue
- PlayBookCompletedView.vue
- ExamTake.vue
- SurveyTake.vue

### 步驟 3：修改主題樣式

編輯新主題資料夾中的 Vue 檔案，自訂樣式：

```vue
<!-- 範例：修改 PlayBookPlayer.vue -->
<template>
  <div class="min-h-screen bg-custom-color">
    <!-- 自訂 HTML 結構 -->
    <nav class="custom-nav">
      <!-- ... -->
    </nav>

    <!-- 自訂樣式的內容 -->
    <div class="custom-content">
      <!-- ... -->
    </div>
  </div>
</template>

<style scoped>
/* 自訂 CSS 樣式 */
.custom-nav {
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
}

.custom-content {
  /* 你的樣式 */
}
</style>
```

**重要提示：**
- 保持元件的 `<script>` 邏輯不變，只修改 `<template>` 和 `<style>`
- 確保所有必要的功能（如表單提交、導航等）都正常運作
- 可以修改 HTML 結構，但要保留關鍵的資料綁定和事件處理

### 步驟 4：註冊新主題

編輯 `client/src/utils/themeLoader.js`，在 `THEME_CONFIG` 中新增主題設定：

```javascript
const THEME_CONFIG = [
  {
    value: 'default',
    label: '預設主題',
    description: '系統預設的主題樣式'
  },
  {
    value: 'jungle',
    label: '叢林主題',
    description: '充滿自然氣息的叢林風格主題'
  },
  {
    value: 'ocean',
    label: '海洋主題',
    description: '海洋風格主題'
  },
  {
    value: 'theme-a',           // 新增：主題的值（必須與資料夾名稱相同）
    label: '主題 A',             // 新增：顯示名稱
    description: '主題 A 的說明' // 新增：描述
  }
]
```

**注意事項：**
- `value` 必須與 `client/src/views/themes/` 下的資料夾名稱**完全相同**
- `label` 是在管理後台顯示的名稱
- `description` 是在選擇器中顯示的說明文字

### 步驟 5：測試新主題

1. **重新啟動開發伺服器**（如果需要）

2. **建立測試 PlayBook**：
   - 進入管理後台 → PlayBook 管理 → 新增 PlayBook
   - 在「主題樣式」下拉選單中選擇新主題
   - 新增步驟並儲存

3. **檢查資料庫**：
   ```javascript
   // 在 MongoDB 中檢查
   db.playbooks.findOne({ slug: 'your-playbook-slug' })
   // 應該看到 theme: 'theme-a'
   ```

4. **測試公開頁面**：
   - 訪問 PlayBook 公開連結
   - 打開瀏覽器 Console，應該看到：
     ```
     [ThemeLoader] 載入元件: theme=theme-a, component=PlayBookPlayer
     [ThemeLoader] 成功載入: themes/theme-a/PlayBookPlayer.vue
     ```
   - 確認頁面顯示新主題的樣式

5. **測試所有頁面**：
   - PlayBook 首頁
   - 各類型步驟（Content、Exam、Survey、CustomPage）
   - 完成頁面

## 主題資源管理

### 資源資料夾結構

**所有主題資源都應放在主題資料夾內**，便於管理、複製和刪除：

```
client/src/views/themes/
├── default/
│   ├── images/                          # 主題圖片資源
│   │   ├── logo.png
│   │   ├── background.jpg
│   │   └── icons/
│   │       └── star.svg
│   ├── styles/                          # 主題樣式
│   │   └── theme.css
│   ├── PlayBookPlayer.vue
│   ├── PlayBookStepPlayer.vue
│   ├── PlayBookStepContentView.vue
│   ├── PlayBookCompletedView.vue
│   ├── ExamTake.vue
│   ├── SurveyTake.vue
│   └── README.md
├── jungle/
│   ├── images/                          # 主題圖片資源
│   │   ├── bg_none.jpg
│   │   ├── bg_menu.jpg
│   │   ├── bg_full.jpg
│   │   └── icons/
│   │       └── leaf.svg
│   ├── styles/                          # 主題樣式
│   │   └── theme.css
│   ├── PlayBookPlayer.vue
│   ├── PlayBookStepPlayer.vue
│   ├── PlayBookStepContentView.vue
│   ├── PlayBookCompletedView.vue
│   ├── ExamTake.vue
│   ├── SurveyTake.vue
│   └── README.md
└── ocean/
    ├── images/                          # 主題圖片資源
    ├── styles/                          # 主題樣式
    ├── PlayBookPlayer.vue
    ├── PlayBookStepPlayer.vue
    ├── PlayBookStepContentView.vue
    ├── PlayBookCompletedView.vue
    ├── ExamTake.vue
    ├── SurveyTake.vue
    └── README.md
```

**優點：**
- 刪除主題時只需刪除一個資料夾
- 複製主題時所有資源一併複製
- 資源路徑相對化，不依賴外部路徑
- 主題更加獨立和可攜帶

### 使用圖片資源

#### 在 Vue 組件中引用圖片

**使用相對路徑** `./images/`：

```vue
<template>
  <div class="theme-container">
    <!-- Logo -->
    <img
      src="./images/logo.png"
      alt="Logo"
      class="w-32 h-32"
    >

    <!-- 背景圖 -->
    <div class="hero-section">
      <h1>{{ playbook.title }}</h1>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  background-image: url('./images/bg_full.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 400px;
}
</style>
```

#### 在 styles/theme.css 中引用圖片

**使用相對路徑** `../images/`：

```css
/* client/src/views/themes/jungle/styles/theme.css */

.jungle-bg {
  background-image: url('../images/bg_menu.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

### 使用主題 CSS 檔案

建立主題專用的 CSS 變數檔案：

```css
/* client/src/views/themes/jungle/styles/theme.css */

:root {
  /* 主色調 */
  --jungle-primary: #2d5016;
  --jungle-secondary: #6b8e23;
  --jungle-accent: #9acd32;

  /* 文字顏色 */
  --jungle-text-primary: #1a1a1a;
  --jungle-text-secondary: #4a5568;

  /* 背景色 */
  --jungle-bg-primary: #f0f8e8;
  --jungle-bg-secondary: #ffffff;

  /* 陰影 */
  --jungle-shadow-sm: 0 2px 4px rgba(45, 80, 22, 0.1);
  --jungle-shadow-md: 0 4px 8px rgba(45, 80, 22, 0.15);
  --jungle-shadow-lg: 0 8px 16px rgba(45, 80, 22, 0.2);

  /* 邊框圓角 */
  --jungle-radius-sm: 0.375rem;
  --jungle-radius-md: 0.5rem;
  --jungle-radius-lg: 0.75rem;
}

/* 通用樣式類別 */
.jungle-theme {
  color: var(--jungle-text-primary);
  background-color: var(--jungle-bg-primary);
}

.jungle-card {
  background: var(--jungle-bg-secondary);
  border-radius: var(--jungle-radius-md);
  box-shadow: var(--jungle-shadow-md);
  padding: 1.5rem;
}

.jungle-btn-primary {
  background-color: var(--jungle-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--jungle-radius-sm);
  box-shadow: var(--jungle-shadow-sm);
  transition: all 0.3s ease;
}

.jungle-btn-primary:hover {
  background-color: var(--jungle-secondary);
  box-shadow: var(--jungle-shadow-md);
  transform: translateY(-2px);
}
```

在 Vue 元件中引入（使用相對路徑）：

```vue
<template>
  <div class="jungle-theme">
    <div class="jungle-card">
      <h2>{{ playbook.title }}</h2>
      <button class="jungle-btn-primary">開始學習</button>
    </div>
  </div>
</template>

<style scoped>
/* 引入主題樣式 - 使用相對路徑 */
@import './styles/theme.css';

/* 元件特定樣式 */
.custom-section {
  /* 使用主題變數 */
  background-color: var(--jungle-bg-secondary);
  border-radius: var(--jungle-radius-lg);
}
</style>
```

### 使用 SVG 圖示

SVG 圖示可以直接內嵌或作為圖片使用：

```vue
<template>
  <!-- 作為圖片使用 -->
  <img src="./images/icons/leaf.svg" alt="Leaf" class="w-6 h-6">

  <!-- 或在 CSS 中使用 -->
  <div class="icon-leaf"></div>
</template>

<style scoped>
.icon-leaf {
  width: 24px;
  height: 24px;
  background-image: url('./images/icons/leaf.svg');
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
```

### 使用自訂字體

1. 將字體檔案放到主題資料夾內，例如 `client/src/views/themes/jungle/fonts/`

2. 在 CSS 中定義字體（使用相對路徑）：

```css
/* client/src/views/themes/jungle/styles/theme.css */

@font-face {
  font-family: 'Jungle Font';
  src: url('../fonts/jungle-font.woff2') format('woff2'),
       url('../fonts/jungle-font.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

:root {
  --jungle-font-heading: 'Jungle Font', sans-serif;
}

.jungle-theme h1,
.jungle-theme h2,
.jungle-theme h3 {
  font-family: var(--jungle-font-heading);
}
```

**注意事項：**
- 所有資源路徑都使用相對路徑
- Vue 組件中：`./images/`、`./fonts/`
- CSS 檔案中（在 styles/ 目錄下）：`../images/`、`../fonts/`
- 這樣主題資料夾可以獨立複製和刪除

### 資源管理最佳實踐總結

#### 正確做法

```
主題資料夾內建立 images/、styles/、fonts/ 等子資料夾
Vue 組件使用相對路徑：url('./images/bg.jpg')
CSS 檔案使用相對路徑：url('../images/bg.jpg')
所有資源集中在主題資料夾內
建立 README.md 說明主題資源結構
```

#### 避免做法

```
不要使用絕對路徑：url('@/assets/themes/...')
不要將資源放在主題資料夾外部
不要使用外部 CDN 資源（除非必要）
不要在多個主題間共用圖片（應各自複製）
```

#### 優點

- **刪除方便**：刪除整個主題資料夾即可
- **複製方便**：複製資料夾即可建立新主題
- **移植方便**：可以輕鬆移動到其他專案
- **維護方便**：所有相關資源都在一個地方

## 主題開發最佳實踐

### 1. 保持一致性

確保主題中的所有元件風格一致：
- 使用相同的色彩配置（透過 CSS 變數）
- 統一的字體和排版
- 一致的按鈕和表單樣式
- 相同的間距和圓角規則

### 2. 使用 TailwindCSS

專案使用 TailwindCSS，建議優先使用 Tailwind utility classes：

```vue
<!-- 推薦 -->
<div class="bg-blue-500 text-white rounded-lg p-6">
  <!-- ... -->
</div>

<!-- 避免 -->
<div style="background: blue; color: white; border-radius: 8px; padding: 24px;">
  <!-- ... -->
</div>
```

### 3. 響應式設計

確保主題在不同裝置上都能正常顯示：

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 內容會根據螢幕大小自動調整 -->
</div>
```

### 4. 測試清單

新主題開發完成後，請測試以下項目：

- [ ] PlayBook 首頁顯示正常
- [ ] 步驟列表和進度條正常
- [ ] Content 步驟顯示正常
- [ ] Exam 步驟功能正常（題目顯示、提交、結果）
- [ ] Survey 步驟功能正常（問題顯示、提交）
- [ ] CustomPage 步驟顯示正常
- [ ] 完成頁面顯示正常
- [ ] 導航功能正常（上一步、下一步、返回）
- [ ] 行動裝置顯示正常
- [ ] 不同瀏覽器顯示一致

### 5. 效能考量

- 避免載入過大的圖片或資源
- 使用 CSS 動畫而非 JavaScript 動畫（效能較好）
- 避免過度使用陰影和模糊效果

## 故障排除

### 問題：主題無法載入

**症狀**：頁面顯示「載入主題失敗」

**可能原因**：
1. 主題資料夾名稱與 `THEME_CONFIG` 中的 `value` 不一致
2. 主題資料夾中缺少必要的 Vue 檔案
3. Vue 檔案語法錯誤

**解決方法**：
1. 檢查 `themeLoader.js` 中的主題名稱
2. 確認所有 6 個 Vue 檔案都存在
3. 檢查瀏覽器 Console 的錯誤訊息
4. 確認 Vue 檔案可以正常編譯

### 問題：主題選項沒有出現在下拉選單

**症狀**：建立/編輯 PlayBook 時看不到新主題

**可能原因**：
1. 忘記在 `themeLoader.js` 註冊主題
2. 開發伺服器需要重啟

**解決方法**：
1. 檢查 `THEME_CONFIG` 陣列
2. 重新啟動 Vite 開發伺服器

### 問題：資料庫中 theme 欄位為空

**症狀**：儲存後資料庫中沒有 theme 資料

**可能原因**：
1. 後端 Controller 未正確處理 theme 欄位

**解決方法**：
1. 檢查 `server/controllers/playBookController.js`
2. 確認 `createPlayBook` 和 `updatePlayBook` 都有處理 theme
3. 查看伺服器端 log

## 技術細節

### 動態 Import

系統使用 Vite 的動態 import 功能載入主題元件：

```javascript
// themeLoader.js
export const loadThemeComponent = (theme, componentName) => {
  return import(`../views/themes/${theme}/${componentName}.vue`)
    .then((module) => module.default)
    .catch((error) => {
      console.error(`無法載入主題元件: themes/${theme}/${componentName}.vue`, error)
      // 失敗時嘗試載入預設主題
      if (theme !== "default") {
        return import(`../views/themes/default/${componentName}.vue`)
          .then((module) => module.default)
      }
      throw error
    })
}
```

### 包裝器元件範例

```vue
<!-- PlayBookPlayer.vue -->
<template>
  <component
    v-if="ThemeComponent"
    :is="ThemeComponent"
  />
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center">
    <el-skeleton :rows="8" animated />
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600">載入主題失敗</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import PlayBookService from '@/services/playbook.service'
import { loadThemeComponent } from '@/utils/themeLoader'

const route = useRoute()
const loading = ref(true)
const ThemeComponent = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    const slug = route.params.slug
    const response = await PlayBookService.getPublicPlayBook(slug)

    if (response.data.success) {
      const playbook = response.data.data
      const theme = playbook.theme || 'default'

      const component = await loadThemeComponent(theme, 'PlayBookPlayer')
      ThemeComponent.value = markRaw(component)
    }
  } catch (error) {
    console.error('載入失敗:', error)
  } finally {
    loading.value = false
  }
})
</script>
```

## 相關文件

- [Vue 3 動態元件](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)
- [Vite 動態 Import](https://vitejs.dev/guide/features.html#dynamic-import)
- [TailwindCSS 文件](https://tailwindcss.com/docs)
- [Element Plus 元件庫](https://element-plus.org/)

## 變更記錄

### 2025-01-XX - 初版
- 實作基礎主題切換系統
- 新增 default 和 jungle 主題
- 支援 6 種頁面類型的主題化
- 實作動態載入機制
