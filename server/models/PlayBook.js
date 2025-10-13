const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

// PlayBook步驟Schema
const PlayBookStepSchema = new Schema({
  stepNumber: {
    type: Number,
    required: [true, '步驟編號為必填'],
    min: 1
  },
  type: {
    type: String,
    enum: ['content', 'exam', 'survey', 'customPage'],
    required: [true, '步驟類型為必填']
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: [true, '資源ID為必填'],
    refPath: 'steps.type' // 動態引用，根據type決定引用哪個Model
  },
  title: {
    type: String,
    required: [true, '步驟標題為必填'],
    trim: true,
    maxlength: [100, '步驟標題不能超過100個字元']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '步驟描述不能超過500個字元']
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  timeLimit: {
    type: Number, // 時間限制（分鐘）
    min: 0
  }
}, {
  _id: false // 不為子文件生成_id
});

// PlayBook主Schema
const PlayBookSchema = new Schema({
  title: {
    type: String,
    required: [true, 'PlayBook標題為必填'],
    trim: true,
    maxlength: [100, '標題不能超過100個字元']
  },
  slug: {
    type: String,
    unique: true,
    required: [true, 'URL識別符為必填'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL識別符格式不正確，只能包含小寫字母、數字和連字號']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, '描述不能超過1000個字元']
  },
  steps: {
    type: [PlayBookStepSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  estimatedTime: {
    type: Number, // 預估完成時間（分鐘）
    default: 0
  },
  tags: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: '標籤數量不能超過10個'
    }
  },
  category: {
    type: String,
    trim: true,
    default: '一般'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  displayType: {
    type: String,
    enum: ['overview', 'stepByStep'],
    default: 'overview',
    // overview: 顯示總覽頁面，用戶可以看到所有步驟
    // stepByStep: 直接進入步驟，逐步完成，不顯示總覽
  },
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
PlayBookSchema.index({ slug: 1 }, { unique: true });
PlayBookSchema.index({ status: 1, publishedAt: -1 });
PlayBookSchema.index({ category: 1 });
PlayBookSchema.index({ tags: 1 });
PlayBookSchema.index({ difficulty: 1 });

// 虛擬字段：總步驟數
PlayBookSchema.virtual('totalSteps').get(function() {
  return this.steps && Array.isArray(this.steps) ? this.steps.length : 0;
});

// 虛擬字段：必須步驟數
PlayBookSchema.virtual('requiredSteps').get(function() {
  return this.steps && Array.isArray(this.steps) ? this.steps.filter(step => step.isRequired).length : 0;
});

// 虛擬字段：是否已發布
PlayBookSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && Boolean(this.publishedAt);
});

// 虛擬字段：公開URL
PlayBookSchema.virtual('publicUrl').get(function() {
  return `/playbook/${this.slug}`;
});

// 虛擬字段：完成率
PlayBookSchema.virtual('completionRate').get(function() {
  if (this.viewCount === 0) return 0;
  return Math.round((this.completionCount / this.viewCount) * 100);
});

// 創建slug的中間件（保留英文/數字，中文標題使用安全備援）
PlayBookSchema.pre('validate', function(next) {
  try {
    if ((this.isModified('title') || this.slug == null || this.slug === '') && !this.slug) {
      const base = slugify(this.title || '', { lower: true, strict: true });
      let generated = base;

      // 若中文或無法轉換導致空字串，使用安全備援
      if (!generated || generated.trim() === '') {
        const random = Math.random().toString(36).slice(2, 8);
        generated = `pb-${random}`;
      }

      this.slug = generated;
    }
    next();
  } catch (e) {
    next(e);
  }
});

// 發布時設定發布日期的中間件
PlayBookSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'published' && this.publishedAt) {
    this.publishedAt = undefined;
  }
  
  // 自動計算預估時間（基於步驟數和類型）
  if (this.isModified('steps')) {
    this.estimatedTime = this.calculateEstimatedTime();
  }
  
  next();
});

