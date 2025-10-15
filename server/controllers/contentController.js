// server/controllers/contentController.js - 一般內容控制器
const Content = require('../models/Content');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// 設定檔案上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/content/');
    // 確保目錄存在
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => {
      cb(err);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 只允許圖片檔案
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案 (jpeg, jpg, png, gif, webp)'));
    }
  },
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  }
});

/**
 * 獲取所有內容（管理員用）
 * @route GET /api/contents
 * @access Private/Admin
 */
exports.getContents = async (req, res) => {
  try {
    const { search, status, category, sort, page = 1, pageSize = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'titleAsc') sortOption = { title: 1 };
    if (sort === 'titleDesc') sortOption = { title: -1 };
    if (sort === 'publishedDesc') sortOption = { publishedAt: -1 };
    if (sort === 'publishedAsc') sortOption = { publishedAt: 1 };
    if (sort === 'viewCount') sortOption = { viewCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate('createdBy', 'username')
        .populate('lastModifiedBy', 'username')
        .select('-content') // 列表不需要完整內容
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Content.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: total,
      data: contents
    });
  } catch (error) {
    console.error('獲取內容列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '無法獲取內容列表',
      error: error.message
    });
  }
};

/**
 * 獲取單個內容詳情（管理員用）
 * @route GET /api/contents/:id
 * @access Private/Admin
 */
exports.getContent = async (req, res) => {
  try {
    console.log(`Fetching content with ID: ${req.params.id}`);
    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!content) {
      console.log(`Content with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該內容'
      });
    }

    console.log(`Found content: ${content.title}`);
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error(`Error fetching content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取內容詳情',
      error: error.message
    });
  }
};

/**
 * 獲取公開內容（根據slug）
 * @route GET /api/contents/public/:slug
 * @access Public
 */
exports.getPublicContent = async (req, res) => {
  try {
    console.log(`Fetching public content with slug: ${req.params.slug}`);
    const content = await Content.getPublicBySlug(req.params.slug);

    if (!content) {
      console.log(`Public content with slug ${req.params.slug} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該內容或內容未公開'
      });
    }

    // 增加瀏覽次數
    await content.incrementViewCount();

    console.log(`Found public content: ${content.title}`);
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error(`Error fetching public content ${req.params.slug}:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取內容',
      error: error.message
    });
  }
};

/**
 * 獲取公開內容（根據ID）
 * @route GET /api/contents/public/by-id/:id
 * @access Public
 */
exports.getPublicContentById = async (req, res) => {
  try {
    console.log(`Fetching public content with ID: ${req.params.id}`);
    const content = await Content.getPublicById(req.params.id);

    if (!content) {
      console.log(`Public content with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該內容或內容未公開'
      });
    }

    // 增加瀏覽次數
    await content.incrementViewCount();

    console.log(`Found public content: ${content.title}`);
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error(`Error fetching public content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取內容',
      error: error.message
    });
  }
};

/**
 * 獲取公開內容列表
 * @route GET /api/contents/public
 * @access Public
 */
exports.getPublicContents = async (req, res) => {
  try {
    const { category, tag, page = 1, pageSize = 10 } = req.query;
    const query = { 
      status: 'published'
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate('createdBy', 'username')
        .select('-content') // 公開列表不包含完整內容
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Content.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: total,
      data: contents
    });
  } catch (error) {
    console.error('獲取公開內容列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '無法獲取內容列表',
      error: error.message
    });
  }
};

/**
 * 創建新內容
 * @route POST /api/contents
 * @access Private/Admin
 */
exports.createContent = async (req, res) => {
  try {
    console.log('Creating new content with data:', JSON.stringify(req.body));
    
    // 檢查slug是否已存在
    const existingContent = await Content.findOne({ slug: req.body.slug });
    if (existingContent) {
      return res.status(400).json({
        success: false,
        message: 'URL識別符已存在，請使用不同的識別符'
      });
    }

    // 設定創建者
    req.body.createdBy = req.user.id;
    console.log(`Setting creator ID: ${req.user.id}`);

    // 創建新內容
    console.log('Creating content in database');
    const content = await Content.create(req.body);
    console.log(`Content created with ID: ${content._id}`);

    // 返回新創建的內容（包含populate）
    const populatedContent = await Content.findById(content._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      data: populatedContent
    });
  } catch (error) {
    console.error('Error creating content:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'URL識別符已存在'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '無法創建內容',
      error: error.message
    });
  }
};

