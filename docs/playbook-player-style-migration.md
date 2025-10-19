# PlayBook Player 樣式遷移方案

## 概述

本文件提供將 PlayBook Player 的樣式從當前的現代卡片設計遷移至類似 Sunshine-main 網頁風格的完整方案。

---

## 一、樣式對比分析

### 1.1 Sunshine-main 網頁樣式特點

#### **佈局特性**
- **全螢幕沉浸式設計**：使用 `position: fixed`, `height: 100dvh`, `width: 100dvw`
- **全屏背景圖片**：`background-size: 100% 100%`, `background-repeat: no-repeat`
- **絕對定位元素**：所有主要元素使用 `position: absolute` 精確定位
- **dvh/dvw 單位**：使用動態視口單位確保跨裝置一致性

#### **視覺風格**
- **自然色系配色方案**：
  - 深棕色：`#634A20`（文字、邊框）
  - 淺綠色：`#D2E6B3`（背景、表單）
  - 中綠色：`#82ab44`（滾動條、強調色）
  - 藍色：`#0071b8`（音樂控制圖示）
- **透明按鈕**：`background-color: transparent`
- **圖片 Hover 效果**：兩張圖片切換（.innimg / .hovimg）
- **自訂字體**：jf-openhuninn（粉圓體）

#### **互動元素**
- **音樂控制器**：固定在頂部，包含播放/暫停、音量、靜音
- **自訂滾動條**：綠色漸層主題
- **動畫效果**：使用 animate.css 和自訂 keyframes

#### **表單控制**
- **自訂 Bootstrap 樣式**：
  - 表單控制：淺綠背景 + 深棕文字
  - Radio/Checkbox：深棕邊框 + 淺綠背景
  - 自訂選中圖示（黑色）

### 1.2 當前 PlayBook Player 樣式特點

#### **佈局特性**
- **標準容器佈局**：`max-w-4xl mx-auto px-4 py-8`
- **白色卡片設計**：`bg-white rounded-lg shadow-md`
- **頂部導航欄**：`bg-white shadow-sm border-b`
- **響應式間距**：使用 Tailwind CSS 間距系統

#### **視覺風格**
- **現代色系配色方案**：
  - 主色：CSS 變量 `var(--pb-color-primary)`
  - 背景：`min-h-screen`（默認白色/淺灰）
  - Element Plus 主題色（藍色、綠色、黃色、紅色）
- **陰影和圓角**：`shadow-md`, `rounded-lg`
- **清晰的層次結構**：使用卡片、標籤、按鈕區分

#### **互動元素**
- **Element Plus 組件**：按鈕、進度條、標籤、圖示
- **漸變進度條**：`el-progress`
- **圖示系統**：`@element-plus/icons-vue`

#### **表單控制**
- **Element Plus 表單**：對話框、輸入框、訊息框

### 1.3 關鍵差異總結

| 特性 | Sunshine-main | 當前 PlayBook Player |
|------|--------------|---------------------|
| 佈局模式 | 全螢幕固定定位 | 標準容器居中 |
| 背景 | 全屏圖片背景 | 白色/淺色背景 |
| 定位方式 | 絕對定位 | Flexbox / Grid |
| 按鈕樣式 | 透明 + 圖片 Hover | Element Plus 按鈕 |
| 色系 | 自然綠棕色系 | 現代藍灰色系 |
| 字體 | jf-openhuninn（粉圓體） | 系統預設字體 |
| 視口單位 | dvh/dvw | rem/px/% |
| 音樂控制 | 內建固定頂部 | 無 |
| 滾動條 | 自訂綠色主題 | 預設瀏覽器 |

---

## 二、遷移方案

### 2.1 方案 A：完全遷移（沉浸式體驗）

#### **概述**
完全採用 Sunshine-main 的全螢幕沉浸式設計風格。

#### **主要改變**

##### **1. 佈局結構調整**

