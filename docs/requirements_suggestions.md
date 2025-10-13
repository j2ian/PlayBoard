# PlayBoard 系統規格建議

## 系統架構完善建議

### 1. 技術棧詳細規劃
- **後端**：Node.js + Express.js，RESTful API 架構
- **前端**：Vue3 + Vite + Pinia
- **資料庫**：MongoDB（存儲所有學習記錄和內容）
- **檔案存儲**：基礎文件系統用於靜態資源存儲
- **部署**：Docker容器化（可選）

## 2. 核心功能模組

### 2.1 角色定義
- **管理者**：系統管理與維護
- **教師**：內容建立與管理，包括知識頁面、遊戲、測驗和問卷的上傳和管理，以及Playbook設計
- **學生**：透過輸入姓名即可使用Playbook進行學習，無需登入系統

### 2.2 內容類型管理

#### 知識顯示頁面管理
- **靜態網頁上傳**：教師可上傳HTML/CSS/JS靜態頁面
- **內容預覽功能**：上傳後可直接預覽顯示效果
- **知識分類功能**：支持知識內容分類管理
- **版本管理**：追蹤內容更新歷史

#### 課堂測驗管理
- **題目管理**：新增、編輯、刪除、排序題目
- **題型支援**：單選、多選、圖文題
- **答案與解析**：設定正確答案與解析文字
- **分類標籤**：可設定題目分類或主題標籤

#### 問卷調查管理
- **問卷基本資料**：設定名稱、說明、狀態
- **題型支援**：單選、多選、文字、Likert scale等
- **問卷題目**：新增、編輯、排序功能
- **啟用/停用控制**：可控制題目狀態

#### 互動遊戲管理
- **遊戲上傳**：支持HTML/JS遊戲壓縮包上傳
- **自動解壓**：系統自動解壓並存入公開目錄
- **遊戲資訊設置**：設定遊戲名稱、識別符(slug)、標籤
- **遊戲預覽**：上傳後可在後台預覽遊戲

### 2.3 Playbook功能

#### Playbook 編輯與流程規劃
- **多元步驟組合**：可自由組合問卷、測驗、遊戲、知識頁面作為步驟（stage）
- **步驟順序設定**：依照教師設定順序執行
- **步驟屬性設定**：設定名稱、描述、啟用狀態
- **步驟關聯**：每個步驟關聯對應內容ID
- **連結生成**：生成可分享的Playbook學習路徑連結
- **範例流程**：支援如"問卷1、測驗1、遊戲1、知識1、遊戲2、問卷2"這樣的自定義排序

#### 學生學習流程
- **簡易身份識別**：學生僅需輸入姓名即可開始學習，無需註冊或登入
- **引導式體驗**：系統引導學生按順序完成Playbook中的所有步驟
- **進度保存**：使用學生姓名記錄在各Playbook中的學習進度
- **禁止跳步**：學生只能按照順序完成，不能跳過步驟

### 2.4 學習數據記錄

#### 使用者互動紀錄
- **進度追踪**：記錄學生在Playbook的執行進度
- **步驟完成記錄**：記錄每個步驟的完成時間和狀態
- **測驗結果存儲**：記錄測驗答題情況與得分
- **問卷回覆存儲**：記錄問卷調查的回覆內容
- **遊戲互動記錄**：記錄遊戲參與數據（如適用）
- **資料存儲**：所有學習數據全部存儲於MongoDB中

## 3. API設計

### 3.1 RESTful API規範
- 統一響應格式：`{code, message, data}`
- 標準HTTP狀態碼使用
- API文檔：Swagger/OpenAPI

### 3.2 核心API

#### 教師認證相關
```
POST /api/auth/login - 教師/管理員登入
POST /api/auth/logout - 登出
GET /api/auth/profile - 獲取用戶資料
```

#### 知識頁面管理
```
GET /api/knowledge - 獲取知識頁面列表
POST /api/knowledge - 上傳新知識頁面
GET /api/knowledge/:id - 獲取特定知識頁面
PUT /api/knowledge/:id - 更新知識頁面
DELETE /api/knowledge/:id - 刪除知識頁面
```

#### 測驗管理
```
GET /api/quizzes - 獲取測驗列表
POST /api/quizzes - 創建新測驗
GET /api/quizzes/:id - 獲取測驗詳情
POST /api/quizzes/:id/questions - 新增測驗題目
PUT /api/quizzes/:id/questions/:qid - 更新測驗題目
```

#### 問卷管理
```
GET /api/surveys - 獲取問卷列表
POST /api/surveys - 創建新問卷
PUT /api/surveys/:id - 更新問卷
POST /api/surveys/:id/questions - 新增問卷題目
PUT /api/surveys/:id/questions/:qid - 更新問卷題目
```

#### 遊戲管理
```
POST /api/games/upload - 上傳遊戲壓縮包
GET /api/games - 獲取遊戲列表
GET /api/games/:slug - 獲取特定遊戲
DELETE /api/games/:id - 刪除遊戲
```

#### Playbook管理
```
GET /api/playbooks - 獲取Playbook列表
POST /api/playbooks - 創建新Playbook
GET /api/playbooks/:id - 獲取特定Playbook詳情
PUT /api/playbooks/:id - 更新Playbook
DELETE /api/playbooks/:id - 刪除Playbook
POST /api/playbooks/:id/steps - 新增學習步驟
PUT /api/playbooks/:id/steps/:stepId - 更新步驟
GET /api/playbooks/:id/share-link - 獲取分享連結
```

