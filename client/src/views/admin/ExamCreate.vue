<template>
  <AdminLayout title="新增測驗">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">建立新測驗</span>
          <el-button @click="goBack" plain>返回列表</el-button>
        </div>
      </template>

      <el-form :model="exam" ref="examForm" :rules="rules" label-width="120px" class="max-w-2xl mx-auto">
        <el-form-item label="測驗標題" prop="title" required>
          <el-input v-model="exam.title" placeholder="請輸入測驗標題" />
        </el-form-item>
        <el-form-item label="測驗描述" prop="description">
          <el-input v-model="exam.description" type="textarea" :rows="3" placeholder="請輸入測驗描述" />
        </el-form-item>
        <el-form-item label="時間限制 (分)" prop="timeLimit">
          <el-input-number v-model="exam.timeLimit" :min="0" :max="999" controls-position="right" class="w-full" />
        </el-form-item>
        <el-form-item label="及格分數 (%)" prop="passingScore">
          <el-input-number v-model="exam.passingScore" :min="0" :max="100" controls-position="right" class="w-full" />
        </el-form-item>

        <el-divider>測驗題目</el-divider>
        <el-form-item label="選擇題目" prop="questions" required>
          <el-select
            v-model="exam.questions"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="請搜尋並選擇題目"
            :remote-method="searchQuestions"
            :loading="questionLoading"
            class="w-full"
            value-key="_id"
          >
            <el-option
              v-for="item in availableQuestions"
              :key="item._id"
              :label="item.title"
              :value="item._id"
            >
              <span class="truncate">{{ item.title }}</span>
              <span class="ml-2 text-xs text-gray-500">({{ item.type === 'single' ? '單選' : '複選' }})</span>
            </el-option>
          </el-select>
          <div v-if="exam.questions.length > 0" class="mt-2 text-sm text-gray-600">
            已選擇 {{ exam.questions.length }} 題
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitExam" :loading="loading">送出</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ExamService from '@/services/exam.service'
import QuestionService from '@/services/question.service'

const router = useRouter()
const loading = ref(false)
const examForm = ref(null)

const exam = ref({
  title: '',
  description: '',
  questions: [],
  timeLimit: 0,
  passingScore: 60,
})

const rules = {
  title: [{ required: true, message: '測驗標題為必填', trigger: 'blur' }],
  questions: [{ 
    required: true, 
    message: '測驗至少需要包含一個題目', 
    trigger: 'change',
    type: 'array',
    min: 1
  }],
  timeLimit: [{ 
    type: 'number', 
    min: 0, 
    max: 999, 
    message: '時間限制必須在 0 到 999 之間', 
    trigger: 'change' 
  }],
  passingScore: [{ 
    type: 'number', 
    min: 0, 
    max: 100, 
    message: '及格分數必須在 0 到 100 之間', 
    trigger: 'change' 
  }],
}

const availableQuestions = ref([])
const questionLoading = ref(false)

// 載入所有題目 (初始化時載入一次，或者根據需要進行遠端搜索)
onMounted(() => {
  fetchQuestions()
})

const fetchQuestions = async (query = '') => {
  questionLoading.value = true
  try {
    const response = await QuestionService.getAllQuestions({ search: query, pageSize: 50 }) // 限制數量，避免過多數據
    availableQuestions.value = response.data.data.map(q => ({
      _id: q._id,
      title: q.text, // 使用 text 作為 title
      type: q.type
    }))
  } catch (error) {
    ElMessage.error('獲取題目列表失敗，請稍後再試')
  } finally {
    questionLoading.value = false
  }
}

const searchQuestions = (query) => {
  if (query !== '') {
    fetchQuestions(query)
  } else {
    // 如果搜索框清空，可以選擇清空或重新載入所有題目
    // availableQuestions.value = [] 
    fetchQuestions()
  }
}

const goBack = () => {
  router.push('/admin/exams')
}

const submitExam = async () => {
  if (!examForm.value) return
  
  await examForm.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('請檢查表單填寫是否完整與正確')
      return false
    }
    
    loading.value = true
    try {
      await ExamService.createExam(exam.value)
      ElMessage.success('測驗建立成功！')
      goBack()
    } catch (error) {
      ElMessage.error(error?.response?.data?.message || '建立失敗，請檢查欄位或稍後再試')
    } finally {
      loading.value = false
    }
  })
}
</script> 