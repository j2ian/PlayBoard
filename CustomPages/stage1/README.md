# Stage1 客製化頁面 - 集食行愛分享愛

## 檔案結構

請按照以下結構手動複製資源檔案：

```
CustomPages/stage1/
├── index.html                  # ✓ 已建立
├── config.json                 # ✓ 已建立
├── README.md                   # ✓ 已建立
└── assets/
    ├── fonts/
    │   └── jf-openhuninn-2.0.woff
    ├── images/
    │   ├── general/
    │   │   ├── btn_Go.png
    │   │   ├── btn_Go_Bright.png
    │   │   ├── btn_next.png
    │   │   ├── btn_next_bright.png
    │   │   ├── btn_finish.png
    │   │   └── btn_finish_bright.png
    │   ├── game/
    │   │   ├── stage1Intro.jpg
    │   │   ├── background_stage1.jpg
    │   │   ├── message.png
    │   │   ├── timer.png
    │   │   ├── shop/
    │   │   │   ├── shop_bubble.png
    │   │   │   ├── shop1.png
    │   │   │   ├── shop2.png
    │   │   │   ├── shop3.png
    │   │   │   ├── shop4.png
    │   │   │   └── shop5.png
    │   │   ├── halos/
    │   │   │   ├── halo1.png
    │   │   │   ├── halo2.png
    │   │   │   ├── halo3.png
    │   │   │   ├── halo4.png
    │   │   │   └── halo5.png
    │   │   ├── share/
    │   │   │   ├── share1.png
    │   │   │   ├── share2.png
    │   │   │   ├── share3.png
    │   │   │   ├── share4.png
    │   │   │   └── share5.png
    │   │   └── dump/
    │   │       ├── dump1.png
    │   │       ├── dump2.png
    │   │       ├── dump3.png
    │   │       ├── dump4.png
    │   │       └── dump5.png
    │   └── result/
    │       ├── background.jpg
    │       ├── background2.jpg
    │       ├── card_result.png
    │       ├── 關卡一結算1.png
    │       └── 關卡一結算2.png
    ├── sound/
    │   └── correct.mp3
    ├── music/
    │   └── 1.mp3
    └── intro/
        └── 1.mp3
```

## 資源檔案複製步驟

### 1. 建立資料夾結構

請先在 `CustomPages/stage1/` 目錄下建立以下資料夾：

```
assets/
assets/fonts/
assets/images/
assets/images/general/
assets/images/game/
assets/images/game/shop/
assets/images/game/halos/
assets/images/game/share/
assets/images/game/dump/
assets/images/result/
assets/sound/
assets/music/
assets/intro/
```

### 2. 複製字型檔案

從來源路徑複製到目標路徑：

- `Sunshine-main/css/jf-openhuninn-2.0.woff` → `CustomPages/stage1/assets/fonts/jf-openhuninn-2.0.woff`

### 3. 複製通用按鈕圖片

從 `Sunshine-main/imgs/general/` 複製以下檔案到 `CustomPages/stage1/assets/images/general/`：

- btn_Go.png
- btn_Go_Bright.png
- btn_next.png
- btn_next_bright.png
- btn_finish.png
- btn_finish_bright.png

### 4. 複製遊戲圖片

#### 主要遊戲圖片
從 `Sunshine-main/imgs/stage1/game/` 複製到 `CustomPages/stage1/assets/images/game/`：

- stage1Intro.jpg
- background_stage1.jpg
- message.png
- timer.png

#### 商店圖片
從 `Sunshine-main/imgs/stage1/game/shop/` 複製到 `CustomPages/stage1/assets/images/game/shop/`：

- shop_bubble.png
- shop1.png
- shop2.png
- shop3.png
- shop4.png
- shop5.png

#### 光環圖片
從 `Sunshine-main/imgs/stage1/game/halos/` 複製到 `CustomPages/stage1/assets/images/game/halos/`：

- halo1.png
- halo2.png
- halo3.png
- halo4.png
- halo5.png

#### 分享圖片
從 `Sunshine-main/imgs/stage1/game/share/` 複製到 `CustomPages/stage1/assets/images/game/share/`：

- share1.png
- share2.png
- share3.png
- share4.png
- share5.png

#### 丟棄圖片
從 `Sunshine-main/imgs/stage1/game/dump/` 複製到 `CustomPages/stage1/assets/images/game/dump/`：

- dump1.png
- dump2.png
- dump3.png
- dump4.png
- dump5.png

### 5. 複製結果頁面圖片

從 `Sunshine-main/imgs/stage1/result/` 複製到 `CustomPages/stage1/assets/images/result/`：

- background.jpg
- background2.jpg
- card_result.png
- 關卡一結算1.png
- 關卡一結算2.png

### 6. 複製音頻檔案

- `Sunshine-main/sound/correct.mp3` → `CustomPages/stage1/assets/sound/correct.mp3`
- `Sunshine-main/music/1.mp3` → `CustomPages/stage1/assets/music/1.mp3`
- `Sunshine-main/intro/1.mp3` → `CustomPages/stage1/assets/intro/1.mp3`

## 打包上傳

完成所有檔案複製後：

1. 將整個 `CustomPages/stage1/` 資料夾內的所有檔案（index.html, config.json, assets/）壓縮成 ZIP 檔案
2. 確認 ZIP 檔案的根目錄包含 `index.html` 和 `config.json`
3. 在 PlayBoard 管理後台上傳此 ZIP 檔案

## 遊戲說明

### 遊戲目標
在 90 秒內將出現的食物正確分配：
- 將可分享的食物（shop1, shop2）拖放到左側的分享區域（share）
- 將需要保存的食物（shop3, shop4, shop5）拖放到右側的保存區域（box）

### 計分方式
- 成功分享的食物會增加「分享分數」
- 未能及時處理而丟棄的食物會增加「浪費分數」
- 目標是最大化分享分數，最小化浪費分數

### 遊戲流程
1. 觀看介紹頁面
2. 點擊「開始」按鈕
3. 等待 10 秒查看遊戲提示
4. 在 90 秒內進行遊戲
5. 查看結果統計
6. 觀看相關教育影片
7. 點擊「下一步」完成此關卡

## 技術說明

### PlayBoard 整合
- 使用 `window.playboard` 物件進行進度控制
- 遊戲完成後會自動顯示「下一步」按鈕
- 點擊「下一步」會將進度資料傳送給 PlayBoard 系統

### 自定義資料追蹤
系統會追蹤以下資料：
- `shareScore`: 成功分享的食物數量
- `dumpScore`: 浪費的食物數量
- `totalItems`: 總處理的食物數量
- `timeSpent`: 遊戲花費時間（秒）

## 故障排除

### 問題：圖片無法顯示
- 檢查資料夾結構是否正確
- 確認所有圖片檔案都已複製
- 檢查檔案路徑是否使用相對路徑

### 問題：音頻無法播放
- 確認音頻檔案格式正確（mp3）
- 檢查瀏覽器是否允許自動播放音頻
- 某些瀏覽器需要使用者互動後才能播放音頻

### 問題：YouTube 影片無法載入
- 確認網路連線正常
- 檢查影片 ID 是否正確（feL5TaU47iE）
- 確認 YouTube IFrame API 能正常載入

## 版本資訊

- 版本：1.0.0
- 建立日期：2025
- 基於：Sunshine 專案 Stage1
