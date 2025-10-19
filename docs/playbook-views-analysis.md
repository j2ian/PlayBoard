# PlayBook 功能 View 分析文件

## 概述

本文件詳細分析 PlayBook 功能中使用到的所有 view 組件，包括管理端和用戶端的視圖結構、路由配置、API 服務以及功能特性。

---

## 1. PlayBook View 文件清單 (共 9 個)

### 1.1 管理端視圖 (5 個文件)

位置：`/client/src/views/admin/playbook/`

| 文件名 | 用途 | 路由 | 權限要求 |
|--------|------|------|----------|
| **PlayBookList.vue** | 列出並管理所有 PlayBook，支援搜尋、篩選、排序和分頁 | `/admin/playbooks` | 僅管理員 |
| **PlayBookCreate.vue** | 建立新的 PlayBook，包含基本資訊、步驟、難度、顯示模式 | `/admin/playbooks/create` | 僅管理員 |
| **PlayBookEdit.vue** | 編輯現有 PlayBook（與建立表單相同但用於更新） | `/admin/playbooks/:id/edit` | 僅管理員 |
| **PlayBookRead.vue** | 以唯讀格式查看 PlayBook 詳細資訊和步驟概覽 | `/admin/playbooks/:id` | 僅管理員 |
| **PlayBookStats.vue** | 顯示 PlayBook 使用情況和完成度的分析統計 | `/admin/playbooks/:id/stats` | 僅管理員 |

### 1.2 用戶端播放器視圖 (4 個文件)

位置：`/client/src/views/playbook/`

| 文件名 | 用途 | 路由 | 權限要求 |
|--------|------|------|----------|
| **PlayBookPlayer.vue** | 主要 PlayBook 概覽/啟動頁面；顯示所有步驟、進度條、開始/繼續按鈕 | `/playbook/:slug` | 公開 |
| **PlayBookStepPlayer.vue** | 逐步模式播放器，用於內容/考試/問卷/自訂頁面；顯示單一步驟和導航 | `/playbook/:slug/step` | 公開 |
| **PlayBookStepContentView.vue** | 內容專用步驟檢視器，用於閱讀材料（HTML、Markdown 或純文字） | `/playbook/:slug/step/content` | 公開 |
| **PlayBookCompletedView.vue** | 完成慶祝頁面，顯示完成統計和學習內容摘要 | `/playbook/:slug/completed` | 公開 |

---

## 2. 路由結構

### 2.1 路由配置文件

**文件位置**：`/client/src/router/index.js` (第 207-259 行)

### 2.2 路由表

#### 管理端路由（需要認證 + 管理員角色）

```javascript
/admin/playbooks              → PlayBookList (列出全部)
/admin/playbooks/create       → PlayBookCreate (新建)
/admin/playbooks/:id/edit     → PlayBookEdit (更新)
/admin/playbooks/:id/stats    → PlayBookStats (分析統計)
/admin/playbooks/:id          → PlayBookRead (詳細檢視)
```

#### 公開用戶路由（不需認證）

```javascript
/playbook/:slug                     → PlayBookPlayer (概覽)
/playbook/:slug/step                → PlayBookStepPlayer (逐步模式)
/playbook/:slug/step/content        → PlayBookStepContentView (內容)
/playbook/:slug/completed           → PlayBookCompletedView (完成)
```

---

## 3. 後端路由與 API 端點

### 3.1 路由文件

**文件位置**：`/server/routes/playBookRoutes.js`

### 3.2 API 端點

#### 公開路由
- `GET /playbooks/public` - 取得所有已發布的 PlayBook
- `GET /playbooks/public/:slug` - 透過 slug 取得單一 PlayBook
- `GET /playbooks/categories` - 取得所有分類

#### 用戶進度路由（不需認證）
- `POST /playbooks/:id/progress` - 建立/取得用戶進度
- `PUT /playbooks/:id/progress/:stepNumber` - 更新步驟完成狀態
- `PUT /playbooks/:id/progress/custom-page/:stepNumber` - 更新自訂頁面進度
- `POST /playbooks/:id/progress/reset` - 重置用戶進度

#### 管理員路由（需認證 + 管理員）
- `GET /playbooks` - 列出所有 PlayBook（管理員）
- `POST /playbooks` - 建立新 PlayBook
- `GET/PUT/DELETE /playbooks/:id` - CRUD 操作
- `GET /playbooks/:id/stats` - 取得統計資料
- `GET /playbooks/:id/download` - 下載結果（JSON/CSV）

---

## 4. 各視圖的主要功能

