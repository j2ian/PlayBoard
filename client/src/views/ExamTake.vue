<template>
  <div class="max-w-2xl mx-auto py-8">
    <div v-if="loading" class="text-center py-10 text-gray-500">載入中...</div>
    <div v-else-if="!exam">
      <el-empty description="查無此測驗" />
    </div>
    <div v-else>
      <h2 class="text-2xl font-bold mb-2 text-[color:var(--pb-color-primary)]">{{ exam.title }}</h2>
      <div class="mb-4 text-gray-600">{{ exam.description }}</div>
      <div class="mb-4 text-sm text-gray-500">
        <span>題目數：{{ exam.questions.length }}</span>
        <span class="ml-4">及格分數：{{ exam.passingScore }}%</span>
        <span class="ml-4">時間限制：{{ exam.timeLimit > 0 ? exam.timeLimit + ' 分鐘' : '無限制' }}</span>
      </div>
      <el-divider />
      <form @submit.prevent="submitExam">
        <div v-for="(q, idx) in exam.questions" :key="q._id" class="mb-8">
          <div class="mb-2 font-semibold">{{ idx + 1 }}. {{ q.text }}</div>
          <el-radio-group v-if="q.type === 'single'" v-model="answers[q._id]">
            <el-radio v-for="opt in q.options" :key="opt._id" :label="opt._id">
              {{ opt.text }}
            </el-radio>
          </el-radio-group>
          <el-checkbox-group v-else v-model="answers[q._id]">
            <el-checkbox v-for="opt in q.options" :key="opt._id" :label="opt._id">
              {{ opt.text }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <el-button type="primary" native-type="submit" :loading="submitting">送出測驗</el-button>
      </form>
      <el-dialog v-model="showResult" title="測驗結果" width="500px" :close-on-click-modal="false">
        <div class="text-center">
          <div class="text-3xl font-bold mb-4" :class="score >= (exam?.passingScore || 60) ? 'text-green-600' : 'text-red-600'">
            {{ score }} / 100
          </div>
          <div class="text-lg mb-4" :class="score >= (exam?.passingScore || 60) ? 'text-green-600' : 'text-red-600'">
            {{ score >= (exam?.passingScore || 60) ? '🎉 恭喜通過！' : '❌ 未達及格分數' }}
          </div>
          
          <!-- PlayBook 模式的自動導航 -->
          <div v-if="isPlayBookMode && score >= (exam?.passingScore || 60)" class="mt-6">
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
          
          <!-- 一般模式或未通過的關閉按鈕 -->
          <div v-else class="mt-4">
            <el-button v-if="isPlayBookMode" plain @click="backToPlayBook">
              返回課程
            </el-button>
            <el-button type="primary" @click="showResult = false">
              {{ isPlayBookMode ? '重新測驗' : '關閉' }}
            </el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ExamService from '@/services/exam.service'
import PlayBookService from '@/services/playbook.service'

const route = useRoute()
const router = useRouter()
const exam = ref(null)
const loading = ref(true)
const submitting = ref(false)
const answers = ref({})
const showResult = ref(false)
const score = ref(0)

// PlayBook 相關
const isPlayBookMode = computed(() => !!route.query.playbook)
const currentStep = computed(() => parseInt(route.query.step) || 1)
const autoNavigateCountdown = ref(5)
let countdownTimer = null

// 計時相關
const examStartTime = ref(null)
const examTimeSpent = ref(0)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const { data } = await ExamService.getExam(id)
      exam.value = data.data
      // 初始化答案
      answers.value = {}
      for (const q of exam.value.questions) {
        answers.value[q._id] = q.type === 'single' ? '' : []
      }
      
      // 記錄測驗開始時間
      examStartTime.value = Date.now()
    } catch (error) {
      ElMessage.error('載入測驗失敗')
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

// 計算測驗花費時間
const calculateExamTimeSpent = () => {
  if (!examStartTime.value) return 0
  const endTime = Date.now()
  const timeSpent = Math.round((endTime - examStartTime.value) / 1000) // 轉換為秒
  return timeSpent
}

const submitExam = async () => {
  if (!exam.value) return
  let correct = 0
  for (const q of exam.value.questions) {
    const userAns = answers.value[q._id]
    const correctAns = (q.correctAnswer || []).map(id => id.toString())
    if (q.type === 'single') {
      if (userAns && correctAns.includes(userAns.toString())) correct++
    } else {
      // 複選需完全一致
      if (Array.isArray(userAns) && userAns.length === correctAns.length && userAns.every(a => correctAns.includes(a.toString()))) correct++
    }
  }
  score.value = Math.round((correct / exam.value.questions.length) * 100)
  showResult.value = true
  
  // 計算測驗花費時間
  examTimeSpent.value = calculateExamTimeSpent()
  
  // 如果是 PlayBook 模式且通過測驗，更新進度並開始倒數
  if (isPlayBookMode.value && score.value >= (exam.value.passingScore || 60)) {
    await updatePlayBookProgress()
    startAutoNavigateCountdown()
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
          type: 'exam',
          examId: exam.value._id,
          examTitle: exam.value.title,
          score: score.value,
          passed: score.value >= (exam.value.passingScore || 60),
          startTime: examStartTime.value,
          endTime: Date.now(),
          timeSpent: examTimeSpent.value,
          completedAt: new Date().toISOString()
        },
        examTimeSpent.value
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
  
  const slug = route.query.playbookSlug
  const playbookId = route.query.playbook
  if (route.query.returnTo === 'stepPlayer' && slug) {
    // 返回逐步播放器（slug 用於路徑，id 用於 API）
    router.push({
      path: `/playbook/${slug}/step`,
      query: { 
        step: currentStep.value,
        completed: 'exam'
      }
    })
  } else if (slug) {
    // 返回 PlayBook 總覽（slug）
    router.push(`/playbook/${slug}`)
  } else {
    // 後備：若缺少 slug，仍嘗試回到 playbook 總覽（可能會失敗）
    router.push(`/playbook/${playbookId}`)
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