<template>
  <AdminLayout title="新增題目">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">建立新題目</span>
          <el-button @click="goBack" plain>返回列表</el-button>
        </div>
      </template>

      <el-form :model="question" ref="questionForm" label-width="100px" class="max-w-2xl mx-auto">
        <el-form-item label="題目內容" prop="text" required>
          <el-input v-model="question.text" placeholder="請輸入題目內容" />
        </el-form-item>
        <el-form-item label="題型" prop="type" required>
          <el-select v-model="question.type" placeholder="請選擇題型">
            <el-option label="單選題" value="single" />
            <el-option label="複選題" value="multiple" />
          </el-select>
        </el-form-item>
        <!-- 若有分類功能可加上分類選擇 -->
        <!--
        <el-form-item label="分類" prop="category">
          <el-select v-model="question.category" placeholder="請選擇分類">
            <el-option v-for="cat in categories" :key="cat._id" :label="cat.name" :value="cat._id" />
          </el-select>
        </el-form-item>
        -->
        <el-divider>選項</el-divider>
        <div v-for="(option, oIdx) in question.options" :key="oIdx" class="flex items-center mb-2">
          <el-input v-model="option.text" placeholder="請輸入選項內容" class="flex-1 mr-2" />
          <el-button size="small" type="danger" @click="removeOption(oIdx)" v-if="question.options.length > 2">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <el-button size="small" type="primary" plain @click="addOption">
          <el-icon><Plus /></el-icon>新增選項
        </el-button>
        <el-form-item label="正確答案" required class="mt-4">
          <el-select
            v-model="question.correctAnswer"
            :multiple="question.type === 'multiple'"
            placeholder="請選擇正確答案"
            style="width: 100%"
          >
            <el-option
              v-for="(option, oIdx) in question.options"
              :key="oIdx"
              :label="option.text"
              :value="option._id || oIdx"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitQuestion" :loading="loading">送出</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import QuestionService from '@/services/question.service'
import { Plus, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const questionForm = ref(null)

const question = ref({
  text: '',
  type: 'single',
  options: [
    { text: '' },
    { text: '' }
  ],
  correctAnswer: [],
  // category: ''
})

// 新增選項
const addOption = () => {
  question.value.options.push({ text: '' })
}

// 移除選項
const removeOption = (oIdx) => {
  question.value.options.splice(oIdx, 1)
}

// 返回列表
const goBack = () => {
  router.push('/admin/questions')
}

// 送出表單
const submitQuestion = async () => {
  loading.value = true
  try {
    // 將 correctAnswer 轉為 options 的 _id 陣列，index 先轉為數字
    const correctAnswerIds = Array.isArray(question.value.correctAnswer)
      ? question.value.correctAnswer.map(idx => {
          const numIdx = typeof idx === 'string' ? parseInt(idx, 10) : idx
          const opt = question.value.options[numIdx]
          return opt && opt._id ? opt._id : numIdx
        })
      : [question.value.correctAnswer]
    const payload = {
      ...question.value,
      correctAnswer: correctAnswerIds
    }
    await QuestionService.createQuestion(payload)
    ElMessage.success('題目建立成功！')
    goBack()
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '建立失敗，請檢查欄位或稍後再試')
  } finally {
    loading.value = false
  }
}
</script> 