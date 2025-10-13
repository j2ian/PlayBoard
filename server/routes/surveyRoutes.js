// server/routes/surveyRoutes.js - 滿意度調查路由
const express = require('express');
const {
  getSurveys,
  getSurvey,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyResponses,
  exportSurveyResponsesCsv
} = require('../controllers/surveyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 管理員路由（需要身份驗證和管理員權限）
router.route('/')
  .get(protect, authorize('admin'), getSurveys)
  .post(protect, authorize('admin'), createSurvey);

// 公開路由（學生獲取問卷內容）
router.get('/:id/public', getSurvey);

// 管理員路由
router.route('/:id')
  .get(protect, authorize('admin'), getSurvey)
  .put(protect, authorize('admin'), updateSurvey)
  .delete(protect, authorize('admin'), deleteSurvey);

router.route('/:id/responses')
  .get(protect, authorize('admin'), getSurveyResponses)
  .post(submitSurveyResponse);

// 匯出所有回應（CSV）
router.get('/:id/responses/export', protect, authorize('admin'), exportSurveyResponsesCsv);

module.exports = router;
