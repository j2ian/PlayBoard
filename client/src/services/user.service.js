// services/user.service.js - 用戶 API 服務
import apiClient from './api';

class UserService {
  getAllUsers(params) {
    return apiClient.get('/users', { params });
  }

  getUser(id) {
    return apiClient.get(`/users/${id}`);
  }

  createUser(userData) {
    return apiClient.post('/users', userData);
  }

  updateUser(id, userData) {
    return apiClient.put(`/users/${id}`, userData);
  }

  deleteUser(id) {
    return apiClient.delete(`/users/${id}`);
  }
}

export default new UserService();
