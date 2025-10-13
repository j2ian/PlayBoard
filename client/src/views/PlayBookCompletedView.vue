<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
    <!-- 頂部導航 -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-lg font-semibold text-blue-600">
            PlayBoard
          </router-link>
          <div class="text-sm text-gray-600">
            {{ playbook?.title || '載入中...' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中 -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <el-skeleton :rows="6" animated />
    </div>

    <!-- 完成慶祝 -->
    <div v-else-if="playbook" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- 慶祝動畫 -->
        <div class="mb-6">
          <div class="celebration-icon">
            <el-icon size="80" class="text-green-500 mb-4"><Trophy /></el-icon>
          </div>
          <div class="flex justify-center items-center gap-2 mb-4">
            <span class="text-4xl">🎉</span>
            <h1 class="text-4xl font-bold text-green-800">恭喜完成！</h1>
            <span class="text-4xl">🎉</span>
          </div>
        </div>
        
        <p class="text-xl text-green-600 mb-8">
          您已成功完成「{{ playbook.title }}」的所有學習步驟
        </p>
        
        <!-- 完成統計 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-green-50 rounded-lg p-6 border border-green-200">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ playbook.totalSteps || playbook.steps?.length || 0 }}
            </div>
            <div class="text-sm text-green-600 font-medium">完成步驟</div>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ formatDuration(totalTimeSpent) }}
            </div>
            <div class="text-sm text-blue-600 font-medium">學習時間</div>
          </div>
          
          <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <div class="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div class="text-sm text-purple-600 font-medium">完成率</div>
          </div>
        </div>
        
        <!-- 學習成果摘要 -->
        <div v-if="completedSteps.length > 0" class="text-left mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">學習成果</h3>
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="grid gap-4">
              <div 
                v-for="step in completedSteps" 
                :key="step.stepNumber"
                class="flex items-center gap-3 p-3 bg-white rounded border"
              >
                <div class="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  <el-icon><Check /></el-icon>
                </div>
                <div class="flex-1">
                  <div class="font-medium text-gray-800">{{ step.title }}</div>
                  <div class="text-sm text-gray-500">
                    {{ getStepTypeLabel(step.type) }}
                    <span v-if="step.completedAt" class="ml-2">
                      - {{ formatDate(step.completedAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <el-button 
            type="primary" 
            size="large"
            @click="backToOverview"
            :data-playbook-id="playbook._id"
            :data-action="'back-to-overview'"
            class="completion-action-btn"
          >
            <el-icon><View /></el-icon>
            查看學習記錄
          </el-button>
          
          <el-button 
            type="success" 
            size="large"
            @click="restartPlayBook"
            :data-playbook-id="playbook._id"
            :data-action="'restart'"
            class="completion-action-btn"
          >
            <el-icon><RefreshRight /></el-icon>
            重新學習
          </el-button>
          
          <el-button 
            size="large"
            @click="shareSuccess"
            :data-playbook-id="playbook._id"
            :data-action="'share'"
            class="completion-action-btn"
          >
            <el-icon><Share /></el-icon>
            分享成果
          </el-button>
        </div>
        
        <!-- 建議後續學習 -->
        <div v-if="suggestedPlayBooks.length > 0" class="mt-8 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">推薦繼續學習</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="suggested in suggestedPlayBooks" 
              :key="suggested._id"
              class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="goToPlayBook(suggested)"
            >
              <h4 class="font-medium text-gray-800 mb-2">{{ suggested.title }}</h4>
              <p class="text-sm text-gray-600 line-clamp-2">{{ suggested.description }}</p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-500">{{ suggested.totalSteps }} 步驟</span>
                <el-button size="small" type="primary" plain>開始學習</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><Warning /></el-icon>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">載入失敗</h2>
        <p class="text-gray-600 mb-6">無法載入完成資訊</p>
        <el-button type="primary" @click="backToHome">返回首頁</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PlayBookService from '@/services/playbook.service'
import { 
  Trophy, Check, View, RefreshRight, Share, Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const playbook = ref(null)
const userProgress = ref(null)
const suggestedPlayBooks = ref([])

// 用戶ID
const userId = ref('')

// 完成的步驟
const completedSteps = computed(() => {
  if (!playbook.value?.steps || !userProgress.value?.completedSteps) return []
  
  return playbook.value.steps
    .filter(step => userProgress.value.completedSteps.includes(step.stepNumber))
    .map(step => ({
      ...step,
      completedAt: userProgress.value.stepResults?.get?.(step.stepNumber.toString())?.completedAt
    }))
})

// 總學習時間
const totalTimeSpent = computed(() => {
  return userProgress.value?.timeSpent || 0
})

onMounted(async () => {
  userId.value = PlayBookService.getUserId()
  await fetchData()
})

// 獲取資料
const fetchData = async () => {
  try {
    loading.value = true
    
    // 獲取PlayBook資料
    await fetchPlayBook()
    
    if (playbook.value) {
      // 獲取用戶進度
      await fetchUserProgress()
      
      // 標記PlayBook為完成
      await markPlayBookCompleted()
      
      // 獲取推薦PlayBook
      await fetchSuggestedPlayBooks()
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
    }
  }
}

// 標記PlayBook為完成
const markPlayBookCompleted = async () => {
  try {
    if (userProgress.value && !userProgress.value.isCompleted) {
      // 這裡可以呼叫API標記為完成
      // 暫時更新本地狀態
      userProgress.value.isCompleted = true
      userProgress.value.completedAt = new Date()
      
      // 保存到本地
      PlayBookService.savePlayBookProgress(playbook.value._id, userProgress.value)
    }
  } catch (error) {
    console.error('標記完成失敗:', error)
  }
}

// 獲取推薦PlayBook
const fetchSuggestedPlayBooks = async () => {
  try {
    const response = await PlayBookService.getPublicPlayBooks({
      limit: 3,
      category: playbook.value.category
    })
    
    if (response.data && response.data.success) {
      // 排除當前PlayBook
      suggestedPlayBooks.value = response.data.data.filter(pb => pb._id !== playbook.value._id)
    }
  } catch (error) {
    console.error('獲取推薦失敗:', error)
  }
}

// 工具方法
const getStepTypeLabel = (type) => {
  const typeMap = {
    content: '內容',
    exam: '測驗',
    survey: '問卷'
  }
  return typeMap[type] || type
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds} 秒`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} 分鐘`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 
    ? `${hours} 小時 ${remainingMinutes} 分鐘`
    : `${hours} 小時`
}

// 操作方法
const backToOverview = () => {
  router.push({
    path: `/playbook/${route.params.slug}`,
    query: { preventAuto: '1' }
  })
}

const restartPlayBook = async () => {
  try {
    // 後端重置 + 清空本地
    await PlayBookService.resetProgress(playbook.value._id, userId.value)
    PlayBookService.clearPlayBookProgress(playbook.value._id)
    ElMessage.success('已重新開始學習')
    router.push({
      path: `/playbook/${route.params.slug}`,
      query: { from: 'restart', preventAuto: '1' }
    })
  } catch (error) {
    ElMessage.error('重新開始失敗')
  }
}

const shareSuccess = () => {
  const shareText = `我剛完成了「${playbook.value.title}」的學習！`
  const shareUrl = window.location.origin + `/playbook/${route.params.slug}`
  
  if (navigator.share) {
    navigator.share({
      title: playbook.value.title,
      text: shareText,
      url: shareUrl
    })
  } else {
    // 複製到剪貼簿
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
    ElMessage.success('分享連結已複製到剪貼簿')
  }
}

const goToPlayBook = (playbook) => {
  router.push(`/playbook/${playbook.slug}`)
}

const backToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.celebration-icon {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.completion-action-btn {
  transition: all 0.3s ease;
}

.completion-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
