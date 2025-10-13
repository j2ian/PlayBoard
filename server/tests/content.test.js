// server/tests/content.test.js - Content 模型和API測試
require('./setup');
const mongoose = require('mongoose');
const Content = require('../models/Content');
const User = require('../models/User');
const request = require('supertest');
const express = require('express');
const contentRoutes = require('../routes/contentRoutes');
const { protect, authorize } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 創建測試Express應用函數
const createTestApp = (user = null) => {
  const app = express();
  app.use(express.json());
  
  // 模擬認證中間件
  if (user) {
    app.use('/api/contents', (req, res, next) => {
      req.user = user;
      next();
    }, contentRoutes);
  } else {
    app.use('/api/contents', contentRoutes);
  }
  
  return app;
};

describe('Content Model Test', () => {
  let testUser;

  beforeEach(async () => {
    // 清理測試資料
    await Content.deleteMany({});
    await User.deleteMany({});

    // 創建測試用戶
    testUser = await User.create({
      username: 'testadmin',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });
  });

  afterEach(async () => {
    await Content.deleteMany({});
    await User.deleteMany({});
  });

  describe('Content Model Validation', () => {
    it('應能成功創建一個基本內容', async () => {
      const contentData = {
        title: '測試文章',
        slug: 'test-article',
        content: '這是測試內容',
        createdBy: testUser._id
      };

      const content = await Content.create(contentData);

      expect(content._id).toBeDefined();
      expect(content.title).toBe('測試文章');
      expect(content.slug).toBe('test-article');
      expect(content.status).toBe('draft'); // 預設狀態
      expect(content.isPublic).toBe(true); // 預設公開
    });

    it('應能創建包含所有欄位的完整內容', async () => {
      const contentData = {
        title: '完整測試文章',
        slug: 'complete-test-article',
        excerpt: '這是文章摘要',
        content: '# 完整測試內容\n\n這是一篇完整的測試文章。',
        contentType: 'markdown',
        status: 'published',
        isPublic: true,
        featuredImage: {
          filename: 'test-image.jpg',
          originalName: 'test-image.jpg',
          url: '/uploads/content/test-image.jpg',
          size: 123456,
          mimeType: 'image/jpeg'
        },
        tags: ['測試', '範例'],
        category: '教學',
        createdBy: testUser._id
      };

      const content = await Content.create(contentData);

      expect(content.title).toBe('完整測試文章');
      expect(content.contentType).toBe('markdown');
      expect(content.status).toBe('published');
      expect(content.featuredImage.filename).toBe('test-image.jpg');
      expect(content.tags).toHaveLength(2);
      expect(content.category).toBe('教學');
      expect(content.publishedAt).toBeDefined(); // 應自動設定發布時間
    });

    it('當標題為空時應驗證失敗', async () => {
      const contentData = {
        slug: 'test-slug',
        content: '測試內容',
        createdBy: testUser._id
      };

      await expect(Content.create(contentData)).rejects.toThrow('標題為必填');
    });

    it('當slug為空時應驗證失敗', async () => {
      const contentData = {
        title: '測試標題',
        content: '測試內容',
        createdBy: testUser._id
      };

      await expect(Content.create(contentData)).rejects.toThrow('URL識別符為必填');
    });

    it('當slug格式不正確時應驗證失敗', async () => {
      const contentData = {
        title: '測試標題',
        slug: 'Invalid Slug!',
        content: '測試內容',
        createdBy: testUser._id
      };

      await expect(Content.create(contentData)).rejects.toThrow();
    });

    it('當slug重複時應驗證失敗', async () => {
      const contentData1 = {
        title: '測試標題1',
        slug: 'duplicate-slug',
        content: '測試內容1',
        createdBy: testUser._id
      };

      const contentData2 = {
        title: '測試標題2',
        slug: 'duplicate-slug',
        content: '測試內容2',
        createdBy: testUser._id
      };

      await Content.create(contentData1);
      await expect(Content.create(contentData2)).rejects.toThrow();
    });

    it('當標籤超過10個時應驗證失敗', async () => {
      const contentData = {
        title: '測試標題',
        slug: 'test-tags',
        content: '測試內容',
        tags: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        createdBy: testUser._id
      };

      await expect(Content.create(contentData)).rejects.toThrow('標籤數量不能超過10個');
    });
  });

  describe('Content Model Methods', () => {
    let publishedContent, draftContent;

    beforeEach(async () => {
      publishedContent = await Content.create({
        title: '已發布文章',
        slug: 'published-article',
        content: '已發布內容',
        status: 'published',
        isPublic: true,
        createdBy: testUser._id
      });

      draftContent = await Content.create({
        title: '草稿文章',
        slug: 'draft-article',
        content: '草稿內容',
        status: 'draft',
        createdBy: testUser._id
      });
    });

    it('getPublicContent 應只返回已發布的公開內容', async () => {
      const publicContents = await Content.getPublicContent();
      
      expect(publicContents).toHaveLength(1);
      expect(publicContents[0]._id.toString()).toBe(publishedContent._id.toString());
    });

    it('getPublicBySlug 應能根據slug獲取公開內容', async () => {
      const content = await Content.getPublicBySlug('published-article');
      
      expect(content).toBeTruthy();
      expect(content._id.toString()).toBe(publishedContent._id.toString());
    });

    it('getPublicBySlug 對草稿內容應返回null', async () => {
      const content = await Content.getPublicBySlug('draft-article');
      
      expect(content).toBeNull();
    });

    it('incrementViewCount 應能增加瀏覽次數', async () => {
      const initialViewCount = publishedContent.viewCount;
      
      await publishedContent.incrementViewCount();
      
      expect(publishedContent.viewCount).toBe(initialViewCount + 1);
    });
  });

  describe('Content Model Hooks', () => {
    it('發布內容時應自動設定publishedAt', async () => {
      const content = await Content.create({
        title: '測試文章',
        slug: 'test-published',
        content: '測試內容',
        status: 'draft',
        createdBy: testUser._id
      });

      expect(content.publishedAt).toBeNull();

      content.status = 'published';
      await content.save();

      expect(content.publishedAt).toBeDefined();
    });

    it('將已發布內容改為草稿時應清除publishedAt', async () => {
      const content = await Content.create({
        title: '測試文章',
        slug: 'test-unpublish',
        content: '測試內容',
        status: 'published',
        createdBy: testUser._id
      });

      expect(content.publishedAt).toBeDefined();

      content.status = 'draft';
      await content.save();

      expect(content.publishedAt).toBeNull();
    });
  });

  describe('Virtual Fields', () => {
    let content;

    beforeEach(async () => {
      content = await Content.create({
        title: '測試文章',
        slug: 'test-virtual',
        content: '測試內容',
        status: 'published',
        createdBy: testUser._id
      });
    });

    it('publicUrl 虛擬字段應返回正確的公開URL', () => {
      expect(content.publicUrl).toBe('/content/test-virtual');
    });

    it('isPublished 虛擬字段應正確判斷發布狀態', () => {
      expect(content.isPublished).toBe(true);
    });

    it('草稿狀態的 isPublished 應為false', async () => {
      const draftContent = await Content.create({
        title: '草稿文章',
        slug: 'draft-virtual',
        content: '草稿內容',
        status: 'draft',
        createdBy: testUser._id
      });

      expect(draftContent.isPublished).toBe(false);
    });
  });
});

