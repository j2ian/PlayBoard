<template>
  <AdminLayout title="PlayBook管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">PlayBook列表</h2>
        <p class="text-gray-600 mt-1">管理學習路徑和課程組合</p>
      </div>
      <el-button type="primary" @click="goToCreatePlayBook">
        <el-icon class="mr-1"><Plus /></el-icon>新增PlayBook
      </el-button>
    </div>

    <!-- 搜尋和篩選 -->
    <el-card class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜尋標題、描述或標籤"
          @input="debouncedSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="狀態篩選" @change="fetchPlayBooks" clearable>
          <el-option label="全部狀態" value="all" />
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
        
        <el-select v-model="categoryFilter" placeholder="分類篩選" @change="fetchPlayBooks" clearable>
          <el-option label="全部分類" value="all" />
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>

        <el-select v-model="difficultyFilter" placeholder="難度篩選" @change="fetchPlayBooks" clearable>
          <el-option label="全部難度" value="all" />
          <el-option
            v-for="difficulty in difficultyOptions"
            :key="difficulty.value"
            :label="difficulty.label"
            :value="difficulty.value"
          />
        </el-select>
        
        <el-select v-model="sortOrder" placeholder="排序方式" @change="fetchPlayBooks">
          <el-option label="最新建立" value="latest" />
          <el-option label="最舊建立" value="oldest" />
          <el-option label="標題 A-Z" value="titleAsc" />
          <el-option label="標題 Z-A" value="titleDesc" />
          <el-option label="最新發布" value="publishedDesc" />
          <el-option label="最舊發布" value="publishedAsc" />
          <el-option label="瀏覽次數" value="viewCount" />
          <el-option label="完成次數" value="completionCount" />
        </el-select>
      </div>
      
      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          共找到 {{ totalPlayBooks }} 個PlayBook
        </div>
        <el-button @click="resetFilters" size="small" plain>
          <el-icon><RefreshRight /></el-icon>重置篩選
        </el-button>
      </div>
    </el-card>

    <!-- PlayBook表格 -->
    <el-card>
      <el-table 
        :data="playbooks" 
        v-loading="loading"
        element-loading-text="載入中..."
        stripe
        style="width: 100%"
      >
        <!-- 標題 -->
        <el-table-column prop="title" label="標題" min-width="200">
          <template #default="{ row }">
            <div>
              <div class="font-medium text-gray-900">{{ row.title }}</div>
              <div v-if="row.description" class="text-sm text-gray-500 line-clamp-2 mt-1">
                {{ row.description }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 步驟資訊 -->
        <el-table-column label="步驟資訊" width="120" align="center">
          <template #default="{ row }">
            <div class="text-center">
              <div class="text-lg font-semibold text-blue-600">{{ row.totalSteps }}</div>
              <div class="text-xs text-gray-500">步驟</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDuration(row.estimatedTime) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 分類/難度（難度可關閉） -->
        <el-table-column label="分類/難度" width="120">
          <template #default="{ row }">
            <div class="space-y-1">
              <el-tag type="warning" size="small" effect="plain">
                {{ row.category || '一般' }}
              </el-tag>
              <br>
              <el-tag v-if="appConfig.features.showDifficultyFields" :type="getDifficultyColor(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 狀態 -->
        <el-table-column prop="status" label="狀態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 統計資訊 -->
        <el-table-column label="統計" width="100" align="center">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="flex items-center justify-center gap-1">
                <el-icon class="text-blue-500"><View /></el-icon>
                <span>{{ row.viewCount || 0 }}</span>
              </div>
              <div class="flex items-center justify-center gap-1 mt-1">
                <el-icon class="text-green-500"><Check /></el-icon>
                <span>{{ row.completionCount || 0 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 創建時間 -->
        <el-table-column label="創建時間" width="150">
          <template #default="{ row }">
            <div class="text-sm">
              <div>{{ formatDate(row.createdAt) }}</div>
              <div v-if="row.publishedAt" class="text-gray-500">
                <span class="text-gray-500">發布：</span>
                {{ formatDate(row.publishedAt) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 創建者 -->
        <el-table-column prop="createdBy.username" label="創建者" width="100" />

        <!-- 操作 -->
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <!-- 公開連結（只在已發布時顯示） -->
              <el-button 
                v-if="row.status === 'published'"
                size="small" 
                type="success" 
                @click="openPublicLink(row)"
              >
                <el-icon><Link /></el-icon>
              </el-button>
              
              <!-- 統計 -->
              <el-button size="small" type="info" plain @click="viewStats(row)">
                <el-icon><DataAnalysis /></el-icon>
              </el-button>
              
              <!-- 編輯 -->
              <el-button size="small" type="primary" @click="editPlayBook(row)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              
              <!-- 發布/取消發布 -->
              <el-button 
                size="small" 
                :type="row.status === 'published' ? 'warning' : 'success'" 
                @click="toggleStatus(row)"
              >
                <el-icon>
                  <Hide v-if="row.status === 'published'" />
                  <Upload v-else />
                </el-icon>
              </el-button>
              
              <!-- 刪除 -->
              <el-button size="small" type="danger" @click="confirmDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="mt-4 flex justify-center" v-if="totalPlayBooks > 0">
        <el-pagination 
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPlayBooks"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import PlayBookService from '@/services/playbook.service'
import appConfig from '@/config/app.config'
import { 
  Plus, Search, Delete, View, EditPen, RefreshRight, Link, 
  Hide, Upload, DataAnalysis, Check
} from '@element-plus/icons-vue'

const router = useRouter()
const playbooks = ref([])
const loading = ref(false)
const totalPlayBooks = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const difficultyFilter = ref('all')
const sortOrder = ref('latest')

// 選項資料
const statusOptions = ref([])
const difficultyOptions = ref([])
const categories = ref([])

onMounted(async () => {
  statusOptions.value = PlayBookService.getStatusOptions()
  difficultyOptions.value = PlayBookService.getDifficultyOptions()
  
  await Promise.all([
    fetchPlayBooks(),
    fetchCategories()
  ])
})

// 獲取PlayBook列表
const fetchPlayBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      category: categoryFilter.value,
      difficulty: difficultyFilter.value,
      sortBy: sortOrder.value
    }
    
    const response = await PlayBookService.getPlayBooks(params)
    if (response.data.success) {
      playbooks.value = response.data.data
      totalPlayBooks.value = response.data.count
    }
  } catch (error) {
    console.error('獲取PlayBook列表失敗:', error)
    ElMessage.error('載入PlayBook列表失敗')
  } finally {
    loading.value = false
  }
}

// 獲取分類列表
const fetchCategories = async () => {
  try {
    const response = await PlayBookService.getCategories()
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  }
}

// 防抖搜尋
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  fetchPlayBooks()
}, 300)

