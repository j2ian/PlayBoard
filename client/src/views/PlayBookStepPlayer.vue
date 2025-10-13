<template>
  <div class="min-h-screen">
    <!-- 頂部進度條（customPage 時隱藏） -->
    <div 
      class="bg-white shadow-sm border-b border-gray-200"
      v-if="!(currentStep && currentStep.type === 'customPage')"
    >
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between mb-2">
          <router-link to="/" class="text-lg font-semibold text-[color:var(--pb-color-primary)]">
            PlayBoard
          </router-link>
          <div class="text-sm text-gray-600">
            {{ playbook?.title || '載入中...' }}
          </div>
        </div>
        
        <!-- 進度條 -->
        <div v-if="userProgress" class="w-full">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-600">
              步驟 {{ currentStepNumber }} / {{ totalSteps }}
            </span>
            <span class="text-xs text-gray-600">
              {{ Math.round((currentStepNumber / totalSteps) * 100) }}% 完成
            </span>
          </div>
          <el-progress 
            :percentage="Math.round((currentStepNumber / totalSteps) * 100)"
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

    <!-- 步驟內容（customPage 全屏 iframe，隱藏外層導覽） -->
    <div v-else-if="currentStep && currentStep.type === 'customPage'" class="w-full h-screen">
      <iframe 
        v-if="customPageSrc"
        class="w-full h-full border-0"
        :src="customPageSrc"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        ref="customPageFrame"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <el-alert type="warning" :title="customPageWarning" :closable="false" />
      </div>
    </div>

    <!-- 其他步驟內容 -->
    <div v-else-if="currentStep" class="max-w-4xl mx-auto px-4 py-8">
      <!-- 步驟標題 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg">
            {{ currentStep.stepNumber }}
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ currentStep.title }}</h1>
            <div class="flex items-center gap-2 mt-1">
              <el-tag :type="getStepTypeColor(currentStep.type)" size="small">
                {{ getStepTypeLabel(currentStep.type) }}
              </el-tag>
              <el-tag v-if="currentStep.isRequired" type="danger" size="small" effect="plain">
                必須完成
              </el-tag>
            </div>
          </div>
        </div>
        
        <p v-if="currentStep.description" class="text-gray-600 mb-4">
          {{ currentStep.description }}
        </p>
        
        <!-- 步驟內容預覽 -->
        <div v-if="currentStep.resource" class="bg-gray-50 rounded-lg p-4 mb-4">
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <h3 class="font-medium text-gray-800 mb-2">{{ currentStep.resource.title }}</h3>
              
              <!-- Content預覽 -->
              <div v-if="currentStep.type === 'content'" class="text-sm text-gray-600">
                <p v-if="currentStep.resource.excerpt">{{ currentStep.resource.excerpt }}</p>
              </div>
              
              <!-- Exam預覽 -->
              <div v-else-if="currentStep.type === 'exam'" class="text-sm text-gray-600">
                <p v-if="currentStep.resource.description">{{ currentStep.resource.description }}</p>
                <div v-if="currentStep.resource.questionCount || (appConfig?.features?.showDifficultyFields && currentStep.resource.timeLimit)" class="flex gap-4 mt-2">
                  <span v-if="currentStep.resource.questionCount">
                    📝 {{ currentStep.resource.questionCount }} 題
                  </span>
                  <span v-if="appConfig?.features?.showDifficultyFields && currentStep.resource.timeLimit">
                    ⏱️ {{ currentStep.resource.timeLimit }} 分鐘
                  </span>
                </div>
              </div>
              
              <!-- Survey預覽 -->
              <div v-else-if="currentStep.type === 'survey'" class="text-sm text-gray-600">
                <p v-if="currentStep.resource.description">{{ currentStep.resource.description }}</p>
                <div v-if="currentStep.resource.questions" class="mt-2">
                  📋 {{ currentStep.resource.questions.length }} 個問題
                </div>
              </div>
              
              <!-- CustomPage預覽 -->
              <div v-else-if="currentStep.type === 'customPage'" class="text-sm text-gray-600">
                <p v-if="currentStep.resource.description">{{ currentStep.resource.description }}</p>
                <div class="mt-2 flex gap-4">
                  <span v-if="currentStep.resource.category">
                    📁 {{ currentStep.resource.category }}
                  </span>
                  <span v-if="currentStep.resource.viewCount">
                    👁️ {{ currentStep.resource.viewCount }} 次瀏覽
                  </span>
                </div>
                <div v-if="currentStep.resource.settings" class="mt-2 text-xs text-gray-500">
                  <span v-if="currentStep.resource.settings.allowFullscreen">🖥️ 全螢幕</span>
                  <span v-if="currentStep.resource.settings.autoProgress" class="ml-2">⚡ 自動進度</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按鈕 -->
        <div class="flex justify-between items-center">
          <div class="flex gap-2">
            <!-- 返回PlayBook總覽 -->
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
          
          <div class="flex gap-2">
            <!-- 開始/繼續步驟 -->
            <el-button 
              type="primary" 
              size="large"
              @click="startCurrentStep"
              :loading="startingStep"
            >
              <el-icon><CaretRight /></el-icon>
              {{ isStepCompleted(currentStep.stepNumber) ? '重新學習' : '開始學習' }}
            </el-button>
            
            <!-- 下一步（如果已完成當前步驟） -->
            <el-button 
              v-if="isStepCompleted(currentStep.stepNumber) && hasNextStep"
              type="success" 
              size="large"
              @click="goToNextStep"
            >
              下一步
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 已完成步驟的成果展示 -->
      <div v-if="isStepCompleted(currentStep.stepNumber)" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-2 mb-2">
          <el-icon class="text-green-600" size="20"><CircleCheck /></el-icon>
          <span class="font-medium text-green-800">此步驟已完成</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-600">
          <div>
            <span class="font-medium">完成時間：</span>
            {{ formatDate(getStepResult(currentStep.stepNumber)?.completedAt) }}
          </div>
          <div v-if="getStepResult(currentStep.stepNumber)?.timeRecord?.stepTimeSpent">
            <span class="font-medium">花費時間：</span>
            {{ formatTime(getStepResult(currentStep.stepNumber)?.timeRecord?.stepTimeSpent) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 完成慶祝 -->
    <div v-else-if="isAllCompleted" class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <el-icon size="64" class="text-green-500 mb-4"><Trophy /></el-icon>
        <h2 class="text-3xl font-bold text-green-800 mb-4">🎉 恭喜完成！</h2>
        <p class="text-lg text-green-600 mb-6">
          您已成功完成「{{ playbook?.title }}」的所有步驟
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-green-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-green-600">{{ totalSteps }}</div>
            <div class="text-sm text-green-600">完成步驟</div>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-blue-600">
              {{ formatDuration(Math.round((userProgress?.timeSpent || 0) / 60)) }}
            </div>
            <div class="text-sm text-blue-600">學習時間</div>
          </div>
          <div class="bg-purple-50 rounded-lg p-4">
            <div class="text-2xl font-bold text-purple-600">100%</div>
            <div class="text-sm text-purple-600">完成率</div>
          </div>
        </div>
        <div class="flex gap-3 justify-center">
          <el-button type="primary" @click="backToOverview">
            查看學習記錄
          </el-button>
          <el-button @click="restartPlayBook" plain>
            重新學習
          </el-button>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><Warning /></el-icon>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">出現錯誤</h2>
        <p class="text-gray-600 mb-6">無法載入步驟內容</p>
        <el-button type="primary" @click="backToOverview">返回總覽</el-button>
      </div>
    </div>

    <!-- 下一步確認對話框 -->
    <el-dialog v-model="showNextStepDialog" title="進入下一步" width="400px">
      <div class="text-center">
        <el-icon size="48" class="text-green-500 mb-4"><CircleCheck /></el-icon>
        <p class="mb-4">恭喜完成這個步驟！</p>
        <p class="text-gray-600 mb-4">
          準備好進入下一步了嗎？
        </p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-3">
          <el-button @click="showNextStepDialog = false">稍後再說</el-button>
          <el-button type="primary" @click="confirmNextStep">
            進入下一步
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import PlayBookService from '@/services/playbook.service'
import appConfig from '@/config/app.config'
import { 
  ArrowLeft, ArrowRight, CaretRight, CircleCheck, Trophy, Warning
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const startingStep = ref(false)
const playbook = ref(null)
const userProgress = ref(null)
const currentStepNumber = ref(1)
const showNextStepDialog = ref(false)
const stepStartTime = ref(null) // 新增：步驟開始時間追蹤
const showCustomPage = ref(false)
const customPageSrc = computed(() => {
  const step = currentStep.value
  const slug = step?.resource?.slug
  if (!step || step.type !== 'customPage') return ''
  if (!slug) return ''
  const url = `/api/custom-pages/public/${slug}?playbook=${playbook.value?._id}&step=${step.stepNumber}&userId=${userId.value}`
  console.log('[CustomPage] 準備載入 iframe:', {
    slug,
    playbookId: playbook.value?._id,
    stepNumber: step.stepNumber,
    userId: userId.value,
    url
  })
  return url
})
const customPageWarning = computed(() => {
  // 資料尚在載入時，先顯示友善提示，避免誤報
  if (loading.value || !playbook.value) return '載入中，請稍候...'
  const step = currentStep.value
  if (!step) return '客製化頁面：步驟資料缺失'
  if (step.type !== 'customPage') return '非客製化頁面步驟'
  const hasResource = !!step.resource
  const slug = step.resource?.slug
  if (!hasResource) return '客製化頁面：資源尚未填充（請稍候或重新整理）'
  if (!slug) return '客製化頁面：資源缺少 slug（請確認頁面狀態為 ready）'
  return '客製化頁面載入中或設定有誤'
})

// 監聽來自客製化頁面的完成/更新訊息
const handleCustomPageMessage = async (event) => {
  if (event.origin !== window.location.origin) return
  const data = event.data
  if (!data || data.type !== 'CUSTOM_PAGE_PROGRESS') return
  if (data.action === 'complete') {
    await completeCurrentStep({ type: 'customPage', ...data.data })
    if (hasNextStep.value) {
      goToNextStep()
    } else {
      router.push({ path: `/playbook/${route.params.slug}/completed` })
    }
  }
}

onMounted(() => {
  window.addEventListener('message', handleCustomPageMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleCustomPageMessage)
})

// 從查詢參數獲取步驟編號
const stepFromQuery = computed(() => {
  return parseInt(route.query.step) || 1
})

// 當前步驟
const currentStep = computed(() => {
  if (!playbook.value?.steps) return null
  return playbook.value.steps.find(step => step.stepNumber === currentStepNumber.value)
})

// 總步驟數
const totalSteps = computed(() => {
  return playbook.value?.totalSteps || playbook.value?.steps?.length || 0
})

// 是否有上一步
const hasPreviousStep = computed(() => {
  return currentStepNumber.value > 1
})

// 是否有下一步
const hasNextStep = computed(() => {
  return currentStepNumber.value < totalSteps.value
})

// 是否全部完成
const isAllCompleted = computed(() => {
  return userProgress.value?.isCompleted
})

// 用戶ID
const userId = ref('')

onMounted(async () => {
  userId.value = PlayBookService.getUserId()
  currentStepNumber.value = stepFromQuery.value
  await fetchPlayBook()
  if (playbook.value) {
    await fetchUserProgress()
    // 移除殘留的 completed 參數，避免影響後續步驟
    if (route.query.completed) {
      const { completed, ...rest } = route.query
      router.replace({ query: { ...rest } })
    }
    handleCompletedFlag()
  }
})

// 監聽路由變化
watch(() => route.query.step, (newStep) => {
  if (newStep) {
    currentStepNumber.value = parseInt(newStep)
  }
})

// 獲取PlayBook資料
const fetchPlayBook = async () => {
  try {
    const slug = route.params.slug
    const response = await PlayBookService.getPublicPlayBook(slug)
    
    if (response.data && response.data.success) {
      playbook.value = response.data.data
      document.title = `${playbook.value.title} - 步驟 ${currentStepNumber.value} - PlayBoard`
      try {
        const stepNum = currentStepNumber.value
        const step = playbook.value?.steps?.find(s => s.stepNumber === stepNum)
        console.log('[StepPlayer] 路由步驟號:', stepNum, '步驟總數:', playbook.value?.steps?.length)
        console.log('[StepPlayer] 當前步驟類型:', step?.type)
        console.log('[StepPlayer] 當前步驟resource存在?:', !!step?.resource, 'resource概要:', step?.resource ? { slug: step.resource.slug, title: step.resource.title, status: step.resource.status } : null)
      } catch (e) {
        console.warn('[StepPlayer] 步驟資訊紀錄時發生例外:', e)
      }
    } else {
      throw new Error('PlayBook資料格式錯誤')
    }
  } catch (error) {
    console.error('獲取PlayBook失敗:', error)
    ElMessage.error('載入PlayBook失敗')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 獲取用戶進度
const fetchUserProgress = async () => {
  try {
    console.log('開始獲取用戶進度 (StepPlayer)...')
    console.log('PlayBook ID:', playbook.value._id)
    console.log('User ID:', userId.value)
    
    const response = await PlayBookService.getOrCreateProgress(
      playbook.value._id,
      userId.value,
      PlayBookService.getUserName() || '匿名用戶'
    )
    
    console.log('API回應 (StepPlayer):', response)
    
    if (response.data && response.data.success) {
      userProgress.value = response.data.data
      console.log('用戶進度載入成功 (StepPlayer):', userProgress.value)
      
      // 驗證 completedSteps 是否為陣列
      if (!Array.isArray(userProgress.value.completedSteps)) {
        console.warn('completedSteps 不是陣列，修正為空陣列')
        userProgress.value.completedSteps = []
      }
      
      PlayBookService.savePlayBookProgress(playbook.value._id, userProgress.value)
    } else {
      console.error('API回應格式錯誤 (StepPlayer):', response)
    }
  } catch (error) {
    console.error('獲取用戶進度失敗 (StepPlayer):', error)
    console.error('錯誤詳情:', error.message)
    
    // 嘗試從本地載入
    const localProgress = PlayBookService.getLocalProgress(playbook.value._id)
    if (localProgress) {
      console.log('使用本地保存的進度 (StepPlayer)')
      userProgress.value = localProgress
      
      // 確保 completedSteps 是陣列
      if (!Array.isArray(userProgress.value.completedSteps)) {
        userProgress.value.completedSteps = []
      }
    } else {
      // 創建默認進度
      console.log('創建默認用戶進度 (StepPlayer)')
      userProgress.value = {
        currentStep: 1,
        completedSteps: [],
        isCompleted: false,
        isNewUser: true,
        timeSpent: 0
      }
    }
  }
}

// 開始當前步驟
const startCurrentStep = () => {
  startingStep.value = true
  
  try {
    const step = currentStep.value
    const stepType = step.type
    const resourceId = step.resourceId
    
    // 記錄步驟開始時間
    stepStartTime.value = Date.now()
    
    // 構建查詢參數
    const query = {
      playbook: playbook.value._id,
      playbookSlug: route.params.slug,
      step: step.stepNumber,
      userId: userId.value,
      returnTo: 'stepPlayer'
    }
    
    switch (stepType) {
      case 'content':
        // 導航到專用的內容顯示頁面
        router.push({
          path: `/playbook/${route.params.slug}/step/content`,
          query: { step: step.stepNumber }
        })
        break
      case 'exam':
        router.push({
          path: `/exams/${resourceId}/take`,
          query
        })
        break
      case 'survey':
        router.push({
          path: `/surveys/${resourceId}/take`,
          query
        })
        break
      case 'customPage':
        showCustomPage.value = true
        // customPage 在本頁以 iframe 呈現，僅記錄開始時間
        break
    }
  } catch (error) {
    ElMessage.error('無法開始步驟')
  } finally {
    startingStep.value = false
  }
}

// 計算步驟花費時間
const calculateStepTimeSpent = () => {
  if (!stepStartTime.value) return 0
  const endTime = Date.now()
  const timeSpent = Math.round((endTime - stepStartTime.value) / 1000) // 轉換為秒
  return timeSpent
}

// 完成當前步驟
const completeCurrentStep = async (result = null) => {
  try {
    const timeSpent = calculateStepTimeSpent()
    
    // 更新步驟進度，包含時間記錄
    await PlayBookService.updateStepProgress(
      playbook.value._id,
      currentStepNumber.value,
      userId.value,
      {
        ...result,
        stepStartTime: stepStartTime.value,
        stepEndTime: Date.now(),
        timeSpent: timeSpent,
        completedAt: new Date().toISOString()
      },
      timeSpent
    )
    
    // 重新獲取進度
    await fetchUserProgress()
    
    // 重置時間追蹤
    stepStartTime.value = null
    
    ElMessage.success('步驟已完成')
  } catch (error) {
    console.error('完成步驟失敗:', error)
    ElMessage.error('完成步驟失敗')
  }
}

// 上一步
const goToPreviousStep = () => {
  if (hasPreviousStep.value) {
    currentStepNumber.value--
    updateURL()
  }
}

// 下一步
const goToNextStep = () => {
  if (hasNextStep.value) {
    currentStepNumber.value++
    updateURL()
  } else {
    // 沒有下一步，直接前往完成頁
    router.push({ path: `/playbook/${route.params.slug}/completed` })
  }
}

// 確認下一步
const confirmNextStep = () => {
  showNextStepDialog.value = false
  goToNextStep()
}

// 更新URL
const updateURL = () => {
  router.replace({
    query: { ...route.query, step: currentStepNumber.value }
  })
}

// 返回總覽
const backToOverview = () => {
  router.push({
    path: `/playbook/${route.params.slug}`,
    query: { preventAuto: '1' }
  })
}

// 重新開始PlayBook
const restartPlayBook = async () => {
  try {
    // 後端重置 + 清空本地
    await PlayBookService.resetProgress(playbook.value._id, userId.value)
    PlayBookService.clearPlayBookProgress(playbook.value._id)
    await fetchUserProgress() // 重新創建進度
    currentStepNumber.value = 1
    updateURL()
    ElMessage.success('已重新開始學習')
  } catch (error) {
    ElMessage.error('重新開始失敗')
  }
}

// 工具方法
const getStepTypeLabel = (type) => {
  const typeMap = {
    content: '內容',
    exam: '測驗',
    survey: '問卷',
    customPage: '客製化頁面'
  }
  return typeMap[type] || type
}

const getStepTypeColor = (type) => {
  const colorMap = {
    content: 'primary',
    exam: 'warning',
    survey: 'success',
    customPage: 'info'
  }
  return colorMap[type] || 'info'
}

const isStepCompleted = (stepNumber) => {
  const completedSteps = userProgress.value?.completedSteps
  return Array.isArray(completedSteps) ? completedSteps.includes(stepNumber) : false
}

const getStepResult = (stepNumber) => {
  return userProgress.value?.stepResults?.get?.(stepNumber.toString())
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW')
}

const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes || 0)
}

const formatTime = (seconds) => {
  if (!seconds) return '0秒'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds > 0 ? remainingSeconds + '秒' : ''}`
  } else {
    return `${remainingSeconds}秒`
  }
}

// 處理從外部返回後的 completed 旗標（需在進度載入後）
const handleCompletedFlag = () => {
  const completed = route.query.completed
  if (!completed || showNextStepDialog.value) return
  // 確保有最新進度再判斷
  setTimeout(() => {
    if (hasNextStep.value) {
      showNextStepDialog.value = true
    } else {
      // 最後一步完成後直接前往完成頁面
      router.push({ path: `/playbook/${route.params.slug}/completed` })
    }
  }, 300)
}

// 當查詢參數變化（特別是 completed 或 step）時也處理
watch(() => ({ completed: route.query.completed, step: route.query.step }), (nv, ov) => {
  // 先處理 completed，再清除它，避免殘留
  if (nv.completed) {
    handleCompletedFlag()
    const { completed, ...rest } = route.query
    router.replace({ query: { ...rest } })
  } else {
    handleCompletedFlag()
  }
})
</script>

<style scoped>
.step-content {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