### 4.1 PlayBookList.vue - 列表管理

**主要功能**：
- **搜尋**：依標題、描述、標籤搜尋
- **篩選**：
  - 狀態（草稿/已發布）
  - 分類
  - 難度（如果啟用）
- **排序**：
  - 最新/最舊
  - 標題（A-Z、Z-A）
  - 發布日期
  - 觀看次數
  - 完成次數
- **分頁**：每頁顯示 10/20/30/50 項
- **顯示資訊**：
  - 標題
  - 步驟數量
  - 預估時間
  - 分類/難度
  - 狀態
  - 觀看/完成統計
  - 建立日期
  - 建立者
- **操作功能**：
  - 查看統計
  - 編輯
  - 切換發布狀態
  - 刪除
  - 查看公開連結

### 4.2 PlayBookCreate.vue - 建立表單

**主要功能**：
- **基本資訊**：
  - 標題
  - 描述
  - 分類
  - 難度（可選）
- **顯示模式**：
  - "概覽" 模式
  - "逐步" 模式
- **標籤**：最多 10 個
- **步驟管理**：
  - 新增/編輯/刪除步驟
  - 步驟類型：內容、考試、問卷、自訂頁面
- **預估時間計算**

### 4.3 PlayBookEdit.vue - 更新表單

**主要功能**：
- 所有建立表單的欄位
- URL slug（唯讀）
- 查看公開連結按鈕（如果已發布）
- 與建立相同的步驟管理功能

### 4.4 PlayBookRead.vue - 詳細檢視

**顯示內容**：
- 狀態標籤、隱私指示器
- 元資訊：
  - 時長
  - 步驟數
  - 建立日期
  - 發布日期
  - 建立者
  - 觀看次數
  - 完成次數
- 所有步驟顯示：
  - 類型標籤
  - 必填指示器
  - 資源預覽

### 4.5 PlayBookStats.vue - 分析儀表板

**主要功能**：
- **概覽卡片**：
  - 總用戶數
  - 完成用戶數
  - 完成率
  - 平均花費時間
- **步驟完成統計圖表**
- **用戶進度詳細表格**
- **下載結果**（JSON/CSV 格式）
- **即時刷新功能**

### 4.6 PlayBookPlayer.vue - 主要用戶界面

**顯示內容**：
- PlayBook 標題、描述、時長、步驟數、建立者、分類、難度
- 用戶進度條（已完成/總步驟數）

**操作按鈕**：
- 開始學習
- 繼續學習
- 複習
- 切換至逐步模式
- 重新開始

**概覽模式**：
- 顯示所有步驟與完成狀態
- 步驟類型指示器
- 鎖定狀態
- 步驟卡片與操作按鈕（開始/繼續/查看/鎖定）

**完成慶祝區段**

### 4.7 PlayBookStepPlayer.vue - 逐步導航

**主要功能**：
- 頂部進度條（自訂頁面時隱藏）
- 當前步驟顯示：
  - 標題
  - 類型
  - 必填指示器
  - 描述
- 不同步驟類型的資源預覽
- **導航按鈕**：
  - 返回概覽
  - 上一步
  - 下一步
  - 標記完成
  - 提交
- 自訂頁面的全螢幕 iframe
- 自動進入下一步選項

### 4.8 PlayBookStepContentView.vue - 內容顯示

**主要功能**：
- 步驟標題：編號、標題、類型、必填指示器
- **內容渲染**：
  - HTML
  - Markdown
  - 純文字
- 文章標題、摘要、標籤
- 查看時的進度追蹤

### 4.9 PlayBookCompletedView.vue - 完成畫面

**顯示內容**：
- 獎盃圖示和祝賀訊息
- **完成統計**：
  - 完成的步驟數
  - 花費時間
  - 100% 完成度
- 所有已完成步驟清單（附時間戳記）
- **操作按鈕**：
  - 返回概覽
  - 重新開始
  - 首頁
  - 下載證書（如果可用）

---

## 5. API 服務

### 5.1 服務文件

**文件位置**：`/client/src/services/playbook.service.js`

### 5.2 管理端 API

- `getPlayBooks(params)` - 以篩選條件取得列表
- `getPlayBook(id)` - 依 ID 取得
- `createPlayBook(data)` - 建立新的
- `updatePlayBook(id, data)` - 更新現有的
- `deletePlayBook(id)` - 刪除
- `getPlayBookStats(id)` - 取得統計
- `downloadPlayBookResults(id, format)` - 下載為 JSON/CSV

### 5.3 公開 API

