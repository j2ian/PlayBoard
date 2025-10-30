# 快速開始

這篇文章是一個建立簡單 Playbook(劇本)的範例，為了讓你快速上手建立 Playbook 的流程，請依照以下步驟指示做，你將會得到一個基本功能的 Playbook。

## 架構

一個 Playbook 會包含至少一個學習步驟，可選擇以下類型且順序可以自訂：

- 測驗
- 內容文章
- 問卷
- 客製化頁面

這個範例將每種頁面都加入。

## 步驟

### 1. 新增題目

- [ ] 到<a href="/PlayBoard/admin/questions" target="_blank">題目管理</a>
- [ ] 點選右側 `新增題目` 按鈕
- [ ] 隨意輸入題目名稱、內容和答案，題目類型選擇單選題
- [ ] 點擊送出

恭喜你擁有了第一個題目。

?> 題目名稱將是你未來在測驗中辨識題目的方式

### 2. 新增測驗

- [ ] 到<a href="/PlayBoard/admin/exams" target="_blank">測驗管理</a>
- [ ] 點選右側 `新增測驗` 按鈕
- [ ] 輸入測驗標題和描述
- [ ] 從題庫中選擇剛剛建立的題目
- [ ] 設定測驗時間和及格分數
- [ ] 開啟 `允許未及格繼續` 選項
- [ ] 點擊送出

測驗建立完成。

> 如果沒有開啟 `允許未及格繼續` 選項，當使用者進行測驗時，沒有到達及格分數則無法進行下一關

!> 注意：測驗時間不會被真正的限制，見 [#1](https://github.com/j2ian/PlayBoard/issues/1)

### 3. 新增一個一般內容頁面

- [ ] 到<a href="/PlayBoard/admin/contents" target="_blank">內容管理</a>
- [ ] 點選右側 `新增內容` 按鈕
- [ ] 輸入內容標題
- [ ] 輸入 URL 識別符，這將會成為你未來網址
- [ ] 使用編輯器輸入文章內容
- [ ] 選擇發佈狀態為「已發佈」
- [ ] 點擊送出

內容文章建立完成。

**已知問題：**

- `公開設定` 欄位沒有作用 見[#2](https://github.com/j2ian/PlayBoard/issues/2)
- `URL識別符` 旁邊的自動生成按鈕在遇到中文時不會生成，需要手動輸入 [#4](https://github.com/j2ian/PlayBoard/issues/4)

### 4. 新增一個滿意度調查

- [ ] 到<a href="/PlayBoard/admin/surveys" target="_blank">問卷管理</a>
- [ ] 點選右側 `新增問卷` 按鈕
- [ ] 輸入問卷標題和描述
- [ ] 新增問題，選擇題型（滿意度評分、開放式問題等）
- [ ] 輸入問題內容
- [ ] 點擊送出

滿意度調查建立完成。

### 5. 新增一個 Playbook

- [ ] 到<a href="/PlayBoard/admin/playbooks" target="_blank">PlayBook 管理</a>
- [ ] 點選右側 `新增 PlayBook` 按鈕
- [ ] 輸入 PlayBook 標題和描述
- [ ] 選擇展示模式（逐步模式）
- [ ] 選擇主題風格（ex. default、jungle、ocean）
- [ ] 新增步驟，依序選擇：
  - 步驟 1：選擇「內容」類型，選擇剛建立的內容文章
  - 步驟 2：選擇「測驗」類型，選擇剛建立的測驗
  - 步驟 3：選擇「問卷」類型，選擇剛建立的問卷
- [ ] 設定狀態為「已發佈」
- [ ] 點擊送出

恭喜你已經完成第一個 Playbook，點集列表中的綠色按鈕，就可以導到 Playbook 畫面。

請注意：

- 如果沒有將狀態設為已發佈，其他人不會看見這個頁面。
- 如果要刪除需要先取消發佈。

**已知問題：**

- 如果其中一個步驟的內容被刪除，可能會導致 Playbook 發生錯誤。 [#3](https://github.com/j2ian/PlayBoard/issues/3)

### 6. 新增客製化頁面

- [ ] 下載範例客製化頁面，點擊下載：[simple-quiz.zip](simple-quiz.zip)
- [ ] 到<a href="/PlayBoard/admin/custom-pages" target="_blank">客製化頁面</a>
- [ ] 點擊上傳新頁面
- [ ] 輸入頁面標題
- [ ] 上傳 zip 檔
- [ ] 點擊上傳
- [ ] 重新整理客製化頁面管理，等待它的狀態變成`就緒`

你擁有了一個客製化頁面。

**已知問題：**

- 修改已經上傳頁面名稱時，會讓路由出錯 [#5](https://github.com/j2ian/PlayBoard/issues/5)

### 7. 修改 Playbook

- [ ] 到<a href="/PlayBoard/admin/playbooks" target="_blank">PlayBook 管理</a>
- [ ] 點擊剛剛建立的 Playbook 上，藍色的編輯按鈕
- [ ] 新增剛才上傳的客製化頁面
- [ ] 儲存 playbook

## 小結

透過上述步驟你應該已經完成了一個初級版的 playbook。