```vue
<!-- 移除當前的導航欄和容器 -->
<!-- 改為全螢幕固定佈局 -->
<template>
  <div class="playbook-player-fullscreen">
    <!-- 音樂控制器 -->
    <div class="music-control">
      <i class="play-icon fas fa-play"></i>
      <input type="range" class="volume-control" min="0" max="1" step="0.01" value="0.3">
      <i class="mute-icon fas fa-volume-up"></i>
    </div>

    <!-- 主要內容區域 -->
    <main class="playbook-main" :style="mainBackgroundStyle">
      <!-- PlayBook 標題和描述（絕對定位） -->
      <div class="playbook-header">
        <img class="playbook-title-img" :src="playbookTitleImage" />
        <h1 class="playbook-title">{{ playbook.title }}</h1>
        <p class="playbook-description">{{ playbook.description }}</p>
      </div>

      <!-- 進度條（絕對定位） -->
      <div class="playbook-progress">
        <div class="progress-bar-custom" :style="progressBarStyle"></div>
      </div>

      <!-- 開始/繼續按鈕（透明 + 圖片 Hover） -->
      <button class="playbook-button" @click="startPlayBook">
        <img class="innimg" src="/imgs/buttons/start.png">
        <img class="hovimg" src="/imgs/buttons/start_bright.png">
      </button>

      <!-- 步驟列表（絕對定位卡片） -->
      <div class="steps-container">
        <div
          v-for="step in playbook.steps"
          :key="step.stepNumber"
          class="step-card"
          :style="getStepCardPosition(step.stepNumber)"
        >
          <!-- 步驟內容 -->
        </div>
      </div>
    </main>
  </div>
</template>
```

##### **2. CSS 樣式**

```css
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主容器 - 全螢幕固定 */
.playbook-player-fullscreen {
  position: fixed;
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
}

/* 主要內容區 - 全螢幕背景 */
.playbook-main {
  display: flex;
  position: fixed;
  height: 100dvh;
  width: 100dvw;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

/* 音樂控制器 */
.music-control {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999;
  padding: 5px;
}

.play-icon, .mute-icon {
  margin: 5px;
  cursor: pointer;
  font-size: 20px;
  color: #0071b8;
}

.volume-control {
  top: 0;
  left: 30px;
  margin: 5px;
  width: 5%;
  line-height: 20px;
}

/* PlayBook 標題區域 */
.playbook-header {
  position: absolute;
  top: 15dvh;
  left: 35dvw;
  text-align: center;
}

.playbook-title {
  font-family: 'jf-openhuninn', sans-serif;
  font-size: 4dvw;
  color: #634A20;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
}

.playbook-description {
  font-family: 'jf-openhuninn', sans-serif;
  font-size: 1.5dvw;
  color: #634A20;
  margin-top: 2dvh;
}

/* 進度條 */
.playbook-progress {
  position: absolute;
  top: 30dvh;
  left: 30dvw;
  width: 40dvw;
  height: 3dvh;
  background-color: #D2E6B3;
  border-radius: 15px;
  border: 2px solid #634A20;
}

.progress-bar-custom {
  height: 100%;
  background: linear-gradient(
    45deg,
    #82ab44 25%,
    rgba(255, 255, 255, .2) 25%,
    rgba(255, 255, 255, .2) 50%,
    #82ab44 50%,
    #82ab44 75%,
    rgba(255, 255, 255, .2) 75%,
    rgba(255, 255, 255, .2)
  );
  border-radius: 13px;
  transition: width 0.3s ease;
}

/* 透明按鈕 + 圖片 Hover */
.playbook-button {
  padding: 0;
  margin: 0;
  border: 0;
  position: absolute;
  left: 43dvw;
  bottom: 10dvh;
  background-color: transparent;
  cursor: pointer;
}

.playbook-button img {
  height: 20dvh;
  width: 15dvw;
}

.hovimg {
  display: none;
}

.playbook-button:hover .hovimg {
  display: inline-block;
}

.playbook-button:hover .innimg {
  display: none;
}

/* 步驟卡片 */
.steps-container {
  position: absolute;
  top: 40dvh;
  left: 10dvw;
  width: 80dvw;
  height: 50dvh;
}

.step-card {
  position: absolute;
  background-color: rgba(210, 230, 179, 0.9);
  border: 3px solid #634A20;
  border-radius: 20px;
  padding: 2dvh 2dvw;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.step-card:hover {
  transform: scale(1.05);
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.3);
}

/* 自訂滾動條 */
.scrollbar::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.2);
  border-radius: 15px;
  background-color: #D2E6B3;
}

.scrollbar::-webkit-scrollbar {
  width: 15px;
  background-color: #F5F5F5;
}

.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 15px;
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #82ab44;
  background-image: -webkit-linear-gradient(
    45deg,
    rgba(255, 255, 255, .2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .2) 50%,
    rgba(255, 255, 255, .2) 75%,
    transparent 75%,
    transparent
  );
}

/* 字體引入 */
@font-face {
  font-family: jf-openhuninn;
  src: url('/fonts/jf-openhuninn-2.0.woff') format('woff');
}
```

