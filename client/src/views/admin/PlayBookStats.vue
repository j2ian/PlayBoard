<template>
  <AdminLayout title="PlayBook統計">
    <div class="space-y-6">
      <!-- 標題區域 -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">PlayBook統計分析</h2>
          <p v-if="playbook" class="text-gray-600 mt-1">{{ playbook.title }}</p>
        </div>
        <div class="flex gap-2">
          <el-dropdown @command="handleDownload" :disabled="loading">
            <el-button type="primary" :loading="downloading">
              <el-icon><Download /></el-icon>下載結果
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">下載 JSON 格式</el-dropdown-item>
                <el-dropdown-item command="csv">下載 CSV 格式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button @click="refreshStats" :loading="loading">
            <el-icon><RefreshRight /></el-icon>重新整理
          </el-button>
          <el-button @click="goBack" plain>返回列表</el-button>
        </div>
      </div>

      <!-- 總覽統計卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full mr-4">
              <el-icon size="24" class="text-blue-600"><View /></el-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ stats.overview?.totalUsers || 0 }}
              </div>
              <div class="text-sm text-gray-600">總用戶數</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full mr-4">
              <el-icon size="24" class="text-green-600"><Check /></el-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ stats.overview?.completedUsers || 0 }}
              </div>
              <div class="text-sm text-gray-600">完成用戶數</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full mr-4">
              <el-icon size="24" class="text-purple-600"><TrendCharts /></el-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ Math.round(stats.overview?.completionRate || 0) }}%
              </div>
              <div class="text-sm text-gray-600">完成率</div>
            </div>
          </div>
        </el-card>

        <el-card class="stat-card">
          <div class="flex items-center">
            <div class="p-3 bg-orange-100 rounded-full mr-4">
              <el-icon size="24" class="text-orange-600"><Clock /></el-icon>
            </div>
            <div>
              <div class="text-2xl font-bold text-gray-800">
                {{ formatDuration(Math.round((stats.overview?.averageTimeSpent || 0) / 60)) }}
              </div>
              <div class="text-sm text-gray-600">平均完成時間</div>
              <div v-if="stats.overview?.minTimeSpent && stats.overview?.maxTimeSpent" class="text-xs text-gray-500">
                範圍: {{ formatDuration(Math.round((stats.overview.minTimeSpent || 0) / 60)) }} - {{ formatDuration(Math.round((stats.overview.maxTimeSpent || 0) / 60)) }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 步驟完成統計 -->
      <el-card v-loading="loading">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">步驟完成統計</h3>
            <el-switch
              v-model="showPercentage"
              active-text="百分比"
              inactive-text="絕對數量"
            />
          </div>
        </template>

        <div v-if="playbook && playbook.steps && playbook.steps.length > 0" class="space-y-4">
          <div 
            v-for="(step, index) in (playbook?.steps || [])" 
            :key="index"
            class="step-stat-item"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                  {{ index + 1 }}
                </span>
                <div>
                  <div class="font-medium text-gray-800">{{ step.title }}</div>
                  <div class="text-sm text-gray-500">
                    {{ getStepTypeLabel(step.type) }}
                    {{ step.isRequired ? '(必須)' : '(選填)' }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-gray-800">
                  {{ getStepCompletionCount(index + 1) }}
                  {{ showPercentage ? '%' : '人' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ showPercentage ? '完成率' : '完成人數' }}
                </div>
              </div>
            </div>
            
            <!-- 進度條 -->
            <el-progress 
              :percentage="getStepCompletionPercentage(index + 1)"
              :stroke-width="8"
              :show-text="false"
              :color="getStepProgressColor(index)"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <el-icon size="48" class="mb-2"><DocumentRemove /></el-icon>
          <p>此PlayBook還沒有步驟</p>
        </div>
      </el-card>

      <!-- 詳細分析 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 完成率分析 -->
        <el-card>
          <template #header>
            <h3 class="text-lg font-semibold">完成率分析</h3>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center gap-2">
                <el-icon class="text-green-600"><Check /></el-icon>
                <span class="text-green-800 font-medium">已完成</span>
              </div>
              <div class="text-green-800 font-semibold">
                {{ stats.overview?.completedUsers || 0 }} 人
              </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div class="flex items-center gap-2">
                <el-icon class="text-yellow-600"><Loading /></el-icon>
                <span class="text-yellow-800 font-medium">進行中</span>
              </div>
              <div class="text-yellow-800 font-semibold">
                {{ getInProgressUsers() }} 人
              </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2">
                <el-icon class="text-gray-600"><User /></el-icon>
                <span class="text-gray-800 font-medium">未完成</span>
              </div>
              <div class="text-gray-800 font-semibold">
                {{ getNotCompletedUsers() }} 人
              </div>
            </div>
          </div>
        </el-card>

        <!-- 平均進度分析 -->
        <el-card>
          <template #header>
            <h3 class="text-lg font-semibold">平均進度分析</h3>
          </template>
          
          <div class="space-y-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {{ Math.round(stats.overview?.averageProgress || 0) }}%
              </div>
              <div class="text-gray-600">平均完成進度</div>
            </div>
            
            <el-progress 
              :percentage="Math.round(stats.overview?.averageProgress || 0)"
              :stroke-width="12"
              color="#409eff"
            />
            
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-lg font-semibold text-blue-600">
                  {{ formatDuration(playbook?.estimatedTime || 0) }}
                </div>
                <div class="text-sm text-blue-600">預估時間</div>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-lg font-semibold text-green-600">
                  {{ formatDuration(Math.round((stats.overview?.averageTimeSpent || 0) / 60)) }}
                </div>
                <div class="text-sm text-green-600">實際平均時間</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- PlayBook基本資訊 -->
      <el-card v-if="playbook">
        <template #header>
          <h3 class="text-lg font-semibold">PlayBook資訊</h3>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-gray-600">PlayBook ID：</span>
            <span class="font-mono">{{ playbook._id }}</span>
          </div>
          <div>
            <span class="text-gray-600">URL識別符：</span>
            <span class="font-mono">{{ playbook.slug }}</span>
          </div>
          <div>
            <span class="text-gray-600">狀態：</span>
            <el-tag :type="getStatusTagType(playbook.status)" size="small">
              {{ getStatusLabel(playbook.status) }}
            </el-tag>
          </div>
          <div>
            <span class="text-gray-600">分類：</span>
            <span>{{ playbook.category || '無' }}</span>
          </div>
          <div>
            <span class="text-gray-600">難度：</span>
            <el-tag :type="getDifficultyColor(playbook.difficulty)" size="small">
              {{ getDifficultyLabel(playbook.difficulty) }}
            </el-tag>
          </div>
          <div>
            <span class="text-gray-600">建立時間：</span>
            <span>{{ formatDate(playbook.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-600">發布時間：</span>
            <span>{{ playbook.publishedAt ? formatDate(playbook.publishedAt) : '未發布' }}</span>
          </div>
          <div>
            <span class="text-gray-600">創建者：</span>
            <span>{{ playbook.createdBy?.username || '未知' }}</span>
          </div>
          <div>
            <span class="text-gray-600">公開狀態：</span>
            <el-tag :type="playbook.isPublic ? 'success' : 'warning'" size="small">
              {{ playbook.isPublic ? '公開' : '私人' }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import PlayBookService from '@/services/playbook.service'
import { 
  RefreshRight, View, Check, TrendCharts, Clock, DocumentRemove,
  Loading, User, Download, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const downloading = ref(false)
const playbook = ref(null)
const stats = ref({
  overview: null,
  stepStats: {}
})
const showPercentage = ref(true)

onMounted(async () => {
  await Promise.all([
    fetchPlayBook(),
    fetchStats()
  ])
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
  }
}

// 獲取統計資料
const fetchStats = async () => {
  try {
    const id = route.params.id
    const response = await PlayBookService.getPlayBookStats(id)
    
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('獲取統計資料失敗:', error)
    ElMessage.error('獲取統計資料失敗')
  } finally {
    loading.value = false
  }
}

// 重新整理統計
const refreshStats = async () => {
  loading.value = true
  await fetchStats()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW')
}

// 格式化持續時間
const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes || 0)
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

// 獲取步驟完成數量
const getStepCompletionCount = (stepNumber) => {
  const count = stats.value.stepStats[stepNumber.toString()] || 0
  if (showPercentage.value) {
    const total = stats.value.overview?.totalUsers || 0
    return total > 0 ? Math.round((count / total) * 100) : 0
  }
  return count
}

// 獲取步驟完成百分比
const getStepCompletionPercentage = (stepNumber) => {
  const count = stats.value.stepStats[stepNumber.toString()] || 0
  const total = stats.value.overview?.totalUsers || 0
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// 獲取步驟進度條顏色
const getStepProgressColor = (index) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  return colors[index % colors.length]
}

// 獲取進行中用戶數
const getInProgressUsers = () => {
  const total = stats.value.overview?.totalUsers || 0
  const completed = stats.value.overview?.completedUsers || 0
  return Math.max(0, total - completed)
}

// 獲取未完成用戶數（這裡假設未完成就是進行中，實際可能需要更細緻的分類）
const getNotCompletedUsers = () => {
  return getInProgressUsers()
}

// 處理下載
const handleDownload = async (format) => {
  if (!playbook.value) {
    ElMessage.error('PlayBook資料不存在')
    return
  }

  downloading.value = true
  try {
    const response = await PlayBookService.downloadPlayBookResults(playbook.value._id, format)
    
    // 創建下載連結
    const blob = new Blob([response.data], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 設置檔案名稱
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const extension = format === 'csv' ? 'csv' : 'json'
    link.download = `playbook_${playbook.value.slug}_results_${timestamp}.${extension}`
    
    // 觸發下載
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success(`${format.toUpperCase()} 格式檔案下載成功`)
  } catch (error) {
    console.error('下載失敗:', error)
    ElMessage.error('下載失敗，請稍後再試')
  } finally {
    downloading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/admin/playbooks')
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-stat-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.step-stat-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}
</style>
