# 新增需求

- playbook 應該要可以選擇 theme
- theme 應該要可以被上傳，類似 wordpress 樣式
- 目前 playbbok 中會含有一般內容、問券、測驗、第一步、過場步驟、完成頁面等，這些應該都要可以被 theme 改變

列舉出如果要完成以上步驟要新增哪些文件、修改哪些地方
將計畫列在下方

📋 計畫總覽

一、需要新增的文件 (19 個)

後端 (6 個):

- server/models/Theme.js - 主題資料模型
- server/controllers/themeController.js - 主題控制器
- server/routes/theme.js - API 路由
- server/middleware/themeUpload.js - 檔案上傳處理
- server/services/themeService.js - 主題邏輯處理
- server/validators/themeValidator.js - 資料驗證

前端 (13 個):

- 2 個視圖：ThemeManage.vue, ThemeEditor.vue
- 5 個組件：ThemeSelector, ThemePreview, ThemeUploader, ThemeProvider, ThemeCustomizer
- 2 個服務：theme.service.js, useTheme composable
- 2 個設定檔：defaultThemes.js, themeTemplate.js
- 類型定義和文件

二、需要修改的文件 (15 個)

後端 (4 個):

- PlayBook.js - 新增 theme 和 customThemeSettings 欄位
- playBookController.js - 處理主題設定
- app.js - 註冊路由和靜態檔案
- playbook routes

前端 (11 個):

- 所有播放器頁面：PlayBookPlayer, StepPlayer, ContentView, CompletedView
- 互動組件：SurveyTake, ExamTake, CustomPagePlayer
- 編輯頁面：PlayBookCreate, PlayBookEdit
- 樣式和路由：tailwind.css, router/index.js, playbook.service.js

三、實作時程 (7 週)

- 第 1-2 週: 後端基礎 (模型、API、服務)
- 第 3-4 週: 前端基礎 (組件、播放器整合)
- 第 5 週: 管理介面
- 第 6 週: 預設主題開發 (5 個主題)
- 第 7 週: 測試與優化

四、主題系統特色

✅ WordPress 風格：ZIP 檔案上傳，包含 theme.json 配置 ✅ 完整自訂：顏色、字型、間距、圓角、陰影、佈局 ✅
安全性：檔案驗證、CSS 清理、權限控制 ✅ 覆蓋全部內容類型：一般內容、問卷、測驗、自訂頁面、完成頁面 ✅
動態套用：即時注入 CSS 變數，無需重新載入

詳細計畫已儲存在 docs/theme.md 檔案中！
