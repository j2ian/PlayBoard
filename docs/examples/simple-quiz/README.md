# 簡單測驗範例

## 檔案結構

```
simple-quiz/
├── index.html          # 主要頁面檔案
├── config.json         # 配置檔案
├── styles/
│   └── quiz.css        # 樣式檔案
├── scripts/
│   └── quiz.js         # JavaScript 邏輯
└── README.md           # 說明檔案
```

## 重點說明

1. 下一步按鈕必須使用 ID：`nextButton`
2. 使用 `window.playboard.showNextButton()` 顯示按鈕
3. 使用 `window.playboard.completePage(分數, 自定義數據)` 完成頁面

## 使用步驟

1. 將所有檔案壓縮成 ZIP
2. 在 PlayBoard 管理後台上傳
3. 在 PlayBook 中新增客製化頁面步驟

## 修改範例

- 修改題目：編輯 `scripts/quiz.js` 中的 `questions` 陣列
- 修改樣式：編輯 `styles/quiz.css`
- 修改配置：編輯 `config.json`