##### **3. 所需資源**

**字體檔案：**
- 複製 `Sunshine-main/css/jf-openhuninn-2.0.woff` 到 `client/public/fonts/`

**背景圖片：**
- 主背景：設計或選擇全屏背景圖（建議 1920x1080 以上）
- 按鈕圖片：設計 `start.png`, `start_bright.png`, `continue.png`, `continue_bright.png` 等

**圖示庫：**
- 引入 Font Awesome：`@fortawesome/fontawesome-free`

#### **優點**
- 完全沉浸式體驗
- 視覺一致性高
- 獨特的品牌風格
- 適合遊戲化學習

#### **缺點**
- 需要大量圖片資源
- 響應式設計較複雜
- 可能影響可訪問性
- 開發時間較長

---

### 2.2 方案 B：混合折衷（保留結構 + 採用視覺風格）

#### **概述**
保留當前的 Vue 組件結構和響應式佈局，但採用 Sunshine-main 的色系、字體和視覺元素。

#### **主要改變**

##### **1. 色系替換**

```css
/* 定義 Sunshine 主題色系 */
:root {
  --sunshine-brown: #634A20;
  --sunshine-light-green: #D2E6B3;
  --sunshine-green: #82ab44;
  --sunshine-blue: #0071b8;
  --sunshine-text: #634A20;
  --sunshine-bg: #F5F5DC; /* 米色背景 */
}

/* 替換 Element Plus 主題色 */
.el-button--primary {
  background-color: var(--sunshine-green);
  border-color: var(--sunshine-brown);
  color: white;
}

.el-button--primary:hover {
  background-color: #9bc85a;
  border-color: var(--sunshine-brown);
}

.el-progress__bar__inner {
  background-color: var(--sunshine-green);
}

.el-tag--warning {
  background-color: var(--sunshine-light-green);
  border-color: var(--sunshine-brown);
  color: var(--sunshine-brown);
}
```

##### **2. 背景和容器樣式**

```vue
<style scoped>
/* 主容器 - 添加背景 */
.min-h-screen {
  min-height: 100vh;
  background: linear-gradient(to bottom, #F5F5DC 0%, #E8ECD0 100%);
  /* 或使用背景圖片 */
  /* background-image: url('/imgs/backgrounds/playbook-bg.jpg'); */
  /* background-size: cover; */
  /* background-attachment: fixed; */
}

/* 導航欄 - 採用 Sunshine 色系 */
nav {
  background-color: rgba(210, 230, 179, 0.95);
  border-bottom: 2px solid var(--sunshine-brown);
  backdrop-filter: blur(10px);
}

nav a {
  color: var(--sunshine-brown);
  font-family: 'jf-openhuninn', sans-serif;
  font-weight: bold;
}

/* 卡片 - 柔和的綠色主題 */
.bg-white.rounded-lg.shadow-md {
  background-color: rgba(255, 255, 255, 0.95);
  border: 3px solid var(--sunshine-brown);
  border-radius: 20px;
  box-shadow: 4px 4px 12px rgba(99, 74, 32, 0.2);
}

/* 標題 */
h1 {
  font-family: 'jf-openhuninn', sans-serif;
  color: var(--sunshine-brown);
}

/* 步驟卡片 */
.border-2 {
  background-color: rgba(210, 230, 179, 0.5);
  border-color: var(--sunshine-brown) !important;
  border-radius: 15px;
}

.border-green-300 {
  background-color: rgba(130, 171, 68, 0.2);
  border-color: var(--sunshine-green) !important;
}

.border-blue-300 {
  background-color: rgba(0, 113, 184, 0.1);
  border-color: var(--sunshine-blue) !important;
}

/* 步驟編號 */
.bg-green-500 {
  background-color: var(--sunshine-green) !important;
}

.bg-blue-500 {
  background-color: var(--sunshine-blue) !important;
}
</style>
```

##### **3. 添加音樂控制器組件**