#### 學生學習相關
```
POST /api/student/register-name - 學生輸入姓名開始學習
GET /api/playbook/:code/next-step - 獲取下一個學習步驟
POST /api/playbook/:code/step-done - 標記步驟完成
GET /api/playbook/:code/status - 獲取整體進度
```

## 4. 資料庫設計

### 4.1 MongoDB 集合設計

#### teachers 集合 (教師/管理員)
```
_id: ObjectId
username: String (用戶名)
password: String (加密密碼)
role: String (admin/teacher)
email: String
created_at: Date
last_login: Date
```

#### knowledge_pages 集合 (知識頁面)
```
_id: ObjectId
title: String (標題)
description: String (描述)
file_path: String (檔案路徑)
html_content: String (HTML內容)
creator_id: ObjectId (關聯teachers)
created_at: Date
updated_at: Date
tags: Array (標籤)
```

#### quizzes 集合 (測驗)
```
_id: ObjectId
title: String
description: String
creator_id: ObjectId (關聯teachers)
created_at: Date
updated_at: Date
questions: Array [
  {
    question_text: String,
    question_type: String (single/multiple/image),
    options: Array,
    correct_answers: Array,
    explanation: String
  }
]
```

#### surveys 集合 (問卷)
```
_id: ObjectId
title: String
description: String
creator_id: ObjectId (關聯teachers)
created_at: Date
updated_at: Date
questions: Array [
  {
    question_text: String,
    question_type: String (single/multiple/text/likert),
    options: Array (選項),
    required: Boolean
  }
]
```

#### games 集合 (遊戲)
```
_id: ObjectId
title: String (遊戲名稱)
slug: String (URL識別符)
description: String (描述)
file_path: String (遊戲檔案路徑)
main_file: String (主入口文件，通常為index.html)
creator_id: ObjectId (關聯teachers)
created_at: Date
updated_at: Date
tags: Array (標籤)
```

#### playbooks 集合 (學習路徑)
```
_id: ObjectId
title: String (名稱)
description: String (描述)
creator_id: ObjectId (關聯teachers)
created_at: Date
updated_at: Date
share_code: String (分享代碼，用於生成網址)
status: String (draft/published/archived)
```

#### playbook_steps 集合 (學習步驟)
```
_id: ObjectId
playbook_id: ObjectId (關聯playbooks)
step_number: Number (步驟順序號)
step_type: String (quiz/survey/game/knowledge)
reference_id: ObjectId (關聯對應內容)
title: String (步驟標題)
description: String (步驟描述)
status: String (active/inactive)
```

#### student_progress 集合 (學生進度)
```
_id: ObjectId
student_name: String (學生姓名，無需登入，僅使用姓名識別)
playbook_id: ObjectId (關聯playbooks)
current_step: Number (當前步驟)
completed_steps: Array (已完成步驟數組)
start_time: Date (開始時間)
last_activity: Date (最後活動時間)
completion_time: Date (完成時間)
status: String (not_started/in_progress/completed)
```

#### quiz_results 集合 (測驗結果)
```
_id: ObjectId
student_name: String (學生姓名)
quiz_id: ObjectId (關聯quizzes)
playbook_id: ObjectId (關聯playbooks)
answers: Array (答案記錄)
score: Number (得分)
max_score: Number (總分)
completion_time: Date
```

#### survey_responses 集合 (問卷回應)
```
_id: ObjectId
student_name: String (學生姓名)
survey_id: ObjectId (關聯surveys)
playbook_id: ObjectId (關聯playbooks)
responses: Object (回應內容)
completion_time: Date
```

#### game_plays 集合 (遊戲記錄)
```
_id: ObjectId
student_name: String (學生姓名)
game_id: ObjectId (關聯games)
playbook_id: ObjectId (關聯playbooks)
start_time: Date
end_time: Date
data: Object (遊戲數據，如適用)
```

## 5. 安全與性能考量

### 5.1 安全措施
- HTTPS全站加密
- 教師帳戶密碼加密存儲
- 檔案上傳安全驗證
- 輸入資料驗證
- XSS/CSRF防護
- 權限控制確保只有教師能管理內容

### 5.2 性能優化
- 靜態資源優化
- 資料庫索引設計
- 按需加載組件
- 圖片優化
- 資料壓縮傳輸

## 6. 開發與部署建議

### 6.1 開發方法
- 模組化開發
- 組件式設計
- 前後端分離開發
- 代碼規範統一
- 版本控制規範

### 6.2 部署架構
- 開發/測試/生產環境分離
- 自動化部署流程
- 資料備份機制
- 監控與日誌系統

## 7. 實施路線圖

### 第一階段 (1-2週)
- 環境搭建與基礎架構
- 教師認證系統
- 知識頁面上傳功能
- 基本Playbook創建功能
- 學生姓名識別與基礎進度追踪

### 第二階段 (3-4週)
- 測驗系統實現
- 問卷系統實現
- 遊戲上傳功能
- Playbook完整流程實現
- 學習數據記錄功能

### 第三階段 (5-6週)
- UI/UX優化
- 數據統計與分析
- 系統穩定性測試
- 使用者體驗改進
- 文檔與培訓資料準備

## 8. 未來擴展考量
- 更豐富的互動元素支持
- 自適應學習路徑
- 多語言支持
- 行動裝置優化
- 報表生成功能 