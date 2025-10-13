# 如何在 PlayBoard 專案中建立新的 Mongoose Model

本文件將引導您完成在 `server/models` 目錄下建立新 Mongoose Model 的完整步驟。請遵循以下指南以確保程式碼的一致性與可維護性。

## 建立新 Model 的步驟

### 1. 建立模型檔案

-   **位置**: 所有 Model 檔案都應存放在 `server/models/` 目錄下。
-   **命名**: 檔案名稱請使用大駝峰命名法 (PascalCase)，並以 `.js` 作為副檔名。例如：`Product.js`, `Order.js`。

### 2. 引入 Mongoose

在檔案的開頭，首先需要引入 `mongoose` 套件。

```javascript
const mongoose = require('mongoose');
```

### 3. 定義 Schema (模式)

Schema 是 Model 的藍圖，定義了資料的結構、欄位、類型和驗證規則。

-   使用 `new mongoose.Schema()` 來建立一個新的 Schema。
-   在 Schema 中定義每個欄位的屬性：
    -   `type`: 資料類型 (例如: `String`, `Number`, `Date`, `Boolean`, `mongoose.Schema.Types.ObjectId`)。
    -   `required`: 是否為必填欄位。
    -   `unique`: 是否為唯一值。
    -   `default`: 預設值。
    -   `trim`: 自動移除字串前後的空白。
    -   `lowercase` / `uppercase`: 自動轉換為小寫或大寫。
    -   `minlength` / `maxlength`: 字串或陣列的最小/最大長度。
    -   `min` / `max`: 數值的最小值/最大值。
    -   `enum`: 允許的列舉值。
    -   `select`: 在查詢時是否預設回傳此欄位。
    -   `ref`: 用於關聯其他 Model (例如: `ref: 'User'`)。

**範例：**

```javascript
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '產品名稱為必填'],
    trim: true,
    maxlength: [100, '產品名稱不能超過100個字']
  },
  price: {
    type: Number,
    required: [true, '價格為必填'],
    min: [0, '價格不能為負數']
  },
  inStock: {
    type: Boolean,
    default: true
  },
  // 建立時間
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 最後更新時間
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### 4. (可選) 建立 Middleware (中間件/Hooks)

Mongoose Schema 支援中間件，讓您可以在特定操作 (如 `save`, `remove`) 前後執行自訂邏輯。最常見的用途是在儲存前加密密碼或更新 `updatedAt` 時間戳。

-   使用 `.pre('save', function(next) { ... })` 來定義儲存前的操作。
-   **注意**: 請使用 `function` 而非箭頭函式 `() => {}`，以確保 `this` 指向正確的文件實例 (document instance)。

**範例：更新 `updatedAt` 時間戳**

```javascript
ProductSchema.pre('save', function(next) {
  // 只有在文件被修改時才更新 updatedAt
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});
```

### 5. (可選) 建立自訂方法 (Instance Methods)

您可以為 Schema 增加自訂的實例方法，這些方法將在所有從此 Model 建立的文件實例上可用。

-   將方法定義在 `Schema.methods` 物件上。
-   同樣地，請使用 `function` 以便 `this` 能正確指向文件實例。

**範例：計算折扣價格**

```javascript
ProductSchema.methods.getDiscountedPrice = function(discountPercentage) {
  const discount = (this.price * discountPercentage) / 100;
  return this.price - discount;
};
```

### 6. 建立並導出 Model

最後，使用 `mongoose.model()` 將 Schema 編譯成一個 Model，並將其導出。

-   `mongoose.model()` 的第一個參數是 Model 的 **單數** 名稱 (例如 `'Product'`)。Mongoose 會自動將其對應到資料庫中 **複數形式** 的 collection (例如 `products`)。
-   使用 `module.exports` 導出 Model。

```javascript
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
```

---

遵循以上步驟，您就可以在專案中一致且有效地建立新的資料模型。