describe('Content Controller API Test', () => {
  let testUser, app;

  beforeEach(async () => {
    // 清理測試資料
    await Content.deleteMany({});
    await User.deleteMany({});

    // 創建測試用戶
    testUser = await User.create({
      username: 'testadmin',
      email: 'test@example.com',
      password: 'password123',
      role: 'admin'
    });

    // 創建測試應用（需要認證的路由）
    app = createTestApp(testUser);
  });

  afterEach(async () => {
    await Content.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/contents/public', () => {
    let publicApp;
    
    beforeEach(() => {
      // 創建無需認證的測試應用
      publicApp = createTestApp();
    });
    beforeEach(async () => {
      // 創建測試內容
      await Content.create({
        title: '公開文章1',
        slug: 'public-article-1',
        content: '公開內容1',
        status: 'published',
        isPublic: true,
        category: '教學',
        createdBy: testUser._id
      });

      await Content.create({
        title: '草稿文章',
        slug: 'draft-article',
        content: '草稿內容',
        status: 'draft',
        createdBy: testUser._id
      });

      await Content.create({
        title: '私人文章',
        slug: 'private-article',
        content: '私人內容',
        status: 'published',
        isPublic: false,
        createdBy: testUser._id
      });
    });

    it('應只返回已發布的公開內容', async () => {
      const res = await request(publicApp)
        .get('/api/contents/public')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('公開文章1');
    });

    it('應支援分類篩選', async () => {
      const res = await request(publicApp)
        .get('/api/contents/public?category=教學')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].category).toBe('教學');
    });
  });

  describe('GET /api/contents/public/:slug', () => {
    let publicContent, publicApp;

    beforeEach(async () => {
      publicApp = createTestApp();
      publicContent = await Content.create({
        title: '公開文章',
        slug: 'public-test-article',
        content: '公開測試內容',
        status: 'published',
        isPublic: true,
        viewCount: 5,
        createdBy: testUser._id
      });
    });

    it('應能獲取公開內容並增加瀏覽次數', async () => {
      const res = await request(publicApp)
        .get('/api/contents/public/public-test-article')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('公開文章');

      // 驗證瀏覽次數是否增加
      const updatedContent = await Content.findById(publicContent._id);
      expect(updatedContent.viewCount).toBe(6);
    });

    it('對不存在的slug應返回404', async () => {
      const res = await request(publicApp)
        .get('/api/contents/public/non-existent-slug')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('找不到該內容或內容未公開');
    });
  });

  describe('GET /api/contents/categories', () => {
    let publicApp;
    
    beforeEach(() => {
      publicApp = createTestApp();
    });
    beforeEach(async () => {
      await Content.create({
        title: '教學文章',
        slug: 'teaching-article',
        content: '教學內容',
        category: '教學',
        createdBy: testUser._id
      });

      await Content.create({
        title: '新聞文章',
        slug: 'news-article',
        content: '新聞內容',
        category: '新聞',
        createdBy: testUser._id
      });
    });

    it('應返回所有分類列表', async () => {
      const res = await request(publicApp)
        .get('/api/contents/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toContain('教學');
      expect(res.body.data).toContain('新聞');
    });
  });

  describe('GET /api/contents/tags', () => {
    let publicApp;
    
    beforeEach(() => {
      publicApp = createTestApp();
    });
    beforeEach(async () => {
      await Content.create({
        title: '標籤文章',
        slug: 'tagged-article',
        content: '有標籤的內容',
        tags: ['Vue', 'JavaScript', '教學'],
        createdBy: testUser._id
      });
    });

    it('應返回所有標籤列表', async () => {
      const res = await request(publicApp)
        .get('/api/contents/tags')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toContain('Vue');
      expect(res.body.data).toContain('JavaScript');
      expect(res.body.data).toContain('教學');
    });
  });

  describe('POST /api/contents', () => {
    it('應能創建新內容', async () => {
      const contentData = {
        title: '新文章',
        slug: 'new-article',
        content: '新文章內容',
        contentType: 'markdown',
        category: '測試'
      };

      const res = await request(app)
        .post('/api/contents')
        .send(contentData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('新文章');
      expect(res.body.data.createdBy).toBeDefined();
    });

    it('當slug重複時應返回400錯誤', async () => {
      // 先創建一個內容
      await Content.create({
        title: '現有文章',
        slug: 'existing-slug',
        content: '現有內容',
        createdBy: testUser._id
      });

      const contentData = {
        title: '新文章',
        slug: 'existing-slug',
        content: '新內容'
      };

      const res = await request(app)
        .post('/api/contents')
        .send(contentData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('URL識別符已存在，請使用不同的識別符');
    });
  });

  describe('PUT /api/contents/:id', () => {
    let existingContent;

    beforeEach(async () => {
      existingContent = await Content.create({
        title: '現有文章',
        slug: 'existing-article',
        content: '現有內容',
        createdBy: testUser._id
      });
    });

    it('應能更新現有內容', async () => {
      const updateData = {
        title: '更新後的文章',
        content: '更新後的內容',
        status: 'published'
      };

      const res = await request(app)
        .put(`/api/contents/${existingContent._id}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('更新後的文章');
      expect(res.body.data.status).toBe('published');
      expect(res.body.data.lastModifiedBy).toBeDefined();
    });

    it('對不存在的ID應返回404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .put(`/api/contents/${fakeId}`)
        .send({ title: '更新標題' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/contents/:id', () => {
    let existingContent;

    beforeEach(async () => {
      existingContent = await Content.create({
        title: '待刪除文章',
        slug: 'to-delete-article',
        content: '待刪除內容',
        createdBy: testUser._id
      });
    });

    it('應能刪除現有內容', async () => {
      const res = await request(app)
        .delete(`/api/contents/${existingContent._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('內容已成功刪除');

      // 驗證內容確實被刪除
      const deletedContent = await Content.findById(existingContent._id);
      expect(deletedContent).toBeNull();
    });

    it('對不存在的ID應返回404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .delete(`/api/contents/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