// 重置篩選
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  categoryFilter.value = 'all'
  difficultyFilter.value = 'all'
  sortOrder.value = 'latest'
  currentPage.value = 1
  fetchPlayBooks()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化持續時間
const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes)
}

// 獲取難度顏色
const getDifficultyColor = (difficulty) => {
  return PlayBookService.getDifficultyColor(difficulty)
}

// 獲取難度標籤
const getDifficultyLabel = (difficulty) => {
  const option = difficultyOptions.value.find(opt => opt.value === difficulty)
  return option ? option.label : difficulty
}

// 獲取狀態標籤樣式
const getStatusTagType = (status) => {
  return PlayBookService.getStatusTagType(status)
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const option = statusOptions.value.find(opt => opt.value === status)
  return option ? option.label : status
}

// 查看PlayBook詳情
const viewPlayBook = (playbook) => {
  router.push(`/admin/playbooks/${playbook._id}`)
}

// 編輯PlayBook
const editPlayBook = (playbook) => {
  router.push(`/admin/playbooks/${playbook._id}/edit`)
}

// 查看統計
const viewStats = (playbook) => {
  router.push(`/admin/playbooks/${playbook._id}/stats`)
}

// 開啟公開連結
const openPublicLink = (playbook) => {
  const url = `/playbook/${playbook.slug}`
  window.open(url, '_blank')
}

// 切換發布狀態
const toggleStatus = async (playbook) => {
  try {
    const newStatus = playbook.status === 'published' ? 'draft' : 'published'
    const statusText = newStatus === 'published' ? '發布' : '取消發布'
    
    await ElMessageBox.confirm(
      `確定要${statusText}「${playbook.title}」嗎？`,
      `確認${statusText}`,
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: newStatus === 'published' ? 'success' : 'warning',
      }
    )
    
    const response = await PlayBookService.updatePlayBook(playbook._id, {
      status: newStatus
    })
    
    if (response.data.success) {
      ElMessage.success(`PlayBook${statusText}成功`)
      fetchPlayBooks()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切換狀態失敗:', error)
      ElMessage.error('操作失敗')
    }
  }
}

// 確認刪除
const confirmDelete = async (playbook) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除PlayBook「${playbook.title}」嗎？此操作無法復原。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deletePlayBook(playbook._id)
  } catch (error) {
    // 用戶取消或發生錯誤
  }
}

// 刪除PlayBook
const deletePlayBook = async (id) => {
  try {
    const response = await PlayBookService.deletePlayBook(id)
    if (response.data.success) {
      ElMessage.success('PlayBook刪除成功')
      fetchPlayBooks()
    }
  } catch (error) {
    console.error('刪除PlayBook失敗:', error)
    ElMessage.error(error.response?.data?.message || '刪除失敗')
  }
}

// 前往創建PlayBook
const goToCreatePlayBook = () => {
  router.push('/admin/playbooks/create')
}

// 分頁大小改變
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchPlayBooks()
}

// 當前頁改變
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchPlayBooks()
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
