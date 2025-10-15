const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const CustomPageSchema = new Schema({
  title: {
    type: String,
    required: [true, '頁面標題為必填'],
    trim: true,
    maxlength: [200, '標題不能超過200個字元']
  },
  slug: {
    type: String,
    unique: true,
    required: [true, 'URL識別符為必填'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL識別符格式不正確']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '描述不能超過500個字元']
  },
  // ZIP 檔案資訊
  zipFile: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadPath: {
      type: String,
      required: true
    }
  },
  // 解壓後的檔案結構
  extractedFiles: [{
    filename: {
      type: String,
      required: true
    },
    relativePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['html', 'css', 'js', 'image', 'font', 'other'],
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  // 主入口檔案
  entryFile: {
    type: String,
    required: true,
    default: 'index.html'
  },
  // 頁面設定
  settings: {
    allowFullscreen: {
      type: Boolean,
      default: false
    },
    allowNavigation: {
      type: Boolean,
      default: true
    },
    autoProgress: {
      type: Boolean,
      default: false
    },
    progressTrigger: {
      type: String,
      enum: ['manual', 'timer', 'interaction', 'completion'],
      default: 'manual'
    },
    progressDelay: {
      type: Number,
      default: 0 // 秒數
    },
    completionCriteria: {
      type: String,
      trim: true
    }
  },
  // 狀態管理
  status: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'error', 'archived'],
    default: 'uploading'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  // 分類和標籤
  category: {
    type: String,
    trim: true,
    default: '客製化頁面'
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 10;
      },
      message: '標籤數量不能超過10個'
    }
  },
  // 統計資訊
  viewCount: {
    type: Number,
    default: 0
  },
  // 創建者資訊
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
CustomPageSchema.index({ slug: 1 }, { unique: true });
CustomPageSchema.index({ status: 1 });
CustomPageSchema.index({ createdBy: 1 });
CustomPageSchema.index({ category: 1 });

// 虛擬欄位
CustomPageSchema.virtual('publicUrl').get(function() {
  return `/PlayBoard/custom-pages/${this.slug}`;
});

CustomPageSchema.virtual('isReady').get(function() {
  return this.status === 'ready';
});

// 中間件：自動生成 slug
CustomPageSchema.pre('validate', function(next) {
  if ((this.isModified('title') || !this.slug) && this.title) {
    const base = slugify(this.title, { lower: true, strict: true });
    let generated = base;
    
    if (!generated || generated.trim() === '') {
      const random = Math.random().toString(36).slice(2, 8);
      generated = `custom-page-${random}`;
    }
    
    this.slug = generated;
  }
  next();
});

// 靜態方法：獲取可用的客製化頁面
CustomPageSchema.statics.getAvailablePages = function() {
  return this.find({ status: 'ready' })
    .select('title slug description category tags')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('CustomPage', CustomPageSchema);
