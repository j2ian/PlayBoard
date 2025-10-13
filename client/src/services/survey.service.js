// client/src/services/survey.service.js
import apiClient from './api';

class SurveyService {
  // 獲取所有問卷（管理員用）
  getAllSurveys(params) {
    return apiClient.get('/surveys', { params });
  }

  // 獲取單個問卷詳情（管理員用）
  getSurvey(id) {
    return apiClient.get(`/surveys/${id}`);
  }

  // 獲取問卷內容（學生用，無需認證）
  getSurveyForStudent(id) {
    return apiClient.get(`/surveys/${id}/public`);
  }

  // 創建問卷（管理員用）
  createSurvey(surveyData) {
    return apiClient.post('/surveys', surveyData);
  }

  // 更新問卷（管理員用）
  updateSurvey(id, surveyData) {
    return apiClient.put(`/surveys/${id}`, surveyData);
  }

  // 刪除問卷（管理員用）
  deleteSurvey(id) {
    return apiClient.delete(`/surveys/${id}`);
  }

  // 提交問卷回答（學生用）
  submitSurveyResponse(id, responseData) {
    return apiClient.post(`/surveys/${id}/responses`, responseData);
  }

  // 獲取問卷回答統計（管理員用）
  getSurveyResponses(id) {
    return apiClient.get(`/surveys/${id}/responses`);
  }

  // 下載問卷所有回應（CSV，管理員）
  downloadSurveyResponsesCsv(id) {
    return apiClient.get(`/surveys/${id}/responses/export`, {
      responseType: 'blob'
    });
  }

  // 獲取李克特量表選項
  getLikertOptions() {
    return [
      { value: 5, label: '非常同意', color: '#67C23A' },
      { value: 4, label: '同意', color: '#95D475' },
      { value: 3, label: '普通', color: '#E6A23C' },
      { value: 2, label: '不同意', color: '#F56C6C' },
      { value: 1, label: '非常不同意', color: '#F78989' }
    ];
  }

  // 獲取問題類型選項
  getQuestionTypes() {
    return [
      { value: 'likert', label: '滿意度量表（5階級）' },
      { value: 'text', label: '簡述題（文字回答）' },
      { value: 'single', label: '單選題' },
      { value: 'multiple', label: '多選題' }
    ];
  }
}

export default new SurveyService();
