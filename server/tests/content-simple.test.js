// server/tests/content-simple.test.js - Content 簡化測試
require('./setup');
const mongoose = require('mongoose');
const Content = require('../models/Content');
const User = require('../models/User');

describe('Content 完整功能測試', () => {
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

  describe('基本CRUD操作', () => {
    it('應能完成完整的內容生命周期', async () => {
      // 1. 創建內容
      const contentData = {
        title: '測試文章生命周期',
        slug: 'test-lifecycle',
        excerpt: '這是測試摘要',
        content: '# 測試內容\n\n這是一篇測試文章的內容。',
        contentType: 'markdown',
        tags: ['測試', '範例'],
        category: '教學',
        createdBy: testUser._id
      };

      const createdContent = await Content.create(contentData);
      
      // 驗證創建
      expect(createdContent._id).toBeDefined();
      expect(createdContent.title).toBe('測試文章生命周期');
      expect(createdContent.status).toBe('draft'); // 預設狀態
      expect(createdContent.publishedAt).toBeNull(); // 草稿沒有發布時間

      // 2. 更新內容 - 發布
      createdContent.status = 'published';
      const updatedContent = await createdContent.save();
      
      // 驗證發布
      expect(updatedContent.status).toBe('published');
      expect(updatedContent.publishedAt).toBeDefined(); // 應自動設定發布時間
      expect(updatedContent.isPublished).toBe(true); // 虛擬字段

      // 3. 查詢公開內容
      const publicContents = await Content.getPublicContent();
      expect(publicContents).toHaveLength(1);
      expect(publicContents[0]._id.toString()).toBe(updatedContent._id.toString());

      // 4. 根據slug查詢
      const foundContent = await Content.getPublicBySlug('test-lifecycle');
      expect(foundContent).toBeTruthy();
      expect(foundContent.title).toBe('測試文章生命周期');

      // 5. 增加瀏覽次數
      const initialViewCount = foundContent.viewCount;
      await foundContent.incrementViewCount();
      expect(foundContent.viewCount).toBe(initialViewCount + 1);

      // 6. 虛擬字段測試
      expect(foundContent.publicUrl).toBe('/content/test-lifecycle');

      // 7. 刪除內容
      await Content.findByIdAndDelete(createdContent._id);
      const deletedContent = await Content.findById(createdContent._id);
      expect(deletedContent).toBeNull();
    });

    it('應正確處理圖片資料', async () => {
      const contentWithImages = {
        title: '有圖片的文章',
        slug: 'article-with-images',
        content: '這是有圖片的文章',
        featuredImage: {
          filename: 'featured.jpg',
          originalName: 'my-featured-image.jpg',
          url: '/uploads/content/featured.jpg',
          size: 123456,
          mimeType: 'image/jpeg'
        },
        images: [
          {
            filename: 'image1.jpg',
            originalName: 'first-image.jpg',
            url: '/uploads/content/image1.jpg',
            size: 78910,
            mimeType: 'image/jpeg'
          },
          {
            filename: 'image2.png',
            originalName: 'second-image.png',
            url: '/uploads/content/image2.png',
            size: 45678,
            mimeType: 'image/png'
          }
        ],
        createdBy: testUser._id
      };

      const content = await Content.create(contentWithImages);

      expect(content.featuredImage.filename).toBe('featured.jpg');
      expect(content.images).toHaveLength(2);
      expect(content.images[0].mimeType).toBe('image/jpeg');
      expect(content.images[1].mimeType).toBe('image/png');
    });

    it('應正確處理標籤和分類', async () => {
      const contents = await Promise.all([
        Content.create({
          title: '前端文章1',
          slug: 'frontend-1',
          content: '前端內容1',
          tags: ['Vue', 'JavaScript', '前端'],
          category: '前端開發',
          createdBy: testUser._id
        }),
        Content.create({
          title: '後端文章1',
          slug: 'backend-1',
          content: '後端內容1',
          tags: ['Node.js', 'Express', '後端'],
          category: '後端開發',
          createdBy: testUser._id
        }),
        Content.create({
          title: '全端文章1',
          slug: 'fullstack-1',
          content: '全端內容1',
          tags: ['Vue', 'Node.js', '全端'],
          category: '全端開發',
          createdBy: testUser._id
        })
      ]);

      // 測試分類查詢
      const categories = await Content.distinct('category');
      expect(categories).toContain('前端開發');
      expect(categories).toContain('後端開發');
      expect(categories).toContain('全端開發');

      // 測試標籤查詢
      const tags = await Content.distinct('tags');
      expect(tags).toContain('Vue');
      expect(tags).toContain('Node.js');
      expect(tags).toContain('JavaScript');
    });

    it('應正確處理狀態轉換', async () => {
      const content = await Content.create({
        title: '狀態測試文章',
        slug: 'status-test',
        content: '狀態測試內容',
        createdBy: testUser._id
      });

      // 初始狀態：草稿
      expect(content.status).toBe('draft');
      expect(content.publishedAt).toBeNull();
      expect(content.isPublished).toBe(false);

      // 發布
      content.status = 'published';
      await content.save();
      expect(content.publishedAt).toBeDefined();
      expect(content.isPublished).toBe(true);

      // 封存
      content.status = 'archived';
      await content.save();
      expect(content.publishedAt).toBeNull(); // 封存時清除發布時間
      expect(content.isPublished).toBe(false);

      // 重新發布
      content.status = 'published';
      await content.save();
      expect(content.publishedAt).toBeDefined(); // 重新設定發布時間
      expect(content.isPublished).toBe(true);
    });
  });

  describe('資料驗證測試', () => {
    const validationTests = [
      {
        name: '標題過長',
        data: { title: 'a'.repeat(201), slug: 'test' },
        error: '標題不能超過200個字元'
      },
      {
        name: '摘要過長',
        data: { title: '測試', slug: 'test', excerpt: 'a'.repeat(501) },
        error: '摘要不能超過500個字元'
      },
      {
        name: 'slug格式錯誤',
        data: { title: '測試', slug: 'Invalid Slug!' },
        error: 'URL識別符只能包含小寫字母、數字和連字號'
      },
      {
        name: '標籤過多',
        data: { 
          title: '測試', 
          slug: 'test',
          tags: ['1','2','3','4','5','6','7','8','9','10','11']
        },
        error: '標籤數量不能超過10個'
      }
    ];

    validationTests.forEach(test => {
      it(`當${test.name}時應驗證失敗`, async () => {
        const data = { 
          content: '測試內容', 
          createdBy: testUser._id, 
          ...test.data 
        };
        
        await expect(Content.create(data)).rejects.toThrow();
      });
    });
  });

  describe('查詢功能測試', () => {
    beforeEach(async () => {
      // 創建測試資料
      await Promise.all([
        Content.create({
          title: '公開已發布文章',
          slug: 'public-published',
          content: '公開已發布內容',
          status: 'published',
          isPublic: true,
          category: '教學',
          tags: ['Vue', '教學'],
          createdBy: testUser._id
        }),
        Content.create({
          title: '私人已發布文章',
          slug: 'private-published',
          content: '私人已發布內容',
          status: 'published',
          isPublic: false,
          category: '內部',
          createdBy: testUser._id
        }),
        Content.create({
          title: '公開草稿文章',
          slug: 'public-draft',
          content: '公開草稿內容',
          status: 'draft',
          isPublic: true,
          category: '教學',
          createdBy: testUser._id
        })
      ]);
    });

    it('getPublicContent 應只返回已發布的公開內容', async () => {
      const publicContents = await Content.getPublicContent();
      
      expect(publicContents).toHaveLength(1);
      expect(publicContents[0].title).toBe('公開已發布文章');
      expect(publicContents[0].status).toBe('published');
      expect(publicContents[0].isPublic).toBe(true);
    });

    it('應支援按分類查詢', async () => {
      const teachingContents = await Content.find({ 
        category: '教學',
        status: 'published',
        isPublic: true 
      });
      
      expect(teachingContents).toHaveLength(1);
      expect(teachingContents[0].category).toBe('教學');
    });

    it('應支援按標籤查詢', async () => {
      const vueContents = await Content.find({ 
        tags: { $in: ['Vue'] },
        status: 'published',
        isPublic: true 
      });
      
      expect(vueContents).toHaveLength(1);
      expect(vueContents[0].tags).toContain('Vue');
    });

    it('getPublicBySlug 應只對公開內容有效', async () => {
      // 公開內容應該找得到
      const publicContent = await Content.getPublicBySlug('public-published');
      expect(publicContent).toBeTruthy();
      expect(publicContent.title).toBe('公開已發布文章');

      // 私人內容應該找不到
      const privateContent = await Content.getPublicBySlug('private-published');
      expect(privateContent).toBeNull();

      // 草稿內容應該找不到
      const draftContent = await Content.getPublicBySlug('public-draft');
      expect(draftContent).toBeNull();
    });
  });

  describe('效能和統計測試', () => {
    it('瀏覽次數應正確累計', async () => {
      const content = await Content.create({
        title: '瀏覽次數測試',
        slug: 'view-count-test',
        content: '測試內容',
        status: 'published',
        isPublic: true,
        createdBy: testUser._id
      });

      expect(content.viewCount).toBe(0);

      // 模擬多次瀏覽
      for (let i = 1; i <= 5; i++) {
        await content.incrementViewCount();
        expect(content.viewCount).toBe(i);
      }
    });

    it('應正確計算各種統計資料', async () => {
      // 創建不同狀態的內容
      await Promise.all([
        Content.create({ title: '文章1', slug: 'article-1', content: '內容1', status: 'published', category: 'A', createdBy: testUser._id }),
        Content.create({ title: '文章2', slug: 'article-2', content: '內容2', status: 'published', category: 'A', createdBy: testUser._id }),
        Content.create({ title: '文章3', slug: 'article-3', content: '內容3', status: 'draft', category: 'B', createdBy: testUser._id }),
        Content.create({ title: '文章4', slug: 'article-4', content: '內容4', status: 'archived', category: 'B', createdBy: testUser._id })
      ]);

      // 統計各狀態數量
      const publishedCount = await Content.countDocuments({ status: 'published' });
      const draftCount = await Content.countDocuments({ status: 'draft' });
      const archivedCount = await Content.countDocuments({ status: 'archived' });

      expect(publishedCount).toBe(2);
      expect(draftCount).toBe(1);
      expect(archivedCount).toBe(1);

      // 統計分類
      const categoryA = await Content.countDocuments({ category: 'A' });
      const categoryB = await Content.countDocuments({ category: 'B' });

      expect(categoryA).toBe(2);
      expect(categoryB).toBe(2);
    });
  });
});

console.log('✅ Content功能測試完成 - 涵蓋模型驗證、CRUD操作、查詢功能和統計功能');
