// server/controllers/userController.js - 用戶 CRUD 控制器
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 取得所有用戶
exports.getUsers = async (req, res) => {
  try {
    const { search, sort, page = 1, pageSize = 10 } = req.query;
    const query = {};

    // 搜尋功能
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // 排序選項
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'usernameAsc') sortOption = { username: 1 };
    if (sort === 'usernameDesc') sortOption = { username: -1 };
    if (sort === 'emailAsc') sortOption = { email: 1 };
    if (sort === 'emailDesc') sortOption = { email: -1 };
    if (sort === 'roleAsc') sortOption = { role: 1 };
    if (sort === 'roleDesc') sortOption = { role: -1 };
    if (sort === 'updatedDesc') sortOption = { updatedAt: -1 };
    if (sort === 'updatedAsc') sortOption = { updatedAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: total, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法獲取用戶列表', error: error.message });
  }
};

// 取得單一用戶
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: '找不到該用戶' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法獲取用戶詳情', error: error.message });
  }
};

// 建立新用戶
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role, active, avatar } = req.body;

    // 檢查用戶名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用戶名已存在' });
    }

    // 檢查郵箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: '電子郵件已存在' });
      }
    }

    // 創建新用戶
    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      active: active !== undefined ? active : true,
      avatar: avatar || ''
    });

    await user.save();

    // 返回不包含密碼的用戶資料
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '無法建立用戶', error: error.message });
  }
};

// 更新用戶
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, role, active, avatar } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '找不到該用戶' });
    }

    // 檢查用戶名是否被其他用戶使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, message: '用戶名已被使用' });
      }
      user.username = username;
    }

    // 檢查郵箱是否被其他用戶使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: '電子郵件已被使用' });
      }
      user.email = email;
    }

    // 更新其他欄位
    if (password) {
      user.password = password; // 會在 pre-save middleware 中自動加密
    }
    if (role !== undefined) user.role = role;
    if (active !== undefined) user.active = active;
    if (avatar !== undefined) user.avatar = avatar;

    user.updatedAt = Date.now();

    await user.save();

    // 返回不包含密碼的用戶資料
    const userResponse = await User.findById(user._id).select('-password');

    res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '無法更新用戶', error: error.message });
  }
};

// 刪除用戶
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '找不到該用戶' });
    }

    // 防止刪除自己的帳號
    if (req.user && req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: '不能刪除自己的帳號' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: '用戶已成功刪除', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法刪除用戶', error: error.message });
  }
};
