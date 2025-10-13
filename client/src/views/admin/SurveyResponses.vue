<template>
  <AdminLayout title="問卷回答統計">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <span class="text-lg font-semibold">{{ surveyData?.survey?.title }} - 回答統計</span>
            <p class="text-sm text-gray-600 mt-1">總回答數：{{ surveyData?.totalResponses || 0 }}</p>
          </div>
          <div class="flex gap-2">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon>匯出資料
            </el-button>
            <el-button @click="goBack" plain>返回詳情</el-button>
          </div>
        </div>
      </template>

      <div v-if="surveyData" class="max-w-6xl mx-auto">
        <!-- 概覽統計 -->
        <div class="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="總回答數"
            :value="surveyData.totalResponses"
            icon="User"
            color="blue"
          />
          <StatCard
            title="問題總數"
            :value="surveyData.survey.questions.length"
            icon="Document"
            color="green"
          />
          <StatCard
            title="滿意度題數"
            :value="getLikertQuestionCount()"
            icon="Star"
            color="yellow"
          />
          <StatCard
            title="簡述題數"
            :value="getTextQuestionCount()"
            icon="EditPen"
            color="purple"
          />
        </div>

        <!-- 問題統計 -->
        <div class="space-y-8">
          <div v-for="(question, index) in surveyData.survey.questions" :key="index" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">第 {{ index + 1 }} 題</h3>
              <el-tag :type="getTypeTagType(question.type)" size="small">
                {{ getTypeLabel(question.type) }}
              </el-tag>
            </div>
            
            <p class="text-gray-700 mb-6">{{ question.text }}</p>
            
            <!-- 李克特量表統計 -->
            <div v-if="question.type === 'likert' && surveyData.statistics[index]">
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-600">平均分數</span>
                  <span class="text-lg font-bold text-blue-600">
                    {{ surveyData.statistics[index].average }}/5.0
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full" 
                    :style="{ width: (surveyData.statistics[index].average / 5 * 100) + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="grid grid-cols-5 gap-2">
                <div 
                  v-for="(option, optionIndex) in likertOptions" 
                  :key="option.value"
                  class="text-center p-3 rounded-lg border"
                  :style="{ backgroundColor: option.color + '20', borderColor: option.color }"
                >
                  <div class="text-xs text-gray-600 mb-1">{{ option.label }}</div>
                  <div class="text-lg font-bold" :style="{ color: option.color }">
                    {{ surveyData.statistics[index].counts[option.value] || 0 }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ getPercentage(surveyData.statistics[index].counts[option.value], surveyData.statistics[index].total) }}%
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 文字題回答 -->
            <div v-else-if="question.type === 'text' && surveyData.statistics[index]">
              <div class="mb-4">
                <span class="text-sm font-medium text-gray-600">
                  共 {{ surveyData.statistics[index].total }} 個回答
                </span>
              </div>
              
              <div v-if="surveyData.statistics[index].responses.length === 0" class="text-gray-500 text-center py-4">
                尚無回答
              </div>
              
              <div v-else class="space-y-3 max-h-60 overflow-y-auto">
                <div 
                  v-for="(response, responseIndex) in surveyData.statistics[index].responses" 
                  :key="responseIndex"
                  class="p-3 bg-gray-50 rounded border-l-4 border-blue-500"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">{{ response.studentName }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(response.createdAt) }}</span>
                  </div>
                  <p class="text-gray-800">{{ response.answer }}</p>
                </div>
              </div>
            </div>
            
            <!-- 其他類型題目統計（單選/多選） -->
            <div v-else-if="(question.type === 'single' || question.type === 'multiple') && surveyData.statistics[index]">
              <div class="space-y-2">
                <div 
                  v-for="(option, optionIndex) in question.options" 
                  :key="optionIndex"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>{{ option }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">
                      {{ getOptionCount(surveyData.statistics[index], optionIndex) }}
                    </span>
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full" 
                        :style="{ width: getOptionPercentage(surveyData.statistics[index], optionIndex, surveyData.totalResponses) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import StatCard from '@/components/admin/StatCard.vue'
import SurveyService from '@/services/survey.service'
import { Download } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const surveyData = ref(null)

// 李克特量表選項
const likertOptions = ref([])

onMounted(async () => {
  likertOptions.value = SurveyService.getLikertOptions()
  await fetchSurveyResponses()
})

// 獲取問卷回答統計
const fetchSurveyResponses = async () => {
  try {
    const id = route.params.id
    const response = await SurveyService.getSurveyResponses(id)
    
    if (response.data.success) {
      surveyData.value = response.data.data
    }
  } catch (error) {
    console.error('獲取問卷統計失敗:', error)
    ElMessage.error('獲取問卷統計失敗')
    router.push('/admin/surveys')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取百分比
const getPercentage = (count, total) => {
  if (!total) return 0
  return Math.round((count / total) * 100)
}

// 獲取李克特題目數量
const getLikertQuestionCount = () => {
  if (!surveyData.value?.survey?.questions) return 0
  return surveyData.value.survey.questions.filter(q => q.type === 'likert').length
}

// 獲取文字題數量
const getTextQuestionCount = () => {
  if (!surveyData.value?.survey?.questions) return 0
  return surveyData.value.survey.questions.filter(q => q.type === 'text').length
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

// 獲取選項計數（單選/多選題用）
const getOptionCount = (statistics, optionIndex) => {
  if (!statistics || !statistics.counts) return 0
  return statistics.counts[optionIndex] || 0
}

// 獲取選項百分比（單選/多選題用）
const getOptionPercentage = (statistics, optionIndex, total) => {
  if (!total) return 0
  const count = getOptionCount(statistics, optionIndex)
  return Math.round((count / total) * 100)
}

// 匯出資料（CSV全部回應）
const exportData = async () => {
  try {
    const id = route.params.id
    const res = await SurveyService.downloadSurveyResponsesCsv(id)

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `survey-${surveyData.value?.survey?.title || id}-responses.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('CSV 匯出成功')
  } catch (error) {
    console.error('匯出失敗:', error)
    ElMessage.error('CSV 匯出失敗')
  }
}

// 返回問卷詳情
const goBack = () => {
  router.push(`/admin/surveys/${route.params.id}`)
}
</script>
