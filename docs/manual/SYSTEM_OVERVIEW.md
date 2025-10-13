# PlayBoard Documentation（獨立文件首頁）

歡迎來到 PlayBoard 官方文件。這裡是完整的產品與開發者文件入口，遵循常見開源專案（如 Next.js / Vue / Strapi / Supabase 等）的文件結構與編寫風格，方便閱讀、搜尋與長期維護。

## 為誰而寫（Audience）
- 工程師：維護、擴充功能、釐清資料流與 API 契約。
- 教師/內容設計者：理解 PlayBook 與內容組裝方式。
- 維運人員：部署、監控、備援與問題排查。

## 你可以從哪開始（Quick Start）
1. 安裝與啟動：見「入門指南」。
2. 建立第一個 PlayBook：依照導引完成建立、發布與測試。
3. 深入模組：按需閱讀「PlayBook」「進度追蹤」「客製化頁面」等章節。

---

## 導覽（目錄）

### 1. 入門指南（Getting Started）
- 系統需求、安裝、專案啟動
- 專案結構與核心概念速覽
- 建立你的第一個 PlayBook

參考：`../../README.md`

### 2. 架構與設計（Architecture）
- 系統全貌與模組邊界
- 前後端分離與資料流
- 技術棧與設計原則

參考：`../PlayBoard_功能模組整理.md`

### 3. 前端（Frontend）
- 技術：Vue 3、Vite、Element Plus、TailwindCSS
- 視圖與路由（Admin / Student）
- 服務層、錯誤處理與 UI 規範

路徑預留：`./frontend/README.md`

### 4. 後端（Backend）
- 專案結構（models / controllers / routes / middleware）
- 認證授權（JWT、角色）
- 檔案上傳與靜態資源

路徑預留：`./backend/README.md`

### 5. 資料模型（Data Models）
- 模型與欄位摘要、索引策略、關聯關係
- 新增模型流程與最佳實務

參考：`../產生Model步驟說明.md`

### 6. PlayBook（Learning Path）
- 展示模式（overview / stepByStep）
- 步驟類型（content / exam / survey）與動態引用（refPath）
- 自動化（slug / publishedAt / estimatedTime）

參考：`../PlayBook核心機制說明.md`

### 7. 進度追蹤（Progress Tracking）
- 生命週期（createOrGet / completeStep / reset）
- 本地儲存與離線策略
- 聚合統計與效能考量

參考：`../PlayBook進度記錄機制說明.md`

### 8. 客製化頁面（Custom Pages）
- ZIP 規範、入口檔與狀態機
- postMessage 通訊與播放器整合
- 管理端 / 公開端 API 摘要

參考：`../PlayBoard_客製化頁面功能設計.md`

### 9. API 參考（API Reference）
- 管理端：Content / Exam / Survey / PlayBook / CustomPage
- 公開端與進度管理 API
- 錯誤格式與常見錯誤碼

路徑預留：`./api/README.md`

### 10. 安全性（Security）
- 上傳白名單與大小限制、隔離與（可選）掃毒
- XSS / CSP / iframe sandbox、權限控制

路徑預留：`./security/README.md`

### 11. 效能（Performance）
- DB 索引與查詢優化
- 前端載入與快取策略
- 統計摘要快取建議

路徑預留：`./performance/README.md`

### 12. 測試（Testing）
- 測試棧與目錄
- 撰寫範例與執行方式

參考：`../TESTING_GUIDE.md`

### 13. 部署（Deployment）
- 環境變數、建置與部署流程
- 反向代理與靜態資源配置

路徑預留：`./deployment/README.md`

### 14. 營運（Operations）
- 日誌、監控、備份與恢復
- 常見維運任務清單

路徑預留：`./operations/README.md`

### 15. 疑難排解（Troubleshooting）
- 常見問題與修復建議
- 已知問題（Critical/High/Medium/Low）

參考：`../ISSUES_AND_BUGS.md`

### 16. FAQ（常見問答）
- 學生端免登入的風險控管
- 公開策略（以 status 為單一來源）
- 擴充新步驟類型的方法

路徑預留：`./faq/README.md`

### 17. 貢獻指南（Contributing）
- 代碼風格、分支策略、Commit 規範
- PR 流程與 Issue 模板

路徑預留：`./contributing/README.md`

### 18. 路線圖與變更記錄（Roadmap & Changelog）
- Roadmap（未來規劃與優先級）
- Changelog（版本變更摘要）

參考：`../../README.md` 內更新日誌（暫）

### 19. 名詞表與約定（Glossary & Conventions）
- PlayBook、Step、Progress、Completion、Likert 等術語
- 命名、時間單位、狀態枚舉等約定

路徑預留：`./glossary/README.md`

---

## 版本與授權（Versioning & License）
- 版本：遵循語意化版本（SemVer）建議。
- 授權：請於專案根目錄 `LICENSE` 查閱（若未提供，請補）。

## 回饋與協作（Feedback & Collaboration）
- 問題回報：請建立 Issue，提供重現步驟與環境資訊。
- 功能提案：先討論再提交 PR，對齊整體架構與規範。

維護原則：新增或調整任何功能時，請同步更新對應章節與此首頁索引。


