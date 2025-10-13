// server/controllers/questionController.js - 單一題目 CRUD 控制器
const Question = require('../models/Question');
const QuestionCategory = require('../models/QuestionCategory');

// 取得所有題目
exports.getQuestions = async (req, res) => {
  try {
    const { search, sort, page = 1, pageSize = 10 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } }
      ];
    }
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'titleAsc') sortOption = { text: 1 };
    if (sort === 'titleDesc') sortOption = { text: -1 };
    if (sort === 'updatedDesc') sortOption = { updatedAt: -1 };
    if (sort === 'updatedAsc') sortOption = { updatedAt: 1 };
    if (sort === 'typeAsc') sortOption = { type: 1 };
    if (sort === 'typeDesc') sortOption = { type: -1 };

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const [questions, total] = await Promise.all([
      Question.find(query)
        .populate('category', 'name')
        .select('-__v')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Question.countDocuments(query)
    ]);

    res.status(200).json({ success: true, count: total, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法獲取題目', error: error.message });
  }
};

// 取得單一題目
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('category', 'name');
    if (!question) {
      return res.status(404).json({ success: false, message: '找不到該題目' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法獲取題目詳情', error: error.message });
  }
};

// 建立新題目
exports.createQuestion = async (req, res) => {
  try {
    console.log('收到建立題目請求，payload:', req.body);

    // 先取出 correctAnswer index
    const { correctAnswer, ...rest } = req.body;
    // 先 new 一個 Question 實例（不存到 DB）
    let question = new Question({ ...rest, correctAnswer: [] });

    // 取得 options 的 _id
    const answerIds = Array.isArray(correctAnswer)
      ? correctAnswer.map(idx => question.options[idx]?._id)
      : [question.options[correctAnswer]?._id];

    // 補上 correctAnswer
    question.correctAnswer = answerIds;
    await question.save();

    console.log('建立成功，儲存後的題目:', question);
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('建立題目失敗:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '無法建立題目', error: error.message });
  }
};

// 更新題目
exports.updateQuestion = async (req, res) => {
  try {
    const { correctAnswer, ...rest } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: '找不到該題目' });
    }

    // 更新欄位
    Object.assign(question, rest);

    // correctAnswer 支援 index 或 ObjectId
    if (correctAnswer) {
      const answerIds = Array.isArray(correctAnswer)
        ? correctAnswer.map(val => {
            // 若是 index，轉成 _id；若已是 _id，直接用
            if (typeof val === 'number' || (typeof val === 'string' && /^[0-9]+$/.test(val))) {
              const idx = typeof val === 'number' ? val : parseInt(val, 10);
              return question.options[idx]?._id;
            }
            // 若是 ObjectId 字串
            return val;
          })
        : [correctAnswer];
      question.correctAnswer = answerIds;
    }

    await question.save();
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: '無法更新題目', error: error.message });
  }
};

// 刪除題目
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: '找不到該題目' });
    }
    if (question.exams && question.exams.length > 0) {
      // 查詢綁定的測驗資訊
      const Exam = require('../models/Exam');
      const exams = await Exam.find({ _id: { $in: question.exams } }, 'title');
      return res.status(400).json({
        success: false,
        message: '此題目已被綁定於測驗，請先移除關聯後再刪除。',
        exams: exams.map(e => ({ _id: e._id, title: e.title }))
      });
    }
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: '題目已成功刪除', data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: '無法刪除題目', error: error.message });
  }
}; 