// services/auth.service.js - 身份驗證服務
import axios from 'axios';

// API基礎URL - 使用相對路徑以便通過Vite代理訪問
const API_URL = '/api/auth/';

class AuthService {
  /**
   * 用戶登入
   * @param {Object} credentials - 登入憑證
   * @returns {Promise} - 返回Promise物件
   */
  async login(credentials) {
    try {
      const response = await axios.post(API_URL + 'login', credentials);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服務器無回應' };
    }
  }

  /**
   * 用戶註冊
   * @param {Object} user - 用戶數據
   * @returns {Promise} - 返回Promise物件
   */
  async register(user) {
    try {
      const response = await axios.post(API_URL + 'register', user);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服務器無回應' };
    }
  }

  /**
   * 創建管理員帳號
   * @param {Object} adminData - 管理員數據
   * @returns {Promise} - 返回Promise物件
   */
  async createAdmin(adminData) {
    try {
      const response = await axios.post(API_URL + 'create-admin', adminData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : { message: '服務器無回應' };
    }
  }

  /**
   * 用戶登出
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * 獲取當前用戶信息
   * @returns {Object|null} - 返回用戶信息或null
   */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  /**
   * 獲取認證頭信息
   * @returns {Object} - 返回包含認證信息的頭對象
   */
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  /**
   * 檢查用戶是否為管理員
   * @returns {Boolean} - 返回是否為管理員
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  /**
   * 檢查用戶是否已登入
   * @returns {Boolean} - 返回是否已登入
   */
  isLoggedIn() {
    return !!localStorage.getItem('user');
  }
}

export default new AuthService(); 