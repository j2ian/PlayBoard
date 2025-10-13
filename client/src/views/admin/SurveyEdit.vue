<template>
    <AdminLayout title="編輯滿意度調查">
      <el-card v-loading="loading" element-loading-text="載入中...">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold">編輯問卷</span>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </template>
  
        <el-form :model="survey" ref="surveyForm" :rules="rules" label-width="120px" class="max-w-4xl mx-auto">
          <!-- 基本資訊 -->
          <el-form-item label="問卷標題" prop="title" required>
            <el-input v-model="survey.title" placeholder="請輸入問卷標題" />
          </el-form-item>
          
          <el-form-item label="問卷描述" prop="description">
            <el-input v-model="survey.description" type="textarea" :rows="3" placeholder="請輸入問卷描述" />
          </el-form-item>
  
          <el-divider>問卷題目</el-divider>
          
          <!-- 問題列表 -->
          <div v-for="(question, index) in survey.questions" :key="index" class="mb-6 p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-md font-medium text-gray-700">第 {{ index + 1 }} 題</h4>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeQuestion(index)"
                :disabled="survey.questions.length === 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            
            <el-form-item :label="`題目類型`" :prop="`questions.${index}.type`" required>
              <el-select v-model="question.type" placeholder="請選擇題目類型" @change="onQuestionTypeChange(index)">
                <el-option
                  v-for="type in questionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item :label="`題目內容`" :prop="`questions.${index}.text`" required>
              <el-input 
                v-model="question.text" 
                type="textarea" 
                :rows="2" 
                placeholder="請輸入題目內容"
              />
            </el-form-item>
            
            <!-- 李克特量表說明 -->
            <div v-if="question.type === 'likert'" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <h5 class="text-sm font-medium text-blue-800 mb-2">滿意度量表選項：</h5>
              <div class="flex flex-wrap gap-2">
                <el-tag 
                  v-for="option in likertOptions" 
                  :key="option.value"
                  :color="option.color"
                  effect="light"
                  size="small"
                >
                  {{ option.value }}. {{ option.label }}
                </el-tag>
              </div>
            </div>
            
            <!-- 單選/多選選項 -->
            <div v-if="question.type === 'single' || question.type === 'multiple'">
              <el-form-item :label="`選項設定`">
                <div class="w-full">
                  <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="flex items-center mb-2">
                    <el-input 
                      v-model="question.options[optionIndex]" 
                      placeholder="請輸入選項內容"
                      class="mr-2"
                    />
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeOption(index, optionIndex)"
                      :disabled="question.options.length <= 2"
                    >
                      <el-icon><Minus /></el-icon>
                    </el-button>
                  </div>
                  <el-button type="primary" size="small" @click="addOption(index)" plain>
                    <el-icon><Plus /></el-icon>新增選項
                  </el-button>
                </div>
              </el-form-item>
            </div>
            
            <!-- 文字題說明 -->
            <div v-if="question.type === 'text'" class="mb-3 p-3 bg-green-50 border border-green-200 rounded">
              <p class="text-sm text-green-700">這是簡述題，學生可以輸入文字回答。</p>
            </div>
          </div>
          
          <!-- 新增問題按鈕 -->
          <el-form-item>
            <el-button type="primary" @click="addQuestion" plain>
              <el-icon><Plus /></el-icon>新增問題
            </el-button>
          </el-form-item>
  
          <!-- 提交按鈕 -->
          <el-form-item>
            <el-button type="primary" @click="submitSurvey" :loading="submitting">更新問卷</el-button>
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
  import SurveyService from '@/services/survey.service'
  import { Plus, Delete, Minus } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const submitting = ref(false)
  const surveyForm = ref(null)
  
  // 問卷資料
  const survey = ref({
    title: '',
    description: '',
    questions: []
  })
  
  // 問題類型選項
  const questionTypes = ref([])
  // 李克特量表選項
  const likertOptions = ref([])
  
  // 表單驗證規則
  const rules = {
    title: [{ required: true, message: '問卷標題為必填', trigger: 'blur' }],
    'questions.*.type': [{ required: true, message: '題目類型為必填', trigger: 'change' }],
    'questions.*.text': [{ required: true, message: '題目內容為必填', trigger: 'blur' }]
  }
  
  onMounted(async () => {
    // 獲取問題類型和李克特選項
    questionTypes.value = SurveyService.getQuestionTypes()
    likertOptions.value = SurveyService.getLikertOptions()
    
    // 載入問卷資料
    await fetchSurvey()
  })
  
  // 獲取問卷資料
  const fetchSurvey = async () => {
    try {
      const id = route.params.id
      const response = await SurveyService.getSurvey(id)
      
      if (response.data.success) {
        survey.value = response.data.data
      }
    } catch (error) {
      console.error('獲取問卷失敗:', error)
      ElMessage.error('獲取問卷失敗')
      router.push('/admin/surveys')
    } finally {
      loading.value = false
    }
  }
  
  // 新增問題
  const addQuestion = () => {
    survey.value.questions.push({
      type: 'likert',
      text: '',
      options: [],
      isPositive: true
    })
  }
  
  // 移除問題
  const removeQuestion = (index) => {
    if (survey.value.questions.length > 1) {
      survey.value.questions.splice(index, 1)
    }
  }
  
  // 題目類型改變時的處理
  const onQuestionTypeChange = (index) => {
    const question = survey.value.questions[index]
    
    // 如果從有選項的類型改為無選項的類型，清空選項
    if (question.type === 'likert' || question.type === 'text') {
      question.options = []
    } else if ((question.type === 'single' || question.type === 'multiple') && (!question.options || question.options.length === 0)) {
      // 如果改為單選/多選但沒有選項，建立預設選項
      question.options = ['', '']
    }
  }
  
  // 新增選項
  const addOption = (questionIndex) => {
    survey.value.questions[questionIndex].options.push('')
  }
  
  // 移除選項
  const removeOption = (questionIndex, optionIndex) => {
    const question = survey.value.questions[questionIndex]
    if (question.options.length > 2) {
      question.options.splice(optionIndex, 1)
    }
  }
  
  // 提交問卷
  const submitSurvey = async () => {
    if (!surveyForm.value) return
    
    try {
      await surveyForm.value.validate()
      
      // 驗證問題內容
      for (let i = 0; i < survey.value.questions.length; i++) {
        const question = survey.value.questions[i]
        
        if (!question.text.trim()) {
          ElMessage.error(`第 ${i + 1} 題的題目內容不能為空`)
          return
        }
        
        if ((question.type === 'single' || question.type === 'multiple')) {
          // 檢查選項
          const validOptions = question.options.filter(opt => opt.trim())
          if (validOptions.length < 2) {
            ElMessage.error(`第 ${i + 1} 題至少需要 2 個有效選項`)
            return
          }
          question.options = validOptions
        }
      }
      
      submitting.value = true
      
      const id = route.params.id
      const response = await SurveyService.updateSurvey(id, survey.value)
      
      if (response.data.success) {
        ElMessage.success('問卷更新成功')
        router.push('/admin/surveys')
      }
    } catch (error) {
      console.error('更新問卷失敗:', error)
      ElMessage.error('更新問卷失敗')
    } finally {
      submitting.value = false
    }
  }
  
  // 返回列表
  const goBack = () => {
    router.push('/admin/surveys')
  }
  </script>