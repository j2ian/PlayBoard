<template>
  <AdminLayout title="問卷詳情">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">問卷詳情</span>
          <div class="flex gap-2">
            <el-button type="success" @click="viewResponses">
              <el-icon><DataAnalysis /></el-icon>查看統計
            </el-button>
            <el-button type="primary" @click="editSurvey">
              <el-icon><EditPen /></el-icon>編輯
            </el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="survey" class="max-w-4xl mx-auto">
        <!-- 基本資訊 -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ survey.title }}</h2>
          <p v-if="survey.description" class="text-gray-600 mb-4">{{ survey.description }}</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ survey.questions.length }}</div>
              <div class="text-sm text-gray-600">問題數量</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ formatDate(survey.createdAt) }}</div>
              <div class="text-sm text-gray-600">建立日期</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">{{ survey.createdBy?.username || '未知' }}</div>
              <div class="text-sm text-gray-600">建立者</div>
            </div>
          </div>
        </div>

        <!-- 問題列表 -->
        <div class="space-y-6">
          <h3 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">問卷題目</h3>
          
          <div v-for="(question, index) in survey.questions" :key="index" class="p-4 border border-gray-200 rounded-lg">
            <div class="flex items-start justify-between mb-3">
              <h4 class="text-lg font-medium text-gray-700">第 {{ index + 1 }} 題</h4>
              <el-tag :type="getTypeTagType(question.type)" size="small">
                {{ getTypeLabel(question.type) }}
              </el-tag>
            </div>
            
            <p class="text-gray-800 mb-4 text-base">{{ question.text }}</p>
            
            <!-- 李克特量表選項展示 -->
            <div v-if="question.type === 'likert'" class="bg-blue-50 p-3 rounded">
              <h5 class="text-sm font-medium text-blue-800 mb-2">滿意度量表選項：</h5>
              <div class="flex flex-wrap gap-2">
                <el-tag 
                  v-for="option in likertOptions" 
                  :key="option.value"
                  :color="option.color"
                  effect="light"
                  size="small"
                >
                  {{ option.value }}. {{ option.label }}
                </el-tag>
              </div>
            </div>
            
            <!-- 單選/多選選項展示 -->
            <div v-else-if="question.type === 'single' || question.type === 'multiple'" class="bg-gray-50 p-3 rounded">
              <h5 class="text-sm font-medium text-gray-700 mb-2">選項：</h5>
              <div class="space-y-1">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center">
                  <span class="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded-full text-xs font-medium mr-2">
                    {{ String.fromCharCode(65 + optionIndex) }}
                  </span>
                  <span>{{ option }}</span>
                </div>
              </div>
            </div>
            
            <!-- 文字題說明 -->
            <div v-else-if="question.type === 'text'" class="bg-green-50 p-3 rounded">
              <p class="text-sm text-green-700">
                <el-icon><EditPen /></el-icon>
                這是簡述題，學生可以輸入文字回答。
              </p>
            </div>
          </div>
        </div>

        <!-- 分享連結 -->
        <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 class="text-lg font-medium text-blue-800 mb-2">問卷連結</h4>
          <p class="text-sm text-blue-600 mb-3">學生可以透過以下連結填寫問卷：</p>
          <div class="flex items-center gap-2">
            <el-input 
              :value="surveyUrl" 
              readonly 
              class="flex-1"
            />
            <el-button type="primary" @click="copyUrl">
              <el-icon><CopyDocument /></el-icon>複製
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import SurveyService from '@/services/survey.service'
import { DataAnalysis, EditPen, CopyDocument } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const survey = ref(null)

// 李克特量表選項
const likertOptions = ref([])

onMounted(async () => {
  likertOptions.value = SurveyService.getLikertOptions()
  await fetchSurvey()
})

// 問卷URL
const surveyUrl = computed(() => {
  if (!survey.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/surveys/${survey.value._id}/take`
})

// 獲取問卷資料
const fetchSurvey = async () => {
  try {
    const id = route.params.id
    const response = await SurveyService.getSurvey(id)
    
    if (response.data.success) {
      survey.value = response.data.data
    }
  } catch (error) {
    console.error('獲取問卷失敗:', error)
    ElMessage.error('獲取問卷失敗')
    router.push('/admin/surveys')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
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

// 複製URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(surveyUrl.value)
    ElMessage.success('連結已複製到剪貼簿')
  } catch (error) {
    ElMessage.error('複製連結失敗')
  }
}

// 查看回答統計
const viewResponses = () => {
  router.push(`/admin/surveys/${survey.value._id}/responses`)
}

// 編輯問卷
const editSurvey = () => {
  router.push(`/admin/surveys/${survey.value._id}/edit`)
}

// 返回列表
const goBack = () => {
  router.push('/admin/surveys')
}
</script>
