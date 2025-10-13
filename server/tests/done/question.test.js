// server/tests/question.test.js - 單一題目模型的測試案例
require('../setup');
const mongoose = require('mongoose');
const Question = require('../../models/Question');

describe('Question Model Test', () => {
  it('應能成功建立一個有效的單選題', async () => {
    const questionData = {
      text: '1+1=?',
      type: 'single',
      options: [
        { text: '2' },
        { text: '3' }
      ],
      correctAnswer: [], // 先空，稍後補上
    };
    const question = new Question(questionData);
    question.correctAnswer = [question.options[0]._id];
    const savedQuestion = await question.save();
    expect(savedQuestion.text).toBe('1+1=?');
    expect(savedQuestion.options.length).toBe(2);
    expect(savedQuestion.correctAnswer.length).toBe(1);
  });

  it('應能成功建立一個有效的複選題', async () => {
    const questionData = {
      text: '哪些是偶數?',
      type: 'multiple',
      options: [
        { text: '2' },
        { text: '3' },
        { text: '4' }
      ],
      correctAnswer: [],
    };
    const question = new Question(questionData);
    question.correctAnswer = [question.options[0]._id, question.options[2]._id];
    const savedQuestion = await question.save();
    expect(savedQuestion.text).toBe('哪些是偶數?');
    expect(savedQuestion.options.length).toBe(3);
    expect(savedQuestion.correctAnswer.length).toBe(2);
  });

  it('若單選題答案數量不為1應驗證失敗', async () => {
    const questionData = {
      text: '1+2=?',
      type: 'single',
      options: [
        { text: '2' },
        { text: '3' }
      ],
      correctAnswer: [],
    };
    const question = new Question(questionData);
    question.correctAnswer = [question.options[0]._id, question.options[1]._id];
    let error;
    try {
      await question.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it('若複選題答案數量小於2應驗證失敗', async () => {
    const questionData = {
      text: '哪些是偶數?',
      type: 'multiple',
      options: [
        { text: '2' },
        { text: '3' },
        { text: '4' }
      ],
      correctAnswer: [],
    };
    const question = new Question(questionData);
    question.correctAnswer = [question.options[0]._id];
    let error;
    try {
      await question.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
}); 