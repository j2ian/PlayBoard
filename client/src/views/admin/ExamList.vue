<template>
  <AdminLayout title="測驗管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">測驗列表</h2>
        <p class="text-gray-600 mt-1">管理所有測驗內容</p>
      </div>
      <el-button type="primary" @click="goToCreateExam">
        <el-icon class="mr-1"><Plus /></el-icon>新增測驗
      </el-button>
    </div>
    <el-card class="mb-5">
      <SearchFilterBar
        v-model:search="searchQuery"
        v-model:sort="sortOrder"
        search-placeholder="搜尋測驗"
        sort-placeholder="排序方式"
        @search="fetchExams"
      />
    </el-card>
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span>共 {{ totalExams }} 筆測驗</span>
        </div>
      </template>
      <el-empty v-if="exams.length === 0 && !loading" description="尚無測驗資料">
        <el-button type="primary" @click="goToCreateExam">新增第一個測驗</el-button>
      </el-empty>
      <el-table v-else :data="exams" style="width: 100%">
        <el-table-column prop="title" label="標題" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-blue-600">{{ row.title }}</span>
              <span class="text-xs text-gray-500 mt-1 line-clamp-2">{{ row.description || '無描述' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="題目數" prop="questions" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" size="small">
              {{ row.questions ? row.questions.length : 0 }} 題
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="建立日期" prop="createdAt" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="viewExam(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="editExam(row)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-center" v-if="totalExams > 0">
        <el-pagination 
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalExams"
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
import ExamService from '@/services/exam.service'
import { Plus, Search, Delete, View, EditPen, RefreshRight } from '@element-plus/icons-vue'
import SearchFilterBar from '@/components/admin/SearchFilterBar.vue'

const router = useRouter()
const exams = ref([])
const loading = ref(false)
const totalExams = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortOrder = ref('latest')

onMounted(() => {
  fetchExams()
})

const fetchExams = async () => {
  loading.value = true
  try {
    const response = await ExamService.getAllExams({
      search: searchQuery.value,
      sort: sortOrder.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    exams.value = response.data.data || []
    totalExams.value = response.data.count || exams.value.length
  } catch (error) {
    ElMessage.error('獲取測驗列表失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

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

const handleSearch = () => {
  currentPage.value = 1
  fetchExams()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchExams()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchExams()
}

const goToCreateExam = () => {
  router.push('/admin/exams/create')
}

const viewExam = (exam) => {
  router.push(`/admin/exams/${exam._id}`)
}

const editExam = (exam) => {
  router.push(`/admin/exams/${exam._id}/edit`)
}

const confirmDelete = (exam) => {
  ElMessageBox.confirm(
    `確定要刪除測驗「${exam.title}」嗎？此操作不可恢復。`,
    '刪除確認',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteExam(exam._id)
  }).catch(() => {})
}

const deleteExam = async (id) => {
  loading.value = true
  try {
    await ExamService.deleteExam(id)
    ElMessage.success('測驗已成功刪除')
    fetchExams()
  } catch (error) {
    ElMessage.error('刪除測驗失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}
</script> 