// server/tests/setup.js - 測試環境設定
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// 在所有測試開始前執行的 Hook
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// 在所有測試結束後執行的 Hook
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 在每個測試開始前，清除所有 collection 中的資料
beforeEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
}); 