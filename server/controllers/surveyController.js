// server/controllers/surveyController.js - 滿意度調查控制器
const Survey = require('../models/Survey');
const SurveyResponse = require('../models/SurveyResponse');

/**
 * 獲取所有問卷
 * @route GET /api/surveys
 * @access Private/Admin
 */
exports.getSurveys = async (req, res) => {
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

    const [surveys, total] = await Promise.all([
      Survey.find(query)
        .populate('createdBy', 'username')
        .select('-__v')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Survey.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: total,
      data: surveys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '無法獲取問卷',
      error: error.message
    });
  }
};

/**
 * 獲取單個問卷詳情
 * @route GET /api/surveys/:id
 * @access Private/Admin
 */
exports.getSurvey = async (req, res) => {
  try {
    console.log(`Fetching survey with ID: ${req.params.id}`);
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!survey) {
      console.log(`Survey with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該問卷'
      });
    }

    console.log(`Found survey: ${survey.title}`);
    
    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error(`Error fetching survey ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取問卷詳情',
      error: error.message
    });
  }
};

/**
 * 創建新問卷
 * @route POST /api/surveys
 * @access Private/Admin
 */
exports.createSurvey = async (req, res) => {
  try {
    console.log('Creating new survey with data:', JSON.stringify(req.body));
    
    // 檢查問題數量
    const questions = req.body.questions || [];
    console.log('Questions received:', questions);
    
    if (questions.length === 0) {
      console.log('Error: No questions provided');
      return res.status(400).json({
        success: false,
        message: '問卷至少需要包含一個問題'
      });
    }

    // 設定創建者
    req.body.createdBy = req.user.id;
    console.log(`Setting creator ID: ${req.user.id}`);

    // 創建新問卷
    console.log('Creating survey in database');
    const survey = await Survey.create(req.body);
    console.log(`Survey created with ID: ${survey._id}`);

    res.status(201).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('Error creating survey:', error);
    
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
      message: '無法創建問卷',
      error: error.message
    });
  }
};

/**
 * 更新問卷
 * @route PUT /api/surveys/:id
 * @access Private/Admin
 */
