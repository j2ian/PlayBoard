# Jungle Theme

叢林主題的所有資源和組件。

## 📁 資料夾結構

```
jungle/
├── images/                          # 主題專用圖片資源
│   ├── bg_none.jpg                 # 無背景圖
│   ├── bg_menu.jpg                 # 選單背景圖
│   └── bg_full.jpg                 # 完整背景圖
├── styles/                          # 主題專用樣式
│   └── theme.css                   # 共用樣式定義
├── ExamTake.vue                     # 測驗頁面
├── SurveyTake.vue                   # 問卷頁面
├── PlayBookPlayer.vue               # PlayBook 播放器（總覽模式）
├── PlayBookStepPlayer.vue           # PlayBook 步驟播放器（逐步模式）
├── PlayBookStepContentView.vue      # 內容步驟視圖
├── PlayBookCompletedView.vue        # 完成頁面
└── README.md                        # 本說明文件
```

## 🎨 可用的樣式類別

### 背景樣式
- `.jungle-bg` - 基礎背景樣式（cover, center, fixed）
- `.jungle-bg-menu` - 選單背景圖
- `.jungle-bg-full` - 完整背景圖（100% x 100%）
- `.jungle-bg-none` - 淺色背景圖

### 容器樣式
- `.jungle-main` - 主要容器（字體、顏色）
- `.jungle-container` - 問卷/內容容器（絕對定位）
- `.jungle-survey-container` - 問卷容器（帶背景和陰影）
- `.jungle-exam-content` - 測驗內容容器（綠色背景和邊框）

### 按鈕樣式
- `.jungle-button` - 自訂按鈕（支援 hover 圖片切換）
  - 配合 `.inn-img` 和 `.hov-img` 使用

### 表單元素
- `.jungle-form-control` - 表單輸入框
- `.jungle-form-check-input` - 單選框/多選框

### 音樂控制器
- `.jungle-music-control` - 音樂控制器容器
  - 包含音量滑桿和靜音按鈕

### 滾動條
- `.jungle-scrollbar` - 自訂滾動條樣式（綠色主題）

### 播放器
- `.jungle-player` - iframe 播放器容器

## 🎨 資源引用規範

### Vue 組件中引用圖片
在 `jungle/` 目錄下的 Vue 組件中，使用相對路徑：
```css
background-image: url('./images/bg_menu.jpg');
```

### styles/ 目錄中引用圖片
在 `styles/theme.css` 中，需要向上一層目錄：
```css
background-image: url('../images/bg_menu.jpg');
```

### 使用主題樣式
在 Vue 組件中引入主題樣式：
```vue
<style scoped>
@import './styles/theme.css';
</style>
```

## 📝 使用範例

### 範例 1：使用背景和容器
```vue
<template>
  <div class="min-h-screen jungle-bg-full">
    <div class="jungle-container jungle-scrollbar">
      <!-- 內容 -->
    </div>
  </div>
</template>

<style scoped>
@import './styles/theme.css';
</style>
```

### 範例 2：使用自訂按鈕
```vue
<template>
  <button class="jungle-button">
    <img class="inn-img" src="./images/btn_normal.png">
    <img class="hov-img" src="./images/btn_hover.png">
  </button>
</template>

<style scoped>
@import './styles/theme.css';
</style>
```

### 範例 3：表單元素
```vue
<template>
  <div class="jungle-survey-container">
    <input type="text" class="jungle-form-control" placeholder="請輸入...">

    <div>
      <input type="radio" class="jungle-form-check-input" name="q1" value="1">
      <label>選項 1</label>
    </div>
  </div>
</template>

<style scoped>
@import './styles/theme.css';
</style>
```

### 範例 4：音樂控制器
```vue
<template>
  <div class="jungle-music-control">
    <input type="range" id="volumeControl" min="0" max="1" step="0.01" value="0.3">
    <i class="mute-icon fas fa-volume-up"></i>
  </div>
</template>

<style scoped>
@import './styles/theme.css';
</style>
```

### 範例 5：測驗頁面
```vue
<template>
  <div class="h-screen w-screen jungle-bg-none flex items-center justify-center">
    <div class="max-w-4xl w-full p-8 overflow-y-auto jungle-exam-content jungle-scrollbar">
      <h2 class="text-2xl font-bold mb-4">測驗標題</h2>
      <!-- 測驗內容 -->
    </div>
  </div>
</template>

<style scoped>
@import './styles/theme.css';
</style>
```

## 🔧 管理說明

### 新增圖片資源
將圖片放入 `images/` 資料夾中，並使用相對路徑引用。

### 新增共用樣式
在 `styles/theme.css` 中新增共用的 CSS class。

### 刪除主題
直接刪除整個 `jungle/` 資料夾即可，所有資源都包含在內。

### 建立新主題
1. 複製整個 `jungle/` 資料夾
2. 重新命名為新主題名稱（例如 `ocean/`）
3. 替換 `images/` 中的圖片
4. 修改 `styles/theme.css` 中的樣式
5. 根據需要調整各個 Vue 組件

## ⚠️ 注意事項

- **所有主題特定資源必須放在此資料夾內**
- **不要引用 theme 資料夾外的圖片或樣式**（共用 services、config 除外）
- **保持資源路徑的相對性**，方便主題的複製和移植
