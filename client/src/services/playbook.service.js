import apiClient from './api';

class PlayBookService {
  // ==================== 管理員API ====================
  
  // 獲取PlayBook列表（管理員）
  getPlayBooks(params = {}) {
    return apiClient.get('/playbooks', { params });
  }

  // 根據ID獲取PlayBook（管理員）
  getPlayBook(id) {
    return apiClient.get(`/playbooks/${id}`);
  }

  // 創建PlayBook
  createPlayBook(data) {
    return apiClient.post('/playbooks', data);
  }

  // 更新PlayBook
  updatePlayBook(id, data) {
    return apiClient.put(`/playbooks/${id}`, data);
  }

  // 刪除PlayBook
  deletePlayBook(id) {
    return apiClient.delete(`/playbooks/${id}`);
  }

  // 獲取PlayBook統計
  getPlayBookStats(id) {
    return apiClient.get(`/playbooks/${id}/stats`);
  }

  // 下載PlayBook用戶結果
  downloadPlayBookResults(id, format = 'json') {
    return apiClient.get(`/playbooks/${id}/download`, {
      params: { format },
      responseType: 'blob' // 重要：設置響應類型為blob以處理文件下載
    });
  }

  // ==================== 公開API ====================
  
  // 獲取公開PlayBook列表
  getPublicPlayBooks(params = {}) {
    return apiClient.get('/playbooks/public', { params });
  }

  // 根據slug獲取公開PlayBook
  getPublicPlayBook(slug) {
    return apiClient.get(`/playbooks/public/${slug}`);
  }

  // 獲取分類列表
  getCategories() {
    return apiClient.get('/playbooks/categories');
  }

  // ==================== 用戶進度API ====================
  
  // 獲取或創建用戶進度
  async getOrCreateProgress(playBookId, userId, userName = '匿名用戶') {
    try {
      console.log('呼叫 getOrCreateProgress API...')
      console.log('參數:', { playBookId, userId, userName })
      
      const response = await apiClient.post(`/playbooks/${playBookId}/progress`, {
        userId,
        userName
      });
      
      console.log('API 回應:', response)
      
      // 驗證回應資料
      if (response.data && response.data.success && response.data.data) {
        const progressData = response.data.data
        
        // 確保 completedSteps 是陣列
        if (!Array.isArray(progressData.completedSteps)) {
          console.warn('API 回應的 completedSteps 不是陣列，修正為空陣列')
          progressData.completedSteps = []
        }
        
        // 確保基本屬性存在
        if (typeof progressData.currentStep !== 'number') {
          progressData.currentStep = 1
        }
        if (typeof progressData.isCompleted !== 'boolean') {
          progressData.isCompleted = false
        }
        
        console.log('驗證後的進度資料:', progressData)
        return response
      } else {
        throw new Error('API 回應格式錯誤')
      }
    } catch (error) {
      console.error('getOrCreateProgress 失敗:', error)
      throw error
    }
  }

  // 重置用戶在指定PlayBook的進度（伺服器端）
  async resetProgress(playBookId, userId) {
    try {
      const response = await apiClient.post(`/playbooks/${playBookId}/progress/reset`, { userId });
      // 清除本地備份
      this.clearPlayBookProgress(playBookId);
      return response;
    } catch (error) {
      console.error('重置進度失敗:', error);
      throw error;
    }
  }

