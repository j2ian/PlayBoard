# PlayBook 主題快速入門

> 5 分鐘快速建立新主題

## 快速步驟

### 1️⃣ 建立主題資料夾
```bash
mkdir client/src/views/themes/my-theme
```

### 2️⃣ 複製檔案
```bash
# Windows
xcopy client\src\views\themes\default\*.vue client\src\views\themes\my-theme\ /Y

# Linux/Mac
cp client/src/views/themes/default/*.vue client/src/views/themes/my-theme/
```

### 3️⃣ 註冊主題

編輯 `client/src/utils/themeLoader.js`：

```javascript
const THEME_CONFIG = [
  {
    value: 'default',
    label: '預設主題',
    description: '系統預設的主題樣式'
  },
  // 👇 新增這裡
  {
    value: 'my-theme',      // 必須與資料夾名稱相同
    label: '我的主題',       // 顯示名稱
    description: '我的自訂主題' // 說明
  }
]
```

### 4️⃣ 修改樣式

編輯 `client/src/views/themes/my-theme/` 下的任何 `.vue` 檔案：

```vue
<template>
  <!-- 修改 HTML 結構和 Tailwind classes -->
  <div class="bg-purple-500 text-white">
    <h1 class="text-4xl font-bold">{{ playbook.title }}</h1>
  </div>
</template>

<style scoped>
/* 新增自訂 CSS */
.custom-class {
  /* 你的樣式 */
}
</style>
```

### 5️⃣ 測試

1. 建立新 PlayBook
2. 選擇「我的主題」
3. 儲存並查看公開頁面

## 需要修改的檔案

| 檔案 | 用途 |
|------|------|
| `PlayBookPlayer.vue` | PlayBook 首頁 |
| `PlayBookStepPlayer.vue` | 步驟播放器 |
| `PlayBookStepContentView.vue` | 內容顯示頁 |
| `PlayBookCompletedView.vue` | 完成頁面 |
| `ExamTake.vue` | 測驗頁面 |
| `SurveyTake.vue` | 問卷頁面 |

## 常用樣式修改

### 修改主色調
```vue
<!-- 將藍色改為紫色 -->
<div class="bg-blue-500">     <!-- 原本 -->
<div class="bg-purple-500">   <!-- 修改後 -->
```

### 修改字體大小
```vue
<h1 class="text-2xl">         <!-- 原本 -->
<h1 class="text-4xl">         <!-- 修改後 -->
```

### 修改圓角
```vue
<div class="rounded-lg">      <!-- 原本 -->
<div class="rounded-full">    <!-- 修改後 -->
```

### 修改間距
```vue
<div class="p-4">             <!-- 原本 -->
<div class="p-8">             <!-- 修改後 -->
```

## 除錯技巧

### 檢查主題是否載入
打開瀏覽器 Console，應該看到：
```
[ThemeLoader] 載入元件: theme=my-theme, component=PlayBookPlayer
[ThemeLoader] 成功載入: themes/my-theme/PlayBookPlayer.vue
```

### 檢查資料庫
```javascript
// MongoDB
db.playbooks.findOne({ slug: 'your-slug' })
// 檢查 theme 欄位
```

### 常見錯誤

❌ **主題沒出現在選單**
- 檢查 `themeLoader.js` 是否正確註冊
- 重新啟動開發伺服器

❌ **載入主題失敗**
- 檢查資料夾名稱是否與 `value` 相同
- 確認所有 6 個 Vue 檔案都存在

❌ **樣式沒有改變**
- 清除瀏覽器快取
- 確認修改了正確的檔案
- 檢查 CSS 語法是否正確

## 進階使用

### 使用圖片和資源

#### 1. 建立 assets 資料夾
```bash
mkdir -p client/src/assets/themes/my-theme/images
mkdir -p client/src/assets/themes/my-theme/styles
```

#### 2. 放置圖片檔案
將圖片放到 `client/src/assets/themes/my-theme/images/` 資料夾

#### 3. 在 Vue 元件中使用
```vue
<template>
  <!-- 方式一：直接引用 -->
  <img src="@/assets/themes/my-theme/images/logo.png" alt="Logo">

  <!-- 方式二：背景圖 -->
  <div class="hero-section">
    <h1>標題</h1>
  </div>
</template>

<style scoped>
/* 背景圖片 */
.hero-section {
  background-image: url('@/assets/themes/my-theme/images/background.jpg');
  background-size: cover;
}
</style>
```

### 使用主題專用 CSS

建立 `client/src/assets/themes/my-theme/styles/theme.css`：

```css
:root {
  --my-primary-color: #8b5cf6;
  --my-secondary-color: #ec4899;
}

.my-theme {
  font-family: 'Custom Font', sans-serif;
}

.my-theme .btn-primary {
  background-color: var(--my-primary-color);
}
```

在元件中引入：

```vue
<style scoped>
@import '@/assets/themes/my-theme/styles/theme.css';
</style>
```

## 完整文件

詳細說明請參考 [playbook-theme-system.md](./playbook-theme-system.md)

## 需要協助？

- 查看現有主題（default、jungle）的程式碼作為範例
- 參考 [TailwindCSS 文件](https://tailwindcss.com/docs)
- 參考 [Element Plus 文件](https://element-plus.org/)
