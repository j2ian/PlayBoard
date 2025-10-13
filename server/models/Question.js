// server/models/Question.js - 題目模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 選項的 Schema
const OptionSchema = new Schema({
  text: {
    type: String,
    required: [true, '選項內容為必填'],
    trim: true
  }
});

// 題目的 Schema
const QuestionSchema = new Schema({
  text: {
    type: String,
    required: [true, '題目描述為必填'],
    trim: true
  },
  type: {
    type: String,
    enum: ['single', 'multiple'],
    required: [true, '題目類型為必填 (single 或 multiple)'],
    default: 'single'
  },
  options: {
    type: [OptionSchema],
    validate: [
      {
        validator: function(v) {
          return v && v.length >= 2;
        },
        message: '每個題目至少需要2個選項'
      }
    ]
  },
  correctAnswer: {
    type: [Schema.Types.ObjectId],
    required: true,
    validate: [
      {
        validator: function(v) {
          // 單選題必須只有一個答案
          if (this.type === 'single' && v.length !== 1) {
            return false;
          }
          // 複選題至少需要兩個答案
          if (this.type === 'multiple' && v.length < 2) {
            return false;
          }
          // 必須有答案
          if (v.length === 0) {
            return false;
          }
          // 答案必須存在於選項中
          const optionIds = this.options.map(opt => opt._id.toString());
          return v.every(answerId => optionIds.includes(answerId.toString()));
        },
        message: '答案配置無效 (答案ID不存在於選項中，單選題只能有一個答案，複選題至少需要兩個答案，或題目沒有正確答案)'
      }
    ]
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionCategory'
  },
  exams: [{
    type: Schema.Types.ObjectId,
    ref: 'Exam' // 關聯到 Exam Model
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User' // 關聯到 User Model
  },
}, {
  timestamps: true
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question; 