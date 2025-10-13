// services/question.service.js - 單一題目 API 服務
import apiClient from './api';

class QuestionService {
  getAllQuestions(params) {
    return apiClient.get('/questions', { params });
  }
  getQuestion(id) {
    return apiClient.get(`/questions/${id}`);
  }
  createQuestion(questionData) {
    return apiClient.post('/questions', questionData);
  }
  updateQuestion(id, questionData) {
    return apiClient.put(`/questions/${id}`, questionData);
  }
  deleteQuestion(id) {
    return apiClient.delete(`/questions/${id}`);
  }
}
export default new QuestionService(); 