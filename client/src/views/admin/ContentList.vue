<template>
  <AdminLayout title="一般內容管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">內容列表</h2>
        <p class="text-gray-600 mt-1">管理所有blog文章和一般內容</p>
      </div>
      <el-button type="primary" @click="goToCreateContent">
        <el-icon class="mr-1"><Plus /></el-icon>新增內容
      </el-button>
    </div>

    <!-- 搜尋和篩選 -->
    <el-card class="mb-5">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜尋標題、摘要或標籤"
          @input="debouncedSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="狀態篩選" @change="fetchContents" clearable>
          <el-option label="全部狀態" value="all" />
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
        
        <el-select v-model="categoryFilter" placeholder="分類篩選" @change="fetchContents" clearable>
          <el-option label="全部分類" value="all" />
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
        
        <el-select v-model="sortOrder" placeholder="排序方式" @change="fetchContents">
          <el-option label="最新建立" value="latest" />
          <el-option label="最舊建立" value="oldest" />
          <el-option label="標題 A-Z" value="titleAsc" />
          <el-option label="標題 Z-A" value="titleDesc" />
          <el-option label="最新發布" value="publishedDesc" />
          <el-option label="最舊發布" value="publishedAsc" />
          <el-option label="瀏覽次數" value="viewCount" />
        </el-select>
      </div>
    </el-card>

    <!-- 內容列表 -->
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span>共 {{ totalContents }} 筆內容</span>
          <div class="flex items-center gap-2">
            <el-button @click="refreshCategories" size="small" type="info" plain>
              <el-icon><RefreshRight /></el-icon>重新整理分類
            </el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="contents.length === 0 && !loading" description="尚無內容資料">
        <el-button type="primary" @click="goToCreateContent">新增第一個內容</el-button>
      </el-empty>

      <el-table v-else :data="contents" style="width: 100%">
        <!-- 標題和摘要 -->
        <el-table-column label="內容" min-width="300">
          <template #default="{ row }">
            <div class="flex items-start gap-3">
              <!-- 特色圖片 -->
              <div v-if="row.featuredImage" class="flex-shrink-0">
                <img 
                  :src="row.featuredImage.url" 
                  :alt="row.title"
                  class="w-16 h-16 object-cover rounded-lg"
                />
              </div>
              
              <!-- 內容資訊 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-medium text-blue-600 truncate">{{ row.title }}</h4>
                  <el-tag 
                    :type="getStatusTagType(row.status)" 
                    size="small"
                    effect="plain"
                  >
                    {{ getStatusLabel(row.status) }}
                  </el-tag>
                </div>
                
                <p v-if="row.excerpt" class="text-sm text-gray-600 line-clamp-2 mb-2">
                  {{ row.excerpt }}
                </p>
                
                <!-- 標籤 -->
                <div v-if="row.tags && row.tags.length > 0" class="flex flex-wrap gap-1">
                  <el-tag
                    v-for="tag in row.tags.slice(0, 3)"
                    :key="tag"
                    size="small"
                    type="info"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag v-if="row.tags.length > 3" size="small" type="info" effect="plain">
                    +{{ row.tags.length - 3 }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 分類和類型 -->
        <el-table-column label="分類/類型" width="150" align="center">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <el-tag type="warning" size="small" effect="plain">
                {{ row.category || '無分類' }}
              </el-tag>
              <el-tag type="info" size="small" effect="plain">
                {{ getContentTypeLabel(row.contentType) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 統計資訊 -->
        <el-table-column label="統計" width="120" align="center">
          <template #default="{ row }">
            <div class="flex flex-col gap-1 text-sm">
              <div class="flex items-center justify-center gap-1">
                <el-icon><View /></el-icon>
                <span>{{ row.viewCount || 0 }}</span>
              </div>
              <div class="flex items-center justify-center gap-1">
                <el-icon><Picture /></el-icon>
                <span>{{ (row.images?.length || 0) + (row.featuredImage ? 1 : 0) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 日期 -->
        <el-table-column label="日期" width="180" align="center">
          <template #default="{ row }">
            <div class="flex flex-col gap-1 text-sm">
              <div>
                <span class="text-gray-500">建立：</span>
                {{ formatDate(row.createdAt) }}
              </div>
              <div v-if="row.publishedAt">
                <span class="text-gray-500">發布：</span>
                {{ formatDate(row.publishedAt) }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 作者 -->
        <el-table-column label="作者" width="120" align="center">
          <template #default="{ row }">
            <div class="flex flex-col gap-1 text-sm">
              <span>{{ row.createdBy?.username || '未知' }}</span>
              <span v-if="row.lastModifiedBy" class="text-gray-500">
                修改：{{ row.lastModifiedBy.username }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <!-- 公開連結（只在已發布且公開時顯示） -->
              <el-button 
                v-if="row.status === 'published'"
                size="small" 
                type="success" 
                @click="openPublicLink(row)"
              >
                <el-icon><Link /></el-icon>
              </el-button>
              
              <!-- 編輯 -->
              <el-button size="small" type="primary" @click="editContent(row)">
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
      <div class="mt-4 flex justify-center" v-if="totalContents > 0">
        <el-pagination 
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalContents"
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
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ContentService from '@/services/content.service'
import { 
  Plus, Search, Delete, View, EditPen, RefreshRight, Link, 
  Picture, Hide, Upload
} from '@element-plus/icons-vue'

const router = useRouter()
const contents = ref([])
const loading = ref(false)
const totalContents = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const sortOrder = ref('latest')

// 選項資料
const statusOptions = ref([])
const categories = ref([])

// 搜尋防抖
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchContents()
  }, 500)
}

onMounted(() => {
  statusOptions.value = ContentService.getStatusOptions()
  fetchContents()
  fetchCategories()
})

// 獲取內容列表
const fetchContents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      status: statusFilter.value,
      category: categoryFilter.value,
      sort: sortOrder.value
    }
    
    const response = await ContentService.getAllContents(params)
    if (response.data.success) {
      contents.value = response.data.data
      totalContents.value = response.data.count
    }
  } catch (error) {
    console.error('獲取內容列表失敗:', error)
    ElMessage.error('獲取內容列表失敗')
  } finally {
    loading.value = false
  }
}

// 獲取分類列表
const fetchCategories = async () => {
  try {
    const response = await ContentService.getCategories()
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  }
}

// 重新整理分類
const refreshCategories = async () => {
  await fetchCategories()
  ElMessage.success('分類列表已更新')
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

// 獲取狀態標籤樣式
const getStatusTagType = (status) => {
  return ContentService.getStatusTagType(status)
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  return ContentService.getStatusLabel(status)
}

// 獲取內容類型標籤
const getContentTypeLabel = (type) => {
  return ContentService.getContentTypeLabel(type)
}

// 導航到新增內容頁面
const goToCreateContent = () => {
  router.push('/admin/contents/create')
}

// 查看內容詳情
const viewContent = (content) => {
  router.push(`/admin/contents/${content._id}`)
}

// 編輯內容
const editContent = (content) => {
  router.push(`/admin/contents/${content._id}/edit`)
}

// 開啟公開連結
const openPublicLink = (content) => {
  const url = `${window.location.origin}/PlayBoard/content/${content.slug}`
  window.open(url, '_blank')
}

// 切換發布狀態
const toggleStatus = async (content) => {
  try {
    const newStatus = content.status === 'published' ? 'draft' : 'published'
    const statusText = newStatus === 'published' ? '發布' : '取消發布'

    await ElMessageBox.confirm(
      `確定要${statusText}「${content.title}」嗎？`,
      `確認${statusText}`,
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const updateData = { status: newStatus }
    // 發布時確保 isPublic 為 true
    if (newStatus === 'published') {
      updateData.isPublic = true
    }

    const response = await ContentService.updateContent(content._id, updateData)
    if (response.data.success) {
      ElMessage.success(`內容已${statusText}`)
      fetchContents()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新狀態失敗:', error)
      ElMessage.error('更新狀態失敗')
    }
  }
}

// 確認刪除
const confirmDelete = async (content) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除內容「${content.title}」嗎？此操作無法復原。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteContent(content._id)
  } catch (error) {
    // 用戶取消或發生錯誤
  }
}

// 刪除內容
const deleteContent = async (id) => {
  try {
    const response = await ContentService.deleteContent(id)
    if (response.data.success) {
      ElMessage.success('內容刪除成功')
      fetchContents()
    }
  } catch (error) {
    console.error('刪除內容失敗:', error)
    ElMessage.error('刪除內容失敗')
  }
}

// 分頁大小改變
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchContents()
}

// 當前頁改變
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchContents()
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