```vue
<!-- 新建 MusicControl.vue -->
<template>
  <div class="music-control">
    <audio ref="bgMusic" :src="musicSrc" loop autoplay></audio>
    <div class="control-panel">
      <i
        class="control-icon fas"
        :class="isPlaying ? 'fa-pause' : 'fa-play'"
        @click="togglePlay"
      ></i>
      <input
        type="range"
        class="volume-slider"
        min="0"
        max="1"
        step="0.01"
        v-model="volume"
        @input="updateVolume"
      >
      <i
        class="control-icon fas"
        :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"
        @click="toggleMute"
      ></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const bgMusic = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(0.3)
const musicSrc = '/music/playbook-bg.mp3'

onMounted(() => {
  if (bgMusic.value) {
    bgMusic.value.volume = volume.value
  }
})

const togglePlay = () => {
  if (bgMusic.value.paused) {
    bgMusic.value.play()
    isPlaying.value = true
  } else {
    bgMusic.value.pause()
    isPlaying.value = false
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
  bgMusic.value.muted = isMuted.value
}

const updateVolume = () => {
  bgMusic.value.volume = volume.value
}
</script>

<style scoped>
.music-control {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  padding: 8px 12px;
  background-color: rgba(210, 230, 179, 0.9);
  border-bottom: 2px solid var(--sunshine-brown);
}

.control-panel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-icon {
  cursor: pointer;
  font-size: 18px;
  color: var(--sunshine-blue);
  transition: color 0.3s;
}

.control-icon:hover {
  color: var(--sunshine-green);
}

.volume-slider {
  width: 100px;
  accent-color: var(--sunshine-green);
}
</style>
```

##### **4. 字體整合**

```css
/* 在 main.css 或 App.vue 中引入 */
@font-face {
  font-family: 'jf-openhuninn';
  src: url('/fonts/jf-openhuninn-2.0.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

/* 全局應用字體 */
body {
  font-family: 'jf-openhuninn', 'Microsoft JhengHei', sans-serif;
}
```

##### **5. 自訂滾動條**

```css
/* 全局滾動條樣式 */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background-color: var(--sunshine-light-green);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--sunshine-green);
  border-radius: 10px;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, .2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, .2) 50%,
    rgba(255, 255, 255, .2) 75%,
    transparent 75%,
    transparent
  );
}

::-webkit-scrollbar-thumb:hover {
  background-color: #9bc85a;
}
```

#### **優點**
- 保留現有組件結構
- 開發時間較短
- 響應式設計保持良好
- 視覺風格接近 Sunshine
- 易於維護

#### **缺點**
- 不是完全的沉浸式體驗
- 需要調整大量 Element Plus 樣式
- 可能存在樣式衝突

---

### 2.3 方案 C：主題切換（可選模式）

#### **概述**
實作主題切換功能，允許用戶在「標準模式」和「Sunshine 模式」之間切換。

#### **主要改變**

##### **1. 主題配置**

```javascript
// config/themes.js
export const themes = {
  standard: {
    name: '標準模式',
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      background: '#FFFFFF',
      text: '#303133'
    },
    font: 'system-ui, -apple-system, sans-serif',
    layout: 'container' // 容器模式
  },
  sunshine: {
    name: 'Sunshine 模式',
    colors: {
      primary: '#82ab44',
      success: '#82ab44',
      warning: '#D2E6B3',
      danger: '#F07B7C',
      background: '#F5F5DC',
      text: '#634A20',
      brown: '#634A20',
      lightGreen: '#D2E6B3',
      green: '#82ab44',
      blue: '#0071b8'
    },
    font: 'jf-openhuninn, Microsoft JhengHei, sans-serif',
    layout: 'fullscreen' // 全螢幕模式（可選）
  }
}
```

##### **2. 主題切換組件**

```vue
<!-- components/ThemeToggle.vue -->
<template>
  <div class="theme-toggle">
    <el-switch
      v-model="isSunshineMode"
      active-text="Sunshine 模式"
      inactive-text="標準模式"
      @change="toggleTheme"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme } = useTheme()
const isSunshineMode = ref(currentTheme.value === 'sunshine')

onMounted(() => {
  // 從 localStorage 讀取主題偏好
  const savedTheme = localStorage.getItem('playbook-theme')
  if (savedTheme) {
    isSunshineMode.value = savedTheme === 'sunshine'
  }
})

const toggleTheme = (value) => {
  const themeName = value ? 'sunshine' : 'standard'
  setTheme(themeName)
  localStorage.setItem('playbook-theme', themeName)
}
</script>
```

