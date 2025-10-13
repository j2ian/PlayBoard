// client/src/services/exam.service.js
import apiClient from './api';

class ExamService {
  getAllExams(params) {
    return apiClient.get('/exams', { params });
  }
  getExam(id) {
    return apiClient.get(`/exams/${id}`);
  }
  createExam(examData) {
    return apiClient.post('/exams', examData);
  }
  updateExam(id, examData) {
    return apiClient.put(`/exams/${id}`, examData);
  }
  deleteExam(id) {
    return apiClient.delete(`/exams/${id}`);
  }
}
export default new ExamService(); 