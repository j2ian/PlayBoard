# 安裝指南

本文件說明如何在本地環境安裝和啟動 PlayBoard 專案。

## 系統需求

### 必要軟體

- Node.js: 版本 16.x 或更高
- npm: 版本 8.x 或更高
- MongoDB: 版本 5.x 或更高
- Git: 用於版本控制

### 推薦開發工具

- VS Code: 推薦的程式碼編輯器
- MongoDB Compass: MongoDB 圖形化管理工具
- Postman: API 測試工具

## 安裝步驟

### 1. 複製專案

```bash
git clone <repository-url>
cd PlayBoard
```

### 2. 安裝 MongoDB

#### Windows

1. 下載 MongoDB Community Server
2. 執行安裝程式，選擇 Complete 安裝
3. 安裝完成後，MongoDB 服務會自動啟動

#### macOS

使用 Homebrew 安裝:

```bash
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

#### Linux (Ubuntu)

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 3. 設定資料庫

啟動 MongoDB 後，建立資料庫:

```bash
mongosh
use playboard
db.createUser({
  user: "admin",
  pwd: "your_password",
  roles: ["readWrite"]
})
exit
```

### 4. 安裝後端依賴

```bash
cd server
npm install
```

### 5. 設定後端環境變數

在 server 目錄建立 .env 檔案:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/playboard
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50000000
```

重要提示:

- JWT_SECRET 請使用強密碼 (至少 32 字元)
- 生產環境請務必更換所有預設值

### 6. 啟動後端伺服器

```bash
cd server
npm run dev
```

成功啟動後會看到:

```
Server running on port 3000
MongoDB connected successfully
```

### 7. 安裝前端依賴

開啟新的終端視窗:

```bash
cd client
npm install
```

### 8. 設定前端環境變數

在 client 目錄建立 .env 檔案:

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_BASE_PATH=/PlayBoard/
```

### 9. 啟動前端開發伺服器

```bash
cd client
npm run dev
```

成功啟動後會看到:

```
VITE v4.x.x ready in xxx ms
Local: http://localhost:5173/PlayBoard/
```

### 10. 驗證安裝

開啟瀏覽器訪問:

```
http://localhost:5173/PlayBoard/
```

## 建立管理員帳號

### 方式 1: 使用註冊 API

使用 Postman 或 curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### 方式 2: 直接在資料庫建立

```bash
mongosh playboard
```

執行:

```javascript
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$your_hashed_password",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

注意: 密碼需要使用 bcrypt hash

## 常見問題

### MongoDB 連線失敗

錯誤訊息:

```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

解決方式:

1. 確認 MongoDB 服務是否啟動
2. 檢查 .env 中的 MONGODB_URI 是否正確
3. 檢查防火牆是否封鎖 27017 port

### Port 已被佔用

錯誤訊息:

```
Error: listen EADDRINUSE: address already in use :::3000
```

解決方式:

1. 找出佔用 port 的程式
   - Windows: netstat -ano | findstr :3000
   - macOS/Linux: lsof -i :3000
2. 終止該程式或更改 .env 中的 PORT

### npm install 失敗

解決方式:

1. 清除 npm cache: npm cache clean --force
2. 刪除 node_modules 和 package-lock.json
3. 重新執行: npm install
4. 如果仍然失敗，檢查網路連線或切換 npm registry

### 前端無法連接後端 API

解決方式:

1. 確認後端伺服器正在運行
2. 檢查 client/.env 中的 VITE_API_BASE_URL 是否正確
3. 檢查瀏覽器 Console 是否有 CORS 錯誤
4. 確認後端 .env 中的 CORS_ORIGIN 設定

## 開發工具設定

### VS Code 推薦擴充套件

在專案根目錄建立 .vscode/extensions.json:

```json
{
  "recommendations": [
    "vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode"
  ]
}
```

### ESLint 和 Prettier

專案已包含 ESLint 和 Prettier 設定檔，安裝後會自動套用。
