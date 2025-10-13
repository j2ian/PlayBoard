// 引入測試環境設定，它會處理資料庫連線
require('./setup');
const mongoose = require('mongoose');
const Survey = require('../models/Survey');

describe('Survey Model Test', () => {
  // 每個測試結束後清空 Survey 資料
  afterEach(async () => {
    await Survey.deleteMany({});
  });

  it('應能成功建立一個含單選題的問卷', async () => {
    // Arrange
    const surveyData = {
      title: '單選問卷',
      description: '單選題測試',
      questions: [
        {
          text: '你喜歡哪個顏色？',
          type: 'single',
          options: ['紅色', '藍色', '綠色'],
          isPositive: true
        }
      ]
    };

    // Act
    const survey = await Survey.create(surveyData);

    // Assert
    expect(survey._id).toBeDefined();
    expect(survey.questions[0].type).toBe('single');
    expect(survey.questions[0].options.length).toBe(3);
  });

  it('應能成功建立一個含多選題的問卷', async () => {
    const survey = await Survey.create({
      title: '多選問卷',
      questions: [
        {
          text: '你喜歡哪些水果？',
          type: 'multiple',
          options: ['蘋果', '香蕉', '橘子'],
          isPositive: false
        }
      ]
    });
    expect(survey.questions[0].type).toBe('multiple');
    expect(survey.questions[0].options.length).toBe(3);
    expect(survey.questions[0].isPositive).toBe(false);
  });

  it('應能成功建立一個含文字題的問卷', async () => {
    const survey = await Survey.create({
      title: '文字題問卷',
      questions: [
        {
          text: '請描述你的夢想',
          type: 'text',
          isPositive: true
        }
      ]
    });
    expect(survey.questions[0].type).toBe('text');
    expect(survey.questions[0].options).toBeUndefined();
  });

  it('當選擇題少於兩個選項時，應建立失敗', async () => {
    let err;
    try {
      await Survey.create({
        title: '錯誤問卷',
        questions: [
          {
            text: '只給一個選項',
            type: 'single',
            options: ['唯一'],
            isPositive: true
          }
        ]
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['questions.0.options'].message).toMatch('選擇題至少需要兩個選項');
  });

  it('當問卷無題目時，應建立失敗', async () => {
    let err;
    try {
      await Survey.create({
        title: '空問卷',
        questions: []
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors['questions'].message).toMatch('問卷至少需要一個問題');
  });
}); 