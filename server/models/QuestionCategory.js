// server/models/QuestionCategory.js - 題目分類模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, '分類名稱為必填'],
    trim: true,
    maxlength: [50, '分類名稱不能超過50個字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '分類描述不能超過200個字符']
  }
}, {
  timestamps: true
});

const QuestionCategory = mongoose.model('QuestionCategory', QuestionCategorySchema);

module.exports = QuestionCategory; 