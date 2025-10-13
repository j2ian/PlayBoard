<template>
  <div class="min-h-screen">
    <!-- 頂部導航 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-bold text-[color:var(--pb-color-primary)]">
            PlayBoard
          </router-link>
          <div class="flex items-center gap-4">
            <div v-if="playbook" class="text-sm text-gray-600">
              {{ playbook.title }}
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 載入中 -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- PlayBook不存在 -->
    <div v-else-if="!playbook" class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><DocumentRemove /></el-icon>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">PlayBook不存在</h2>
        <p class="text-gray-600 mb-6">您要查看的學習路徑可能已被刪除或不存在。</p>
        <el-button type="primary" @click="goHome">返回首頁</el-button>
      </div>
    </div>

    <!-- PlayBook內容 -->
    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <!-- PlayBook標題區域 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ playbook.title }}</h1>
            <p v-if="playbook.description" class="text-gray-600 mb-4">
              {{ playbook.description }}
            </p>
            
            <!-- PlayBook資訊 -->
            <div class="flex flex-wrap gap-4 text-sm text-gray-600">
              <div class="flex items-center gap-1">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDuration(playbook.estimatedTime) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <el-icon><List /></el-icon>
                <span>{{ playbook.totalSteps }} 個步驟</span>
              </div>
              <div class="flex items-center gap-1">
                <el-icon><User /></el-icon>
                <span>{{ playbook.createdBy?.username || '匿名作者' }}</span>
              </div>
            </div>
            
            <!-- 分類和難度 -->
            <div class="flex gap-2 mt-4">
              <el-tag type="warning" effect="plain">{{ playbook.category }}</el-tag>
              <el-tag
                v-if="appConfig?.features?.showDifficultyFields"
                :type="getDifficultyColor(playbook.difficulty)"
              >
                {{ getDifficultyLabel(playbook.difficulty) }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 進度條 -->
        <div v-if="userProgress" class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">學習進度</span>
            <span class="text-sm text-gray-500">
              {{ userProgress.completedSteps.length }} / {{ userProgress.totalSteps }}
            </span>
          </div>
          <el-progress 
            :percentage="userProgress.progressPercentage" 
            :stroke-width="8"
            :show-text="false"
          />
        </div>

        <!-- 開始/繼續按鈕 -->
        <div class="flex gap-3">
          <el-button 
            v-if="!userProgress || userProgress.isNewUser"
            type="primary" 
            size="large"
            @click="startPlayBook"
            :loading="startingPlayBook"
          >
            <el-icon><CaretRight /></el-icon>
            開始學習
          </el-button>
          <el-button 
            v-else-if="!userProgress.isCompleted"
            type="primary" 
            size="large"
            @click="continuePlayBook"
          >
            <el-icon><CaretRight /></el-icon>
            繼續學習
          </el-button>
          <el-button 
            v-else
            type="success" 
            size="large"
            @click="reviewPlayBook"
          >
            <el-icon><View /></el-icon>
            重新檢視
          </el-button>
          
          <!-- 逐步模式切換按鈕 -->
          <el-button 
            v-if="playbook.displayType !== 'stepByStep' && userProgress && !userProgress.isNewUser"
            size="large" 
            type="info"
            plain
            @click="switchToStepMode"
          >
            <el-icon><Right /></el-icon>
            逐步模式
          </el-button>
          
          <el-button 
            v-if="userProgress && !userProgress.isNewUser"
            size="large" 
            plain
            @click="resetProgress"
          >
            <el-icon><RefreshRight /></el-icon>
            重新開始
          </el-button>
        </div>
      </div>

      <!-- 步驟列表（只在總覽模式顯示） -->
      <div v-if="playbook && playbook.displayType === 'overview'" class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">學習步驟</h3>
        
        <div class="space-y-4">
          <div 
            v-for="(step, index) in (playbook?.steps || [])" 
            :key="step.stepNumber"
            class="relative"
          >
            <!-- 步驟連接線 -->
            <div 
              v-if="index < (playbook?.steps?.length || 0) - 1" 
              class="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 z-0"
            ></div>
            
            <!-- 步驟卡片 -->
            <div 
              class="relative z-10 flex items-start gap-4 p-4 rounded-lg border-2 transition-all"
              :class="getStepCardClass(step)"
            >
              <!-- 步驟編號 -->
              <div 
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-semibold"
                :class="getStepNumberClass(step)"
              >
                <el-icon v-if="isStepCompleted(step.stepNumber)" class="text-white">
                  <Check />
                </el-icon>
                <span v-else class="text-white">{{ step.stepNumber }}</span>
              </div>
              
              <!-- 步驟內容 -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-semibold text-gray-800">{{ step.title }}</h4>
                  <el-tag :type="getStepTypeColor(step.type)" size="small" effect="plain">
                    {{ getStepTypeLabel(step.type) }}
                  </el-tag>
                  <el-tag v-if="step.isRequired" type="danger" size="small" effect="plain">
                    必須
                  </el-tag>
                </div>
                
                <p v-if="step.description" class="text-gray-600 text-sm mb-2">
                  {{ step.description }}
                </p>
                
                <!-- 資源資訊 -->
                <div v-if="step.resource" class="text-sm text-gray-500 mb-3">
                  <div v-if="step.type === 'content'">
                    <span>📖 {{ step.resource.title }}</span>
                    <span v-if="step.resource.excerpt" class="ml-2">
                      - {{ step.resource.excerpt.substring(0, 60) }}...
                    </span>
                  </div>
                  <div v-else-if="step.type === 'exam'">
                    <span>📝 {{ step.resource.title }}</span>
                    <span v-if="step.resource.questionCount" class="ml-2">
                      - {{ step.resource.questionCount }} 題
                    </span>
                    <span v-if="step.resource.timeLimit" class="ml-2">
                      - {{ step.resource.timeLimit }} 分鐘
                    </span>
                  </div>
                  <div v-else-if="step.type === 'survey'">
                    <span>📋 {{ step.resource.title }}</span>
                    <span v-if="step.resource.questions" class="ml-2">
                      - {{ step.resource.questions.length }} 題
                    </span>
                  </div>
                </div>
                
                <!-- 操作按鈕 -->
                <div class="flex gap-2">
                  <!-- 開始按鈕 -->
                  <el-button 
                    v-if="canAccessStep(step.stepNumber) && !isStepCompleted(step.stepNumber)"
                    type="primary" 
                    size="small"
                    @click="goToStep(step)"
                  >
                    <el-icon><CaretRight /></el-icon>
                    {{ isCurrentStep(step.stepNumber) ? '繼續' : '開始' }}
                  </el-button>
                  
                  <!-- 查看按鈕（已完成的步驟） -->
                  <el-button 
                    v-else-if="isStepCompleted(step.stepNumber)"
                    type="success" 
                    size="small" 
                    plain
                    @click="goToStep(step)"
                  >
                    <el-icon><View /></el-icon>
                    查看
                  </el-button>
                  
                  <!-- 鎖定狀態 -->
                  <el-button 
                    v-else
                    size="small" 
                    disabled
                  >
                    <el-icon><Lock /></el-icon>
                    鎖定
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 完成慶祝 -->
      <div v-if="userProgress && userProgress.isCompleted" class="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
        <div class="text-center">
          <el-icon size="48" class="text-green-500 mb-4"><CircleCheck /></el-icon>
          <h3 class="text-xl font-semibold text-green-800 mb-2">🎉 恭喜完成！</h3>
          <p class="text-green-600 mb-4">
            您已成功完成「{{ playbook.title }}」的所有步驟
          </p>
          <div class="text-sm text-green-600">
            <div>完成時間：{{ formatDate(userProgress.completedAt) }}</div>
            <div>總花費時間：{{ formatDuration(Math.round(userProgress.timeSpent / 60)) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用戶名稱對話框 -->
    <el-dialog v-model="showNameDialog" title="歡迎來到學習旅程" width="400px" :close-on-click-modal="false">
      <div class="text-center">
        <p class="mb-4">請輸入您的姓名，讓我們個人化您的學習體驗：</p>
        <el-input 
          v-model="userName" 
          placeholder="輸入您的姓名"
          @keyup.enter="confirmStartPlayBook"
        />
      </div>
      <template #footer>
        <el-button @click="skipName">跳過</el-button>
        <el-button type="primary" @click="confirmStartPlayBook">開始學習</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import PlayBookService from '@/services/playbook.service'
import appConfig from '@/config/app.config'
import { 
  DocumentRemove, Clock, List, User, CaretRight, View, RefreshRight,
  Check, Lock, CircleCheck, Right
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const playbook = ref(null)
const userProgress = ref(null)
const startingPlayBook = ref(false)
const showNameDialog = ref(false)
const userName = ref('')

// 用戶ID（自動生成或從本地儲存獲取）
const userId = ref('')

onMounted(async () => {
  // 獲取或生成用戶ID
  userId.value = PlayBookService.getUserId()
  
  // 獲取保存的用戶姓名
  userName.value = PlayBookService.getUserName()
  
  await fetchPlayBook()
  if (playbook.value) {
    await fetchUserProgress()
    
    // 逐步模式可選自動跳轉：僅在未從重新開始返回且非新用戶且未完成學習時
    if (playbook.value.displayType === 'stepByStep') {
      const preventAuto = route.query.from === 'restart' || route.query.preventAuto === '1'
      const isCompleted = userProgress.value?.isCompleted
      const shouldAutoStart = !preventAuto && userProgress.value && !userProgress.value.isNewUser && !isCompleted
      
      if (shouldAutoStart) {
        setTimeout(() => {
          const currentStepNumber = userProgress.value?.currentStep || 1
          const currentStep = playbook.value.steps?.find(step => step.stepNumber === currentStepNumber)
          
          if (currentStep) {
            if (currentStep.type === 'content') {
              router.replace({
                path: `/playbook/${route.params.slug}/step/content`,
                query: { step: currentStepNumber }
              })
            } else {
              router.replace({
                path: `/playbook/${route.params.slug}/step`,
                query: { step: currentStepNumber }
              })
            }
          }
        }, 2000)
      }
    }
  }
})

// 獲取PlayBook資料
const fetchPlayBook = async () => {
  try {
    const slug = route.params.slug
    console.log('嘗試載入PlayBook，slug:', slug)
    
    const response = await PlayBookService.getPublicPlayBook(slug)
    console.log('PlayBook API回應:', response)
    
    if (response.data && response.data.success) {
      playbook.value = response.data.data
      console.log('PlayBook載入成功:', playbook.value)
      document.title = `${playbook.value.title} - PlayBoard`
    } else {
      console.error('PlayBook API回應格式錯誤:', response)
      playbook.value = null
    }
  } catch (error) {
    console.error('獲取PlayBook失敗:', error)
    
    if (error.response) {
      console.error('錯誤回應:', error.response.data)
      console.error('錯誤狀態:', error.response.status)
      
      if (error.response.status === 404) {
        playbook.value = null
        ElMessage.error('PlayBook不存在或未發布')
      } else {
        ElMessage.error(`載入失敗：${error.response.data?.message || '伺服器錯誤'}`)
      }
    } else if (error.request) {
      console.error('網路錯誤:', error.request)
      ElMessage.error('網路連線失敗')
    } else {
      console.error('未知錯誤:', error.message)
      ElMessage.error('載入PlayBook失敗')
    }
    
    playbook.value = null
  } finally {
    loading.value = false
  }
}

// 獲取用戶進度
const fetchUserProgress = async () => {
  try {
    console.log('開始獲取用戶進度...')
    console.log('PlayBook ID:', playbook.value._id)
    console.log('User ID:', userId.value)
    console.log('User Name:', userName.value || '匿名用戶')
    
    // 先嘗試從本地獲取進度
    const localProgress = PlayBookService.getLocalProgress(playbook.value._id)
    console.log('本地進度:', localProgress)
    
    const response = await PlayBookService.getOrCreateProgress(
      playbook.value._id,
      userId.value,
      userName.value || '匿名用戶'
    )
    
    console.log('API回應:', response)
    
    if (response.data && response.data.success) {
      userProgress.value = response.data.data
      console.log('用戶進度載入成功:', userProgress.value)
      
      // 驗證 completedSteps 是否為陣列
      if (!Array.isArray(userProgress.value.completedSteps)) {
        console.warn('completedSteps 不是陣列，修正為空陣列')
        userProgress.value.completedSteps = []
      }
      
      // 保存進度到本地
      PlayBookService.savePlayBookProgress(playbook.value._id, userProgress.value)
      
      // 如果本地進度比伺服器進度新，提示用戶
      if (localProgress && localProgress.lastSaved > new Date(userProgress.value.updatedAt).getTime()) {
        console.log('發現本地進度較新，可考慮同步')
      }
    } else {
      console.error('API回應格式錯誤:', response)
    }
  } catch (error) {
    console.error('獲取用戶進度失敗:', error)
    console.error('錯誤詳情:', error.message)
    console.error('錯誤堆疊:', error.stack)
    
    // 如果網路失敗，嘗試從本地載入
    const localProgress = PlayBookService.getLocalProgress(playbook.value._id)
    if (localProgress) {
      console.log('使用本地保存的進度')
      userProgress.value = localProgress
      
      // 確保 completedSteps 是陣列
      if (!Array.isArray(userProgress.value.completedSteps)) {
        userProgress.value.completedSteps = []
      }
    } else {
      // 創建默認進度
      console.log('創建默認用戶進度')
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

// 開始PlayBook
const startPlayBook = () => {
  showNameDialog.value = true
}

// 確認開始PlayBook
const confirmStartPlayBook = async () => {
  showNameDialog.value = false
  startingPlayBook.value = true
  
  try {
    // 保存用戶姓名
    if (userName.value) {
      PlayBookService.saveUserName(userName.value)
    }
    
    await fetchUserProgress()
    
    if (userProgress.value) {
      // 根據展示模式決定行為
      if (playbook.value.displayType === 'stepByStep') {
        // 逐步模式：直接跳轉到第一步
        goToStep(playbook.value.steps[0])
      } else {
        // 總覽模式：留在當前頁面，用戶可以選擇步驟
        ElMessage.success('學習已開始，請選擇要學習的步驟')
      }
    }
  } catch (error) {
    ElMessage.error('開始學習失敗')
    console.log(error)
  } finally {
    startingPlayBook.value = false
  }
}

// 跳過姓名輸入
const skipName = () => {
  userName.value = '匿名用戶'
  confirmStartPlayBook()
}

// 繼續PlayBook
const continuePlayBook = () => {
  if (playbook.value.displayType === 'stepByStep') {
    // 逐步模式：跳轉到逐步播放器
    switchToStepMode()
  } else {
    // 總覽模式：跳轉到當前步驟
    const currentStep = playbook.value.steps.find(step => 
      step.stepNumber === userProgress.value.currentStep
    )
    if (currentStep) {
      goToStep(currentStep)
    }
  }
}

// 重新檢視PlayBook
const reviewPlayBook = () => {
  goToStep(playbook.value.steps[0])
}

// 重置進度
const resetProgress = async () => {
  try {
    await ElMessageBox.confirm(
      '確定要重新開始此PlayBook嗎？這將清除您的所有進度。',
      '確認重置',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 呼叫後端重置，並清空本地進度
    await PlayBookService.resetProgress(playbook.value._id, userId.value)
    userProgress.value = null
    PlayBookService.clearPlayBookProgress(playbook.value._id)
    await fetchUserProgress()
    ElMessage.success('進度已重置')
  } catch (error) {
    // 用戶取消
  }
}

// 前往指定步驟
const goToStep = (step) => {
  const stepType = step.type
  const resourceId = step.resourceId
  
  switch (stepType) {
    case 'content':
      // 逐步模式內容：統一前往逐步內容頁，避免依賴未載入的 resource.slug
      router.push({
        path: `/playbook/${route.params.slug}/step/content`,
        query: { step: step.stepNumber }
      })
      break
    case 'exam':
      // 前往測驗頁面
      router.push({
        path: `/exams/${resourceId}/take`,
        query: {
          playbook: playbook.value._id,          // 用於更新進度（ID）
          playbookSlug: route.params.slug,       // 用於返回路徑（slug）
          step: step.stepNumber,
          userId: userId.value,
          returnTo: 'stepPlayer'
        }
      })
      break
    case 'survey':
      // 前往問卷頁面
      router.push({
        path: `/surveys/${resourceId}/take`,
        query: {
          playbook: playbook.value._id,
          playbookSlug: route.params.slug,
          step: step.stepNumber,
          userId: userId.value,
          returnTo: 'stepPlayer'
        }
      })
      break
    case 'customPage':
      // 前往逐步播放器，由內嵌 iframe 播放客製化頁面
      router.push({
        path: `/playbook/${route.params.slug}/step`,
        query: { step: step.stepNumber }
      })
      break
  }
}

// 工具方法
const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW')
}

const getDifficultyColor = (difficulty) => {
  return PlayBookService.getDifficultyColor(difficulty)
}

const getDifficultyLabel = (difficulty) => {
  const options = PlayBookService.getDifficultyOptions()
  const option = options.find(opt => opt.value === difficulty)
  return option ? option.label : difficulty
}

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

// 步驟狀態檢查
const isStepCompleted = (stepNumber) => {
  const completedSteps = userProgress.value?.completedSteps
  return Array.isArray(completedSteps) ? completedSteps.includes(stepNumber) : false
}

const isCurrentStep = (stepNumber) => {
  return userProgress.value?.currentStep === stepNumber
}

const canAccessStep = (stepNumber) => {
  if (!userProgress.value) return stepNumber === 1
  const completedSteps = userProgress.value.completedSteps || []
  return PlayBookService.canAccessStep(stepNumber, completedSteps)
}

// 步驟卡片樣式
const getStepCardClass = (step) => {
  if (isStepCompleted(step.stepNumber)) {
    return 'border-green-300 bg-green-50'
  } else if (isCurrentStep(step.stepNumber)) {
    return 'border-blue-300 bg-blue-50'
  } else if (canAccessStep(step.stepNumber)) {
    return 'border-gray-200 bg-white hover:border-blue-200'
  } else {
    return 'border-gray-200 bg-gray-50'
  }
}

const getStepNumberClass = (step) => {
  if (isStepCompleted(step.stepNumber)) {
    return 'bg-green-500'
  } else if (isCurrentStep(step.stepNumber)) {
    return 'bg-blue-500'
  } else if (canAccessStep(step.stepNumber)) {
    return 'bg-gray-400'
  } else {
    return 'bg-gray-300'
  }
}

// 切換到逐步模式
const switchToStepMode = () => {
  const currentStep = userProgress.value?.currentStep || 1
  router.push({
    path: `/playbook/${route.params.slug}/step`,
    query: { step: currentStep }
  })
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
