const CustomPage = require('../models/CustomPage');
const { validateZipFile, extractZipFile, readConfigFile, cleanupFile } = require('../utils/fileProcessor');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

// 設定 multer 用於檔案上傳
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/custom-pages');
    // 確保目錄存在
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => {
      cb(err);
    });
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'custom-page-' + uniqueSuffix + '.zip');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('只能上傳 ZIP 檔案'), false);
    }
  }
});

// 上傳中間件
const uploadMiddleware = upload.single('file');

/**
 * 上傳客製化頁面
 */
const uploadCustomPage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請選擇要上傳的 ZIP 檔案'
      });
    }

    const { title, description, category, tags } = req.body;
    
    if (!title) {
      // 清理上傳的檔案
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        message: '頁面標題為必填'
      });
    }

    // 創建客製化頁面記錄
    const customPage = new CustomPage({
      title,
      description,
      category: category || '客製化頁面',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      zipFile: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadPath: req.file.path
      },
      status: 'uploading',
      createdBy: req.user.id
    });

    await customPage.save();

    // 異步處理檔案
    processCustomPageAsync(customPage._id, req.file.path);

    res.json({
      success: true,
      message: '檔案上傳成功，正在處理中...',
      data: {
        id: customPage._id,
        status: customPage.status
      }
    });

  } catch (error) {
    console.error('上傳客製化頁面失敗:', error);
    
    // 清理上傳的檔案
    if (req.file) {
      await cleanupFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || '上傳失敗'
    });
  }
};

/**
 * 異步處理客製化頁面
 */
async function processCustomPageAsync(customPageId, zipPath) {
  try {
    const customPage = await CustomPage.findById(customPageId);
    if (!customPage) {
      throw new Error('找不到客製化頁面記錄');
    }

    // 更新狀態為處理中
    customPage.status = 'processing';
    await customPage.save();

    // 驗證 ZIP 檔案
    await validateZipFile(zipPath);

    // 創建解壓目錄
    const extractDir = path.join(__dirname, '../public/custom-pages', customPage.slug);
    await fs.mkdir(extractDir, { recursive: true });

    // 解壓檔案
    const extractedFiles = await extractZipFile(zipPath, extractDir);

    // 讀取設定檔案
    const config = await readConfigFile(extractDir);

    // 更新客製化頁面記錄
    customPage.extractedFiles = extractedFiles;
    customPage.entryFile = config.settings.entryFile || 'index.html';
    customPage.settings = {
      allowFullscreen: config.settings.allowFullscreen || false,
      allowNavigation: config.settings.allowNavigation !== false,
      autoProgress: config.settings.autoProgress || false,
      progressTrigger: config.settings.progressTrigger || 'manual',
      progressDelay: config.settings.progressDelay || 0,
      completionCriteria: config.settings.completionCriteria || ''
    };
    customPage.status = 'ready';
    customPage.errorMessage = undefined;

    await customPage.save();

    // 清理原始 ZIP 檔案
    await cleanupFile(zipPath);

    console.log(`客製化頁面處理完成: ${customPage.title}`);

  } catch (error) {
    console.error('處理客製化頁面失敗:', error);
    
    try {
      const customPage = await CustomPage.findById(customPageId);
      if (customPage) {
        customPage.status = 'error';
        customPage.errorMessage = error.message;
        await customPage.save();
      }
    } catch (updateError) {
      console.error('更新錯誤狀態失敗:', updateError);
    }
  }
}

/**
 * 獲取客製化頁面列表
 */
const getCustomPages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * pageSize;
    
    const [customPages, total] = await Promise.all([
      CustomPage.find(query)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      CustomPage.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        customPages,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });

  } catch (error) {
    console.error('獲取客製化頁面列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取列表失敗'
    });
  }
};

/**
 * 獲取單個客製化頁面
 */
const getCustomPage = async (req, res) => {
  try {
    const customPage = await CustomPage.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!customPage) {
      return res.status(404).json({
        success: false,
        message: '找不到客製化頁面'
      });
    }

    res.json({
      success: true,
      data: customPage
    });

  } catch (error) {
    console.error('獲取客製化頁面失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取頁面失敗'
    });
  }
};

/**
 * 更新客製化頁面
 */
const updateCustomPage = async (req, res) => {
  try {
    const { title, description, settings, category, tags } = req.body;
    
    const customPage = await CustomPage.findById(req.params.id);
    if (!customPage) {
      return res.status(404).json({
        success: false,
        message: '找不到客製化頁面'
      });
    }

    // 更新欄位
    if (title) customPage.title = title;
    if (description !== undefined) customPage.description = description;
    if (category) customPage.category = category;
    if (tags) customPage.tags = tags.split(',').map(tag => tag.trim());
    if (settings) {
      customPage.settings = { ...customPage.settings, ...settings };
    }
    
    customPage.lastModifiedBy = req.user.id;

    await customPage.save();

    res.json({
      success: true,
      message: '更新成功',
      data: customPage
    });

  } catch (error) {
    console.error('更新客製化頁面失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新失敗'
    });
  }
};

