import api from './api';

const customPageService = {
  // 上傳客製化頁面
  async uploadCustomPage(formData) {
    try {
      const response = await api.post('/custom-pages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 獲取客製化頁面列表
  async getCustomPages(params = {}) {
    try {
      const response = await api.get('/custom-pages', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 獲取單個客製化頁面
  async getCustomPage(id) {
    try {
      const response = await api.get(`/custom-pages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 更新客製化頁面
  async updateCustomPage(id, data) {
    try {
      const response = await api.put(`/custom-pages/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 刪除客製化頁面
  async deleteCustomPage(id) {
    try {
      const response = await api.delete(`/custom-pages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 獲取可用的客製化頁面
  async getAvailableCustomPages() {
    // 與其他 service 保持一致：回傳完整 axios response，呼叫端以 response.data.success 判斷
    return api.get('/custom-pages/available');
  },

  // 訪問客製化頁面（公開）
  async getCustomPagePublic(slug) {
    try {
      const response = await api.get(`/custom-pages/public/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default customPageService;
