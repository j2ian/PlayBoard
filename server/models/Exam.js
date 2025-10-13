// server/models/Exam.js - 測驗模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamSchema = new Schema({
  title: {
    type: String,
    required: [true, '測驗標題為必填'],
    trim: true,
    maxlength: [150, '測驗標題不能超過150個字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '測驗描述不能超過500個字符']
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question', // 關聯到單一題目
    required: true
  }],
  timeLimit: {
    type: Number,
    min: [0, '時間限制不能為負數'],
    default: 0,
    comment: '測驗時間限制（分鐘），0表示無限制'
  },
  passingScore: {
    type: Number,
    min: [0, '及格分數不能為負數'],
    max: [100, '及格分數不能超過100'],
    default: 60,
    comment: '測驗及格分數（百分比）'
  },
  isActive: {
    type: Boolean,
    default: true,
    comment: '測驗是否啟用'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});

// 驗證測驗至少包含一個題目
ExamSchema.path('questions').validate(function (questions) {
  return questions && questions.length > 0;
}, '測驗至少需要包含一個題目');

const Exam = mongoose.model('Exam', ExamSchema);

module.exports = Exam; 