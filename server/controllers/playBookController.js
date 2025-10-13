const PlayBook = require('../models/PlayBook');
const PlayBookProgress = require('../models/PlayBookProgress');
const Content = require('../models/Content');
const Exam = require('../models/Exam');
const Survey = require('../models/Survey');
const CustomPage = require('../models/CustomPage');

// @desc    獲取所有PlayBook (管理員)
// @route   GET /api/playbooks
// @access  Private/Admin
const getPlayBooks = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = '',
      status = 'all',
      category = 'all',
      difficulty = 'all',
      sortBy = 'latest'
    } = req.query;

    const query = {};
    
    // 搜尋條件
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // 狀態篩選
    if (status !== 'all') {
      query.status = status;
    }
    
    // 分類篩選
    if (category !== 'all') {
      query.category = category;
    }
    
    // 難度篩選
    if (difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    // 排序選項
    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      titleAsc: { title: 1 },
      titleDesc: { title: -1 },
      publishedDesc: { publishedAt: -1 },
      publishedAsc: { publishedAt: 1 },
      viewCount: { viewCount: -1 },
      completionCount: { completionCount: -1 }
    };

    const playbooks = await PlayBook.find(query)
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')
      .sort(sortOptions[sortBy] || { createdAt: -1 })
      .limit(pageSize * 1)
      .skip((page - 1) * pageSize);

    const total = await PlayBook.countDocuments(query);

    res.json({
      success: true,
      data: playbooks,
      count: total,
      pages: Math.ceil(total / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('獲取PlayBook列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    根據ID獲取PlayBook (管理員)
// @route   GET /api/playbooks/:id
// @access  Private/Admin
const getPlayBook = async (req, res) => {
  try {
    let playbook = await PlayBook.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username');

    if (!playbook) {
      return res.status(404).json({
        success: false,
        message: 'PlayBook不存在'
      });
    }

    // 先轉為 plain object 再填充步驟的資源資訊，確保可序列化
    if (playbook && typeof playbook.toObject === 'function') {
      playbook = playbook.toObject();
    }
    await populateStepResources(playbook);

    res.json({
      success: true,
      data: playbook
    });
  } catch (error) {
    console.error('獲取PlayBook失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    創建PlayBook
// @route   POST /api/playbooks
// @access  Private/Admin
const createPlayBook = async (req, res) => {
  try {
    let {
      title,
      description,
      category,
      difficulty,
      displayType,
      tags,
      steps,
      status,
      isPublic
    } = req.body;

    // 兼容前端可能以字串傳遞布林值的情況
    if (typeof isPublic === 'string') {
      isPublic = isPublic === 'true';
    }

    // 驗證步驟資源
    if (steps && steps.length > 0) {
      await PlayBook.validateStepResources(steps);
    }

    const playbook = new PlayBook({
      title,
      description,
      category,
      difficulty,
      displayType,
      tags,
      steps: steps || [],
      ...(status ? { status } : {}),
      ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
      createdBy: req.user.id
    });

    const savedPlayBook = await playbook.save();
    await savedPlayBook.populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      data: savedPlayBook,
      message: 'PlayBook創建成功'
    });
  } catch (error) {
    console.error('創建PlayBook失敗:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '資料驗證失敗',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || '伺服器錯誤' 
    });
  }
};

// @desc    更新PlayBook
// @route   PUT /api/playbooks/:id
// @access  Private/Admin
const updatePlayBook = async (req, res) => {
  try {
    const playbook = await PlayBook.findById(req.params.id);
    
    if (!playbook) {
      return res.status(404).json({
        success: false,
        message: 'PlayBook不存在'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      displayType,
      tags,
      steps,
      status,
      isPublic
    } = req.body;

    // 驗證步驟資源
    if (steps && steps.length > 0) {
      await PlayBook.validateStepResources(steps);
    }

    // 更新字段
    if (title !== undefined) playbook.title = title;
    if (description !== undefined) playbook.description = description;
    if (category !== undefined) playbook.category = category;
    if (difficulty !== undefined) playbook.difficulty = difficulty;
    if (displayType !== undefined) playbook.displayType = displayType;
    if (tags !== undefined) playbook.tags = tags;
    if (steps !== undefined) playbook.steps = steps;
    if (status !== undefined) playbook.status = status;
    if (isPublic !== undefined) playbook.isPublic = isPublic;
    
    playbook.lastModifiedBy = req.user.id;

    const updatedPlayBook = await playbook.save();
    await updatedPlayBook.populate(['createdBy', 'lastModifiedBy'], 'username');

    res.json({
      success: true,
      data: updatedPlayBook,
      message: 'PlayBook更新成功'
    });
  } catch (error) {
    console.error('更新PlayBook失敗:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: '資料驗證失敗',
        errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || '伺服器錯誤' 
    });
  }
};

// @desc    刪除PlayBook
// @route   DELETE /api/playbooks/:id
// @access  Private/Admin
const deletePlayBook = async (req, res) => {
  try {
    const playbook = await PlayBook.findById(req.params.id);
    
    if (!playbook) {
      return res.status(404).json({
        success: false,
        message: 'PlayBook不存在'
      });
    }

    // 僅限制已發布的PlayBook不可刪除；未發布(draft/archived)允許刪除
    if (playbook.status === 'published') {
      return res.status(400).json({
        success: false,
        message: '已發布的PlayBook不可刪除，請先變更狀態'
      });
    }

    await PlayBook.findByIdAndDelete(req.params.id);
    
    // 刪除相關的進度記錄
    await PlayBookProgress.deleteMany({ playBook: req.params.id });

    res.json({
      success: true,
      message: 'PlayBook刪除成功'
    });
  } catch (error) {
    console.error('刪除PlayBook失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    獲取公開PlayBook列表
// @route   GET /api/playbooks/public
// @access  Public
const getPublicPlayBooks = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 12,
      category = '',
      difficulty = '',
      search = ''
    } = req.query;

    const query = { status: 'published' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const playbooks = await PlayBook.find(query)
      .populate('createdBy', 'username')
      .select('-steps') // 不返回詳細步驟，只返回概要
      .sort({ publishedAt: -1 })
      .limit(pageSize * 1)
      .skip((page - 1) * pageSize);

    const total = await PlayBook.countDocuments(query);

    res.json({
      success: true,
      data: playbooks,
      count: total,
      pages: Math.ceil(total / pageSize),
      currentPage: page
    });
  } catch (error) {
    console.error('獲取公開PlayBook列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    根據slug獲取公開PlayBook詳情
// @route   GET /api/playbooks/public/:slug
// @access  Public
const getPublicPlayBook = async (req, res) => {
  try {
    let playbook = await PlayBook.getPublicBySlug(req.params.slug);
    
    if (!playbook) {
      return res.status(404).json({
        success: false,
        message: 'PlayBook不存在或未發布'
      });
    }

    // 先轉為 plain object 再填充步驟資源
    if (playbook && typeof playbook.toObject === 'function') {
      playbook = playbook.toObject();
    }
    await populateStepResources(playbook);

    res.json({
      success: true,
      data: playbook
    });
  } catch (error) {
    console.error('獲取公開PlayBook失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    獲取或創建用戶進度
// @route   POST /api/playbooks/:id/progress
// @access  Public
const getOrCreateProgress = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用戶ID為必填'
      });
    }

    const progress = await PlayBookProgress.createOrGet(
      req.params.id,
      userId,
      userName
    );

    await progress.populate('playBook', 'title totalSteps');

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('獲取用戶進度失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || '伺服器錯誤' 
    });
  }
};

// @desc    更新步驟進度
// @route   PUT /api/playbooks/:id/progress/:stepNumber
// @access  Public
const updateStepProgress = async (req, res) => {
  try {
    const { userId, result, timeSpent } = req.body;
    const stepNumber = parseInt(req.params.stepNumber);
    
    const progress = await PlayBookProgress.findOne({
      playBook: req.params.id,
      userId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: '用戶進度不存在'
      });
    }

    // 檢查是否可以訪問此步驟
    if (!progress.canAccessStep(stepNumber)) {
      return res.status(403).json({
        success: false,
        message: '無法訪問此步驟，請先完成前面的步驟'
      });
    }

    // 完成步驟
    await progress.completeStep(stepNumber, result);
    
    // 新增時間記錄
    if (timeSpent) {
      await progress.addTimeSpent(timeSpent);
    }

    // 如果完成了所有步驟，增加PlayBook的完成計數
    if (progress.isCompleted) {
      const playbook = await PlayBook.findById(req.params.id);
      if (playbook) {
        await playbook.incrementCompletionCount();
      }
    }

    res.json({
      success: true,
      data: progress,
      message: '步驟進度更新成功'
    });
  } catch (error) {
    console.error('更新步驟進度失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    更新客製化頁面進度
// @route   PUT /api/playbooks/:id/progress/custom-page/:stepNumber
// @access  Public
const updateCustomPageProgress = async (req, res) => {
  try {
    const { stepNumber, progressData } = req.body;
    const userId = req.body.userId || req.query.userId;
    
    const progress = await PlayBookProgress.findOne({
      playBook: req.params.id,
      userId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: '用戶進度不存在'
      });
    }

    // 檢查是否可以訪問此步驟
    if (!progress.canAccessStep(stepNumber)) {
      return res.status(403).json({
        success: false,
        message: '無法訪問此步驟，請先完成前面的步驟'
      });
    }

    // 根據完成與否決定行為
    if (progressData && progressData.completed === true) {
      await progress.completeStep(stepNumber, {
        ...progressData,
        completed: true,
        completedAt: new Date()
      });
      if (typeof progressData.timeSpent === 'number' && progressData.timeSpent > 0) {
        await progress.addTimeSpent(progressData.timeSpent);
      }
    } else {
      // 僅同步進度，不標記完成
      if (!progress.stepResults) {
        progress.stepResults = new Map();
      }
      progress.stepResults.set(String(stepNumber), {
        ...progressData,
        updatedAt: new Date()
      });
      await progress.save();
    }

    // 如果完成了所有步驟，增加PlayBook的完成計數
    if (progress.isCompleted) {
      const playbook = await PlayBook.findById(req.params.id);
      if (playbook) {
        await playbook.incrementCompletionCount();
      }
    }

    res.json({
      success: true,
      data: progress,
      message: '客製化頁面進度更新成功'
    });
  } catch (error) {
    console.error('更新客製化頁面進度失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    重置用戶在指定PlayBook的進度
// @route   POST /api/playbooks/:id/progress/reset
// @access  Public
const resetProgress = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '用戶ID為必填'
      });
    }

    const progress = await PlayBookProgress.findOne({
      playBook: req.params.id,
      userId
    });

    if (!progress) {
      // 若不存在，直接回傳成功，視為已重置
      return res.json({ success: true, data: null, message: '進度已重置' });
    }

    await progress.reset();

    res.json({
      success: true,
      data: progress,
      message: '進度已重置'
    });
  } catch (error) {
    console.error('重置進度失敗:', error);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
};

// @desc    獲取PlayBook統計
// @route   GET /api/playbooks/:id/stats
// @access  Private/Admin
const getPlayBookStats = async (req, res) => {
  try {
    const stats = await PlayBookProgress.getPlayBookStats(req.params.id);
    const stepStats = await PlayBookProgress.getStepStats(req.params.id);

    res.json({
      success: true,
      data: {
        overview: stats,
        stepStats
      }
    });
  } catch (error) {
    console.error('獲取PlayBook統計失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    下載PlayBook用戶結果
// @route   GET /api/playbooks/:id/download
// @access  Private/Admin
const downloadPlayBookResults = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    // 獲取PlayBook資訊
    const playbook = await PlayBook.findById(req.params.id);
    if (!playbook) {
      return res.status(404).json({
        success: false,
        message: 'PlayBook不存在'
      });
    }

    // 獲取詳細的用戶結果
    const userResults = await PlayBookProgress.getPlayBookUserResults(req.params.id);
    
    // 準備下載數據
    const downloadData = {
      playBook: {
        id: playbook._id,
        title: playbook.title,
        slug: playbook.slug,
        description: playbook.description,
        category: playbook.category,
        difficulty: playbook.difficulty,
        totalSteps: playbook.totalSteps,
        createdAt: playbook.createdAt,
        publishedAt: playbook.publishedAt
      },
      summary: {
        totalUsers: userResults.length,
        completedUsers: userResults.filter(r => r.isCompleted).length,
        averageCompletionRate: userResults.length > 0 
          ? Math.round(userResults.reduce((sum, r) => sum + r.completionRate, 0) / userResults.length)
          : 0,
        averageTimeSpent: userResults.length > 0
          ? Math.round(userResults.reduce((sum, r) => sum + r.totalTimeSpent, 0) / userResults.length)
          : 0,
        exportDate: new Date().toISOString()
      },
      userResults: userResults
    };

    // 根據格式返回數據
    if (format === 'csv') {
      // 生成CSV格式
      const csvData = generateCSV(downloadData);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="playbook_${playbook.slug}_results.csv"`);
      res.send('\uFEFF' + csvData); // 新增BOM以支援中文
    } else {
      // 預設JSON格式
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="playbook_${playbook.slug}_results.json"`);
      res.json(downloadData);
    }
  } catch (error) {
    console.error('下載PlayBook結果失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// @desc    獲取分類列表
// @route   GET /api/playbooks/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await PlayBook.distinct('category', {
      status: 'published',
      isPublic: true
    });

    res.json({
      success: true,
      data: categories.filter(Boolean)
    });
  } catch (error) {
    console.error('獲取分類列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤' 
    });
  }
};

// 輔助函數：填充步驟資源
const populateStepResources = async (playbook) => {
  if (!playbook.steps || playbook.steps.length === 0) {
    return;
  }

  for (let step of playbook.steps) {
    try {
      let resource;
      
      switch (step.type) {
        case 'content':
          resource = await Content.findById(step.resourceId)
            .select('title excerpt featuredImage status slug');
          break;
        case 'exam':
          resource = await Exam.findById(step.resourceId)
            .select('title description timeLimit questionCount');
          break;
        case 'survey':
          resource = await Survey.findById(step.resourceId)
            .select('title description questions');
          break;
        case 'customPage':
          resource = await CustomPage.findById(step.resourceId)
            .select('title description slug status settings');
          break;
      }
      
      if (resource) {
        step.resource = resource;
      } else {
        console.warn(`找不到 ${step.type} 資源，ID: ${step.resourceId}`);
        step.resource = null;
      }
    } catch (error) {
      console.error(`載入步驟資源時發生錯誤 (${step.type}, ${step.resourceId}):`, error);
      step.resource = null;
    }
  }
};

// 生成CSV格式數據
const generateCSV = (data) => {
  const { playBook, summary, userResults } = data;
  
  let csv = '';
  
  // 新增標題和摘要
  csv += `PlayBook: ${playBook.title}\n`;
  csv += `導出時間: ${summary.exportDate}\n`;
  csv += `總用戶數: ${summary.totalUsers}\n`;
  csv += `完成用戶數: ${summary.completedUsers}\n`;
  csv += `平均完成率: ${summary.averageCompletionRate}%\n`;
  csv += `平均完成時間: ${Math.round(summary.averageTimeSpent / 60)}分鐘\n\n`;
  
  // 新增用戶結果標題行
  csv += '用戶ID,用戶姓名,開始時間,完成時間,最後活動時間,是否完成,完成率(%),總時間(秒),當前步驟,已完成步驟,步驟詳情\n';
  
  // 新增用戶數據
  userResults.forEach(user => {
    const stepDetailsStr = user.stepDetails.map(step => {
      const base = `步驟${step.stepNumber}:${step.stepTitle}:${step.timeSpent}秒`;
      if (step.stepType === 'exam') {
        return `${base}:分數=${step.score ?? ''}:通過=${step.passed ?? ''}`;
      }
      if (step.stepType === 'survey') {
        const answers = step.answers ? JSON.stringify(step.answers).replace(/"/g, '""') : '';
        return `${base}:問卷答案=${answers}`;
      }
      return base;
    }).join(';');
    
    csv += `"${user.userId}","${user.userName}","${user.startedAt}","${user.completedAt || ''}","${user.lastActiveAt}","${user.isCompleted}","${user.completionRate}","${user.totalTimeSpent}","${user.currentStep}","${user.completedSteps.join(',')}","${stepDetailsStr}"\n`;
  });
  
  return csv;
};

module.exports = {
  getPlayBooks,
  getPlayBook,
  createPlayBook,
  updatePlayBook,
  deletePlayBook,
  getPublicPlayBooks,
  getPublicPlayBook,
  getOrCreateProgress,
  updateStepProgress,
  updateCustomPageProgress,
  resetProgress,
  getPlayBookStats,
  downloadPlayBookResults,
  getCategories
};
