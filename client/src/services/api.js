// services/api.js - API 請求服務
import axios from 'axios';

// API 基礎 URL
const API_URL = import.meta.env.VITE_API_URL || '/api/';

// 創建 axios 實例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true  // 跨域請求時發送 Cookie
});

// 請求攔截器 - 新增認證頭
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器 - 處理錯誤和身份驗證問題
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 處理 401 未授權錯誤
    if (error.response && error.response.status === 401) {
      // 如果 token 無效，登出用戶
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // 如果不是登入頁，重定向到登入頁面
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login?redirect=' + currentPath;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 