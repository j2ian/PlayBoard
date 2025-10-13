// server/tests/examApi.test.js - Exam API 的整合測試
require('../setup'); // 引入測試環境設定
const mongoose = require('mongoose');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const examRoutes = require('../../routes/examRoutes');
const authMiddleware = require('../../middleware/auth');
const Exam = require('../../models/Exam');
const Question = require('../../models/Question');
const User = require('../../models/User');

// 模擬身份驗證中間件
jest.mock('../middleware/auth', () => ({
  protect: jest.fn((req, res, next) => {
    if (req.headers['x-test-user']) {
      req.user = JSON.parse(req.headers['x-test-user']);
      next();
    } else {
      res.status(401).json({ success: false, message: '未授權訪問' });
    }
  }),
  authorize: jest.fn((role) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '未授權訪問' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: '無權限執行此操作' });
    }
    
    next();
  })
}));

// 創建測試應用
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/exams', examRoutes);

const request = supertest(app);

describe('Exam API Test', () => {
  let testUser, testAdmin, testQuestion1, testQuestion2, testExam;
  let adminToken, userToken;
  
  // 在所有測試開始前創建測試數據
  beforeAll(async () => {
    // 清理現有測試數據
    await User.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
    
    // 創建測試用戶
    testUser = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    });
    
    testAdmin = await User.create({
      username: 'testadmin',
      email: 'testadmin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // 建立 JWT token
    adminToken = jwt.sign(
      { id: testAdmin._id, role: testAdmin.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1d' }
    );
    
    userToken = jwt.sign(
      { id: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1d' }
    );
    
    // 創建單一題目
    const question1 = await Question.create({
      title: '單選題 1',
      text: '1+1=?',
      type: 'single',
      options: [
        { text: '2' },
        { text: '3' }
      ],
      correctAnswer: [], // 先空，稍後補上
      createdBy: testAdmin._id
    });
    question1.correctAnswer = [question1.options[0]._id];
    await question1.save();
    testQuestion1 = question1;

    const question2 = await Question.create({
      title: '複選題 2',
      text: '哪些是偶數?',
      type: 'multiple',
      options: [
        { text: '2' },
        { text: '3' },
        { text: '4' }
      ],
      correctAnswer: [],
      createdBy: testAdmin._id
    });
    question2.correctAnswer = [question2.options[0]._id, question2.options[2]._id];
    await question2.save();
    testQuestion2 = question2;
    
    // 創建測試考試
    testExam = await Exam.create({
      title: '測試考試',
      description: '這是測試用考試',
      questions: [testQuestion1._id],
      timeLimit: 30,
      passingScore: 60,
      createdBy: testAdmin._id
    });
    
    // 更新題目中的考試關聯
    await Question.findByIdAndUpdate(
      testQuestion1._id,
      { $push: { exams: testExam._id } }
    );
    
    // 確認關聯已正確建立
    const updatedQuestion = await Question.findById(testQuestion1._id);
    if (!updatedQuestion.exams.includes(testExam._id)) {
      throw new Error('題組與考試的關聯未正確建立');
    }
  });
  
  // 在所有測試結束後清理測試數據
  afterAll(async () => {
    await User.deleteMany({});
    await Question.deleteMany({});
    await Exam.deleteMany({});
  });
  
  describe('GET /api/exams', () => {
    it('應允許已驗證用戶查看考試列表', async () => {
      const response = await request
        .get('/api/exams')
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }));
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    it('未驗證的用戶應被拒絕訪問', async () => {
      const response = await request.get('/api/exams');
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/exams/:id', () => {
    it('應允許已驗證用戶查看特定考試詳情', async () => {
      const response = await request
        .get(`/api/exams/${testExam._id}`)
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }));
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('測試考試');
    });
    
    it('當考試不存在時應返回404錯誤', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const response = await request
        .get(`/api/exams/${nonExistingId}`)
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }));
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/exams', () => {
    it('應允許管理員創建新考試', async () => {
      const examData = {
        title: '新建API測試考試',
        description: '這是通過API新建的測試考試',
        questions: [testQuestion1._id.toString(), testQuestion2._id.toString()],
        timeLimit: 45,
        passingScore: 70
      };
      
      const response = await request
        .post('/api/exams')
        .set('x-test-user', JSON.stringify({
          id: testAdmin._id,
          role: 'admin'
        }))
        .send(examData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('新建API測試考試');
      expect(response.body.data.questions.length).toBe(2);
    });
    
    it('普通用戶嘗試創建考試應被拒絕', async () => {
      const examData = {
        title: '普通用戶創建的考試',
        description: '這個不該被創建',
        questions: [testQuestion1._id.toString()]
      };
      
      const response = await request
        .post('/api/exams')
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }))
        .send(examData);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('PUT /api/exams/:id', () => {
    it('應允許管理員更新考試', async () => {
      const updateData = {
        title: '已更新的API測試考試',
        description: '這是通過API更新的測試考試',
        passingScore: 75
      };
      
      const response = await request
        .put(`/api/exams/${testExam._id}`)
        .set('x-test-user', JSON.stringify({
          id: testAdmin._id,
          role: 'admin'
        }))
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('已更新的API測試考試');
      expect(response.body.data.passingScore).toBe(75);
    });
    
    it('普通用戶嘗試更新考試應被拒絕', async () => {
      const updateData = {
        title: '普通用戶更新的考試'
      };
      
      const response = await request
        .put(`/api/exams/${testExam._id}`)
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }))
        .send(updateData);
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('DELETE /api/exams/:id', () => {
    it('應允許管理員刪除考試', async () => {
      // 先創建一個要刪除的測試考試
      const deleteTestExam = await Exam.create({
        title: '待刪除考試',
        description: '這是將被刪除的測試考試',
        questions: [testQuestion1._id],
        createdBy: testAdmin._id
      });
      
      const response = await request
        .delete(`/api/exams/${deleteTestExam._id}`)
        .set('x-test-user', JSON.stringify({
          id: testAdmin._id,
          role: 'admin'
        }));
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 驗證考試已被刪除
      const deletedExam = await Exam.findById(deleteTestExam._id);
      expect(deletedExam).toBeNull();
    });
    
    it('普通用戶嘗試刪除考試應被拒絕', async () => {
      const response = await request
        .delete(`/api/exams/${testExam._id}`)
        .set('x-test-user', JSON.stringify({
          id: testUser._id,
          role: 'user'
        }));
      
      expect(response.status).toBe(403);
    });
  });
}); 