##### **3. 主題 Composable**

```javascript
// composables/useTheme.js
import { ref, watch } from 'vue'
import { themes } from '@/config/themes'

const currentTheme = ref('standard')

export function useTheme() {
  const setTheme = (themeName) => {
    currentTheme.value = themeName
    const theme = themes[themeName]

    // 設定 CSS 變量
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })

    // 設定字體
    root.style.setProperty('--theme-font', theme.font)

    // 切換 body class
    document.body.className = `theme-${themeName}`
  }

  return {
    currentTheme,
    setTheme,
    themes
  }
}
```

##### **4. 條件式佈局**

```vue
<!-- PlayBookPlayer.vue -->
<template>
  <component :is="layoutComponent">
    <!-- PlayBook 內容 -->
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import StandardLayout from '@/components/layouts/StandardLayout.vue'
import SunshineLayout from '@/components/layouts/SunshineLayout.vue'

const { currentTheme } = useTheme()

const layoutComponent = computed(() => {
  return currentTheme.value === 'sunshine' ? SunshineLayout : StandardLayout
})
</script>
```

#### **優點**
- 用戶可自由選擇
- 保留兩種體驗
- 展示技術能力
- 適應不同偏好

#### **缺點**
- 維護兩套樣式
- 開發成本最高
- 可能增加複雜度

---

## 三、建議實作步驟

### 推薦方案：**方案 B（混合折衷）**

#### **理由：**
1. 平衡視覺一致性和開發效率
2. 保持響應式設計和可訪問性
3. 易於維護和擴展
4. 開發時間適中

### 實作步驟

#### **階段一：準備工作（1-2 天）**

1. **資源準備**
   - 複製字體檔案到 `client/public/fonts/`
   - 準備背景圖片（可選）
   - 準備背景音樂檔案（可選）
   - 安裝 Font Awesome：`npm install @fortawesome/fontawesome-free`

2. **配置檔案**
   - 建立 `client/src/styles/sunshine-theme.css`
   - 定義色系變量
   - 引入字體

#### **階段二：基礎樣式遷移（2-3 天）**

3. **全局樣式調整**
   ```css
   /* styles/sunshine-theme.css */
   @import '@fortawesome/fontawesome-free/css/all.css';

   @font-face {
     font-family: 'jf-openhuninn';
     src: url('/fonts/jf-openhuninn-2.0.woff') format('woff');
   }

   :root {
     --sunshine-brown: #634A20;
     --sunshine-light-green: #D2E6B3;
     --sunshine-green: #82ab44;
     --sunshine-blue: #0071b8;
     --sunshine-bg: #F5F5DC;
   }

   body {
     font-family: 'jf-openhuninn', 'Microsoft JhengHei', sans-serif;
     background: linear-gradient(to bottom, #F5F5DC 0%, #E8ECD0 100%);
   }
   ```

4. **引入全局樣式**
   ```javascript
   // main.js
   import '@/styles/sunshine-theme.css'
   ```

5. **自訂滾動條**
   - 在 `sunshine-theme.css` 中添加滾動條樣式

#### **階段三：組件樣式更新（3-4 天）**

6. **PlayBookPlayer.vue 樣式調整**
   - 更新導航欄樣式
   - 更新卡片樣式
   - 更新按鈕樣式
   - 更新步驟卡片樣式
   - 調整色系和間距

7. **Element Plus 主題覆蓋**
   ```css
   /* 覆蓋 Element Plus 樣式 */
   .el-button--primary {
     background-color: var(--sunshine-green);
     border-color: var(--sunshine-brown);
   }

   .el-progress__bar__inner {
     background: linear-gradient(45deg,
       var(--sunshine-green) 25%,
       rgba(255,255,255,.2) 25%,
       rgba(255,255,255,.2) 50%,
       var(--sunshine-green) 50%);
   }
   ```

#### **階段四：互動元素添加（2-3 天）**

8. **音樂控制器組件**
   - 建立 `MusicControl.vue`
   - 整合到 PlayBookPlayer
   - 添加音樂檔案
   - 實作播放/暫停/音量控制

