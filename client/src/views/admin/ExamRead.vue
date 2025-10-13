<template>
  <AdminLayout title="測驗詳情">
    <el-card v-if="exam">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">測驗詳情</span>
          <div>
            <el-button type="primary" @click="goEdit" class="mr-2">編輯</el-button>
            <el-button type="info" @click="openExamUrl" class="mr-2">開啟測驗連結</el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>
      <div class="mb-4">
        <span class="font-semibold">標題：</span>
        <span>{{ exam.title }}</span>
      </div>
      <div class="mb-4">
        <span class="font-semibold">描述：</span>
        <span>{{ exam.description || '無描述' }}</span>
      </div>
      <div class="mb-4">
        <span class="font-semibold">時間限制：</span>
        <span>{{ exam.timeLimit > 0 ? exam.timeLimit + ' 分鐘' : '無限制' }}</span>
      </div>
      <div class="mb-4">
        <span class="font-semibold">及格分數：</span>
        <span>{{ exam.passingScore }} %</span>
      </div>
      <div class="mb-4">
        <span class="font-semibold">建立者：</span>
        <span>{{ exam.createdBy?.username || '未知' }}</span>
      </div>
      <div class="mb-2 text-xs text-gray-500">
        建立時間：{{ formatDate(exam.createdAt) }}
      </div>
      <div class="mb-2 text-xs text-gray-500">
        更新時間：{{ formatDate(exam.updatedAt) }}
      </div>
      <el-divider>題目列表</el-divider>
      <el-table :data="exam.questions" style="width: 100%" v-if="exam.questions && exam.questions.length">
        <el-table-column prop="text" label="題目內容" min-width="200">
          <template #default="{ row }">
            <span>{{ row.text }}</span>
          </template>
        </el-table-column>
        <el-table-column label="題型" prop="type" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'single' ? 'success' : 'warning'" effect="plain">
              {{ row.type === 'single' ? '單選' : '複選' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="選項" min-width="200">
          <template #default="{ row }">
            <div v-if="row.options && row.options.length">
              <span v-for="(opt, idx) in row.options" :key="opt._id || idx" class="mr-2">
                <el-tag :type="isCorrect(row, opt) ? 'success' : 'info'" size="small">
                  {{ opt.text }}<span v-if="isCorrect(row, opt)">（正確答案）</span>
                </el-tag>
              </span>
            </div>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="尚無題目資料" />
    </el-card>
    <el-empty v-else description="查無此測驗" />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ExamService from '@/services/exam.service'

const router = useRouter()
const route = useRoute()
const exam = ref(null)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const { data } = await ExamService.getExam(id)
      exam.value = data.data
    } catch (error) {
      ElMessage.error('載入測驗資料失敗')
      goBack()
    }
  }
})

const goBack = () => {
  router.push('/admin/exams')
}

const goEdit = () => {
  router.push(`/admin/exams/${route.params.id}/edit`)
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

const isCorrect = (question, option) => {
  if (!question.correctAnswer) return false
  return question.correctAnswer.some(ansId => option._id && ansId && option._id.toString() === ansId.toString())
}

const openExamUrl = () => {
  const url = `${window.location.origin}/exams/${route.params.id}/take`
  window.open(url, '_blank')
}
</script> 