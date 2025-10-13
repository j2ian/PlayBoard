// server/tests/exam.test.js - Exam 模型的測試案例
require('../setup'); // 引入測試環境設定
const mongoose = require('mongoose');
const Exam = require('../../models/Exam');
const Question = require('../../models/Question');
const User = require('../../models/User');

describe('Exam Model Test', () => {
  let testQuestion1, testQuestion2, testUser;

  // 在每個測試前，創建測試用的題組和用戶
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
    // 設定正確答案
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
  });

  it('應能成功建立一個包含多個題組的有效考試', async () => {
    const examData = {
      title: '期末考試',
      description: '這是一個期末考試',
      questions: [testQuestion1._id, testQuestion2._id],
      timeLimit: 60, // 60分鐘
      passingScore: 70, // 70分及格
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    const savedExam = await exam.save();

    expect(savedExam._id).toBeDefined();
    expect(savedExam.title).toBe(examData.title);
    expect(savedExam.questions.length).toBe(2);
    expect(savedExam.timeLimit).toBe(60);
    expect(savedExam.passingScore).toBe(70);
    expect(savedExam.isActive).toBe(true);
  });

  it('當沒有提供任何題組時，應建立失敗', async () => {
    const examData = {
      title: '沒有題組的考試',
      description: '這個考試沒有包含任何題組',
      questions: [],
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    let err;

    try {
      await exam.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.questions).toBeDefined();
  });

  it('當時間限制為負數時，應建立失敗', async () => {
    const examData = {
      title: '負時間限制考試',
      description: '這個考試設定了負數的時間限制',
      questions: [testQuestion1._id],
      timeLimit: -30, // 負數時間限制
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    let err;

    try {
      await exam.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.timeLimit).toBeDefined();
  });

  it('當及格分數超過100時，應建立失敗', async () => {
    const examData = {
      title: '高分及格考試',
      description: '這個考試設定了超過100的及格分數',
      questions: [testQuestion1._id],
      passingScore: 120, // 超過100的及格分數
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    let err;

    try {
      await exam.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.passingScore).toBeDefined();
  });

  it('應能更新考試中的題組列表', async () => {
    // 首先創建只包含一個題組的考試
    const examData = {
      title: '期中考試',
      description: '這是一個期中考試',
      questions: [testQuestion1._id],
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    const savedExam = await exam.save();

    // 更新考試，新增另一個題組
    savedExam.questions.push(testQuestion2._id);
    const updatedExam = await savedExam.save();

    expect(updatedExam.questions.length).toBe(2);
    expect(updatedExam.questions[1].toString()).toBe(testQuestion2._id.toString());
  });

  it('應能正確關聯題組與考試', async () => {
    // 創建一個考試
    const examData = {
      title: '關聯測試考試',
      description: '測試考試和題組的關聯',
      questions: [testQuestion1._id, testQuestion2._id],
      createdBy: testUser._id
    };

    const exam = new Exam(examData);
    const savedExam = await exam.save();

    // 手動更新題組的 exams 欄位（模擬控制器的行為）
    await Question.updateMany(
      { _id: { $in: [testQuestion1._id, testQuestion2._id] } },
      { $push: { exams: savedExam._id } }
    );

    // 查詢更新後的題組
    const updatedQuestion1 = await Question.findById(testQuestion1._id);
    const updatedQuestion2 = await Question.findById(testQuestion2._id);

    // 驗證題組是否正確關聯到考試
    expect(updatedQuestion1.exams.length).toBe(1);
    expect(updatedQuestion1.exams[0].toString()).toBe(savedExam._id.toString());
    expect(updatedQuestion2.exams.length).toBe(1);
    expect(updatedQuestion2.exams[0].toString()).toBe(savedExam._id.toString());
  });
}); 