<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 頂部導航 -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between mb-2">
          <router-link to="/" class="text-lg font-semibold text-blue-600">
            PlayBoard
          </router-link>
          <div class="text-sm text-gray-600">
            {{ playbook?.title || '載入中...' }}
          </div>
        </div>
        
        <!-- 進度條 -->
        <div v-if="stepInfo" class="w-full">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-600">
              步驟 {{ stepInfo.stepNumber }} / {{ playbook?.totalSteps || 0 }}
            </span>
            <span class="text-xs text-gray-600">
              {{ progressPercentage }}% 完成
            </span>
          </div>
          <el-progress 
            :percentage="progressPercentage"
            :stroke-width="6"
            :show-text="false"
          />
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 內容顯示 -->
    <div v-else-if="content && stepInfo" class="max-w-4xl mx-auto px-4 py-8">
      <!-- 步驟標題 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
            {{ stepInfo.stepNumber }}
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ stepInfo.title }}</h1>
            <div class="flex items-center gap-2 mt-1">
              <el-tag type="primary" size="small">內容</el-tag>
              <el-tag v-if="stepInfo.isRequired" type="danger" size="small" effect="plain">
                必須完成
              </el-tag>
            </div>
          </div>
        </div>
        
        <p v-if="stepInfo.description" class="text-gray-600">
          {{ stepInfo.description }}
        </p>
      </div>

      <!-- 內容主體 -->
      <div class="bg-white rounded-lg shadow-sm p-8 mb-6">
        <!-- 文章標題 -->
        <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ content.title }}</h2>
        
        <!-- 文章摘要 -->
        <div v-if="content.excerpt" class="text-lg text-gray-600 mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          {{ content.excerpt }}
        </div>
        
        <!-- 文章內容 -->
        <div class="prose prose-lg max-w-none">
          <!-- HTML 內容 -->
          <div 
            v-if="content.contentType === 'html'"
            v-html="content.content"
            class="content-html"
          ></div>
          
          <!-- Markdown 內容 -->
          <div 
            v-else-if="content.contentType === 'markdown'"
            v-html="renderedMarkdown"
            class="content-markdown"
          ></div>
          
          <!-- 純文字內容 -->
          <div 
            v-else
            class="whitespace-pre-wrap content-plain"
          >
            {{ content.content }}
          </div>
        </div>
        
        <!-- 標籤 -->
        <div v-if="content.tags && content.tags.length > 0" class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
          <span class="text-sm text-gray-500 mr-2">標籤：</span>
          <el-tag 
            v-for="tag in content.tags" 
            :key="tag" 
            size="small" 
            effect="plain"
            class="mr-1"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 導航按鈕 -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <!-- 閱讀時間顯示 -->
        <div v-if="contentReadTime > 0" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center gap-2 text-blue-800">
            <el-icon><Clock /></el-icon>
            <span class="font-medium">閱讀時間：{{ formatTime(contentReadTime) }}</span>
          </div>
        </div>
        
        <div class="flex justify-between items-center">
          <!-- 返回總覽 -->
          <div class="flex gap-3">
            <el-button @click="backToOverview" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回總覽
            </el-button>
            
            <!-- 上一步 -->
            <el-button 
              v-if="hasPreviousStep"
              @click="goToPreviousStep"
              plain
            >
              <el-icon><ArrowLeft /></el-icon>
              上一步
            </el-button>
          </div>
          
          <!-- 下一步 -->
          <div class="flex gap-3">
            <!-- 標記為完成 -->
            <el-button 
              v-if="!isStepCompleted"
              type="success"
              @click="markAsCompleted"
              :loading="markingComplete"
              :data-step-id="stepInfo.stepNumber"
              :data-playbook-id="playbook?._id"
              :data-step-type="stepInfo.type"
              class="next-step-btn"
            >
              <el-icon><Check /></el-icon>
              標記完成
            </el-button>
            
            <!-- 下一步 -->
            <el-button 
              type="primary" 
              size="large"
              @click="proceedToNextStep"
              :disabled="!isStepCompleted && stepInfo.isRequired"
              :data-step-id="stepInfo.stepNumber"
              :data-playbook-id="playbook?._id"
              :data-next-step-type="nextStepType"
              class="next-step-btn primary"
            >
              {{ nextStepButtonText }}
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 完成提示 -->
        <div v-if="isStepCompleted" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2 text-green-800">
            <el-icon><CircleCheck /></el-icon>
            <span class="font-medium">此步驟已完成</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><Warning /></el-icon>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">載入失敗</h2>
        <p class="text-gray-600 mb-6">無法載入內容，請稍後重試</p>
        <el-button type="primary" @click="backToOverview">返回總覽</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PlayBookService from '@/services/playbook.service'
