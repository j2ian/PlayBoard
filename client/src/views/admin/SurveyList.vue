<template>
  <AdminLayout title="滿意度調查管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">問卷列表</h2>
        <p class="text-gray-600 mt-1">管理所有滿意度調查問卷</p>
      </div>
      <el-button type="primary" @click="goToCreateSurvey">
        <el-icon class="mr-1"><Plus /></el-icon>新增問卷
      </el-button>
    </div>
    <el-card class="mb-5">
      <SearchFilterBar
        v-model:search="searchQuery"
        v-model:sort="sortOrder"
        search-placeholder="搜尋問卷"
        sort-placeholder="排序方式"
        @search="fetchSurveys"
      />
    </el-card>
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span>共 {{ totalSurveys }} 筆問卷</span>
        </div>
      </template>
      <el-empty v-if="surveys.length === 0 && !loading" description="尚無問卷資料">
        <el-button type="primary" @click="goToCreateSurvey">新增第一個問卷</el-button>
      </el-empty>
      <el-table v-else :data="surveys" style="width: 100%">
        <el-table-column prop="title" label="標題" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-blue-600">{{ row.title }}</span>
              <span class="text-xs text-gray-500 mt-1 line-clamp-2">{{ row.description || '無描述' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="問題數" prop="questions" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" effect="plain" size="small">
              {{ row.questions ? row.questions.length : 0 }} 題
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="問題類型" width="150" align="center">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <el-tag 
                v-for="type in getQuestionTypes(row.questions)" 
                :key="type"
                :type="getTypeTagType(type)"
                size="small"
                effect="plain"
              >
                {{ getTypeLabel(type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="建立日期" prop="createdAt" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="viewSurvey(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="success" @click="viewResponses(row)">
                <el-icon><DataAnalysis /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="editSurvey(row)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-center" v-if="totalSurveys > 0">
        <el-pagination 
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalSurveys"
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
import SearchFilterBar from '@/components/admin/SearchFilterBar.vue'
import SurveyService from '@/services/survey.service'
import { Plus, Delete, View, EditPen, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const surveys = ref([])
const loading = ref(false)
const totalSurveys = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortOrder = ref('latest')

onMounted(() => {
  fetchSurveys()
})

// 獲取問卷列表
const fetchSurveys = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value,
      sort: sortOrder.value
    }
    
    const response = await SurveyService.getAllSurveys(params)
    if (response.data.success) {
      surveys.value = response.data.data
      totalSurveys.value = response.data.count
    }
  } catch (error) {
    console.error('獲取問卷列表失敗:', error)
    ElMessage.error('獲取問卷列表失敗')
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
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取問題類型
const getQuestionTypes = (questions) => {
  if (!questions || questions.length === 0) return []
  const types = [...new Set(questions.map(q => q.type))]
  return types
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
    'likert': '滿意度',
    'text': '簡述題',
    'single': '單選',
    'multiple': '多選'
  }
  return typeMap[type] || type
}

// 導航到新增問卷頁面
const goToCreateSurvey = () => {
  router.push('/admin/surveys/create')
}

// 查看問卷詳情
const viewSurvey = (survey) => {
  router.push(`/admin/surveys/${survey._id}`)
}

// 查看問卷回答統計
const viewResponses = (survey) => {
  router.push(`/admin/surveys/${survey._id}/responses`)
}

// 編輯問卷
const editSurvey = (survey) => {
  router.push(`/admin/surveys/${survey._id}/edit`)
}

// 確認刪除
const confirmDelete = async (survey) => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除問卷「${survey.title}」嗎？此操作將同時刪除所有相關回答，且無法復原。`,
      '確認刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteSurvey(survey._id)
  } catch (error) {
    // 用戶取消或發生錯誤
  }
}

// 刪除問卷
const deleteSurvey = async (id) => {
  try {
    const response = await SurveyService.deleteSurvey(id)
    if (response.data.success) {
      ElMessage.success('問卷刪除成功')
      fetchSurveys()
    }
  } catch (error) {
    console.error('刪除問卷失敗:', error)
    ElMessage.error('刪除問卷失敗')
  }
}

// 分頁大小改變
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchSurveys()
}

// 當前頁改變
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchSurveys()
}
</script>
