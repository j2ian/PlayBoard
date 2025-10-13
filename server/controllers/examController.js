// server/controllers/examController.js - 測驗控制器
const Exam = require('../models/Exam');
const Question = require('../models/Question');

/**
 * 獲取所有測驗
 * @route GET /api/exams
 * @access Private/Admin
 */
exports.getExams = async (req, res) => {
  try {
    const { search, sort, page = 1, pageSize = 10 } = req.query;
    const query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'titleAsc') sortOption = { title: 1 };
    if (sort === 'titleDesc') sortOption = { title: -1 };
    if (sort === 'updatedDesc') sortOption = { updatedAt: -1 };
    if (sort === 'updatedAsc') sortOption = { updatedAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [exams, total] = await Promise.all([
      Exam.find(query)
        .populate('createdBy', 'username')
        .select('-__v')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Exam.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: total,
      data: exams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '無法獲取測驗',
      error: error.message
    });
  }
};

/**
 * 獲取單個測驗詳情
 * @route GET /api/exams/:id
 * @access Private/Admin
 */
exports.getExam = async (req, res) => {
  try {
    console.log(`Fetching exam with ID: ${req.params.id}`);
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate({
        path: 'questions',
        select: 'text type options correctAnswer title description',
      });

    if (!exam) {
      console.log(`Exam with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該測驗'
      });
    }

    console.log(`Found exam: ${exam.title}`);
    
    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error(`Error fetching exam ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取測驗詳情',
      error: error.message
    });
  }
};

/**
 * 創建新測驗
 * @route POST /api/exams
 * @access Private/Admin
 */
exports.createExam = async (req, res) => {
  try {
    console.log('Creating new exam with data:', JSON.stringify(req.body));
    
    // 檢查所有引用的題目是否存在
    const questionIds = req.body.questions || [];
    console.log('Question IDs received:', questionIds);
    
    if (questionIds.length === 0) {
      console.log('Error: No questions provided');
      return res.status(400).json({
        success: false,
        message: '測驗至少需要包含一個題目'
      });
    }

    // 驗證所有引用的題目 ID
    for (const questionId of questionIds) {
      console.log(`Checking if question ID exists: ${questionId}`);
      const questionExists = await Question.exists({ _id: questionId });
      console.log(`Question ${questionId} exists: ${!!questionExists}`);
      
      if (!questionExists) {
        console.log(`Error: Question ID ${questionId} does not exist`);
        return res.status(400).json({
          success: false,
          message: `題目 ID ${questionId} 不存在`
        });
      }
    }

    // 設定創建者
    req.body.createdBy = req.user.id;
    console.log(`Setting creator ID: ${req.user.id}`);

    // 創建新測驗
    console.log('Creating exam in database');
    const exam = await Exam.create(req.body);
    console.log(`Exam created with ID: ${exam._id}`);

    // 更新所有關聯的題目，加入此測驗的參考
    console.log(`Updating questions with exam reference: ${exam._id}`);
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $push: { exams: exam._id } }
    );
    console.log('Questions updated with exam reference');

    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '無法創建測驗',
      error: error.message
    });
  }
};

/**
 * 更新測驗
 * @route PUT /api/exams/:id
 * @access Private/Admin
 */
exports.updateExam = async (req, res) => {
  try {
    console.log(`Updating exam with ID: ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body));
    
    // 檢查測驗是否存在
    let exam = await Exam.findById(req.params.id);
    if (!exam) {
      console.log(`Exam with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該測驗'
      });
    }
    console.log(`Found exam: ${exam.title}`);

    // 獲取測驗當前的題目列表
    const oldQuestionIds = exam.questions.map(q => q.toString());
    console.log('Current question IDs:', oldQuestionIds);
    
    // 檢查所有引用的題目是否存在（如果有更新題目列表）
    if (req.body.questions && req.body.questions.length > 0) {
      console.log('New question IDs:', req.body.questions);
      
      for (const questionId of req.body.questions) {
        console.log(`Checking if question ID exists: ${questionId}`);
        const questionExists = await Question.exists({ _id: questionId });
        console.log(`Question ${questionId} exists: ${!!questionExists}`);
        
        if (!questionExists) {
          console.log(`Error: Question ID ${questionId} does not exist`);
          return res.status(400).json({
            success: false,
            message: `題目 ID ${questionId} 不存在`
          });
        }
      }
    } else if (req.body.questions && req.body.questions.length === 0) {
      console.log('Error: Empty questions array provided');
      return res.status(400).json({
        success: false,
        message: '測驗至少需要包含一個題目'
      });
    }

    // 更新測驗
    console.log('Updating exam in database');
    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('questions', 'title description');
    console.log('Exam updated');

    // 如果題目列表有更新
    if (req.body.questions) {
      const newQuestionIds = req.body.questions;
      
      // 找出需要新增關聯的題目（在新列表但不在舊列表中）
      const questionsToAdd = newQuestionIds.filter(id => !oldQuestionIds.includes(id));
      console.log('Questions to add exam reference:', questionsToAdd);
      
      // 找出需要移除關聯的題目（在舊列表但不在新列表中）
      const questionsToRemove = oldQuestionIds.filter(id => !newQuestionIds.includes(id));
      console.log('Questions to remove exam reference:', questionsToRemove);
      
      // 為新增的題目加入測驗關聯
      if (questionsToAdd.length > 0) {
        console.log('Adding exam reference to new questions');
        await Question.updateMany(
          { _id: { $in: questionsToAdd } },
          { $push: { exams: exam._id } }
        );
      }
      
      // 為移除的題目刪除測驗關聯
      if (questionsToRemove.length > 0) {
        console.log('Removing exam reference from old questions');
        await Question.updateMany(
          { _id: { $in: questionsToRemove } },
          { $pull: { exams: exam._id } }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error(`Error updating exam ${req.params.id}:`, error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '無法更新測驗',
      error: error.message
    });
  }
};

/**
 * 刪除測驗
 * @route DELETE /api/exams/:id
 * @access Private/Admin
 */
exports.deleteExam = async (req, res) => {
  try {
    console.log(`Deleting exam with ID: ${req.params.id}`);
    
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      console.log(`Exam with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該測驗'
      });
    }
    console.log(`Found exam to delete: ${exam.title}`);

    // 獲取測驗相關的所有題目ID
    const questionIds = exam.questions.map(q => q.toString());
    console.log('Associated question IDs:', questionIds);
    
    // 更新所有相關題目，移除測驗參考
    if (questionIds.length > 0) {
      console.log('Removing exam reference from associated questions');
      await Question.updateMany(
        { _id: { $in: questionIds } },
        { $pull: { exams: exam._id } }
      );
    }

    // 刪除測驗
    console.log('Deleting exam from database');
    await Exam.findByIdAndDelete(req.params.id);
    console.log('Exam deleted successfully');

    res.status(200).json({
      success: true,
      message: '測驗已成功刪除',
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting exam ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法刪除測驗',
      error: error.message
    });
  }
}; 