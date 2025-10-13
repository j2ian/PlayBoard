import { createRouter, createWebHistory } from 'vue-router';

// 導入視圖組件
const Home = () => import('../views/Home.vue');
const Login = () => import('../views/Login.vue');
const AdminDashboard = () => import('../views/admin/Dashboard.vue');
const NotFound = () => import('../views/NotFound.vue');
const QuestionList = () => import('../views/admin/QuestionList.vue');
const QuestionCreate = () => import('../views/admin/QuestionCreate.vue');
const QuestionEdit = () => import('../views/admin/QuestionEdit.vue');
const QuestionRead = () => import('../views/admin/QuestionRead.vue');
const ExamList = () => import('../views/admin/ExamList.vue');
const ExamCreate = () => import('../views/admin/ExamCreate.vue')
const ExamEdit = () => import('../views/admin/ExamEdit.vue')
const ExamRead = () => import('../views/admin/ExamRead.vue')
const ExamTake = () => import('../views/ExamTake.vue')
const SurveyList = () => import('../views/admin/SurveyList.vue')
const SurveyCreate = () => import('../views/admin/SurveyCreate.vue')
const SurveyEdit = () => import('../views/admin/SurveyEdit.vue')
const SurveyRead = () => import('../views/admin/SurveyRead.vue')
const SurveyResponses = () => import('../views/admin/SurveyResponses.vue')
const SurveyTake = () => import('../views/SurveyTake.vue')
const AdminContentList = () => import('../views/admin/ContentList.vue')
const ContentCreate = () => import('../views/admin/ContentCreate.vue')
const ContentEdit = () => import('../views/admin/ContentEdit.vue')
const ContentRead = () => import('../views/admin/ContentRead.vue')
const ContentView = () => import('../views/ContentView.vue')
const ContentList = () => import('../views/ContentList.vue')
const PlayBookList = () => import('../views/admin/PlayBookList.vue')
const PlayBookCreate = () => import('../views/admin/PlayBookCreate.vue')
const PlayBookEdit = () => import('../views/admin/PlayBookEdit.vue')
const PlayBookRead = () => import('../views/admin/PlayBookRead.vue')
const PlayBookStats = () => import('../views/admin/PlayBookStats.vue')
const PlayBookPlayer = () => import('../views/PlayBookPlayer.vue')
const PlayBookStepPlayer = () => import('../views/PlayBookStepPlayer.vue')
const PlayBookStepContentView = () => import('../views/PlayBookStepContentView.vue')
const PlayBookCompletedView = () => import('../views/PlayBookCompletedView.vue')
const CustomPageList = () => import('../views/admin/CustomPageList.vue')

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首頁 - PlayBoard' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登入 - PlayBoard' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { 
      title: '管理後台 - PlayBoard',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/questions',
    name: 'QuestionList',
    component: QuestionList,
    meta: {
      title: '題組管理 - PlayBoard',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/questions/create',
    name: 'QuestionCreate',
    component: QuestionCreate,
    meta: {
      title: '新增題組 - PlayBoard',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/questions/:id/edit',
    name: 'QuestionEdit',
    component: QuestionEdit,
    meta: {
      title: '編輯題組 - PlayBoard',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/questions/:id',
    name: 'QuestionRead',
    component: QuestionRead,
    meta: { title: '題目詳情 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exams',
    name: 'ExamList',
    component: ExamList,
    meta: { title: '測驗管理 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exams/create',
    name: 'ExamCreate',
    component: ExamCreate,
    meta: { title: '新增測驗 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exams/:id/edit',
    name: 'ExamEdit',
    component: ExamEdit,
    meta: { title: '編輯測驗 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exams/:id',
    name: 'ExamRead',
    component: ExamRead,
    meta: { title: '測驗詳情 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/exams/:id/take',
    name: 'ExamTake',
    component: ExamTake,
    meta: { title: '進行測驗 - PlayBoard' }
  },
  {
    path: '/admin/surveys',
    name: 'SurveyList',
    component: SurveyList,
    meta: { title: '滿意度調查管理 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/surveys/create',
    name: 'SurveyCreate',
    component: SurveyCreate,
    meta: { title: '新增問卷 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/surveys/:id/edit',
    name: 'SurveyEdit',
    component: SurveyEdit,
    meta: { title: '編輯問卷 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/surveys/:id',
    name: 'SurveyRead',
    component: SurveyRead,
    meta: { title: '問卷詳情 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/surveys/:id/responses',
    name: 'SurveyResponses',
    component: SurveyResponses,
    meta: { title: '問卷統計 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/surveys/:id/take',
    name: 'SurveyTake',
    component: SurveyTake,
    meta: { title: '填寫問卷 - PlayBoard' }
  },
  {
    path: '/admin/contents',
    name: 'AdminContentList',
    component: AdminContentList,
    meta: { title: '一般內容管理 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/contents/create',
    name: 'ContentCreate',
    component: ContentCreate,
    meta: { title: '新增內容 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/contents/:id/edit',
    name: 'ContentEdit',
    component: ContentEdit,
    meta: { title: '編輯內容 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/contents/:id',
    name: 'ContentRead',
    component: ContentRead,
    meta: { title: '內容詳情 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/contents',
    name: 'ContentList',
    component: ContentList,
    meta: { title: '所有內容 - PlayBoard' }
  },
  {
    path: '/content/:slug',
    name: 'ContentView',
    component: ContentView,
    meta: { title: 'PlayBoard' }
  },
  {
    path: '/admin/playbooks',
    name: 'PlayBookList',
    component: PlayBookList,
    meta: { title: 'PlayBook管理 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/playbooks/create',
    name: 'PlayBookCreate',
    component: PlayBookCreate,
    meta: { title: '新增PlayBook - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/playbooks/:id/edit',
    name: 'PlayBookEdit',
    component: PlayBookEdit,
    meta: { title: '編輯PlayBook - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/playbooks/:id/stats',
    name: 'PlayBookStats',
    component: PlayBookStats,
    meta: { title: 'PlayBook統計 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/playbooks/:id',
    name: 'PlayBookRead',
    component: PlayBookRead,
    meta: { title: 'PlayBook詳情 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/playbook/:slug',
    name: 'PlayBookPlayer',
    component: PlayBookPlayer,
    meta: { title: 'PlayBoard' }
  },
  {
    path: '/playbook/:slug/step',
    name: 'PlayBookStepPlayer',
    component: PlayBookStepPlayer,
    meta: { title: 'PlayBoard' }
  },
  {
    path: '/playbook/:slug/step/content',
    name: 'PlayBookStepContentView',
    component: PlayBookStepContentView,
    meta: { title: 'PlayBoard' }
  },
  {
    path: '/playbook/:slug/completed',
    name: 'PlayBookCompletedView',
    component: PlayBookCompletedView,
    meta: { title: 'PlayBoard' }
  },
  {
    path: '/admin/custom-pages',
    name: 'CustomPageList',
    component: CustomPageList,
    meta: { title: '客製化頁面管理 - PlayBoard', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/custom-pages/:id/play',
    name: 'CustomPagePlayer',
    component: () => import('../views/CustomPagePlayer.vue'),
    meta: { title: '客製化頁面 - PlayBoard' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '頁面未找到 - PlayBoard' }
  }
];

// 創建路由實例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // 始終滾動到頂部
    return { top: 0 };
  }
});

// 全局前置守衛 - 身份驗證檢查和頁面標題設置
router.beforeEach((to, from, next) => {
  // 設置頁面標題
  document.title = to.meta.title || 'PlayBoard';
  
  // 檢查該路由是否需要身份驗證
  const loggedIn = localStorage.getItem('user');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要身份驗證，檢查是否已登入
    if (!loggedIn) {
      // 未登入，重定向到登入頁面
      return next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    
    // 檢查是否需要管理員權限
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      const user = JSON.parse(loggedIn);
      
      if (user && user.role !== 'admin') {
        // 非管理員，重定向到首頁
        return next({ name: 'Home' });
      }
    }
  }
  
  next();
});

export default router; 