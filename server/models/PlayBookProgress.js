const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlayBookProgressSchema = new Schema({
  playBook: {
    type: Schema.Types.ObjectId,
    ref: 'PlayBook',
    required: [true, 'PlayBook ID為必填']
  },
  userId: {
    type: String,
    required: [true, '用戶ID為必填'],
    trim: true
  },
  userName: {
    type: String,
    trim: true,
    default: '匿名用戶'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1
  },
  completedSteps: {
    type: [Number],
    default: []
  },
  stepResults: {
    type: Map,
    of: Schema.Types.Mixed, // 存儲每個步驟的結果
    default: new Map()
  },
  totalSteps: {
    type: Number,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // 總花費時間（秒）
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 複合索引
PlayBookProgressSchema.index({ playBook: 1, userId: 1 }, { unique: true });
PlayBookProgressSchema.index({ playBook: 1, isCompleted: 1 });
PlayBookProgressSchema.index({ userId: 1, lastActiveAt: -1 });

// 虛擬字段：進度百分比
PlayBookProgressSchema.virtual('progressPercentage').get(function() {
  if (this.totalSteps === 0) return 0;
  const completedCount = Array.isArray(this.completedSteps) ? this.completedSteps.length : 0;
  return Math.round((completedCount / this.totalSteps) * 100);
});

// 虛擬字段：剩餘步驟數
PlayBookProgressSchema.virtual('remainingSteps').get(function() {
  const completedCount = Array.isArray(this.completedSteps) ? this.completedSteps.length : 0;
  return this.totalSteps - completedCount;
});

// 虛擬字段：是否為新用戶
PlayBookProgressSchema.virtual('isNewUser').get(function() {
  const completedCount = Array.isArray(this.completedSteps) ? this.completedSteps.length : 0;
  return completedCount === 0;
});

// 中間件：更新最後活動時間
PlayBookProgressSchema.pre('save', function(next) {
  this.lastActiveAt = new Date();
  
  // 確保 completedSteps 是陣列
  if (!Array.isArray(this.completedSteps)) {
    this.completedSteps = [];
  }
  
  // 計算完成率
  if (this.totalSteps > 0) {
    this.completionRate = (this.completedSteps.length / this.totalSteps) * 100;
  }
  
  // 檢查是否完成
  if (this.completedSteps.length === this.totalSteps && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  next();
});

// 完成步驟
PlayBookProgressSchema.methods.completeStep = function(stepNumber, result = null) {
  // 確保 completedSteps 是陣列
  if (!Array.isArray(this.completedSteps)) {
    this.completedSteps = [];
  }
  
  if (!this.completedSteps.includes(stepNumber)) {
    this.completedSteps.push(stepNumber);
    this.completedSteps.sort((a, b) => a - b); // 保持排序
  }
  
  // 儲存步驟結果
  if (result) {
    this.stepResults.set(stepNumber.toString(), result);
  }
  
  // 更新當前步驟為下一步
  if (stepNumber === this.currentStep && this.currentStep < this.totalSteps) {
    this.currentStep = stepNumber + 1;
  }
  
  return this.save();
};

// 回到指定步驟
PlayBookProgressSchema.methods.goToStep = function(stepNumber) {
  if (stepNumber < 1 || stepNumber > this.totalSteps) {
    throw new Error('無效的步驟編號');
  }
  
  this.currentStep = stepNumber;
  return this.save();
};

// 重置進度
PlayBookProgressSchema.methods.reset = function() {
  this.currentStep = 1;
  this.completedSteps = [];
  this.stepResults.clear();
  this.timeSpent = 0;
  this.isCompleted = false;
  this.completedAt = undefined;
  this.startedAt = new Date();
  this.completionRate = 0;
  
  return this.save();
};

// 新增時間記錄
PlayBookProgressSchema.methods.addTimeSpent = function(seconds) {
  this.timeSpent += seconds;
  return this.save();
};

// 獲取步驟結果
PlayBookProgressSchema.methods.getStepResult = function(stepNumber) {
  return this.stepResults.get(stepNumber.toString());
};

// 檢查步驟是否已完成
PlayBookProgressSchema.methods.isStepCompleted = function(stepNumber) {
  const completedSteps = Array.isArray(this.completedSteps) ? this.completedSteps : [];
  return completedSteps.includes(stepNumber);
};

// 檢查是否可以訪問指定步驟
PlayBookProgressSchema.methods.canAccessStep = function(stepNumber) {
  if (stepNumber === 1) return true;
  
  // 檢查前一步是否已完成（線性進度）
  return this.isStepCompleted(stepNumber - 1);
};

// 靜態方法：創建或獲取進度
PlayBookProgressSchema.statics.createOrGet = async function(playBookId, userId, userName = '匿名用戶') {
  let progress = await this.findOne({ playBook: new mongoose.Types.ObjectId(playBookId), userId });
  
  if (!progress) {
    // 獲取PlayBook資訊
    const PlayBook = mongoose.model('PlayBook');
    const playbook = await PlayBook.findById(new mongoose.Types.ObjectId(playBookId));
    
    if (!playbook) {
      throw new Error('PlayBook不存在');
    }
    
    progress = new this({
      playBook: new mongoose.Types.ObjectId(playBookId),
      userId,
      userName,
      totalSteps: playbook.totalSteps,
      currentStep: 1,
      completedSteps: [],
      stepResults: new Map()
    });
    
    await progress.save();
  } else {
    // 確保現有進度記錄有正確的預設值
    if (!Array.isArray(progress.completedSteps)) {
      progress.completedSteps = [];
    }
    if (!progress.stepResults) {
      progress.stepResults = new Map();
    }
    if (!progress.totalSteps) {
      const PlayBook = mongoose.model('PlayBook');
      const playbookData = await PlayBook.findById(new mongoose.Types.ObjectId(playBookId));
      if (playbookData) {
        progress.totalSteps = playbookData.totalSteps;
      }
    }
    
    // 如果有任何更新，儲存一下
    if (progress.isModified()) {
      await progress.save();
    }
  }
  
  return progress;
};

// 靜態方法：獲取PlayBook統計
PlayBookProgressSchema.statics.getPlayBookStats = async function(playBookId) {
  const stats = await this.aggregate([
    { $match: { playBook: new mongoose.Types.ObjectId(playBookId) } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        completedUsers: { $sum: { $cond: { if: '$isCompleted', then: 1, else: 0 } } },
        averageProgress: { $avg: '$completionRate' },
        averageTimeSpent: { $avg: '$timeSpent' },
        // 新增更詳細的時間統計
        minTimeSpent: { $min: '$timeSpent' },
        maxTimeSpent: { $max: '$timeSpent' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalUsers: 0,
      completedUsers: 0,
      completionRate: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      minTimeSpent: 0,
      maxTimeSpent: 0,
      totalTimeSpent: 0
    };
  }
  
  const result = stats[0];
  return {
    totalUsers: result.totalUsers,
    completedUsers: result.completedUsers,
    completionRate: result.totalUsers > 0 ? (result.completedUsers / result.totalUsers) * 100 : 0,
    averageProgress: Math.round(result.averageProgress || 0),
    averageTimeSpent: Math.round(result.averageTimeSpent || 0),
    minTimeSpent: Math.round(result.minTimeSpent || 0),
    maxTimeSpent: Math.round(result.maxTimeSpent || 0),
    totalTimeSpent: Math.round(result.totalTimeSpent || 0)
  };
};

// 靜態方法：獲取步驟統計
PlayBookProgressSchema.statics.getStepStats = async function(playBookId) {
  const progresses = await this.find({ playBook: new mongoose.Types.ObjectId(playBookId) });
  const stepStats = {};
  
  progresses.forEach(progress => {
    // 確保 completedSteps 是陣列
    const completedSteps = Array.isArray(progress.completedSteps) ? progress.completedSteps : [];
    
    completedSteps.forEach(stepNumber => {
      const stepKey = stepNumber.toString();
      if (!stepStats[stepKey]) {
        stepStats[stepKey] = 0;
      }
      stepStats[stepKey]++;
    });
  });
  
  // 確保返回的統計資料包含所有步驟，即使沒有人完成
  const PlayBook = mongoose.model('PlayBook');
  const playbook = await PlayBook.findById(new mongoose.Types.ObjectId(playBookId));
  
  if (playbook && playbook.steps) {
    for (let i = 1; i <= playbook.steps.length; i++) {
      const stepKey = i.toString();
      if (!stepStats[stepKey]) {
        stepStats[stepKey] = 0;
      }
    }
  }
  
  return stepStats;
};

// 靜態方法：獲取PlayBook詳細用戶結果（用於下載）
PlayBookProgressSchema.statics.getPlayBookUserResults = async function(playBookId) {
  const progresses = await this.find({ playBook: new mongoose.Types.ObjectId(playBookId) })
    .populate('playBook', 'title slug description category difficulty')
    .sort({ createdAt: -1 });

  const results = progresses.map(progress => {
    const stepDetails = [];
    
    // 處理步驟結果
    if (progress.stepResults && progress.stepResults.size > 0) {
      progress.stepResults.forEach((result, stepNumber) => {
        const timeRecord = result.timeRecord || {};
        const detail = {
          stepNumber: parseInt(stepNumber),
          stepTitle: result.contentTitle || result.examTitle || result.surveyTitle || `步驟 ${stepNumber}`,
          stepType: result.type || 'unknown',
          completedAt: result.completedAt || timeRecord.timestamp,
          timeSpent: timeRecord.stepTimeSpent || result.timeSpent || 0,
          readTime: timeRecord.readTime || 0,
          startTime: timeRecord.stepStartTime || result.startTime,
          endTime: timeRecord.stepEndTime || result.endTime
        };
        
        // 若為測驗，加入分數與通過
        if (result.type === 'exam') {
          detail.examId = result.examId;
          detail.examTitle = result.examTitle;
          detail.score = result.score;
          detail.passed = result.passed;
        }
        
        // 若為問卷，加入完整答案
        if (result.type === 'survey') {
          detail.surveyId = result.surveyId;
          detail.surveyTitle = result.surveyTitle;
          detail.answers = result.answers || result.responses || {};
        }
        
        stepDetails.push(detail);
      });
    }

    return {
      userId: progress.userId,
      userName: progress.userName,
      playBookTitle: progress.playBook?.title || '未知',
      playBookSlug: progress.playBook?.slug || '',
      startedAt: progress.startedAt,
      completedAt: progress.completedAt,
      lastActiveAt: progress.lastActiveAt,
      isCompleted: progress.isCompleted,
      completionRate: progress.completionRate,
      totalTimeSpent: progress.timeSpent,
      currentStep: progress.currentStep,
      completedSteps: progress.completedSteps,
      stepDetails: stepDetails,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt
    };
  });

  return results;
};

module.exports = mongoose.model('PlayBookProgress', PlayBookProgressSchema);
