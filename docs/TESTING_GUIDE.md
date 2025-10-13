# 如何在 PlayBoard 專案中撰寫與執行測試

本文件旨在引導開發者如何在本專案中為 Mongoose Model 或 API Routes 撰寫並執行單元測試與整合測試。我們使用 Jest 作為測試框架，並搭配 `mongodb-memory-server` 來建立一個獨立、乾淨的測試資料庫環境。

## 測試工具

-   **Jest**: 一個功能強大且設定簡單的 JavaScript 測試框架。
-   **mongodb-memory-server**: 在記憶體中啟動一個真實的 MongoDB 伺服器，讓我們的測試可以在一個隔離的環境中執行，不會影響開發資料庫。
-   **Supertest**: (可選，用於 API 測試) 一個用於測試 Node.js HTTP 伺服器的函式庫，可以讓我們輕鬆地對 API 端點發送請求並驗證回應。

## 檔案結構

所有後端測試相關的檔案都存放在 `server/tests/` 目錄下：

```
server/
└── tests/
    ├── setup.js         # 全域測試環境設定 (連接記憶體資料庫)
    └── quiz.test.js     # 針對 Quiz Model 的測試案例檔案
```

-   `setup.js`: 這個檔案會在所有測試執行前，自動設定好與記憶體資料庫的連線，並在所有測試結束後清除資料與連線。您不需要在測試檔案中手動引入它，Jest 會自動處理。
-   `*.test.js`: 這是 Jest 約定的測試檔案命名規則。所有以 `.test.js` 結尾的檔案都會被視為測試檔並被執行。

## 如何撰寫 Model 的測試案例

以 `server/tests/quiz.test.js` 為例，一個典型的 Model 測試包含以下幾個部分：

### 1. 引入相依套件

在檔案開頭，引入需要測試的 Model。

```javascript
// 引入測試環境設定，它會處理資料庫連線
require('./setup'); 
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');
```

### 2. 使用 `describe` 組織測試

使用 `describe` 函式將相關的測試案例群組在一起，讓報告更具可讀性。

```javascript
describe('Quiz Model Test', () => {
  // ... 測試案例會寫在這裡 ...
});
```

### 3. 使用 `it` 或 `test` 撰寫獨立的測試案例

每個 `it` 函式代表一個獨立的測試情境。測試案例的描述應該清晰地說明它要驗證的行為。

```javascript
it('應能成功建立一個有效的測驗', async () => {
  // ... 測試邏輯 ...
});

it('當沒有提供任何問題時，應建立失敗', async () => {
  // ... 測試邏輯 ...
});
```

### 4. 編寫測試邏輯 (The "Arrange-Act-Assert" Pattern)

一個好的測試案例通常遵循「安排 (Arrange)」、「執行 (Act)」、「斷言 (Assert)」的模式。

-   **安排 (Arrange)**: 準備測試所需的資料和環境。
-   **執行 (Act)**: 執行您想要測試的程式碼 (例如：儲存一個 Model 實例)。
-   **斷言 (Assert)**: 使用 `expect` 函式來驗證執行的結果是否符合預期。

```javascript
it('應能成功建立一個有效的測驗', async () => {
  // 1. 安排 (Arrange): 建立一個包含有效資料的物件
  const quizData = {
    title: '基礎 JavaScript 測驗',
    questions: [ /* ... 問題內容 ... */ ]
  };

  // 2. 執行 (Act): 建立 Model 實例並儲存到資料庫
  const quiz = new Quiz(quizData);
  const savedQuiz = await quiz.save();
  
  // 3. 斷言 (Assert): 驗證儲存後的結果是否正確
  expect(savedQuiz._id).toBeDefined();
  expect(savedQuiz.title).toBe('基礎 JavaScript 測驗');
});
```

### 5. 測試錯誤處理

測試失敗或錯誤情境同樣重要。您可以透過 `try...catch` 區塊來捕捉預期中的錯誤，並驗證錯誤的類型和訊息。

```javascript
it('當問題選項少於2個時，應建立失敗', async () => {
  const quizData = { /* ... 無效的資料 ... */ };
  const quiz = new Quiz(quizData);
  let err;

  // 執行並捕捉預期中的錯誤
  try {
    await quiz.save();
  } catch (error) {
    err = error;
  }

  // 斷言錯誤是我們預期的 Mongoose 驗證錯誤
  expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  expect(err.errors['questions.0.options']).toBeDefined();
});
```

## 如何執行測試

我們已經在 `server/package.json` 中設定好了 `test` 指令。

1.  打開您的終端機。
2.  **切換到 `server` 目錄**: `cd server`
3.  執行以下指令：

    ```bash
    npm test
    ```

Jest 將會自動尋找所有 `*.test.js` 檔案並執行它們。您將會在終端機中看到詳細的測試報告，包含哪些測試通過、哪些失敗。

---

遵循本指南，您將能夠為專案建立穩定且可靠的測試，確保程式碼的品質。 