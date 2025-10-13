<template>
  <AdminLayout title="題目管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">題目列表</h2>
        <p class="text-gray-600 mt-1">管理所有題目內容</p>
      </div>
      <el-button type="primary" @click="goToCreateQuestion">
        <el-icon class="mr-1"><Plus /></el-icon>新增題目
      </el-button>
    </div>
    <el-card class="mb-5">
      <SearchFilterBar
        v-model:search="searchQuery"
        v-model:sort="sortOrder"
        search-placeholder="搜尋題目"
        sort-placeholder="排序方式"
        :sort-options="[
          { label: '最新建立', value: 'latest' },
          { label: '最舊建立', value: 'oldest' },
          { label: '標題 A-Z', value: 'titleAsc' },
          { label: '標題 Z-A', value: 'titleDesc' },
          { label: '更新時間（新→舊）', value: 'updatedDesc' },
          { label: '更新時間（舊→新）', value: 'updatedAsc' },
          { label: '類型 A-Z', value: 'typeAsc' },
          { label: '類型 Z-A', value: 'typeDesc' }
        ]"
        @search="fetchQuestions"
      />
    </el-card>

    <!-- 題目列表 -->
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span>共 {{ totalQuestions }} 題</span>
        </div>
      </template>

      <!-- 列表為空時 -->
      <el-empty v-if="questions.length === 0 && !loading" description="尚無題目資料">
        <el-button type="primary" @click="goToCreateQuestion">新增第一個題目</el-button>
      </el-empty>

      <!-- 題目列表 -->
      <el-table v-else :data="questions" style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="text" label="題目內容" min-width="200" sortable="custom">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-blue-600">{{ row.title }}</span>
              <span class="text-xs text-gray-500 mt-1 line-clamp-2">{{ row.text }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="類型" width="100" align="center" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.type === 'single' ? 'success' : 'warning'" effect="plain" size="small">
              {{ row.type === 'single' ? '單選' : '複選' }}
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="category" label="分類" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.category" type="info" effect="plain" size="small">
              {{ row.category.name }}
            </el-tag>
            <span v-else class="text-gray-400 text-xs">未分類</span>
          </template>
        </el-table-column> -->
        <el-table-column prop="createdAt" label="建立日期" width="180" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新日期" width="180" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="viewQuestion(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="editQuestion(row)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="mt-4 flex justify-center" v-if="totalQuestions > 0">
        <el-pagination 
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalQuestions"
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
import QuestionService from '@/services/question.service'
import { 
  Plus, Search, Delete, View, EditPen, RefreshRight 
} from '@element-plus/icons-vue'
import SearchFilterBar from '@/components/admin/SearchFilterBar.vue'

// 路由
const router = useRouter()

// 資料狀態
const questions = ref([])
const loading = ref(false)
const totalQuestions = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortOrder = ref('latest')

// 初始化
onMounted(() => {
  fetchQuestions()
})

// 獲取題目列表
const fetchQuestions = async () => {
  loading.value = true
  try {
    const response = await QuestionService.getAllQuestions({
      search: searchQuery.value,
      sort: sortOrder.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    questions.value = response.data.data || []
    totalQuestions.value = response.data.count || questions.value.length
  } catch (error) {
    ElMessage.error('獲取題目列表失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜尋處理
const handleSearch = () => {
  currentPage.value = 1
  fetchQuestions()
}

// 分頁處理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchQuestions()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchQuestions()
}

// 導航到創建頁面
const goToCreateQuestion = () => {
  router.push('/admin/questions/create')
}

// 查看題目
const viewQuestion = (question) => {
  router.push(`/admin/questions/${question._id}`)
}

// 編輯題目
const editQuestion = (question) => {
  router.push(`/admin/questions/${question._id}/edit`)
}

// 確認刪除
const confirmDelete = (question) => {

  ElMessageBox.confirm(
    `確定要刪除題目「${question.text}」嗎？此操作不可恢復。`,
    '刪除確認',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteQuestion(question._id)
  }).catch(() => {
    // 用戶取消操作
  })
}

// 刪除題目
const deleteQuestion = async (id) => {
  loading.value = true
  try {
    await QuestionService.deleteQuestion(id)
    ElMessage.success('題目已成功刪除')
    fetchQuestions() // 刷新列表
  } catch (error) {
    console.error('刪除題目失敗:', error)
    const msg = error?.response?.data?.message || '刪除題目失敗，請稍後再試'
    const exams = Array.isArray(error?.response?.data?.exams) ? error.response.data.exams : []
    if (exams.length > 0) {
      const examList = exams.map(e => (e && e.title ? `• ${e.title}（ID: ${e._id}）` : '')).filter(Boolean).join('\n')
      ElMessageBox.alert(
        msg + (examList ? '\n\n綁定測驗：\n' + examList : ''),
        '無法刪除',
        { type: 'warning' }
      )
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }) => {
  // order: ascending/descending/null
  if (!order) return
  if (prop === 'createdAt') sortOrder.value = order === 'ascending' ? 'latest' : 'oldest'
  else if (prop === 'updatedAt') sortOrder.value = order === 'ascending' ? 'updatedAsc' : 'updatedDesc'
  else if (prop === 'text') sortOrder.value = order === 'ascending' ? 'titleAsc' : 'titleDesc'
  else if (prop === 'type') sortOrder.value = order === 'ascending' ? 'typeAsc' : 'typeDesc'
  fetchQuestions()
}
</script> 