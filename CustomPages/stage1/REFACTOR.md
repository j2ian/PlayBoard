# Stage1 程式碼重構說明

## 優化概述

這次重構將原本混亂的 810 行單一 HTML 檔案重構為清晰的模組化結構。

## 檔案結構

```
stage1/
├── index.html                      # 簡潔的 HTML 結構（115 行）
├── assets/
│   ├── css/
│   │   └── style.css              # 獨立的樣式檔案
│   ├── js/
│   │   ├── game.js                # 遊戲邏輯類別
│   │   └── playboard.js           # PlayBoard 整合
│   ├── images/                     # 圖片資源
│   ├── music/                      # 音樂檔案
│   ├── sound/                      # 音效檔案
│   ├── intro/                      # 介紹音頻
│   └── fonts/                      # 字型檔案
└── REFACTOR.md                     # 本說明文件
```

## 主要改進

### 1. 分離關注點（Separation of Concerns）

**之前：**
- ❌ HTML、CSS、JavaScript 全部混在一個檔案中
- ❌ 810 行的單一檔案難以維護

**現在：**
- ✅ HTML 結構清晰（115 行）
- ✅ CSS 獨立檔案（450+ 行）
- ✅ JavaScript 模組化（兩個獨立檔案）

### 2. 移除內聯事件處理器

**之前：**
```html
<button onclick="gameStart()">開始</button>
<button onclick="next(1)">下一步</button>
<div ondrop="drop(event)" ondragover="allowDrop(event)">
```

**現在：**
```javascript
// 使用 addEventListener
startButtons.forEach(btn => {
    btn.addEventListener('click', () => this.startGame());
});
```

### 3. 封裝與模組化

**之前：**
```javascript
// 全域變數污染
let score = 0;
let scoreDump = 0;
var timerFuntion;
var TileAvailable = [true, true, true, true, true];

// 散落的函數
function gameStart() { ... }
function setGame() { ... }
```

**現在：**
```javascript
// 使用類別封裝
class FoodSharingGame {
    constructor() {
        this.state = {
            score: 0,
            scoreDump: 0,
            // ...
        };
        this.config = {
            startingTime: 90,
            // ...
        };
    }

    startGame() { ... }
    setGame() { ... }
}
```

### 4. 改善程式碼組織

**功能分類：**

#### `game.js` - 遊戲主邏輯類別
- ✅ 統一的設定管理（`config` 物件）
- ✅ 狀態管理（`state` 物件）
- ✅ DOM 元素快取（`elements` 物件）
- ✅ 計時器引用管理（`timers` 物件）
- ✅ 清晰的方法命名

#### `playboard.js` - PlayBoard 整合
- ✅ 獨立的進度控制類別
- ✅ 與主遊戲邏輯分離
- ✅ 清楚的職責劃分

### 5. 消除魔術數字

**之前：**
```javascript
setTimeout(setGame, 10000);
if(time == 60) { ... }
if(time == 30) { ... }
```

**現在：**
```javascript
// 使用命名常數
this.config = {
    hintDuration: 10000,
    phase1Threshold: 60,
    phase2Threshold: 30
};

setTimeout(() => this.setGame(), this.config.hintDuration);
if(this.state.time === this.config.phase1Threshold) { ... }
```

### 6. 改善可讀性

**命名改進：**
- `timerFuntion` → `this.timers.countdown`
- `tileFunctionPhase1` → `this.timers.phase1`
- `setdraggableTile` → `setDraggableTile`

**註解改進：**
- 新增清楚的 JSDoc 風格註解
- 每個方法都有說明

### 7. 改善 HTML 語義化

**之前：**
```html
<div class="boxReceive" id="box-1" value="1">
```

**現在：**
```html
<div class="boxReceive" id="box-1" data-value="1" aria-label="接收區 1">
```

- ✅ 使用 `data-*` 屬性而非 `value`
- ✅ 新增 `aria-label` 提升無障礙性
- ✅ 移除不必要的內聯屬性

### 8. 效能優化

- ✅ DOM 元素快取（避免重複查詢）
- ✅ 事件委派（減少事件監聽器數量）
- ✅ 使用 `const` 和 `let` 替代 `var`
- ✅ 箭頭函數簡化程式碼

## 優點總結

### 維護性
- ✅ 程式碼結構清晰，易於理解
- ✅ 職責分明，修改不影響其他部分
- ✅ 註解完整，降低學習成本

### 擴充性
- ✅ 模組化設計，容易新增功能
- ✅ 設定集中管理，調整參數簡單
- ✅ 類別封裝，可重複使用

### 效能
- ✅ DOM 查詢優化
- ✅ 事件處理改進
- ✅ 記憶體使用更合理

### 程式碼品質
- ✅ 遵循現代 JavaScript 最佳實踐
- ✅ 無全域變數污染
- ✅ 統一的命名規範

## 使用方式

直接在瀏覽器中開啟 `index.html` 即可。所有邏輯已自動初始化：

```javascript
// 遊戲實例自動建立並掛載到 window
window.foodSharingGame = new FoodSharingGame();

// PlayBoard 整合自動初始化
window.playboard = new PlayBoardProgress();
```

## 相容性

- ✅ 保持所有原有功能不變
- ✅ 遊戲邏輯完全相同
- ✅ PlayBoard 整合正常運作
- ✅ 支援所有現代瀏覽器

## 未來改進建議

1. **TypeScript 遷移**：新增型別安全
2. **單元測試**：新增遊戲邏輯測試
3. **打包工具**：使用 Webpack/Vite 進行打包優化
4. **錯誤處理**：新增更完善的錯誤處理機制
5. **國際化**：支援多語言

## 總結

這次重構大幅改善了程式碼品質，從 810 行混亂的單一檔案，重構為清晰的模組化結構。程式碼更易讀、易維護、易擴充，同時保持了所有原有功能。
