const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurveyQuestionSchema = new Schema({
  text: {
    type: String,
    required: [true, '問題內容為必填'],
    trim: true
  },
  type: {
    type: String,
    enum: ['single', 'multiple', 'text', 'likert'],
    required: true,
    default: 'single'
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        // text 和 likert 不需選項，單選/多選必須有選項
        if (this.type === 'text' || this.type === 'likert') return true;
        return Array.isArray(v) && v.length >= 2;
      },
      message: '選擇題至少需要兩個選項'
    },
    default: undefined // 若 type=text 或 likert 不存 options 欄位
  },
  isPositive: {
    type: Boolean,
    default: true, // true: 正面，false: 負面
    required: true
  }
});

const SurveySchema = new Schema({
  title: {
    type: String,
    required: [true, '問卷標題為必填'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: {
    type: [SurveyQuestionSchema],
    required: true,
    validate: [arr => arr.length > 0, '問卷至少需要一個問題']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Survey', SurveySchema); 