9. **動畫效果**
   - 安裝 animate.css：`npm install animate.css`
   - 添加進入/離開動畫
   - 實作 hover 效果

#### **階段五：測試與優化（2-3 天）**

10. **跨瀏覽器測試**
    - Chrome、Firefox、Safari、Edge
    - 行動裝置測試

11. **響應式調整**
    - 平板尺寸優化
    - 手機尺寸優化
    - dvh/dvw 單位替代方案

12. **性能優化**
    - 圖片壓縮
    - 字體子集化
    - CSS 最佳化

13. **可訪問性檢查**
    - 鍵盤導航
    - 螢幕閱讀器支援
    - 對比度檢查

#### **總計時間：10-15 天**

---

## 四、技術細節

### 4.1 字體處理

#### **字體檔案位置**
```
client/
  public/
    fonts/
      jf-openhuninn-2.0.woff
```

#### **字體引入**
```css
@font-face {
  font-family: 'jf-openhuninn';
  src: url('/fonts/jf-openhuninn-2.0.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* 優化載入 */
}
```

#### **字體應用**
```css
body, h1, h2, h3, h4, h5, h6, p, button {
  font-family: 'jf-openhuninn', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
}
```

### 4.2 響應式 dvh/dvw 處理

#### **問題**
- dvh/dvw 在某些舊瀏覽器不支援
- 行動裝置可能有地址欄影響

#### **解決方案**
```css
/* 使用 CSS 變量 + JavaScript 回退 */
:root {
  --vh: 1vh;
  --vw: 1vw;
}

.playbook-main {
  height: calc(100 * var(--vh));
  width: calc(100 * var(--vw));
}
```

```javascript
// 在 main.js 中
function setViewportUnits() {
  const vh = window.innerHeight * 0.01
  const vw = window.innerWidth * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
  document.documentElement.style.setProperty('--vw', `${vw}px`)
}

setViewportUnits()
window.addEventListener('resize', setViewportUnits)
```

### 4.3 背景圖片處理

#### **建議規格**
- 解析度：1920x1080 以上
- 格式：WebP（回退 JPG）
- 檔案大小：< 500KB
- 色調：柔和自然色系

#### **實作**
```vue
<template>
  <div class="playbook-main" :style="backgroundStyle">
    <!-- 內容 -->
  </div>
</template>

<script setup>
import { computed } from 'vue'

const backgroundStyle = computed(() => {
  return {
    backgroundImage: `url('/imgs/backgrounds/playbook-main.webp')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})
</script>
```

### 4.4 音樂控制器實作細節

#### **音樂檔案要求**
- 格式：MP3（兼容性最佳）
- 時長：2-5 分鐘（循環播放）
- 檔案大小：< 2MB
- 音量：適中（避免突兀）

#### **自動播放政策**
```javascript
// 處理瀏覽器自動播放限制
onMounted(async () => {
  try {
    await bgMusic.value.play()
    isPlaying.value = true
  } catch (error) {
    console.log('自動播放被阻止，需要用戶互動')
    // 顯示播放按鈕提示
  }
})
```

### 4.5 Element Plus 主題覆蓋完整方案

#### **全局主題配置**
```javascript
// vite.config.js 或 main.js
import { ElConfigProvider } from 'element-plus'

app.use(ElConfigProvider, {
  // 自訂主題變量
  // 注意：這只覆蓋部分，更完整的需要 SCSS 變量覆蓋
})
```

#### **使用 SCSS 變量覆蓋**
```scss
// styles/element-variables.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #82ab44,
    ),
    'success': (
      'base': #82ab44,
    ),
    'warning': (
      'base': #D2E6B3,
    ),
  )
);