/**
 * 刪除客製化頁面
 */
const deleteCustomPage = async (req, res) => {
  try {
    const customPage = await CustomPage.findById(req.params.id);
    if (!customPage) {
      return res.status(404).json({
        success: false,
        message: '找不到客製化頁面'
      });
    }

    // 清理檔案
    const extractDir = path.join(__dirname, '../public/custom-pages', customPage.slug);
    await cleanupFile(extractDir);

    // 刪除資料庫記錄
    await CustomPage.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '刪除成功'
    });

  } catch (error) {
    console.error('刪除客製化頁面失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除失敗'
    });
  }
};

/**
 * 獲取可用的客製化頁面（公開 API）
 */
const getAvailableCustomPages = async (req, res) => {
  try {
    const customPages = await CustomPage.getAvailablePages();
    
    res.json({
      success: true,
      data: customPages
    });

  } catch (error) {
    console.error('獲取可用客製化頁面失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取頁面失敗'
    });
  }
};

/**
 * 訪問客製化頁面（公開 API）
 */
const serveCustomPage = async (req, res) => {
  try {
    const customPage = await CustomPage.findOne({ 
      slug: req.params.slug, 
      status: 'ready' 
    });

    if (!customPage) {
      return res.status(404).json({
        success: false,
        message: '找不到客製化頁面'
      });
    }

    // 增加瀏覽次數
    customPage.viewCount++;
    await customPage.save();

    // 讀取並返回 HTML 檔案
    // 首先嘗試在根目錄查找
    let filePath = path.join(
      __dirname, 
      '../public/custom-pages', 
      customPage.slug, 
      customPage.entryFile
    );
    
    // 如果根目錄沒有找到，嘗試在子目錄中查找
    if (!require('fs').existsSync(filePath)) {
      const extractDir = path.join(__dirname, '../public/custom-pages', customPage.slug);
      const files = await fs.readdir(extractDir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isDirectory()) {
          const subDirPath = path.join(extractDir, file.name);
          const potentialPath = path.join(subDirPath, customPage.entryFile);
          if (require('fs').existsSync(potentialPath)) {
            filePath = potentialPath;
            break;
          }
        }
      }
    }

    console.log('客製化頁面調試信息:');
    console.log('Slug:', customPage.slug);
    console.log('Entry File:', customPage.entryFile);
    console.log('File Path:', filePath);
    console.log('File exists:', require('fs').existsSync(filePath));

    try {
      let htmlContent = await fs.readFile(filePath, 'utf8');

      // 設定 base URL，讓所有相對路徑（包括 JS 中動態新增的）都能正確解析
      const baseUrl = `/api/custom-pages/public/${customPage.slug}/assets/`;

      // 在 <head> 標籤後注入 <base> 標籤
      if (htmlContent.includes('<head>')) {
        htmlContent = htmlContent.replace(
          '<head>',
          `<head>\n    <base href="${baseUrl}">`
        );
      } else if (htmlContent.includes('<HEAD>')) {
        htmlContent = htmlContent.replace(
          '<HEAD>',
          `<HEAD>\n    <base href="${baseUrl}">`
        );
      } else {
        // 如果沒有 <head> 標籤，在 <html> 或開頭新增
        if (htmlContent.includes('<html>') || htmlContent.includes('<HTML>')) {
          htmlContent = htmlContent.replace(
            /(<html[^>]*>)/i,
            `$1\n<head>\n    <base href="${baseUrl}">\n</head>`
          );
        } else {
          htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n    <base href="${baseUrl}">\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
        }
      }

      // 注入音頻自動播放處理程式碼
      const autoplayScript = `
<script>
(function() {
  let userInteracted = false;
  const pendingAudioElements = [];

  // 新增開始互動覆蓋層
  function createStartOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'playboard-start-overlay';
    overlay.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      cursor: pointer;
    \`;

    const button = document.createElement('div');
    button.style.cssText = \`
      background: #4CAF50;
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    \`;
    button.textContent = '點擊開始';

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    overlay.appendChild(button);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function() {
      userInteracted = true;
      overlay.remove();
      playPendingAudios();
    });
  }

  // 播放所有待播放的音頻
  function playPendingAudios() {
    // 播放所有 audio 元素
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.autoplay || audio.dataset.autoplay) {
        audio.play().catch(err => {
          console.log('音頻播放失敗:', err);
        });
      }
    });

    // 播放待處理的音頻
    pendingAudioElements.forEach(audio => {
      audio.play().catch(err => {
        console.log('音頻播放失敗:', err);
      });
    });
    pendingAudioElements.length = 0;
  }

  // 攔截 Audio.prototype.play
  const originalPlay = Audio.prototype.play;
  Audio.prototype.play = function() {
    if (!userInteracted) {
      pendingAudioElements.push(this);
      return Promise.reject(new DOMException('User interaction required'));
    }
    return originalPlay.apply(this, arguments);
  };

  // 攔截 HTMLMediaElement.prototype.play
  const originalMediaPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() {
    if (!userInteracted) {
      pendingAudioElements.push(this);
      return Promise.reject(new DOMException('User interaction required'));
    }
    return originalMediaPlay.apply(this, arguments);
  };

  // 頁面載入完成後檢查是否需要顯示覆蓋層
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
      const audioElements = document.querySelectorAll('audio');
      const hasAutoplayAudio = Array.from(audioElements).some(audio =>
        audio.autoplay || audio.dataset.autoplay
      );

      // 如果有自動播放的音頻，顯示覆蓋層
      if (hasAutoplayAudio || pendingAudioElements.length > 0) {
        createStartOverlay();
      }
    }, 100);
  });

  // 如果頁面已經載入完成
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
      const audioElements = document.querySelectorAll('audio');
      const hasAutoplayAudio = Array.from(audioElements).some(audio =>
        audio.autoplay || audio.dataset.autoplay
      );

      if (hasAutoplayAudio || pendingAudioElements.length > 0) {
        createStartOverlay();
      }
    }, 100);
  }
})();
</script>
`;

      // 在 </body> 前注入腳本
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${autoplayScript}\n</body>`);
      } else if (htmlContent.includes('</BODY>')) {
        htmlContent = htmlContent.replace('</BODY>', `${autoplayScript}\n</BODY>`);
      } else {
        htmlContent += autoplayScript;
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (fileError) {
      console.error('讀取檔案失敗:', fileError);
      res.status(404).json({
        success: false,
        message: '找不到頁面檔案'
      });
    }

  } catch (error) {
    console.error('訪問客製化頁面失敗:', error);
    res.status(500).json({
      success: false,
      message: '訪問頁面失敗'
    });
  }
};

/**
 * 提供客製化頁面的靜態資源
 */
const serveCustomPageAsset = async (req, res) => {
  try {
    const { slug } = req.params;
    const assetPath = req.assetPath; // 使用中間件設定的 assetPath

    const customPage = await CustomPage.findOne({
      slug: slug,
      status: 'ready'
    });

    if (!customPage) {
      console.log('找不到客製化頁面:', slug);
      return res.status(404).json({
        success: false,
        message: '找不到客製化頁面'
      });
    }

    // 構建資源檔案路徑
    const extractDir = path.join(__dirname, '../public/custom-pages', customPage.slug);

    // 遞迴搜尋檔案的輔助函數
    const findFileRecursive = async (dir, targetFile) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // 遞迴搜尋子目錄
            const found = await findFileRecursive(fullPath, targetFile);
            if (found) return found;
          } else if (entry.isFile()) {
            // 檢查檔案名稱是否符合（不分大小寫）
            const relativePath = path.relative(extractDir, fullPath);
            if (relativePath.toLowerCase() === targetFile.toLowerCase() ||
                entry.name.toLowerCase() === path.basename(targetFile).toLowerCase()) {
              return fullPath;
            }
          }
        }
        return null;
      } catch (err) {
        console.error('搜尋檔案錯誤:', err);
        return null;
      }
    };

    // 先嘗試直接路徑
    let filePath = path.join(extractDir, assetPath);

    // 如果直接路徑不存在，遞迴搜尋整個目錄
    if (!require('fs').existsSync(filePath)) {
      console.log('直接路徑不存在，開始遞迴搜尋:', assetPath);
      filePath = await findFileRecursive(extractDir, assetPath);
    }

    console.log('資源檔案調試信息:');
    console.log('Slug:', slug);
    console.log('Asset Path:', assetPath);
    console.log('Extract Dir:', extractDir);
    console.log('Final File Path:', filePath);
    console.log('File exists:', filePath ? require('fs').existsSync(filePath) : false);

    // 檢查檔案是否存在
    if (!filePath || !require('fs').existsSync(filePath)) {
      console.error('找不到資源檔案:', assetPath);
      return res.status(404).json({
        success: false,
        message: '找不到資源檔案: ' + assetPath
      });
    }

    // 根據檔案擴展名設定正確的 Content-Type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.otf': 'font/otf'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // 設定快取標頭（1天）
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // 讀取並返回檔案內容
    const fileContent = await fs.readFile(filePath);
    res.send(fileContent);

  } catch (error) {
    console.error('提供資源檔案失敗:', error);
    res.status(500).json({
      success: false,
      message: '提供資源檔案失敗'
    });
  }
};


module.exports = {
  uploadMiddleware,
  uploadCustomPage,
  getCustomPages,
  getCustomPage,
  updateCustomPage,
  deleteCustomPage,
  getAvailableCustomPages,
  serveCustomPage,
  serveCustomPageAsset
};