import ContentService from '@/services/content.service'
import { marked } from 'marked'
import { 
  ArrowLeft, ArrowRight, Check, CircleCheck, Warning, Clock
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const markingComplete = ref(false)
const playbook = ref(null)
const content = ref(null)
const stepInfo = ref(null)
const userProgress = ref(null)

// 當前步驟編號
const currentStepNumber = computed(() => {
  return parseInt(route.query.step) || 1
})

// 進度百分比
const progressPercentage = computed(() => {
  if (!playbook.value?.totalSteps) return 0
  return Math.round((currentStepNumber.value / playbook.value.totalSteps) * 100)
})

// 是否有上一步
const hasPreviousStep = computed(() => {
  return currentStepNumber.value > 1
})

// 是否有下一步
const hasNextStep = computed(() => {
  return currentStepNumber.value < (playbook.value?.totalSteps || 0)
})

// 是否已完成當前步驟
const isStepCompleted = computed(() => {
  if (!userProgress.value?.completedSteps) return false
  return userProgress.value.completedSteps.includes(currentStepNumber.value)
})

// 下一步類型
const nextStepType = computed(() => {
  if (!hasNextStep.value) return null
  const nextStep = playbook.value?.steps?.find(step => 
    step.stepNumber === currentStepNumber.value + 1
  )
  return nextStep?.type || null
})

// 下一步按鈕文字
const nextStepButtonText = computed(() => {
  if (!hasNextStep.value) return '完成學習'
  
  const typeMap = {
    content: '下一篇文章',
    exam: '開始測驗',
    survey: '填寫問卷'
  }
  
  return typeMap[nextStepType.value] || '下一步'
})

// 渲染的Markdown內容
const renderedMarkdown = computed(() => {
  if (!content.value?.content || content.value.contentType !== 'markdown') return ''
  return marked(content.value.content)
})

// 用戶ID
const userId = ref('')

// 時間追蹤相關
const contentStartTime = ref(null)
const contentReadTime = ref(0)
const contentTimer = ref(null)

onMounted(async () => {
  userId.value = PlayBookService.getUserId()
  await fetchData()
  
  // 開始內容閱讀時間追蹤
  startContentTimer()
})

// 開始內容閱讀時間追蹤
const startContentTimer = () => {
  contentStartTime.value = Date.now()
  contentReadTime.value = 0
  
  // 每秒更新閱讀時間
  contentTimer.value = setInterval(() => {
    if (contentStartTime.value) {
      contentReadTime.value = Math.round((Date.now() - contentStartTime.value) / 1000)
    }
  }, 1000)
}

// 停止內容閱讀時間追蹤
const stopContentTimer = () => {
  if (contentTimer.value) {
    clearInterval(contentTimer.value)
    contentTimer.value = null
  }
}

// 計算內容閱讀時間
const calculateContentReadTime = () => {
  if (!contentStartTime.value) return 0
  return Math.round((Date.now() - contentStartTime.value) / 1000)
}

// 格式化時間顯示
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 當路由中的 step 變化時，重新抓取步驟與內容
watch(() => route.query.step, async () => {
  try {
    loading.value = true
    await fetchStepInfo()
    if (stepInfo.value?.type === 'content') {
      await fetchContent()
    }
  } finally {
    loading.value = false
  }
})

// 獲取所有需要的資料
const fetchData = async () => {
  try {
    loading.value = true
    
    // 獲取PlayBook資料
    await fetchPlayBook()
    
    if (playbook.value) {
      // 獲取用戶進度
      await fetchUserProgress()
      
      // 獲取當前步驟資訊
      await fetchStepInfo()
      
      // 獲取內容
      if (stepInfo.value && stepInfo.value.type === 'content') {
        await fetchContent()
      } else {
        throw new Error('當前步驟不是內容類型')
      }
    }
  } catch (error) {
    console.error('載入資料失敗:', error)
    ElMessage.error('載入失敗')
  } finally {
    loading.value = false
  }
}

// 獲取PlayBook資料
const fetchPlayBook = async () => {
  const slug = route.params.slug
  const response = await PlayBookService.getPublicPlayBook(slug)
  
  if (response.data && response.data.success) {
    playbook.value = response.data.data
  } else {
    throw new Error('PlayBook載入失敗')
  }
}

// 獲取用戶進度
const fetchUserProgress = async () => {
  try {
    const response = await PlayBookService.getOrCreateProgress(
      playbook.value._id,
      userId.value,
      PlayBookService.getUserName() || '匿名用戶'
    )
    
    if (response.data && response.data.success) {
      userProgress.value = response.data.data
      
      // 確保 completedSteps 是陣列
      if (!Array.isArray(userProgress.value.completedSteps)) {
        userProgress.value.completedSteps = []
      }
      
      // 保存到本地
      PlayBookService.savePlayBookProgress(playbook.value._id, userProgress.value)
    }
  } catch (error) {
    console.error('獲取用戶進度失敗:', error)
    
    // 嘗試從本地載入
    const localProgress = PlayBookService.getLocalProgress(playbook.value._id)
    if (localProgress) {
      userProgress.value = localProgress
      if (!Array.isArray(userProgress.value.completedSteps)) {
        userProgress.value.completedSteps = []
      }
    } else {
      // 創建預設進度
      userProgress.value = {
        currentStep: currentStepNumber.value,
        completedSteps: [],
        isCompleted: false,
        isNewUser: true,
        timeSpent: 0
      }
    }
  }
}

// 獲取步驟資訊
const fetchStepInfo = async () => {
  const step = playbook.value.steps?.find(step => 
    step.stepNumber === currentStepNumber.value
  )
  
  if (!step) {
    throw new Error('找不到當前步驟')
  }
  
  stepInfo.value = step
}

// 獲取內容
const fetchContent = async () => {
  try {
    let response
    
    // 如果步驟有 resource 且有 slug，使用 slug
    if (stepInfo.value.resource?.slug) {
      response = await ContentService.getPublicContent(stepInfo.value.resource.slug)
    } else {
      // 否則使用 resourceId（通過ID獲取）
      response = await ContentService.getPublicContentById(stepInfo.value.resourceId)
    }
    
    if (response.data && response.data.success) {
      content.value = response.data.data
    } else {
      throw new Error('內容載入失敗')
    }
  } catch (error) {
    console.error('獲取內容失敗:', error)
    throw error
  }
}

// 標記為完成
const markAsCompleted = async () => {
  if (markingComplete.value) return
  
  try {
    markingComplete.value = true
    
    // 停止時間追蹤並計算閱讀時間
    stopContentTimer()
    const readTime = calculateContentReadTime()
    
    // 更新步驟進度，包含詳細的時間記錄
    await PlayBookService.updateStepProgress(
      playbook.value._id,
      currentStepNumber.value,
      userId.value,
      { 
        type: 'content', 
        contentId: content.value._id,
        contentTitle: content.value.title,
        readTime: readTime,
        startTime: contentStartTime.value,
        endTime: Date.now(),
        completedAt: new Date().toISOString()
      },
      readTime
    )
    
    // 重新獲取進度
    await fetchUserProgress()
    
    ElMessage.success('步驟已完成')
  } catch (error) {
    console.error('標記完成失敗:', error)
    ElMessage.error('標記失敗')
  } finally {
    markingComplete.value = false
  }
}

// 前往下一步
const proceedToNextStep = async () => {
  // 如果步驟未完成且為必須步驟，先標記完成
  if (!isStepCompleted.value && stepInfo.value.isRequired) {
    await markAsCompleted()
  }
  
  if (hasNextStep.value) {
    // 有下一步，導航到下一步
    const nextStepNumber = currentStepNumber.value + 1
    const nextStep = playbook.value.steps.find(step => step.stepNumber === nextStepNumber)
    
    if (nextStep) {
      if (nextStep.type === 'content') {
        // 下一步是內容，停留在當前頁面類型但更新步驟
        router.push({
          path: `/playbook/${route.params.slug}/step/content`,
          query: { step: nextStepNumber }
        })
      } else {
        // 下一步是測驗或問卷，導航到逐步播放器
        router.push({
          path: `/playbook/${route.params.slug}/step`,
          query: { step: nextStepNumber }
        })
      }
    }
  } else {
    // 沒有下一步，跳轉到完成頁面
    router.push({
      path: `/playbook/${route.params.slug}/completed`
    })
  }
}

// 上一步
const goToPreviousStep = () => {
  if (hasPreviousStep.value) {
    const prevStepNumber = currentStepNumber.value - 1
    const prevStep = playbook.value.steps.find(step => step.stepNumber === prevStepNumber)
    
    if (prevStep?.type === 'content') {
      router.push({
        path: `/playbook/${route.params.slug}/step/content`,
        query: { step: prevStepNumber }
      })
    } else {
      router.push({
        path: `/playbook/${route.params.slug}/step`,
        query: { step: prevStepNumber }
      })
    }
  }
}

// 返回總覽
const backToOverview = () => {
  router.push({
    path: `/playbook/${route.params.slug}`,
    query: { preventAuto: '1' }
  })
}

// 組件卸載時清理定時器
onUnmounted(() => {
  stopContentTimer()
})
</script>

<style scoped>
@import "tailwindcss";

.prose {
  @apply text-gray-700 leading-relaxed;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply font-bold text-gray-900 mt-6 mb-4;
}

.prose h1 { @apply text-3xl; }
.prose h2 { @apply text-2xl; }
.prose h3 { @apply text-xl; }
.prose h4 { @apply text-lg; }

.prose p {
  @apply mb-4;
}

.prose ul, .prose ol {
  @apply mb-4 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4;
}

.prose code {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-100 p-4 rounded overflow-x-auto mb-4;
}

.prose pre code {
  @apply bg-transparent p-0;
}

.prose img {
  @apply max-w-full h-auto rounded-lg shadow-sm;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose table {
  @apply w-full border-collapse border border-gray-300 my-4;
}

.prose th, .prose td {
  @apply border border-gray-300 px-4 py-2;
}

.prose th {
  @apply bg-gray-50 font-semibold;
}

/* 客製化屬性 */
.next-step-btn {
  transition: all 0.3s ease;
}

.next-step-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.next-step-btn.primary {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
</style>