- `getPublicPlayBooks(params)` - 公開列表
- `getPublicPlayBook(slug)` - 透過 slug 取得
- `getCategories()` - 取得所有分類

### 5.4 進度追蹤 API

- `getOrCreateProgress(playBookId, userId, userName)` - 初始化/取得用戶進度
- `updateStepProgress(playBookId, stepNumber, userId, result, timeSpent)` - 標記步驟完成
- `updateCustomPageProgress()` - 用於自訂頁面步驟
- `resetProgress(playBookId, userId)` - 重置用戶進度

---

## 6. 視圖階層與流程

```
管理端儀表板 (/admin)
├── PlayBook 管理 (/admin/playbooks)
│   ├── PlayBookList (查看全部、搜尋、篩選)
│   ├── PlayBookCreate (新建)
│   ├── PlayBookEdit/:id (修改)
│   ├── PlayBookRead/:id (詳細/預覽)
│   └── PlayBookStats/:id (分析統計)

公開/用戶視圖（不需管理員權限）
├── PlayBookPlayer (/playbook/:slug)
│   ├── 所有步驟的概覽
│   ├── 步驟導航
│   └── 路由至：
│       ├── PlayBookStepPlayer (/playbook/:slug/step)
│       │   └── 顯示個別步驟
│       │   └── 可能嵌入：
│       │       ├── PlayBookStepContentView (內容步驟)
│       │       ├── ExamTake (考試步驟)
│       │       ├── SurveyTake (問卷步驟)
│       │       └── CustomPagePlayer (自訂頁面步驟)
│       └── PlayBookCompletedView (/playbook/:slug/completed)
```

---

## 7. 支援的步驟類型

1. **Content（內容）** - ReadableContent（HTML/Markdown/純文字）
2. **Exam（考試）** - 含題目和時間限制的考試
3. **Survey（問卷）** - 調查問卷
4. **CustomPage（自訂頁面）** - 透過 iframe 的自訂互動頁面

---

## 8. 關鍵功能特性

### 8.1 進度追蹤
- **LocalStorage + 伺服器同步**
- 即時保存用戶進度
- 跨裝置進度同步

### 8.2 用戶識別
- 自動生成用戶 ID
- 可選的姓名輸入

### 8.3 顯示模式
- **概覽模式**：所有步驟可見
- **逐步模式**：順序進行

### 8.4 存取控制
- 基於完成狀態的順序步驟解鎖
- 必填步驟強制完成

### 8.5 統計功能
- 觀看次數
- 完成次數
- 時間追蹤
- 完成率

### 8.6 發布控制
- 草稿/已發布狀態控制
- 公開連結生成

### 8.7 分類系統
- 分類
- 難度等級
- 標籤

### 8.8 資料匯出
- 下載完成資料為 JSON 或 CSV

---

## 9. 技術架構摘要

### 9.1 前端技術
- **框架**：Vue.js
- **路由**：Vue Router
- **狀態管理**：LocalStorage + API
- **UI 組件**：自訂 Vue 組件

### 9.2 後端技術
- **路由管理**：Express.js
- **資料存儲**：資料庫（透過 ORM/模型）
- **API 格式**：RESTful API

### 9.3 資料流
```
用戶操作 → Vue 組件 → API 服務 → 後端路由 → 控制器 → 資料庫
         ←           ←           ←          ←         ←
```

---

## 10. 使用場景

### 10.1 管理員場景
1. 建立新的學習路徑（PlayBook）
2. 組織學習內容成步驟序列
3. 設定步驟類型和必填要求
4. 發布或保存為草稿
5. 監控學習者進度和完成率
6. 匯出學習資料進行分析

### 10.2 學習者場景
1. 瀏覽可用的 PlayBook
2. 開始學習旅程
3. 依序完成步驟（內容、考試、問卷、自訂頁面）
4. 追蹤個人進度
5. 完成整個 PlayBook
6. 複習已完成的內容

---

## 11. 結論

PlayBook 功能提供了一個完整的學習路徑系統，包含：
- **9 個主要視圖組件**：5 個管理端 + 4 個用戶端
- **完整的 CRUD 操作**：建立、讀取、更新、刪除
- **豐富的進度追蹤**：步驟級別的完成狀態
- **靈活的內容類型**：支援 4 種不同的步驟類型
- **強大的分析功能**：完整的統計和資料匯出
- **良好的用戶體驗**：概覽和逐步兩種學習模式

此系統為管理員提供了強大的控制工具，同時為學習者提供了引人入勝的學習體驗。
