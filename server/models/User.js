// models/User.js - 用戶模型
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 定義用戶模式
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用戶名是必填項'],
    unique: true,
    trim: true,
    minlength: [3, '用戶名至少需要3個字符'],
    maxlength: [20, '用戶名不能超過20個字符']
  },
  password: {
    type: String,
    required: [true, '密碼是必填項'],
    minlength: [6, '密碼至少需要6個字符'],
    select: false // 查詢時預設不返回密碼
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請輸入有效的電子郵件地址']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 密碼加密中間件
UserSchema.pre('save', async function(next) {
  // 只有當密碼被修改時才進行加密
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // 生成鹽
    const salt = await bcrypt.genSalt(10);
    // 加密密碼
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 驗證密碼的方法
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 創建並導出用戶模型
const User = mongoose.model('User', UserSchema);
module.exports = User; 