exports.updateSurvey = async (req, res) => {
  try {
    console.log(`Updating survey with ID: ${req.params.id}`);
    console.log('Update data:', JSON.stringify(req.body));
    
    // 檢查問卷是否存在
    let survey = await Survey.findById(req.params.id);
    if (!survey) {
      console.log(`Survey with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該問卷'
      });
    }
    console.log(`Found survey: ${survey.title}`);

    // 檢查問題數量（如果有更新問題列表）
    if (req.body.questions && req.body.questions.length === 0) {
      console.log('Error: Empty questions array provided');
      return res.status(400).json({
        success: false,
        message: '問卷至少需要包含一個問題'
      });
    }

    // 更新問卷
    console.log('Updating survey in database');
    survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    console.log('Survey updated');

    res.status(200).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error(`Error updating survey ${req.params.id}:`, error);
    
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
      message: '無法更新問卷',
      error: error.message
    });
  }
};

/**
 * 刪除問卷
 * @route DELETE /api/surveys/:id
 * @access Private/Admin
 */
exports.deleteSurvey = async (req, res) => {
  try {
    console.log(`Deleting survey with ID: ${req.params.id}`);
    
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      console.log(`Survey with ID ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: '找不到該問卷'
      });
    }
    console.log(`Found survey to delete: ${survey.title}`);

    // 刪除所有相關回答
    console.log('Deleting related survey responses');
    await SurveyResponse.deleteMany({ survey: survey._id });

    // 刪除問卷
    console.log('Deleting survey from database');
    await Survey.findByIdAndDelete(req.params.id);
    console.log('Survey deleted successfully');

    res.status(200).json({
      success: true,
      message: '問卷已成功刪除',
      data: {}
    });
  } catch (error) {
    console.error(`Error deleting survey ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: '無法刪除問卷',
      error: error.message
    });
  }
};

/**
 * 提交問卷回答
 * @route POST /api/surveys/:id/responses
 * @access Public
 */
exports.submitSurveyResponse = async (req, res) => {
  try {
    console.log(`Submitting response for survey ID: ${req.params.id}`);
    console.log('Response data:', JSON.stringify(req.body));
    
    // 檢查問卷是否存在
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: '找不到該問卷'
      });
    }

    // 驗證必填欄位
    const { studentName, responses } = req.body;
    if (!studentName || !responses) {
      return res.status(400).json({
        success: false,
        message: '學生姓名和回答內容為必填'
      });
    }

    // 創建問卷回答
    const surveyResponse = await SurveyResponse.create({
      survey: req.params.id,
      studentName,
      responses,
      playbook: req.body.playbook || null
    });

    console.log(`Survey response created with ID: ${surveyResponse._id}`);

    res.status(201).json({
      success: true,
      data: surveyResponse
    });
  } catch (error) {
    console.error(`Error submitting survey response:`, error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: '無法提交問卷回答',
      error: error.message
    });
  }
};

/**
 * 獲取問卷回答統計
 * @route GET /api/surveys/:id/responses
 * @access Private/Admin
 */
exports.getSurveyResponses = async (req, res) => {
  try {
    console.log(`Fetching responses for survey ID: ${req.params.id}`);
    
    // 檢查問卷是否存在
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: '找不到該問卷'
      });
    }

    // 獲取所有回答
    const responses = await SurveyResponse.find({ survey: req.params.id })
      .sort({ createdAt: -1 });

    // 統計數據
    const totalResponses = responses.length;
    const statistics = {};

    // 為每個問題生成統計
    survey.questions.forEach((question, index) => {
      const questionId = index.toString();
      
      if (question.type === 'likert') {
        // 李克特量表統計
        const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let total = 0;
        let sum = 0;
        
        responses.forEach(response => {
          const answer = response.responses.get(questionId);
          if (answer && answer >= 1 && answer <= 5) {
            counts[answer]++;
            total++;
            sum += answer;
          }
        });
        
        statistics[questionId] = {
          type: 'likert',
          counts,
          total,
          average: total > 0 ? (sum / total).toFixed(2) : 0
        };
      } else if (question.type === 'text') {
        // 文字題回答
        const textResponses = [];
        responses.forEach(response => {
          const answer = response.responses.get(questionId);
          if (answer && answer.trim()) {
            textResponses.push({
              studentName: response.studentName,
              answer: answer,
              createdAt: response.createdAt
            });
          }
        });
        
        statistics[questionId] = {
          type: 'text',
          responses: textResponses,
          total: textResponses.length
        };
      }
    });

    res.status(200).json({
      success: true,
      data: {
        survey,
        totalResponses,
        statistics,
        responses
      }
    });
  } catch (error) {
    console.error(`Error fetching survey responses:`, error);
    res.status(500).json({
      success: false,
      message: '無法獲取問卷回答',
      error: error.message
    });
  }
};

/**
 * 匯出問卷所有回應（CSV）
 * @route GET /api/surveys/:id/responses/export
 * @access Private/Admin
 */
exports.exportSurveyResponsesCsv = async (req, res) => {
  try {
    // 取得問卷
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: '找不到該問卷' });
    }

    // 取得所有回答
    const responses = await SurveyResponse.find({ survey: req.params.id }).sort({ createdAt: 1 });

    // 準備CSV表頭：固定欄位 + 每題欄位
    // 固定欄位：受訪者、填寫時間、（可選）PlayBook
    const questionHeaders = survey.questions.map((q, idx) => {
      const text = (q.text || '').replace(/\r?\n/g, ' ').trim();
      // 標題包含題號與最多前30字，避免過長
      const short = text.length > 30 ? text.slice(0, 30) + '…' : text;
      return `Q${idx + 1}:${short}`;
    });
    const headers = ['StudentName', 'SubmittedAt', 'PlayBookId', ...questionHeaders];

    // 題目文字行（與 headers 對齊，前三個固定欄位留空）
    const questionTextsRow = ['', '', '', ...survey.questions.map(q => (q.text || '').replace(/\r?\n/g, ' ').trim())];

    // 題目選項/說明行（likert/單選/多選列出選項，文字題留空）
    const questionOptionsRow = ['', '', '', ...survey.questions.map(q => {
      if (q.type === 'likert') {
        // 1-5 量表
        return '1|2|3|4|5';
      }
      if (q.type === 'single' || q.type === 'multiple') {
        return Array.isArray(q.options) ? q.options.join('|') : '';
      }
      return '';
    })];

    // 建立行資料
    const rows = responses.map(r => {
      // 逐題取值，SurveyResponse.responses 是 Map
      const answers = survey.questions.map((q, idx) => {
        const key = idx.toString();
        const val = r.responses.get(key);
        if (q.type === 'multiple') {
          return Array.isArray(val) ? val.join('|') : '';
        }
        if (typeof val === 'string') {
          // 去掉換行，避免破壞CSV結構
          return val.replace(/\r?\n/g, ' ').trim();
        }
        return val ?? '';
      });

      return [
        r.studentName || '',
        (r.createdAt ? new Date(r.createdAt).toISOString() : ''),
        (r.playbook ? r.playbook.toString() : ''),
        ...answers
      ];
    });

    // 轉為CSV字串（加上BOM以支援Excel中文）
    const escapeCsv = (value) => {
      const str = value === null || value === undefined ? '' : String(value);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvLines = [headers.map(escapeCsv).join(',')];
    // 插入題目內容與選項說明兩行，方便對照
    csvLines.push(questionTextsRow.map(escapeCsv).join(','));
    csvLines.push(questionOptionsRow.map(escapeCsv).join(','));

    rows.forEach(row => csvLines.push(row.map(escapeCsv).join(',')));
    const csvContent = '\uFEFF' + csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="survey_${survey._id}_responses.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export survey CSV failed:', error);
    return res.status(500).json({ success: false, message: '匯出失敗' });
  }
};