<template>
  <div class="custom-page-player">
    <div class="page-header bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ customPage?.title }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ customPage?.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="goBack" size="small">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-button 
              type="primary" 
              @click="goNext" 
              :disabled="!canProceed"
              size="small"
            >
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="page-container flex-1">
      <div v-if="loading" class="flex items-center justify-center h-96">
        <el-loading-spinner size="large" />
        <span class="ml-2">載入客製化頁面中...</span>
      </div>
      
      <div v-else-if="error" class="flex items-center justify-center h-96">
        <el-alert
          :title="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>
      
      <iframe
        v-else
        ref="pageFrame"
        :src="pageUrl"
        :style="iframeStyle"
        @load="onPageLoad"
        @error="onPageError"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        class="w-full h-full border-0"
      />
    </div>
    
    <!-- 進度控制面板 -->
    <div v-if="showControls && customPage" class="page-controls bg-white border-t shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">
              進度觸發: {{ getProgressTriggerText(customPage.settings?.progressTrigger) }}
            </span>
            <span v-if="customPage.settings?.progressDelay > 0" class="text-sm text-gray-600">
              延遲: {{ customPage.settings.progressDelay }}秒
            </span>
            <span v-if="customPage.settings?.completionCriteria" class="text-sm text-gray-600">
              完成條件: {{ customPage.settings.completionCriteria }}
            </span>
          </div>
          
          <div class="flex items-center gap-2">
            <el-button @click="goBack" size="small">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <el-button 
              type="primary" 
              @click="goNext" 
              :disabled="!canProceed"
              size="small"
            >
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import customPageService from '@/services/customPage.service';

export default {
  name: 'CustomPagePlayer',
  components: {
    ArrowLeft,
    ArrowRight
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    
    const customPage = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const canProceed = ref(false);
    const showControls = ref(true);
    const pageFrame = ref(null);
    
    const iframeStyle = computed(() => ({
      width: '100%',
      height: 'calc(100vh - 200px)', // 減去 header 和 controls 的高度
      border: 'none'
    }));
    
    const pageUrl = computed(() => {
      if (!customPage.value) return '';
      return `/api/custom-pages/public/${customPage.value.slug}`;
    });
    
    // 載入客製化頁面
    const loadCustomPage = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const response = await customPageService.getCustomPage(route.params.id);
        customPage.value = response.data;
        
        // 檢查頁面狀態
        if (customPage.value.status !== 'ready') {
          error.value = '客製化頁面尚未準備就緒';
          return;
        }
        
        // 根據設定決定是否顯示控制面板
        showControls.value = customPage.value.settings?.allowNavigation !== false;
        
        // 根據進度觸發類型設定初始狀態
        if (customPage.value.settings?.progressTrigger === 'manual') {
          canProceed.value = true;
        } else if (customPage.value.settings?.progressTrigger === 'timer') {
          // 設定計時器
          setTimeout(() => {
            canProceed.value = true;
            if (customPage.value.settings?.autoProgress) {
              goNext();
            }
          }, (customPage.value.settings?.progressDelay || 0) * 1000);
        }
        
      } catch (err) {
        console.error('載入客製化頁面失敗:', err);
        error.value = '載入頁面失敗';
        ElMessage.error('載入客製化頁面失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 設定訊息監聽器
    const setupMessageListener = () => {
      window.addEventListener('message', handleMessage);
    };
    
    // 處理來自 iframe 的訊息
    const handleMessage = (event) => {
      // 檢查來源是否為我們的客製化頁面
      if (event.origin !== window.location.origin) {
        return;
      }
      
      if (event.data.type === 'CUSTOM_PAGE_PROGRESS') {
        handleProgressUpdate(event.data);
      }
    };
    
    // 處理進度更新
    const handleProgressUpdate = (data) => {
      console.log('收到進度更新:', data);
      
      switch (data.action) {
        case 'complete':
          canProceed.value = true;
          updateProgress(data.data);
          break;
        case 'next':
          goNext();
          break;
        case 'previous':
          goBack();
          break;
        case 'ready':
          canProceed.value = true;
          break;
      }
    };
    
    // 更新進度
    const updateProgress = async (progressData) => {
      try {
        // 檢查是否在 PlayBook 中
        if (route.query.playbook && route.query.step) {
          const playBookId = route.query.playbook;
          const stepNumber = parseInt(route.query.step);
          const userId = route.query.userId;
          
          // 調用 API 更新 PlayBook 進度
          const response = await fetch(`/api/playbooks/${playBookId}/progress/custom-page/${stepNumber}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              stepNumber,
              progressData,
              userId
            })
          });
          
          if (response.ok) {
            console.log('進度更新成功:', progressData);
          } else {
            console.error('進度更新失敗:', await response.text());
          }
        } else {
          console.log('獨立訪問，不更新進度:', progressData);
        }
      } catch (error) {
        console.error('更新進度失敗:', error);
      }
    };
    
    // 頁面載入完成
    const onPageLoad = () => {
      console.log('客製化頁面載入完成');
      
      // 如果設定為互動觸發，等待用戶互動
      if (customPage.value?.settings?.progressTrigger === 'interaction') {
        // 可以通過 postMessage 告訴 iframe 頁面準備就緒
        if (pageFrame.value?.contentWindow) {
          pageFrame.value.contentWindow.postMessage({
            type: 'CUSTOM_PAGE_READY',
            settings: customPage.value.settings
          }, '*');
        }
      }
    };
    
    // 頁面載入錯誤
    const onPageError = () => {
      error.value = '頁面載入失敗';
      ElMessage.error('頁面載入失敗');
    };
    
    // 獲取進度觸發文字
    const getProgressTriggerText = (trigger) => {
      const textMap = {
        manual: '手動',
        timer: '計時',
        interaction: '互動',
        completion: '完成'
      };
      return textMap[trigger] || '手動';
    };
    
    // 下一步
    const goNext = () => {
      // 發送事件給父組件或路由跳轉
      if (route.query.playbook && route.query.step) {
        // 在 PlayBook 中，發送事件給父組件
        window.parent.postMessage({
          type: 'PLAYBOOK_NEXT_STEP',
          playbookId: route.query.playbook,
          currentStep: parseInt(route.query.step)
        }, '*');
      } else {
        // 獨立訪問，返回上一頁
        router.go(-1);
      }
    };
    
    // 返回
    const goBack = () => {
      if (route.query.playbook && route.query.step) {
        // 在 PlayBook 中，發送事件給父組件
        window.parent.postMessage({
          type: 'PLAYBOOK_PREVIOUS_STEP',
          playbookId: route.query.playbook,
          currentStep: parseInt(route.query.step)
        }, '*');
      } else {
        // 獨立訪問，返回上一頁
        router.go(-1);
      }
    };
    
    onMounted(() => {
      loadCustomPage();
      setupMessageListener();
    });
    
    onUnmounted(() => {
      window.removeEventListener('message', handleMessage);
    });
    
    return {
      customPage,
      loading,
      error,
      canProceed,
      showControls,
      pageFrame,
      iframeStyle,
      pageUrl,
      onPageLoad,
      onPageError,
      getProgressTriggerText,
      goNext,
      goBack
    };
  }
};
</script>

<style scoped>
.custom-page-player {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.page-container {
  flex: 1;
  overflow: hidden;
}

.page-controls {
  flex-shrink: 0;
}
</style>
