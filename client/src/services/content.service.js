// client/src/services/content.service.js
import apiClient from './api';

class ContentService {
  // ===== 管理員API =====
  
  // 獲取所有內容（管理員用）
  getAllContents(params) {
    return apiClient.get('/contents', { params });
  }

  // 獲取單個內容詳情（管理員用）
  getContent(id) {
    return apiClient.get(`/contents/${id}`);
  }

  // 創建內容（管理員用）
  createContent(contentData) {
    return apiClient.post('/contents', contentData);
  }

  // 更新內容（管理員用）
  updateContent(id, contentData) {
    return apiClient.put(`/contents/${id}`, contentData);
  }

  // 刪除內容（管理員用）
  deleteContent(id) {
    return apiClient.delete(`/contents/${id}`);
  }

  // 上傳圖片（管理員用）
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiClient.post('/contents/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // ===== 公開API =====
  
  // 獲取公開內容列表
  getPublicContents(params) {
    return apiClient.get('/contents/public', { params });
  }

  // 獲取公開內容（根據slug）
  getPublicContent(slug) {
    return apiClient.get(`/contents/public/${slug}`);
  }

  // 獲取公開內容（根據ID）
  getPublicContentById(id) {
    return apiClient.get(`/contents/public/by-id/${id}`);
  }

  // 獲取分類列表
  getCategories() {
    return apiClient.get('/contents/categories');
  }

  // 獲取標籤列表
  getTags() {
    return apiClient.get('/contents/tags');
  }

  // ===== 工具方法 =====
  
  // 獲取內容狀態選項
  getStatusOptions() {
    return [
      { value: 'draft', label: '草稿', color: 'info' },
      { value: 'published', label: '已發布', color: 'success' },
      { value: 'archived', label: '已封存', color: 'warning' }
    ];
  }

  // 獲取內容類型選項
  getContentTypeOptions() {
    return [
      { value: 'markdown', label: 'Markdown', description: '支援Markdown語法的富文本' },
      { value: 'html', label: 'HTML', description: '原始HTML內容' },
      { value: 'plain', label: '純文字', description: '純文字內容' }
    ];
  }

  // 生成slug（URL識別符）
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-') // 將空格和特殊字元替換為連字號
      .replace(/-+/g, '-') // 合併多個連字號
      .replace(/^-|-$/g, ''); // 移除開頭和結尾的連字號
  }

  // 驗證slug格式
  validateSlug(slug) {
    const slugRegex = /^[a-z0-9\-]+$/;
    return slugRegex.test(slug);
  }

  // 格式化檔案大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 獲取狀態標籤樣式
  getStatusTagType(status) {
    const statusMap = {
      'draft': 'info',
      'published': 'success',
      'archived': 'warning'
    };
    return statusMap[status] || 'info';
  }

  // 獲取狀態標籤文字
  getStatusLabel(status) {
    const statusMap = {
      'draft': '草稿',
      'published': '已發布',
      'archived': '已封存'
    };
    return statusMap[status] || status;
  }

  // 獲取內容類型標籤
  getContentTypeLabel(type) {
    const typeMap = {
      'markdown': 'Markdown',
      'html': 'HTML',
      'plain': '純文字'
    };
    return typeMap[type] || type;
  }

  // 截斷文字
  truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // 解析標籤字串
  parseTags(tagsString) {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  // 標籤轉字串
  tagsToString(tags) {
    if (!Array.isArray(tags)) return '';
    return tags.join(', ');
  }
}

export default new ContentService();