/**
 * 更新內容
 * @route PUT /api/contents/:id
 * @access Private/Admin
 */
exports.updateContent = async (req, res) => {
  try {
    console.log(`Updating content with ID: ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body));
    
    // 檢查內容是否存在
    let content = await Content.findById(req.params.id);
    if (!content) {
      console.log(`Content with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該內容'
      });
    }
    console.log(`Found content: ${content.title}`);

    // 如果更新slug，檢查是否重複
    if (req.body.slug && req.body.slug !== content.slug) {
      const existingContent = await Content.findOne({ 
        slug: req.body.slug, 
        _id: { $ne: req.params.id } 
      });
      if (existingContent) {
        return res.status(400).json({
          success: false,
          message: 'URL識別符已存在，請使用不同的識別符'
        });
      }
    }

    // 設定最後修改者
    req.body.lastModifiedBy = req.user.id;

    // 更新內容
    console.log('Updating content in database');
    content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username')
     .populate('lastModifiedBy', 'username');
    
    console.log('Content updated');

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error(`Error updating content ${req.params.id}:`, error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'URL識別符已存在'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '無法更新內容',
      error: error.message
    });
  }
};

/**
 * 刪除內容
 * @route DELETE /api/contents/:id
 * @access Private/Admin
 */
exports.deleteContent = async (req, res) => {
  try {
    console.log(`Deleting content with ID: ${req.params.id}`);
    
    const content = await Content.findById(req.params.id);

    if (!content) {
      console.log(`Content with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該內容'
      });
    }
    console.log(`Found content to delete: ${content.title}`);

    // 刪除相關的圖片檔案
    const imagesToDelete = [...content.images];
    if (content.featuredImage) {
      imagesToDelete.push(content.featuredImage);
    }

    for (const image of imagesToDelete) {
      try {
        const filePath = path.join(__dirname, '../public/uploads/content/', image.filename);
        await fs.unlink(filePath);
        console.log(`Deleted image file: ${image.filename}`);
      } catch (fileError) {
        console.warn(`Failed to delete image file ${image.filename}:`, fileError.message);
      }
    }

    // 刪除內容
    console.log('Deleting content from database');
    await Content.findByIdAndDelete(req.params.id);
    console.log('Content deleted successfully');

    res.status(200).json({
      success: true,
      message: '內容已成功刪除',
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法刪除內容',
      error: error.message
    });
  }
};

/**
 * 上傳圖片
 * @route POST /api/contents/upload-image
 * @access Private/Admin
 */
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '請選擇要上傳的圖片'
        });
      }

      const imageData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/content/${req.file.filename}`,
        size: req.file.size,
        mimeType: req.file.mimetype
      };

      console.log('Image uploaded successfully:', imageData);

      res.status(200).json({
        success: true,
        data: imageData
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      res.status(500).json({
        success: false,
        message: '圖片上傳失敗',
        error: error.message
      });
    }
  }
];

/**
 * 獲取內容分類列表
 * @route GET /api/contents/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Content.distinct('category');
    
    res.status(200).json({
      success: true,
      data: categories.filter(cat => cat && cat.trim()) // 過濾空值
    });
  } catch (error) {
    console.error('獲取分類列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '無法獲取分類列表',
      error: error.message
    });
  }
};

/**
 * 獲取標籤列表
 * @route GET /api/contents/tags
 * @access Public
 */
exports.getTags = async (req, res) => {
  try {
    const tags = await Content.distinct('tags');
    
    res.status(200).json({
      success: true,
      data: tags.filter(tag => tag && tag.trim()) // 過濾空值
    });
  } catch (error) {
    console.error('獲取標籤列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '無法獲取標籤列表',
      error: error.message
    });
  }
};
