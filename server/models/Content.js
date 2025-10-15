const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const ContentImageSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  }
}, { _id: true });

const ContentSchema = new Schema({
  title: {
    type: String,
    required: [true, '標題為必填'],
    trim: true,
    maxlength: [200, '標題不能超過200個字元']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9\-]+$/, 'URL識別符只能包含小寫字母、數字和連字號']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, '摘要不能超過500個字元']
  },
  content: {
    type: String,
    required: [true, '內容為必填']
  },
  contentType: {
    type: String,
    enum: ['markdown', 'html', 'plain'],
    default: 'markdown',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    required: true
  },
  featuredImage: {
    type: ContentImageSchema,
    default: null
  },
  images: {
    type: [ContentImageSchema],
    default: []
  },
  tags: {
    type: [String],
    default: [],
    validate: [
      {
        validator: function(v) {
          return v.length <= 10;
        },
        message: '標籤數量不能超過10個'
      }
    ]
  },
  category: {
    type: String,
    trim: true,
    default: '一般'
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  publishedAt: {
    type: Date,
    default: null
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
  timestamps: true
});

// 索引優化
ContentSchema.index({ slug: 1 }, { unique: true });
ContentSchema.index({ status: 1, isPublic: 1 });
ContentSchema.index({ publishedAt: -1 });
ContentSchema.index({ createdBy: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ category: 1 });

// 虛擬字段：公開URL
ContentSchema.virtual('publicUrl').get(function() {
  return `/PlayBoard/content/${this.slug}`;
});

// 虛擬字段：是否已發布
ContentSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && Boolean(this.publishedAt);
});

// 創建slug的中間件
ContentSchema.pre('validate', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// 中間件：發布時設定發布日期
ContentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (this.isModified('status') && this.status !== 'published') {
    this.publishedAt = null;
  }
  
  next();
});

// 靜態方法：獲取公開內容
ContentSchema.statics.getPublicContent = function() {
  return this.find({ 
    status: 'published'
  }).sort({ publishedAt: -1 });
};

// 靜態方法：根據slug獲取公開內容
ContentSchema.statics.getPublicBySlug = function(slug) {
  return this.findOne({ 
    slug, 
    status: 'published'
  }).populate('createdBy', 'username');
};

// 靜態方法：根據ID獲取公開內容
ContentSchema.statics.getPublicById = function(id) {
  return this.findOne({ 
    _id: id, 
    status: 'published'
  }).populate('createdBy', 'username');
};

// 實例方法：增加瀏覽次數
ContentSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Content', ContentSchema);