  // 更新步驟進度
  async updateStepProgress(playBookId, stepNumber, userId, result = null, timeSpent = 0) {
    try {
      // 準備詳細的時間記錄
      const timeRecord = {
        stepTimeSpent: timeSpent,
        stepStartTime: result?.startTime || null,
        stepEndTime: result?.endTime || null,
        readTime: result?.readTime || null,
        timestamp: new Date().toISOString()
      };

      const response = await apiClient.put(`/playbooks/${playBookId}/progress/${stepNumber}`, {
        userId,
        result: {
          ...result,
          timeRecord
        },
        timeSpent
      });
      
      // 更新成功後，同步更新本地進度
      if (response.data && response.data.success) {
        const updatedProgress = response.data.data;
        this.savePlayBookProgress(playBookId, updatedProgress);
        
        // 觸發自定義事件，通知其他組件進度已更新
        window.dispatchEvent(new CustomEvent('playbook-progress-updated', {
          detail: { playBookId, stepNumber, progress: updatedProgress, timeSpent }
        }));
      }
      
      return response;
    } catch (error) {
      console.error('更新步驟進度失敗:', error);
      
      // 如果網路失敗，先更新本地進度作為備份
      const localProgress = this.getLocalProgress(playBookId);
      if (localProgress) {
        // 確保 completedSteps 是陣列
        if (!Array.isArray(localProgress.completedSteps)) {
          localProgress.completedSteps = [];
        }
        
        // 新增完成的步驟
        if (!localProgress.completedSteps.includes(stepNumber)) {
          localProgress.completedSteps.push(stepNumber);
          localProgress.completedSteps.sort((a, b) => a - b);
        }
        
        // 更新當前步驟
        if (stepNumber >= localProgress.currentStep) {
          localProgress.currentStep = stepNumber + 1;
        }
        
        // 保存結果，包含時間記錄
        if (result) {
          if (!localProgress.stepResults) {
            localProgress.stepResults = {};
          }
          
          const timeRecord = {
            stepTimeSpent: timeSpent,
            stepStartTime: result?.startTime || null,
            stepEndTime: result?.endTime || null,
            readTime: result?.readTime || null,
            timestamp: new Date().toISOString()
          };
          
          localProgress.stepResults[stepNumber.toString()] = {
            ...result,
            timeRecord,
            completedAt: new Date().toISOString(),
            offline: true // 標記為離線保存
          };
        }
        
        // 更新總時間
        if (timeSpent) {
          localProgress.timeSpent = (localProgress.timeSpent || 0) + timeSpent;
        }
        
        localProgress.lastModified = Date.now();
        this.savePlayBookProgress(playBookId, localProgress);
        
        console.log('已離線保存進度，將在網路恢復時同步');
      }
      
      throw error;
    }
  }

  // ==================== 工具方法 ====================
  
  // 獲取難度選項
  getDifficultyOptions() {
    return [
      { value: 'beginner', label: '初級', color: '#67c23a' },
      { value: 'intermediate', label: '中級', color: '#e6a23c' },
      { value: 'advanced', label: '高級', color: '#f56c6c' }
    ];
  }

  // 獲取狀態選項
  getStatusOptions() {
    return [
      { value: 'draft', label: '草稿' },
      { value: 'published', label: '已發布' }
    ];
  }

