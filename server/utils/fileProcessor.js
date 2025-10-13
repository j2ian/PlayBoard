const fs = require('fs').promises;
const path = require('path');
const yauzl = require('yauzl');
const { promisify } = require('util');

// 將 yauzl 的異步函數轉換為 Promise
const openZip = promisify(yauzl.open);

/**
 * 驗證 ZIP 檔案
 * @param {string} zipPath - ZIP 檔案路徑
 * @returns {Promise<Object>} 驗證結果
 */
async function validateZipFile(zipPath) {
  try {
    const stats = await fs.stat(zipPath);
    
    // 檢查檔案大小（最大 50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (stats.size > maxSize) {
      throw new Error('ZIP 檔案大小不能超過 50MB');
    }
    
    // 檢查是否為有效的 ZIP 檔案
    const zipfile = await openZip(zipPath, { lazyEntries: true });
    
    let fileCount = 0;
    const maxFiles = 1000;
    const allowedExtensions = ['.html', '.htm', '.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf', '.otf', '.json', '.txt', '.md'];
    const extractedFiles = [];
    
    return new Promise((resolve, reject) => {
      zipfile.on('entry', (entry) => {
        fileCount++;
        
        if (fileCount > maxFiles) {
          reject(new Error(`檔案數量不能超過 ${maxFiles} 個`));
          return;
        }
        
        // 檢查檔案大小（單一檔案最大 10MB）
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        if (entry.uncompressedSize > maxFileSize) {
          reject(new Error(`檔案 ${entry.fileName} 大小不能超過 10MB`));
          return;
        }
        
        // 檢查檔案類型
        const ext = path.extname(entry.fileName).toLowerCase();
        if (ext && !allowedExtensions.includes(ext)) {
          reject(new Error(`不支援的檔案類型: ${entry.fileName}`));
          return;
        }
        
        // 檢查是否有 index.html
        if (entry.fileName.toLowerCase() === 'index.html' || 
            entry.fileName.toLowerCase().endsWith('/index.html')) {
          extractedFiles.push({
            filename: path.basename(entry.fileName),
            relativePath: entry.fileName,
            fileType: getFileType(ext),
            size: entry.uncompressedSize
          });
        }
        
        zipfile.readEntry();
      });
      
      zipfile.on('end', () => {
        if (extractedFiles.length === 0) {
          reject(new Error('ZIP 檔案中必須包含 index.html 檔案'));
          return;
        }
        
        resolve({
          isValid: true,
          fileCount,
          totalSize: stats.size,
          hasIndexHtml: true
        });
      });
      
      zipfile.on('error', (err) => {
        reject(new Error(`ZIP 檔案格式錯誤: ${err.message}`));
      });
      
      zipfile.readEntry();
    });
  } catch (error) {
    throw new Error(`檔案驗證失敗: ${error.message}`);
  }
}

/**
 * 解壓 ZIP 檔案
 * @param {string} zipPath - ZIP 檔案路徑
 * @param {string} extractPath - 解壓目標路徑
 * @returns {Promise<Array>} 解壓後的檔案列表
 */
async function extractZipFile(zipPath, extractPath) {
  try {
    // 確保解壓目錄存在
    await fs.mkdir(extractPath, { recursive: true });
    
    const zipfile = await openZip(zipPath, { lazyEntries: true });
    const extractedFiles = [];
    
    return new Promise((resolve, reject) => {
      zipfile.on('entry', (entry) => {
        // 跳過目錄
        if (/\/$/.test(entry.fileName)) {
          zipfile.readEntry();
          return;
        }
        
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) {
            reject(err);
            return;
          }
          
          // 移除 ZIP 檔案中的根目錄結構
          let relativePath = entry.fileName;
          const pathParts = relativePath.split('/');
          
          // 如果第一個部分是資料夾名稱，且與 ZIP 檔案名相同，則移除它
          if (pathParts.length > 1 && pathParts[0] && pathParts[0] !== '') {
            // 檢查是否應該移除根目錄
            const shouldRemoveRoot = pathParts.length > 1 && 
              (pathParts[0] === path.basename(extractPath) || 
               pathParts[0].toLowerCase() === path.basename(extractPath).toLowerCase());
            
            if (shouldRemoveRoot) {
              relativePath = pathParts.slice(1).join('/');
            }
          }
          
          const filePath = path.join(extractPath, relativePath);
          const fileDir = path.dirname(filePath);
          
          // 確保目錄存在
          fs.mkdir(fileDir, { recursive: true }).then(() => {
            const writeStream = require('fs').createWriteStream(filePath);
            
            readStream.pipe(writeStream);
            
            writeStream.on('close', () => {
              const ext = path.extname(entry.fileName).toLowerCase();
              extractedFiles.push({
                filename: path.basename(relativePath),
                relativePath: relativePath,
                fileType: getFileType(ext),
                size: entry.uncompressedSize
              });
              
              zipfile.readEntry();
            });
            
            writeStream.on('error', (err) => {
              reject(err);
            });
          }).catch(reject);
        });
      });
      
      zipfile.on('end', () => {
        resolve(extractedFiles);
      });
      
      zipfile.on('error', (err) => {
        reject(err);
      });
      
      zipfile.readEntry();
    });
  } catch (error) {
    throw new Error(`解壓失敗: ${error.message}`);
  }
}

/**
 * 根據副檔名判斷檔案類型
 * @param {string} ext - 副檔名
 * @returns {string} 檔案類型
 */
function getFileType(ext) {
  const typeMap = {
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.js': 'js',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.webp': 'image',
    '.svg': 'image',
    '.woff': 'font',
    '.woff2': 'font',
    '.ttf': 'font',
    '.otf': 'font'
  };
  
  return typeMap[ext] || 'other';
}

/**
 * 讀取 config.json 設定檔案
 * @param {string} extractPath - 解壓目錄路徑
 * @returns {Promise<Object>} 設定物件
 */
async function readConfigFile(extractPath) {
  try {
    const configPath = path.join(extractPath, 'config.json');
    const configData = await fs.promises.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    // 如果沒有 config.json，返回預設設定
    return {
      pageInfo: {
        title: '',
        description: '',
        version: '1.0.0',
        author: ''
      },
      settings: {
        entryFile: 'index.html',
        allowFullscreen: false,
        allowNavigation: true,
        autoProgress: false,
        progressTrigger: 'manual',
        progressDelay: 0,
        completionCriteria: ''
      },
      requirements: {
        minWidth: 800,
        minHeight: 600,
        browserSupport: ['chrome', 'firefox', 'safari', 'edge']
      }
    };
  }
}

/**
 * 清理檔案和目錄
 * @param {string} filePath - 要清理的檔案或目錄路徑
 */
async function cleanupFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await fs.rmdir(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error('清理檔案失敗:', error.message);
  }
}

module.exports = {
  validateZipFile,
  extractZipFile,
  getFileType,
  readConfigFile,
  cleanupFile
};