// 計算預估完成時間
PlayBookSchema.methods.calculateEstimatedTime = function() {
  const timeByType = {
    content: 5,       // 內容平均5分鐘
    exam: 10,         // 測驗平均10分鐘
    survey: 3,        // 問卷平均3分鐘
    customPage: 8     // 客製化頁面平均8分鐘
  };
  
  if (!this.steps || !Array.isArray(this.steps)) {
    return 0;
  }
  
  return this.steps.reduce((total, step) => {
    return total + (timeByType[step.type] || 5);
  }, 0);
};

// 新增步驟
PlayBookSchema.methods.addStep = function(stepData) {
  if (!this.steps || !Array.isArray(this.steps)) {
    this.steps = [];
  }
  const nextStepNumber = this.steps.length + 1;
  const newStep = {
    stepNumber: nextStepNumber,
    ...stepData
  };
  this.steps.push(newStep);
  return this.save();
};

// 移除步驟
PlayBookSchema.methods.removeStep = function(stepNumber) {
  if (!this.steps || !Array.isArray(this.steps)) {
    return this.save();
  }
  this.steps = this.steps.filter(step => step.stepNumber !== stepNumber);
  // 重新編號
  this.steps.forEach((step, index) => {
    step.stepNumber = index + 1;
  });
  return this.save();
};

// 重新排序步驟
PlayBookSchema.methods.reorderSteps = function(newOrder) {
  if (!this.steps || !Array.isArray(this.steps)) {
    throw new Error('沒有步驟可以重新排序');
  }
  
  if (newOrder.length !== this.steps.length) {
    throw new Error('新順序的步驟數量不匹配');
  }
  
  const reorderedSteps = newOrder.map((stepId, index) => {
    const step = this.steps.id(stepId);
    if (!step) {
      throw new Error(`找不到步驟 ID: ${stepId}`);
    }
    step.stepNumber = index + 1;
    return step;
  });
  
  this.steps = reorderedSteps;
  return this.save();
};

// 增加瀏覽次數
PlayBookSchema.methods.incrementViewCount = async function() {
  this.viewCount++;
  await this.save();
  return this.viewCount;
};

// 增加完成次數
PlayBookSchema.methods.incrementCompletionCount = async function() {
  this.completionCount++;
  await this.save();
  return this.completionCount;
};

// 靜態方法：獲取公開且已發布的PlayBook（僅依 status）
PlayBookSchema.statics.getPublicPlayBooks = function(query = {}) {
  return this.find({ 
    status: 'published', 
    ...query 
  })
  .populate('createdBy', 'username')
  .sort({ publishedAt: -1 });
};

// 靜態方法：根據slug獲取公開PlayBook（僅依 status）
PlayBookSchema.statics.getPublicBySlug = async function(slug) {
  const playbook = await this.findOne({ 
    slug, 
    status: 'published'
  })
  .populate('createdBy', 'username');
  
  if (playbook) {
    await playbook.incrementViewCount();
  }
  
  return playbook;
};

// 靜態方法：驗證步驟資源是否存在
PlayBookSchema.statics.validateStepResources = async function(steps) {
  const Content = mongoose.model('Content');
  const Exam = mongoose.model('Exam');
  const Survey = mongoose.model('Survey');
  const CustomPage = mongoose.model('CustomPage');
  
  for (const step of steps) {
    let model;
    switch (step.type) {
      case 'content':
        model = Content;
        break;
      case 'exam':
        model = Exam;
        break;
      case 'survey':
        model = Survey;
        break;
      case 'customPage':
        model = CustomPage;
        break;
      default:
        throw new Error(`未知的步驟類型: ${step.type}`);
    }
    
    const resource = await model.findById(step.resourceId);
    if (!resource) {
      throw new Error(`找不到${step.type}資源: ${step.resourceId}`);
    }
    
    // 檢查資源是否可用
    if (step.type === 'content' && resource.status !== 'published') {
      throw new Error(`內容資源未發布: ${step.resourceId}`);
    }
    
    if (step.type === 'customPage' && resource.status !== 'ready') {
      throw new Error(`客製化頁面未準備就緒: ${step.resourceId}`);
    }
  }
  
  return true;
};

module.exports = mongoose.model('PlayBook', PlayBookSchema);
