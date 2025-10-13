<template>
  <div class="min-h-screen">
    <!-- Hero 簡潔資訊區 -->
    <header class="pb-card max-w-6xl mx-auto mt-10 px-6 py-10">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-semibold leading-snug">歡迎來到 PlayBoard</h1>
          <p class="text-[color:var(--pb-text-secondary)] mt-2">您的學習路徑與互動內容中心</p>
        </div>
        <div class="shrink-0">
          <router-link to="/login">
            <el-button type="primary" size="large">後台管理</el-button>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 功能卡片 -->
    <section class="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-10 mb-16">
      <h2 class="text-2xl md:text-3xl font-semibold mb-6">平台功能</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="pb-card p-6">
          <div class="text-3xl mb-3">🎮</div>
          <h3 class="font-medium mb-1">學習路徑</h3>
          <p class="text-sm text-[color:var(--pb-text-secondary)]">以步驟化方式完成學習任務</p>
        </div>
        <div class="pb-card p-6">
          <div class="text-3xl mb-3">📚</div>
          <h3 class="font-medium mb-1">內容中心</h3>
          <p class="text-sm text-[color:var(--pb-text-secondary)]">閱讀文章與教材，提升知識深度</p>
        </div>
        <div class="pb-card p-6">
          <div class="text-3xl mb-3">📝</div>
          <h3 class="font-medium mb-1">測驗與問卷</h3>
          <p class="text-sm text-[color:var(--pb-text-secondary)]">透過測驗與調查蒐集回饋</p>
        </div>
        <div class="pb-card p-6">
          <div class="text-3xl mb-3">🧩</div>
          <h3 class="font-medium mb-1">客製化頁面</h3>
          <p class="text-sm text-[color:var(--pb-text-secondary)]">載入互動內容，打造專屬體驗</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>