  // 格式化時間顯示
  formatDuration(minutes) {
    if (!minutes || minutes === 0) return '0分鐘';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}小時${remainingMinutes > 0 ? remainingMinutes + '分鐘' : ''}`;
    } else {
      return `${remainingMinutes}分鐘`;
    }
  }

  // 獲取步驟時間統計
  getStepTimeStats(progress) {
    if (!progress?.stepResults) return null;
    
    const stats = {
      totalSteps: 0,
      completedSteps: 0,
      totalTimeSpent: 0,
      averageTimePerStep: 0,
      stepDetails: []
    };
    
    Object.entries(progress.stepResults).forEach(([stepNumber, result]) => {
      const timeRecord = result.timeRecord || {};
      const stepTime = timeRecord.stepTimeSpent || 0;
      
      stats.totalSteps++;
      stats.totalTimeSpent += stepTime;
      
      stats.stepDetails.push({
        stepNumber: parseInt(stepNumber),
        timeSpent: stepTime,
        readTime: timeRecord.readTime || 0,
        startTime: timeRecord.stepStartTime,
        endTime: timeRecord.stepEndTime,
        type: result.type,
        title: result.contentTitle || `步驟 ${stepNumber}`
      });
    });
    
    if (stats.totalSteps > 0) {
      stats.averageTimePerStep = Math.round(stats.totalTimeSpent / stats.totalSteps);
    }
    
    return stats;
  }

  // 獲取步驟類型選項
  getStepTypeOptions() {
    return [
      { 
        value: 'content', 
        label: '內容文章',
        icon: 'Document',
        description: '閱讀文章或學習內容'
      },
      { 
        value: 'exam', 
        label: '測驗',
        icon: 'EditPen',
        description: '完成測驗題目'
      },
      { 
        value: 'survey', 
        label: '問卷調查',
        icon: 'ChatDotSquare',
        description: '填寫問卷或反饋'
      },
      { 
        value: 'customPage', 
        label: '客製化頁面',
        icon: 'Document',
        description: '互動式客製化學習頁面'
      }
    ];
  }

  // 獲取難度標籤顏色
  getDifficultyColor(difficulty) {
    const colorMap = {
      beginner: 'success',
      intermediate: 'warning', 
      advanced: 'danger'
    };
    return colorMap[difficulty] || 'info';
  }

  // 獲取狀態標籤樣式
  getStatusTagType(status) {
    const typeMap = {
      draft: 'info',
      published: 'success'
    };
    return typeMap[status] || 'info';
  }

  // 生成用戶ID（用於匿名用戶）
  generateUserId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `user_${timestamp}_${random}`;
  }

  // 儲存用戶ID到本地儲存
  saveUserId(userId) {
    localStorage.setItem('playbook_user_id', userId);
  }

  // 從本地儲存獲取用戶ID
  getUserId() {
    let userId = localStorage.getItem('playbook_user_id');
    if (!userId) {
      userId = this.generateUserId();
      this.saveUserId(userId);
    }
    return userId;
  }

  // 儲存用戶姓名
  saveUserName(userName) {
    localStorage.setItem('playbook_user_name', userName);
  }

  // 獲取用戶姓名
  getUserName() {
    return localStorage.getItem('playbook_user_name') || '';
  }

  // 儲存PlayBook進度到本地（備份）
  savePlayBookProgress(playBookId, progress) {
    const key = `playbook_progress_${playBookId}`;
    const progressData = {
      ...progress,
      lastSaved: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(progressData));
  }

  // 獲取本地進度
  getLocalProgress(playBookId) {
    const key = `playbook_progress_${playBookId}`;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('解析本地進度失敗:', error);
      return null;
    }
  }

  // 清除用戶資料
  clearUserData() {
    // 保留用戶姓名，只清除ID
    localStorage.removeItem('playbook_user_id');
    // 可選：清除所有進度
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('playbook_progress_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // 清除特定PlayBook的進度
  clearPlayBookProgress(playBookId) {
    const key = `playbook_progress_${playBookId}`;
    localStorage.removeItem(key);
  }

  // 驗證步驟資料
  validateStep(step) {
    const errors = [];
    
    if (!step.type) {
      errors.push('步驟類型為必填');
    }
    
    if (!step.resourceId) {
      errors.push('請選擇資源');
    }
    
    if (!step.title?.trim()) {
      errors.push('步驟標題為必填');
    }
    
    if (step.timeLimit && step.timeLimit < 0) {
      errors.push('時間限制不能為負數');
    }
    
    return errors;
  }

  // 驗證PlayBook資料
  validatePlayBook(playBook) {
    const errors = [];
    
    if (!playBook.title?.trim()) {
      errors.push('PlayBook標題為必填');
    }
    
    if (!playBook.steps || playBook.steps.length === 0) {
      errors.push('至少需要一個步驟');
    }
    
    if (playBook.steps) {
      playBook.steps.forEach((step, index) => {
        const stepErrors = this.validateStep(step);
        stepErrors.forEach(error => {
          errors.push(`步驟 ${index + 1}: ${error}`);
        });
      });
    }
    
    return errors;
  }

  // 計算進度百分比
  calculateProgress(completedSteps, totalSteps) {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }

  // 獲取下一步驟
  getNextStep(currentStep, totalSteps) {
    return currentStep < totalSteps ? currentStep + 1 : null;
  }

  // 檢查是否可以訪問步驟
  canAccessStep(stepNumber, completedSteps) {
    // 第一步總是可以訪問
    if (stepNumber === 1) return true;
    
    // 確保 completedSteps 是陣列
    if (!Array.isArray(completedSteps)) {
      return false;
    }
    
    // 檢查前一步是否已完成
    return completedSteps.includes(stepNumber - 1);
  }

  // 格式化標籤字串
  tagsToString(tags) {
    return Array.isArray(tags) ? tags.join(', ') : '';
  }

  // 解析標籤字串
  parseTags(tagsString) {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
}

export default new PlayBookService();
