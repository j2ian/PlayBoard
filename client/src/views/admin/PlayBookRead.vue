<template>
  <AdminLayout title="PlayBook詳情">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">PlayBook詳情</span>
          <div class="flex gap-2">
            <el-button 
              v-if="playbook.status === 'published' && playbook.isPublic"
              type="success" 
              @click="openPublicLink"
            >
              <el-icon><Link /></el-icon>查看公開頁面
            </el-button>
            <el-button type="primary" @click="editPlayBook">
              <el-icon><EditPen /></el-icon>編輯
            </el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="playbook" class="max-w-4xl mx-auto">
        <!-- 標題和狀態 -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-3">
            <h1 class="text-3xl font-bold text-gray-800">{{ playbook.title }}</h1>
            <el-tag :type="getStatusTagType(playbook.status)" size="large">
              {{ getStatusLabel(playbook.status) }}
            </el-tag>
            <el-tag v-if="!playbook.isPublic" type="warning" size="large">
              私人
            </el-tag>
          </div>
          
          <div v-if="playbook.description" class="text-lg text-gray-600 mb-4">
            {{ playbook.description }}
          </div>
          
          <!-- 基本資訊 -->
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div class="flex items-center gap-1">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDuration(playbook.estimatedTime) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><List /></el-icon>
              <span>{{ playbook.totalSteps }} 個步驟</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(playbook.createdAt) }}</span>
            </div>
            <div v-if="playbook.publishedAt" class="flex items-center gap-1">
              <el-icon><Upload /></el-icon>
              <span>發布於 {{ formatDate(playbook.publishedAt) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><User /></el-icon>
              <span>{{ playbook.createdBy?.username || '未知作者' }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><View /></el-icon>
              <span>{{ playbook.viewCount || 0 }} 次瀏覽</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><Check /></el-icon>
              <span>{{ playbook.completionCount || 0 }} 次完成</span>
            </div>
          </div>
          
          <!-- 分類、難度和標籤 -->
          <div class="flex flex-wrap gap-2 mb-6">
            <el-tag type="warning" size="small" effect="plain">
              {{ playbook.category || '無分類' }}
            </el-tag>
            <el-tag :type="getDifficultyColor(playbook.difficulty)" size="small">
              {{ getDifficultyLabel(playbook.difficulty) }}
            </el-tag>
            <el-tag
              v-for="tag in playbook.tags"
              :key="tag"
              type="info"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 學習步驟 -->
        <div class="mb-8">
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
                class="absolute left-6 top-16 w-0.5 h-16 bg-gray-200 z-0"
              ></div>
              
              <!-- 步驟卡片 -->
              <div class="relative z-10 flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <!-- 步驟編號 -->
                <div class="flex-shrink-0 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {{ step.stepNumber }}
                </div>
                
                <!-- 步驟內容 -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-800 text-lg">{{ step.title }}</h4>
                    <el-tag :type="getStepTypeColor(step.type)" size="small" effect="plain">
                      {{ getStepTypeLabel(step.type) }}
                    </el-tag>
                    <el-tag v-if="step.isRequired" type="danger" size="small" effect="plain">
                      必須
                    </el-tag>
                  </div>
                  
                  <p v-if="step.description" class="text-gray-600 mb-3">
                    {{ step.description }}
                  </p>
                  
                  <!-- 關聯資源資訊 -->
                  <div v-if="step.resource" class="bg-gray-50 rounded-lg p-3">
                    <div class="flex items-start gap-3">
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 mb-1">
                          {{ step.resource.title }}
                        </div>
                        
                        <!-- Content詳情 -->
                        <div v-if="step.type === 'content'" class="text-sm text-gray-600">
                          <div v-if="step.resource.excerpt" class="mb-2">
                            {{ step.resource.excerpt }}
                          </div>
                          <div class="flex gap-4">
                            <span>狀態：{{ step.resource.status }}</span>
                          </div>
                        </div>
                        
                        <!-- Exam詳情 -->
                        <div v-else-if="step.type === 'exam'" class="text-sm text-gray-600">
                          <div v-if="step.resource.description" class="mb-2">
                            {{ step.resource.description }}
                          </div>
                          <div class="flex gap-4">
                            <span v-if="step.resource.questionCount">
                              題目數：{{ step.resource.questionCount }}
                            </span>
                            <span v-if="step.resource.timeLimit">
                              時間限制：{{ step.resource.timeLimit }} 分鐘
                            </span>
                          </div>
                        </div>
                        
                        <!-- Survey詳情 -->
                        <div v-else-if="step.type === 'survey'" class="text-sm text-gray-600">
                          <div v-if="step.resource.description" class="mb-2">
                            {{ step.resource.description }}
                          </div>
                          <div v-if="step.resource.questions">
                            問題數：{{ step.resource.questions.length }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- 查看資源按鈕 -->
                      <el-button 
                        size="small" 
                        type="primary" 
                        plain
                        @click="viewResource(step)"
                      >
                        查看{{ getStepTypeLabel(step.type) }}
                      </el-button>
                    </div>
                  </div>
                  <div v-else class="text-red-500 text-sm">
                    ⚠️ 關聯的資源不存在或已被刪除
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 統計資訊 -->
        <div class="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">統計資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ playbook.viewCount || 0 }}</div>
              <div class="text-sm text-gray-600">總瀏覽次數</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ playbook.completionCount || 0 }}</div>
              <div class="text-sm text-gray-600">完成次數</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-2xl font-bold text-purple-600">{{ getCompletionRate() }}%</div>
              <div class="text-sm text-gray-600">完成率</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg">
              <div class="text-2xl font-bold text-orange-600">{{ playbook.totalSteps }}</div>
              <div class="text-sm text-gray-600">總步驟數</div>
            </div>
          </div>
        </div>

        <!-- 技術資訊 -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">技術資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">PlayBook ID：</span>
              <code class="bg-gray-200 px-2 py-1 rounded">{{ playbook._id }}</code>
            </div>
            <div>
              <span class="text-gray-600">URL識別符：</span>
              <code class="bg-gray-200 px-2 py-1 rounded">{{ playbook.slug }}</code>
            </div>
            <div>
              <span class="text-gray-600">建立時間：</span>
              <span>{{ formatDate(playbook.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">更新時間：</span>
              <span>{{ formatDate(playbook.updatedAt) }}</span>
            </div>
            <div v-if="playbook.lastModifiedBy">
              <span class="text-gray-600">最後修改者：</span>
              <span>{{ playbook.lastModifiedBy.username }}</span>
            </div>
            <div>
              <span class="text-gray-600">預估完成時間：</span>
              <span>{{ formatDuration(playbook.estimatedTime) }}</span>
            </div>
          </div>
        </div>

        <!-- 公開連結資訊 -->
        <div v-if="playbook.status === 'published' && playbook.isPublic" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 class="text-lg font-medium text-green-800 mb-2">公開連結</h4>
          <p class="text-sm text-green-600 mb-3">此PlayBook已發布並可公開訪問：</p>
          <div class="flex items-center gap-2">
            <el-input 
              :value="publicUrl" 
              readonly 
              class="flex-1"
            />
            <el-button type="success" @click="copyUrl">
              <el-icon><CopyDocument /></el-icon>複製
            </el-button>
            <el-button type="success" @click="openPublicLink">
              <el-icon><Link /></el-icon>開啟
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
import PlayBookService from '@/services/playbook.service'
import { 
  Link, EditPen, Clock, List, Calendar, Upload, User, View, Check,
  CopyDocument
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const playbook = ref(null)

onMounted(async () => {
  await fetchPlayBook()
})

// 公開URL
const publicUrl = computed(() => {
  if (!playbook.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/playbook/${playbook.value.slug}`
})

// 獲取PlayBook資料
const fetchPlayBook = async () => {
  try {
    const id = route.params.id
    const response = await PlayBookService.getPlayBook(id)
    
    if (response.data.success) {
      playbook.value = response.data.data
    }
  } catch (error) {
    console.error('獲取PlayBook失敗:', error)
    ElMessage.error('獲取PlayBook失敗')
    router.push('/admin/playbooks')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化持續時間
const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes || 0)
}

// 獲取狀態標籤樣式
const getStatusTagType = (status) => {
  return PlayBookService.getStatusTagType(status)
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const statusOptions = PlayBookService.getStatusOptions()
  const option = statusOptions.find(opt => opt.value === status)
  return option ? option.label : status
}

// 獲取難度顏色
const getDifficultyColor = (difficulty) => {
  return PlayBookService.getDifficultyColor(difficulty)
}

// 獲取難度標籤
const getDifficultyLabel = (difficulty) => {
  const difficultyOptions = PlayBookService.getDifficultyOptions()
  const option = difficultyOptions.find(opt => opt.value === difficulty)
  return option ? option.label : difficulty
}

// 獲取步驟類型標籤
const getStepTypeLabel = (type) => {
  const typeMap = {
    content: '內容',
    exam: '測驗',
    survey: '問卷'
  }
  return typeMap[type] || type
}

// 獲取步驟類型顏色
const getStepTypeColor = (type) => {
  const colorMap = {
    content: 'primary',
    exam: 'warning',
    survey: 'success'
  }
  return colorMap[type] || 'info'
}

// 計算完成率
const getCompletionRate = () => {
  if (!playbook.value || playbook.value.viewCount === 0) return 0
  return Math.round((playbook.value.completionCount / playbook.value.viewCount) * 100)
}

// 查看資源
const viewResource = (step) => {
  const resourceId = step.resourceId
  
  switch (step.type) {
    case 'content':
      router.push(`/admin/contents/${resourceId}`)
      break
    case 'exam':
      router.push(`/admin/exams/${resourceId}`)
      break
    case 'survey':
      router.push(`/admin/surveys/${resourceId}`)
      break
  }
}

// 複製URL
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    ElMessage.success('連結已複製到剪貼簿')
  } catch (error) {
    ElMessage.error('複製連結失敗')
  }
}

// 開啟公開連結
const openPublicLink = () => {
  window.open(publicUrl.value, '_blank')
}

// 編輯PlayBook
const editPlayBook = () => {
  router.push(`/admin/playbooks/${playbook.value._id}/edit`)
}

// 返回列表
const goBack = () => {
  router.push('/admin/playbooks')
}
</script>

<style scoped>
.step-card {
  transition: all 0.3s ease;
}

.step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
