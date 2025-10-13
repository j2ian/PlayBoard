<template>
  <div class="min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- 載入中 -->
      <el-card v-if="loading" class="text-center" v-loading="true" element-loading-text="載入中...">
        <div class="py-8">
          <p class="text-gray-600">正在載入問卷...</p>
        </div>
      </el-card>

      <!-- 問卷不存在 -->
      <el-card v-else-if="!survey" class="text-center">
        <div class="py-8">
          <el-icon size="64" class="text-gray-400 mb-4"><DocumentRemove /></el-icon>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">問卷不存在</h2>
          <p class="text-gray-600">您要填寫的問卷可能已被刪除或不存在。</p>
        </div>
      </el-card>

      <!-- 已提交成功 -->
      <el-card v-else-if="submitted" class="text-center">
        <div class="py-8">
          <el-icon size="64" class="text-green-500 mb-4"><CircleCheck /></el-icon>
          <h2 class="text-xl font-semibold text-gray-800 mb-2">提交成功</h2>
          <p class="text-gray-600">感謝您的參與！您的回答已成功提交。</p>
          
          <!-- 自動導航提示 -->
          <div v-if="isPlayBookMode" class="mt-6">
            <p class="text-[color:var(--pb-color-primary)] mb-4">{{ autoNavigateCountdown > 0 ? `${autoNavigateCountdown} 秒後自動進入下一步...` : '即將進入下一步...' }}</p>
            <div class="flex justify-center gap-3">
              <el-button type="primary" @click="proceedToNextStep" :data-step-completed="currentStep">
                立即進入下一步
              </el-button>
              <el-button plain @click="backToPlayBook">
                返回課程
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 問卷填寫表單 -->
      <div v-else>
        <!-- 問卷標題 -->
        <el-card class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ survey.title }}</h1>
          <p v-if="survey.description" class="text-gray-600">{{ survey.description }}</p>
          <div class="mt-4 text-sm text-gray-500">
            <el-icon><User /></el-icon>
            共 {{ survey.questions.length }} 題
          </div>
        </el-card>

        <!-- 學生資訊 -->
        <el-card class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">基本資訊</h3>
          <el-form :model="studentInfo" :rules="studentInfoRules" ref="studentInfoForm">
            <el-form-item label="您的姓名" prop="name" required>
              <el-input 
                v-model="studentInfo.name" 
                placeholder="請輸入您的姓名"
                :disabled="submitting || isPlayBookMode"
              />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 問題表單 -->
        <el-form :model="responses" ref="responseForm" class="space-y-6">
          <el-card v-for="(question, index) in survey.questions" :key="index" class="mb-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">
                第 {{ index + 1 }} 題
                <el-tag :type="getTypeTagType(question.type)" size="small" class="ml-2">
                  {{ getTypeLabel(question.type) }}
                </el-tag>
              </h3>
              <p class="text-gray-700">{{ question.text }}</p>
            </div>

            <!-- 李克特量表 -->
            <div v-if="question.type === 'likert'">
              <div class="mb-4">
                <div class="grid grid-cols-5 gap-2">
                  <div 
                    v-for="option in likertOptions" 
                    :key="option.value"
                    class="text-center p-2 border rounded cursor-pointer transition-all"
                    :class="{
                      'border-[color:var(--pb-color-primary)] bg-[color:var(--pb-surface-subtle)]': responses[index] === option.value,
                      'border-[color:var(--pb-border-color)] hover:border-[color:var(--pb-color-primary-600)]': responses[index] !== option.value
                    }"
                    @click="selectLikert(index, option.value)"
                  >
                    <div class="text-sm font-medium mb-1" :style="{ color: option.color }">
                      {{ option.value }}
                    </div>
                    <div class="text-xs text-gray-600">{{ option.label }}</div>
                  </div>
                </div>
              </div>
              <div v-if="responses[index]" class="text-sm text-gray-600 text-center">
                您選擇了：{{ getLikertLabel(responses[index]) }}
              </div>
            </div>

            <!-- 文字題 -->
            <div v-else-if="question.type === 'text'">
              <el-input
                v-model="responses[index]"
                type="textarea"
                :rows="4"
                placeholder="請輸入您的回答..."
                :disabled="submitting"
              />
            </div>

            <!-- 單選題 -->
            <div v-else-if="question.type === 'single'">
              <el-radio-group v-model="responses[index]" :disabled="submitting">
                <div class="space-y-2">
                  <el-radio 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    :value="optionIndex"
                    class="w-full"
                  >
                    <span class="ml-2">{{ option }}</span>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>

            <!-- 多選題 -->
            <div v-else-if="question.type === 'multiple'">
              <el-checkbox-group v-model="responses[index]" :disabled="submitting">
                <div class="space-y-2">
                  <el-checkbox 
                    v-for="(option, optionIndex) in question.options" 
                    :key="optionIndex"
                    :value="optionIndex"
                    class="w-full"
                  >
                    <span class="ml-2">{{ option }}</span>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </el-card>
        </el-form>

        <!-- 提交按鈕 -->
        <el-card class="text-center">
          <el-button 
            type="primary" 
            size="large" 
            @click="submitSurvey"
            :loading="submitting"
            :disabled="!canSubmit"
          >
            {{ submitting ? '提交中...' : '提交問卷' }}
          </el-button>
          <div class="mt-2 text-sm text-gray-500">
            請確認所有題目都已回答完成
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SurveyService from '@/services/survey.service'
import PlayBookService from '@/services/playbook.service'
import { DocumentRemove, CircleCheck, User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const survey = ref(null)

// PlayBook 相關
const isPlayBookMode = computed(() => !!route.query.playbook)
const currentStep = computed(() => parseInt(route.query.step) || 1)
const autoNavigateCountdown = ref(5)
let countdownTimer = null

// 計時相關
const surveyStartTime = ref(null)
const surveyTimeSpent = ref(0)

// 學生資訊
const studentInfo = ref({
  name: ''
})

const studentInfoRules = {
  name: [{ required: true, message: '請輸入您的姓名', trigger: 'blur' }]
}

// 問卷回答
const responses = ref({})

// 李克特量表選項
const likertOptions = ref([])

// 表單引用
const studentInfoForm = ref(null)
const responseForm = ref(null)

onMounted(async () => {
  likertOptions.value = SurveyService.getLikertOptions()
  // PlayBook 模式自動帶入姓名
  if (isPlayBookMode.value) {
    const name = PlayBookService.getUserName() || ''
    if (name) studentInfo.value.name = name
  }
  await fetchSurvey()
})

// 是否可以提交
const canSubmit = computed(() => {
  if (!studentInfo.value.name.trim()) return false
  if (!survey.value) return false
  
  // 檢查所有必要的問題是否都已回答
  for (let i = 0; i < survey.value.questions.length; i++) {
    const question = survey.value.questions[i]
    const response = responses.value[i]
    
    if (question.type === 'likert' && (!response || response < 1 || response > 5)) {
      return false
    }
    if (question.type === 'text' && (!response || !response.trim())) {
      return false
    }
    if (question.type === 'single' && (response === undefined || response === null)) {
      return false
    }
    if (question.type === 'multiple' && (!response || response.length === 0)) {
      return false
    }
  }
  
  return true
})

// 獲取問卷資料
const fetchSurvey = async () => {
  try {
    const id = route.params.id
    const response = await SurveyService.getSurveyForStudent(id)
    
    if (response.data.success) {
      survey.value = response.data.data
      // 初始化回答物件
      survey.value.questions.forEach((question, index) => {
        if (question.type === 'multiple') {
          responses.value[index] = []
        } else {
          responses.value[index] = null
        }
      })
      
      // 記錄問卷開始時間
      surveyStartTime.value = Date.now()
    }
  } catch (error) {
    console.error('獲取問卷失敗:', error)
    // 如果是404錯誤，問卷不存在
    if (error.response?.status === 404) {
      survey.value = null
    } else {
      ElMessage.error('載入問卷失敗')
    }
  } finally {
    loading.value = false
  }
}

// 計算問卷花費時間
const calculateSurveyTimeSpent = () => {
  if (!surveyStartTime.value) return 0
  const endTime = Date.now()
  const timeSpent = Math.round((endTime - surveyStartTime.value) / 1000) // 轉換為秒
  return timeSpent
}

// 選擇李克特量表選項
const selectLikert = (questionIndex, value) => {
  if (!submitting.value) {
    responses.value[questionIndex] = value
  }
}

// 獲取李克特標籤
const getLikertLabel = (value) => {
  const option = likertOptions.value.find(opt => opt.value === value)
  return option ? `${value}. ${option.label}` : value
}

// 獲取類型標籤樣式
const getTypeTagType = (type) => {
  const typeMap = {
    'likert': 'success',
    'text': 'info',
    'single': 'warning',
    'multiple': 'danger'
  }
  return typeMap[type] || 'info'
}

// 獲取類型標籤文字
const getTypeLabel = (type) => {
  const typeMap = {
    'likert': '滿意度量表',
    'text': '簡述題',
    'single': '單選題',
    'multiple': '多選題'
  }
  return typeMap[type] || type
}

// 提交問卷
const submitSurvey = async () => {
  if (!studentInfoForm.value) return
  
  submitting.value = true
  
  try {
    // 計算問卷花費時間
    surveyTimeSpent.value = calculateSurveyTimeSpent()
    
    // 驗證學生資訊
    await studentInfoForm.value.validate()
    
    if (!canSubmit.value) {
      ElMessage.warning('請完成所有題目的回答')
      return
    }
    
    const submitData = {
      studentName: studentInfo.value.name,
      responses: {}
    }
    
    // 若為 PlayBook 模式，附帶 playbook 參考
    if (isPlayBookMode.value && route.query.playbook) {
      submitData.playbook = route.query.playbook
    }
    
    // 處理回答資料
    Object.keys(responses.value).forEach(key => {
      const qIndex = Number(key)
      const question = survey.value?.questions?.[qIndex]
      let answer = responses.value[key]
      
      if (question?.type === 'text') {
        answer = (answer ?? '').toString().trim()
      } else if (question?.type === 'multiple') {
        // 多選題轉換為數組
        answer = Array.isArray(answer) ? answer : []
      }
      
      submitData.responses[key] = answer
    })
    
    const response = await SurveyService.submitSurveyResponse(survey.value._id, submitData)
    
    if (response.data.success) {
      submitted.value = true
      ElMessage.success('問卷提交成功，感謝您的參與！')
      
      // 如果是 PlayBook 模式，更新步驟進度並開始倒數
      if (isPlayBookMode.value) {
        await updatePlayBookProgress()
        startAutoNavigateCountdown()
      }
    }
  } catch (error) {
    console.error('提交問卷失敗:', error)
    ElMessage.error('提交問卷失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 更新 PlayBook 步驟進度
const updatePlayBookProgress = async () => {
  try {
    if (route.query.playbook && route.query.userId) {
      await PlayBookService.updateStepProgress(
        route.query.playbook,
        currentStep.value,
        route.query.userId,
        {
          type: 'survey',
          surveyId: survey.value._id,
          surveyTitle: survey.value.title,
          startTime: surveyStartTime.value,
          endTime: Date.now(),
          timeSpent: surveyTimeSpent.value,
          completedAt: new Date().toISOString(),
          // 將完整答案寫入進度，供後續匯出
          answers: responses.value
        },
        surveyTimeSpent.value
      )
    }
  } catch (error) {
    console.error('更新 PlayBook 進度失敗:', error)
  }
}

// 開始自動導航倒數
const startAutoNavigateCountdown = () => {
  autoNavigateCountdown.value = 5
  countdownTimer = setInterval(() => {
    autoNavigateCountdown.value--
    if (autoNavigateCountdown.value <= 0) {
      clearInterval(countdownTimer)
      proceedToNextStep()
    }
  }, 1000)
}

// 前往下一步
const proceedToNextStep = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  const slug = route.query.playbookSlug || route.query.playbook
  if (route.query.returnTo === 'stepPlayer' && slug) {
    // 返回逐步播放器，並標記完成
    router.push({
      path: `/playbook/${slug}/step`,
      query: { 
        step: currentStep.value,
        completed: 'survey'
      }
    })
  } else if (slug) {
    // 預設返回 PlayBook 總覽
    router.push(`/playbook/${slug}`)
  } else {
    // 後備：若缺少 slug，嘗試使用原始參數
    router.push(`/playbook/${route.query.playbook}`)
  }
}

// 返回 PlayBook
const backToPlayBook = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  router.push(`/playbook/${route.query.playbook}`)
}

// 清理定時器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>
