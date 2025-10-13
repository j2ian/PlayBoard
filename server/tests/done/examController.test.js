// server/tests/examController.test.js - Exam 控制器的測試案例
require('../setup'); // 引入測試環境設定
const mongoose = require('mongoose');
const examController = require('../../controllers/examController');
const Exam = require('../../models/Exam');
const Question = require('../../models/Question');
const User = require('../../models/User');

// 模擬請求和響應對象
const mockRequest = (body = {}, params = {}, user = null) => {
  return {
    body,
    params,
    user
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Exam Controller Test', () => {
  let testUser, testQuestion1, testQuestion2, testExam;

  // 在每個測試前創建測試數據
  beforeEach(async () => {
    // 創建測試用戶
    testUser = new User({
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: 'password123',
      role: 'admin'
    });
    await testUser.save();

    // 創建測試題目 1
    const question1 = new Question({
      text: '問題 1',
      type: 'single',
      options: [{ text: '選項 A' }, { text: '選項 B' }],
      createdBy: testUser._id
    });
    question1.correctAnswer = [question1.options[0]._id];
    testQuestion1 = await question1.save();

    // 創建測試題目 2
    const question2 = new Question({
      text: '問題 2',
      type: 'multiple',
      options: [{ text: '選項 A' }, { text: '選項 B' }, { text: '選項 C' }],
      createdBy: testUser._id
    });
    question2.correctAnswer = [question2.options[0]._id, question2.options[1]._id];
    testQuestion2 = await question2.save();

    // 創建測試考試
    testExam = await Exam.create({
      title: '測試考試',
      description: '這是測試用考試',
      questions: [testQuestion1._id],
      timeLimit: 30,
      passingScore: 60,
      createdBy: testUser._id
    });

    // 更新題組中的考試關聯
    await Question.updateMany(
      { _id: testQuestion1._id },
      { $push: { exams: testExam._id } }
    );
  });

  describe('getExams', () => {
    it('應能獲取所有考試列表', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await examController.getExams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // 檢查返回的數據
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.count).toBe(1);
      expect(responseData.data.length).toBe(1);
      expect(responseData.data[0].title).toBe('測試考試');
    });
  });

  describe('getExam', () => {
    it('應能獲取單個考試的詳情', async () => {
      const req = mockRequest({}, { id: testExam._id });
      const res = mockResponse();

      await examController.getExam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.title).toBe('測試考試');
      expect(responseData.data.questions.length).toBe(1);
    });

    it('當考試ID不存在時，應返回404錯誤', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: nonExistingId });
      const res = mockResponse();

      await examController.getExam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '找不到該測驗'
      });
    });
  });

  describe('createExam', () => {
    it('應能成功創建新考試', async () => {
      const examData = {
        title: '新建考試',
        description: '這是一個新建的考試',
        questions: [testQuestion1._id, testQuestion2._id],
        timeLimit: 45,
        passingScore: 70
      };

      const req = mockRequest(examData, {}, { id: testUser._id });
      const res = mockResponse();

      await examController.createExam(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      
      // 檢查返回的數據
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.title).toBe('新建考試');
      expect(responseData.data.questions.length).toBe(2);

      // 驗證題組中的考試關聯是否已更新
      const updatedQuestion1 = await Question.findById(testQuestion1._id);
      const updatedQuestion2 = await Question.findById(testQuestion2._id);

      // 尋找新建考試的 ID
      const newExamId = responseData.data._id;
      
      // 檢查題組的 exams 陣列是否包含新考試的 ID
      const question1HasNewExam = updatedQuestion1.exams.some(id => id.toString() === newExamId.toString());
      const question2HasNewExam = updatedQuestion2.exams.some(id => id.toString() === newExamId.toString());
      
      expect(question1HasNewExam).toBe(true);
      expect(question2HasNewExam).toBe(true);
    });

    it('當沒有提供題組時，應返回錯誤', async () => {
      const examData = {
        title: '無題組考試',
        description: '這個考試沒有包含任何題組',
        questions: []
      };

      const req = mockRequest(examData, {}, { id: testUser._id });
      const res = mockResponse();

      await examController.createExam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '測驗至少需要包含一個題目'
      });
    });
  });

  describe('updateExam', () => {
    it('應能成功更新考試', async () => {
      const updateData = {
        title: '已更新的考試',
        description: '這是更新後的考試描述',
        questions: [testQuestion1._id, testQuestion2._id], // 新增一個題組
        timeLimit: 60,
        passingScore: 75
      };

      const req = mockRequest(updateData, { id: testExam._id }, { id: testUser._id });
      const res = mockResponse();

      await examController.updateExam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();

      // 檢查返回的數據
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.title).toBe('已更新的考試');
      expect(responseData.data.questions.length).toBe(2);
      
      // 驗證題組中的考試關聯是否已更新
      const updatedQuestion2 = await Question.findById(testQuestion2._id);
      const question2HasExam = updatedQuestion2.exams.some(id => id.toString() === testExam._id.toString());
      expect(question2HasExam).toBe(true);
    });

    it('當考試ID不存在時，應返回404錯誤', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const req = mockRequest({ title: '更新考試' }, { id: nonExistingId }, { id: testUser._id });
      const res = mockResponse();

      await examController.updateExam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '找不到該測驗'
      });
    });
  });

  describe('deleteExam', () => {
    it('應能成功刪除考試並移除題組關聯', async () => {
      const req = mockRequest({}, { id: testExam._id }, { id: testUser._id });
      const res = mockResponse();

      await examController.deleteExam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '測驗已成功刪除',
        data: {}
      });

      // 驗證考試是否已被刪除
      const deletedExam = await Exam.findById(testExam._id);
      expect(deletedExam).toBeNull();

      // 驗證題組中的考試關聯是否已移除
      const updatedQuestion = await Question.findById(testQuestion1._id);
      const questionHasExam = updatedQuestion.exams.some(id => id.toString() === testExam._id.toString());
      expect(questionHasExam).toBe(false);
    });

    it('當考試ID不存在時，應返回404錯誤', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const req = mockRequest({}, { id: nonExistingId }, { id: testUser._id });
      const res = mockResponse();

      await examController.deleteExam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: '找不到該測驗'
      });
    });
  });
}); 