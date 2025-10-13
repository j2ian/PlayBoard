<template>
  <AdminLayout title="編輯題目">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">編輯題目</span>
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
              :value="oIdx"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitQuestion" :loading="loading">儲存變更</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import QuestionService from '@/services/question.service'
import { Plus, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
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

// 載入現有資料
onMounted(async () => {
  const id = route.params.id
  if (id) {
    loading.value = true
    try {
      const { data } = await QuestionService.getQuestion(id)
      // log options 和 correctAnswer
      console.log('options:', data.data.options)
      console.log('correctAnswer:', data.data.correctAnswer)
      let answerIndexes = Array.isArray(data.data.correctAnswer)
        ? data.data.correctAnswer.map(ansId => {
            const idx = data.data.options.findIndex(opt =>
              opt._id && ansId && opt._id.toString() === ansId.toString()
            )
            return idx !== -1 ? idx : null
          }).filter(idx => idx !== null)
        : []
      // 單選題時只取第一個 index
      if (data.data.type === 'single' && answerIndexes.length > 0) {
        answerIndexes = answerIndexes[0]
      }
      question.value = {
        ...data.data,
        correctAnswer: answerIndexes
      }
    } catch (error) {
      ElMessage.error('載入題目資料失敗')
      goBack()
    } finally {
      loading.value = false
    }
  }
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
  router.push(`/admin/questions/${route.params.id}`)
}

// 送出表單
const submitQuestion = async () => {
  loading.value = true
  try {
    const payload = {
      ...question.value,
      correctAnswer: Array.isArray(question.value.correctAnswer)
        ? question.value.correctAnswer.map(idx => question.value.options[idx]?._id || idx)
        : [question.value.correctAnswer]
    }
    await QuestionService.updateQuestion(route.params.id, payload)
    ElMessage.success('題目已更新！')
    goBack()
  } catch (error) {
    ElMessage.error('更新失敗，請檢查欄位或稍後再試')
  } finally {
    loading.value = false
  }
}
</script> 