<template>
  <AdminLayout title="題目詳情">
    <el-card v-if="question">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">題目詳情</span>
          <div>
            <el-button type="primary" @click="goEdit" class="mr-2">編輯</el-button>
            <el-button type="danger" @click="confirmDelete">刪除</el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>
      <div class="mb-4">
        <span class="font-semibold">題目內容：</span>
        <span>{{ question.text }}</span>
      </div>
      <div class="mb-4">
        <span class="font-semibold">題型：</span>
        <el-tag :type="question.type === 'single' ? 'success' : 'warning'" effect="plain" size="small">
          {{ question.type === 'single' ? '單選' : '複選' }}
        </el-tag>
      </div>
      <div class="mb-4">
        <span class="font-semibold">選項：</span>
        <ul class="list-disc pl-6">
          <li v-for="(option, idx) in question.options" :key="option._id">
            <span :class="isCorrect(idx) ? 'text-green-600 font-bold' : ''">
              {{ option.text }}
              <el-tag v-if="isCorrect(idx)" type="success" size="small" class="ml-2">正確答案</el-tag>
            </span>
          </li>
        </ul>
      </div>
      <div class="mb-4">
        <span class="font-semibold">分類：</span>
        <el-tag v-if="question.category" type="info" effect="plain" size="small">
          {{ question.category.name }}
        </el-tag>
        <span v-else class="text-gray-400 text-xs">未分類</span>
      </div>
      <div class="mb-2 text-xs text-gray-500">
        建立時間：{{ formatDate(question.createdAt) }}
      </div>
      <div class="mb-2 text-xs text-gray-500">
        更新時間：{{ formatDate(question.updatedAt) }}
      </div>
    </el-card>
    <el-empty v-else description="查無此題目" />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import QuestionService from '@/services/question.service'

const router = useRouter()
const route = useRoute()
const question = ref(null)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const { data } = await QuestionService.getQuestion(id)
      question.value = data.data
    } catch (error) {
      ElMessage.error('載入題目資料失敗')
      goBack()
    }
  }
})

const goBack = () => {
  router.push('/admin/questions')
}

const goEdit = () => {
  router.push(`/admin/questions/${route.params.id}/edit`)
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    '確定要刪除此題目嗎？此操作不可恢復。',
    '刪除確認',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteQuestion()
  }).catch(() => {})
}

const deleteQuestion = async () => {
  try {
    await QuestionService.deleteQuestion(route.params.id)
    ElMessage.success('題目已成功刪除')
    goBack()
  } catch (error) {
    ElMessage.error('刪除題目失敗，請稍後再試')
  }
}

const isCorrect = (idx) => {
  if (!question.value) return false
  // correctAnswer 可能是 ObjectId 陣列
  const option = question.value.options[idx]
  return question.value.correctAnswer.some(ansId => option._id && ansId && option._id.toString() === ansId.toString())
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
</script> 