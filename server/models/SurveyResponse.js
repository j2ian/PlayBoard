const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurveyResponseSchema = new Schema({
  survey: {
    type: Schema.Types.ObjectId,
    ref: 'Survey',
    required: [true, '問卷ID為必填']
  },
  studentName: {
    type: String,
    required: [true, '學生姓名為必填'],
    trim: true
  },
  playbook: {
    type: Schema.Types.ObjectId,
    ref: 'Playbook',
    required: false // 可能是獨立問卷，不一定屬於某個學習路徑
  },
  responses: {
    type: Map,
    of: Schema.Types.Mixed, // 可以是字串（文字題）或數字（李克特量表：1-5）
    required: [true, '回答內容為必填']
  },
  completionTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 索引優化
SurveyResponseSchema.index({ survey: 1, studentName: 1 });
SurveyResponseSchema.index({ survey: 1, createdAt: -1 });

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
