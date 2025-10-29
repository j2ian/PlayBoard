# PlayBook 主題快速入門

> 5 分鐘快速建立新主題

## 快速步驟

### 步驟 1：建立主題資料夾

```bash
mkdir client/src/views/themes/my-theme
```

### 步驟 2：複製檔案

```bash
# Windows
xcopy client\src\views\themes\default\*.vue client\src\views\themes\my-theme\ /Y

# Linux/Mac
cp client/src/views/themes/default/*.vue client/src/views/themes/my-theme/
```

### 步驟 3：註冊主題

編輯 `client/src/utils/themeLoader.js`：

```javascript
const THEME_CONFIG = [
  {
    value: "default",
    label: "預設主題",
    description: "系統預設的主題樣式",
  },
  {
    value: "jungle",
    label: "叢林主題",
    description: "充滿自然氣息的叢林風格主題",
  },
  {
    value: "ocean",
    label: "海洋主題",
    description: "海洋風格主題",
  },
  // 新增這裡
  {
    value: "my-theme", // 必須與資料夾名稱相同
    label: "我的主題", // 顯示名稱
    description: "我的自訂主題", // 說明
  },
];
```

### 步驟 4：修改樣式

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

### 步驟 5：測試

1. 建立新 PlayBook
2. 選擇「我的主題」
3. 儲存並查看公開頁面

## 需要修改的檔案

| 檔案                          | 用途          |
| ----------------------------- | ------------- |
| `PlayBookPlayer.vue`          | PlayBook 首頁 |
| `PlayBookStepPlayer.vue`      | 步驟播放器    |
| `PlayBookStepContentView.vue` | 內容顯示頁    |
| `PlayBookCompletedView.vue`   | 完成頁面      |
| `ExamTake.vue`                | 測驗頁面      |
| `SurveyTake.vue`              | 問卷頁面      |

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
db.playbooks.findOne({ slug: "your-slug" });
// 檢查 theme 欄位
```

### 常見錯誤

**主題沒出現在選單**

- 檢查 `themeLoader.js` 是否正確註冊
- 重新啟動開發伺服器

**載入主題失敗**

- 檢查資料夾名稱是否與 `value` 相同
- 確認所有 6 個 Vue 檔案都存在

**樣式沒有改變**

- 清除瀏覽器快取
- 確認修改了正確的檔案
- 檢查 CSS 語法是否正確

## 進階使用

### 使用圖片和資源

#### 1. 建立資源資料夾

在主題資料夾內建立 images 和 styles 資料夾：

```bash
# Windows
mkdir client\src\views\themes\my-theme\images
mkdir client\src\views\themes\my-theme\styles

# Linux/Mac
mkdir -p client/src/views/themes/my-theme/images
mkdir -p client/src/views/themes/my-theme/styles
```

#### 2. 放置圖片檔案

將圖片放到 `client/src/views/themes/my-theme/images/` 資料夾

#### 3. 在 Vue 元件中使用

```vue
<template>
  <!-- 方式一：直接引用 -->
  <img src="./images/logo.png" alt="Logo" />

  <!-- 方式二：背景圖 -->
  <div class="hero-section">
    <h1>標題</h1>
  </div>
</template>

<style scoped>
/* 背景圖片 - 在 Vue 組件中使用相對路徑 */
.hero-section {
  background-image: url("./images/background.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
```

### 使用主題專用 CSS

建立 `client/src/views/themes/my-theme/styles/theme.css`：

```css
:root {
  --my-primary-color: #8b5cf6;
  --my-secondary-color: #ec4899;
}

.my-theme {
  font-family: "Custom Font", sans-serif;
}

.my-theme .btn-primary {
  background-color: var(--my-primary-color);
}
```

在元件中引入：

```vue
<style scoped>
@import "./styles/theme.css";
</style>
```

**重要提示：**

- 所有主題資源（圖片、CSS、字體等）都應放在主題資料夾內
- Vue 組件中使用 `./images/` 相對路徑
- styles/ 目錄中的 CSS 引用圖片時使用 `../images/`
- 這樣方便主題的複製、刪除和管理

## 完整文件

詳細說明請參考 [playbook-theme-system.md](dev/playbook-theme-system.md)

## 需要協助？

- 查看現有主題（default、jungle）的程式碼作為範例
- 參考 [TailwindCSS 文件](https://tailwindcss.com/docs)
- 參考 [Element Plus 文件](https://element-plus.org/)