// 在 main.js 引入
import './styles/element-variables.scss'
```

---

## 五、潛在問題與解決方案

### 5.1 問題：字體載入閃爍（FOIT/FOUT）

**解決方案：**
```css
@font-face {
  font-family: 'jf-openhuninn';
  src: url('/fonts/jf-openhuninn-2.0.woff') format('woff');
  font-display: swap; /* 或使用 optional */
}
```

### 5.2 問題：全螢幕佈局在行動裝置上的地址欄問題

**解決方案：**
```javascript
// 使用 100vh 的替代方案
function setRealVH() {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

setRealVH()
window.addEventListener('resize', setRealVH)
window.addEventListener('orientationchange', setRealVH)
```

```css
.playbook-main {
  height: calc(var(--vh, 1vh) * 100);
}
```

### 5.3 問題：背景音樂自動播放被阻止

**解決方案：**
```vue
<template>
  <div v-if="showPlayPrompt" class="play-prompt">
    <button @click="startMusic">
      <i class="fas fa-play"></i> 點擊開始音樂
    </button>
  </div>
</template>

<script setup>
const showPlayPrompt = ref(false)

const startMusic = async () => {
  try {
    await bgMusic.value.play()
    showPlayPrompt.value = false
  } catch (error) {
    console.error('播放失敗', error)
  }
}
</script>
```

### 5.4 問題：大背景圖載入速度慢

**解決方案：**
1. **圖片壓縮**：使用 TinyPNG 或 Squoosh
2. **漸進式 JPEG**：設定 progressive
3. **預載入**：
   ```html
   <link rel="preload" as="image" href="/imgs/backgrounds/playbook-main.webp">
   ```
4. **模糊占位符**：
   ```css
   .playbook-main {
     background-image: url('/imgs/backgrounds/playbook-main-blur.jpg');
   }
   .playbook-main.loaded {
     background-image: url('/imgs/backgrounds/playbook-main.webp');
   }
   ```

### 5.5 問題：Element Plus 樣式優先級衝突

**解決方案：**
```css
/* 使用更高優先級 */
.playbook-player .el-button--primary {
  background-color: var(--sunshine-green) !important;
}

/* 或使用深度選擇器 */
:deep(.el-button--primary) {
  background-color: var(--sunshine-green);
}
```

---

## 六、檢查清單

### 設計階段
- [ ] 確認色系配置
- [ ] 準備背景圖片
- [ ] 設計按鈕圖片（innimg/hovimg）
- [ ] 選擇背景音樂
- [ ] 確認字體授權

### 開發階段
- [ ] 安裝必要依賴（Font Awesome, animate.css）
- [ ] 複製字體檔案
- [ ] 建立主題樣式檔案
- [ ] 實作音樂控制器
- [ ] 更新 PlayBookPlayer.vue 樣式
- [ ] 覆蓋 Element Plus 主題
- [ ] 實作自訂滾動條
- [ ] 添加動畫效果

### 測試階段
- [ ] Chrome 桌面版測試
- [ ] Firefox 桌面版測試
- [ ] Safari 桌面版測試
- [ ] Edge 桌面版測試
- [ ] iOS Safari 測試
- [ ] Android Chrome 測試
- [ ] 平板裝置測試
- [ ] 響應式斷點測試
- [ ] 鍵盤導航測試
- [ ] 螢幕閱讀器測試

### 優化階段
- [ ] 圖片壓縮
- [ ] 字體子集化
- [ ] CSS 最小化
- [ ] 移除未使用的 CSS
- [ ] Lighthouse 性能檢查
- [ ] 可訪問性評分檢查

### 上線階段
- [ ] 備份原始樣式
- [ ] 部署到測試環境
- [ ] 用戶測試反饋
- [ ] 修正 bug
- [ ] 正式環境部署
- [ ] 監控性能指標

---

## 七、總結

### 方案比較總表

| 特性 | 方案 A（完全遷移） | 方案 B（混合折衷）⭐ | 方案 C（主題切換） |
|------|------------------|---------------------|-------------------|
| 開發時間 | 15-20 天 | 10-15 天 | 20-30 天 |
| 視覺一致性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 響應式設計 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 可訪問性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 維護成本 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 使用體驗 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 技術難度 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**⭐ 推薦方案 B（混合折衷）**

### 最終建議

1. **短期**：採用方案 B，快速實現視覺風格遷移
2. **中期**：根據用戶反饋進行細節優化
3. **長期**：考慮實作方案 C，提供主題選項

### 後續擴展可能

1. **更多主題**：可擴展更多主題選項（黑暗模式、高對比度等）
2. **自訂背景**：允許用戶上傳自訂背景
3. **音樂選擇**：提供多種背景音樂選項
4. **動畫自訂**：允許開關動畫效果
5. **字體選擇**：提供多種字體選項

---

**文件版本**：v1.0
**建立日期**：2025-10-19
**最後更新**：2025-10-19
**作者**：Claude Code
