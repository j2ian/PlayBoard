<template>
  <AdminLayout title="新增PlayBook">
    <el-card v-loading="loading" element-loading-text="儲存中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">新增PlayBook</span>
          <el-button @click="goBack" plain>返回列表</el-button>
        </div>
      </template>

      <el-form 
        :model="playbook" 
        ref="playbookForm" 
        :rules="rules" 
        label-width="120px" 
        class="max-w-4xl mx-auto"
      >
        <!-- 基本資訊 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本資訊</h3>
          
          <el-form-item label="標題" prop="title" required>
            <el-input 
              v-model="playbook.title" 
              placeholder="請輸入PlayBook標題"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="描述" prop="description">
            <el-input 
              v-model="playbook.description" 
              type="textarea" 
              :rows="3" 
              placeholder="請輸入PlayBook描述（可選）"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="分類" prop="category">
            <el-input 
              v-model="playbook.category" 
              placeholder="請輸入分類（例如：前端開發、數據分析等）"
            />
          </el-form-item>
          
          <el-form-item v-if="appConfig.features.showDifficultyFields" label="難度" prop="difficulty" required>
            <el-select v-model="playbook.difficulty" placeholder="請選擇難度級別">
              <el-option
                v-for="difficulty in difficultyOptions"
                :key="difficulty.value"
                :label="difficulty.label"
                :value="difficulty.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="展示模式" prop="displayType" required>
            <el-select v-model="playbook.displayType" placeholder="請選擇展示模式">
              <el-option
                v-for="type in displayTypeOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              >
                <div>
                  <div>{{ type.label }}</div>
                  <div class="text-sm text-gray-500">{{ type.description }}</div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="標籤" prop="tags">
            <TagInput
              v-model="playbook.tags"
              :max-tags="10"
              @change="onTagsChange"
            />
          </el-form-item>
        </div>

        <!-- 步驟設定 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-800">學習步驟</h3>
            <el-button type="primary" @click="addStep">
              <el-icon><Plus /></el-icon>新增步驟
            </el-button>
          </div>
          
          <div v-if="playbook.steps.length === 0" class="text-center py-8 text-gray-500">
            <el-icon size="48" class="mb-2"><DocumentAdd /></el-icon>
            <p>還沒有新增任何步驟</p>
            <p class="text-sm">點擊上方「新增步驟」按鈕開始建立學習路徑</p>
          </div>
          
          <!-- 步驟列表 -->
          <div v-else class="space-y-4">
            <div 
              v-for="(step, index) in playbook.steps" 
              :key="index"
              class="border rounded-lg p-4 bg-gray-50"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {{ index + 1 }}
                  </span>
                  <span class="font-medium">步驟 {{ index + 1 }}</span>
                </div>
                <div class="flex gap-2">
                  <el-button 
                    v-if="index > 0"
                    size="small" 
                    @click="moveStepUp(index)"
                    plain
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button 
                    v-if="index < playbook.steps.length - 1"
                    size="small" 
                    @click="moveStepDown(index)"
                    plain
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="removeStep(index)"
                    plain
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 步驟類型 -->
                <el-form-item :label="`步驟${index + 1}類型`" :prop="`steps.${index}.type`" required>
                  <el-select 
                    v-model="step.type" 
                    placeholder="選擇步驟類型"
                    @change="onStepTypeChange(index)"
                  >
                    <el-option
                      v-for="type in stepTypeOptions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    >
                      <div class="flex items-center gap-2">
                        <span>{{ type.label }}</span>
                        <span class="text-sm text-gray-500">{{ type.description }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                
                <!-- 選擇資源 -->
                <el-form-item :label="`選擇${getStepTypeLabel(step.type)}`" :prop="`steps.${index}.resourceId`" required>
                  <el-select 
                    v-model="step.resourceId" 
                    placeholder="選擇資源"
                    @change="onResourceChange(index)"
                    filterable
                  >
                    <el-option
                      v-for="resource in getResourceOptions(step.type)"
                      :key="resource._id"
                      :label="resource.title"
                      :value="resource._id"
                    />
                  </el-select>
                </el-form-item>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <!-- 步驟標題 -->
                <el-form-item :label="`步驟${index + 1}標題`" :prop="`steps.${index}.title`" required>
                  <el-input 
                    v-model="step.title" 
                    placeholder="輸入步驟標題"
                  />
                </el-form-item>
                
                <!-- 是否必須 -->
                <el-form-item :label="`是否必須完成`">
                  <el-switch
                    v-model="step.isRequired"
                    active-text="必須"
                    inactive-text="選填"
                  />
                </el-form-item>
              </div>
              
              <!-- 步驟描述 -->
              <el-form-item :label="`步驟${index + 1}描述`">
                <el-input 
                  v-model="step.description" 
                  type="textarea"
                  :rows="2"
                  placeholder="輸入步驟描述（可選）"
                />
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 發布設定 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">發布設定</h3>
          
          <el-form-item label="狀態" prop="status" required>
            <el-select v-model="playbook.status" placeholder="請選擇發布狀態">
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          
          
        </div>

        <!-- 提交按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="submitPlayBook" :loading="submitting">創建PlayBook</el-button>
          <el-button @click="goBack">取消</el-button>
          <el-button @click="previewPlayBook" type="info" plain :disabled="!playbook.title">預覽</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 預覽對話框 -->
    <el-dialog v-model="previewVisible" title="PlayBook預覽" width="80%" top="5vh">
      <div class="space-y-4">
        <div>
          <h2 class="text-2xl font-bold">{{ playbook.title }}</h2>
          <p v-if="playbook.description" class="text-gray-600 mt-2">{{ playbook.description }}</p>
        </div>
        
        <div class="flex gap-2">
          <el-tag type="warning">{{ playbook.category || '一般' }}</el-tag>
          <el-tag v-if="appConfig.features.showDifficultyFields" :type="getDifficultyColor(playbook.difficulty)">
            {{ getDifficultyLabel(playbook.difficulty) }}
          </el-tag>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-2">學習步驟 ({{ playbook.steps.length }})</h3>
          <div class="space-y-2">
            <div 
              v-for="(step, index) in playbook.steps" 
              :key="index"
              class="flex items-center gap-3 p-3 border rounded"
            >
              <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <div class="font-medium">{{ step.title }}</div>
                <div class="text-sm text-gray-500">
                  {{ getStepTypeLabel(step.type) }}
                  {{ step.isRequired ? '(必須)' : '(選填)' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import TagInput from '@/components/admin/TagInput.vue'
import PlayBookService from '@/services/playbook.service'
import ContentService from '@/services/content.service'
import ExamService from '@/services/exam.service'
import SurveyService from '@/services/survey.service'
import customPageService from '@/services/customPage.service'
import { Plus, DocumentAdd, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue'
import appConfig from '@/config/app.config'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const playbookForm = ref(null)
const previewVisible = ref(false)

// PlayBook資料
const playbook = ref({
  title: '',
  description: '',
  category: '一般',
  difficulty: 'beginner',
  // 依設定決定預設展示模式
  displayType: appConfig.features.showOverviewOptionInPlayBookForm ? 'overview' : 'stepByStep',
  tags: [],
  steps: [],
  status: 'draft',
  isPublic: true
})

// 選項資料
const difficultyOptions = ref([])
const displayTypeOptions = ref([])
const statusOptions = ref([])
const stepTypeOptions = ref([])

// 資源選項
const contentOptions = ref([])
const examOptions = ref([])
const surveyOptions = ref([])
const customPageOptions = ref([])

// 表單驗證規則
const rules = {
  title: [{ required: true, message: '標題為必填', trigger: 'blur' }],
  difficulty: [{ required: true, message: '難度為必填', trigger: 'change' }],
  status: [{ required: true, message: '發布狀態為必填', trigger: 'change' }]
}

onMounted(async () => {
  difficultyOptions.value = PlayBookService.getDifficultyOptions()
  displayTypeOptions.value = getDisplayTypeOptions()
  // 若目前值不在可選清單內，改用第一個選項
  if (!displayTypeOptions.value.some(opt => opt.value === playbook.value.displayType)) {
    playbook.value.displayType = displayTypeOptions.value[0]?.value || 'stepByStep'
  }
  statusOptions.value = PlayBookService.getStatusOptions()
  stepTypeOptions.value = PlayBookService.getStepTypeOptions()
  
  await loadResources()
})

// 獲取展示類型選項
const getDisplayTypeOptions = () => {
  const options = []
  if (appConfig.features.showOverviewOptionInPlayBookForm) {
    options.push({
      value: 'overview',
      label: '總覽模式',
      description: '顯示所有步驟列表，用戶可以自由選擇步驟'
    })
  }
  options.push({
    value: 'stepByStep',
    label: '逐步模式',
    description: '直接進入步驟，逐步完成，中間以「下一步」串接'
  })
  return options
}

// 載入所有資源
const loadResources = async () => {
  try {
    // 載入內容
    console.log('開始載入內容...')
    const contentResponse = await ContentService.getAllContents({ 
      status: 'published', 
      pageSize: 100 
    })
    console.log('內容回應:', contentResponse)
    if (contentResponse.data && contentResponse.data.success) {
      contentOptions.value = contentResponse.data.data
      console.log('載入內容成功:', contentOptions.value.length, '個')
    } else {
      console.warn('內容載入失敗:', contentResponse)
    }
    
    // 載入測驗
    console.log('開始載入測驗...')
    try {
      const examResponse = await ExamService.getAllExams({ pageSize: 100 })
      console.log('測驗回應:', examResponse)
      if (examResponse.data && examResponse.data.success) {
        examOptions.value = examResponse.data.data
        console.log('載入測驗成功:', examOptions.value.length, '個')
      } else {
        console.warn('測驗載入失敗:', examResponse)
      }
    } catch (examError) {
      console.error('載入測驗時發生錯誤:', examError)
      ElMessage.warning('載入測驗列表失敗，但不影響其他功能')
    }
    
    // 載入問卷
    console.log('開始載入問卷...')
    try {
      const surveyResponse = await SurveyService.getAllSurveys({ pageSize: 100 })
      console.log('問卷回應:', surveyResponse)
      if (surveyResponse.data && surveyResponse.data.success) {
        surveyOptions.value = surveyResponse.data.data
        console.log('載入問卷成功:', surveyOptions.value.length, '個')
      } else {
        console.warn('問卷載入失敗:', surveyResponse)
      }
    } catch (surveyError) {
      console.error('載入問卷時發生錯誤:', surveyError)
      ElMessage.warning('載入問卷列表失敗，但不影響其他功能')
    }
    
    // 載入客製化頁面
    console.log('開始載入客製化頁面...')
    try {
      const customPageResponse = await customPageService.getAvailableCustomPages()
      console.log('客製化頁面回應:', customPageResponse)
      if (customPageResponse.data && customPageResponse.data.success) {
        customPageOptions.value = customPageResponse.data.data
        console.log('載入客製化頁面成功:', customPageOptions.value.length, '個')
      } else {
        console.warn('客製化頁面載入失敗:', customPageResponse)
      }
    } catch (customPageError) {
      console.error('載入客製化頁面時發生錯誤:', customPageError)
      ElMessage.warning('載入客製化頁面列表失敗，但不影響其他功能')
    }
  } catch (error) {
    console.error('載入資源時發生嚴重錯誤:', error)
    ElMessage.error('載入資源失敗')
  }
}

// 標籤改變時
const onTagsChange = (newTags) => {
  playbook.value.tags = newTags
}

// 新增步驟
const addStep = () => {
  const newStep = {
    stepNumber: playbook.value.steps.length + 1,
    type: 'content',
    resourceId: '',
    title: '',
    description: '',
    isRequired: true
  }
  playbook.value.steps.push(newStep)
}

// 移除步驟
const removeStep = (index) => {
  playbook.value.steps.splice(index, 1)
  // 重新編號
  playbook.value.steps.forEach((step, i) => {
    step.stepNumber = i + 1
  })
}

// 向上移動步驟
const moveStepUp = (index) => {
  if (index > 0) {
    const temp = playbook.value.steps[index]
    playbook.value.steps[index] = playbook.value.steps[index - 1]
    playbook.value.steps[index - 1] = temp
    
    // 重新編號
    playbook.value.steps.forEach((step, i) => {
      step.stepNumber = i + 1
    })
  }
}

// 向下移動步驟
const moveStepDown = (index) => {
  if (index < playbook.value.steps.length - 1) {
    const temp = playbook.value.steps[index]
    playbook.value.steps[index] = playbook.value.steps[index + 1]
    playbook.value.steps[index + 1] = temp
    
    // 重新編號
    playbook.value.steps.forEach((step, i) => {
      step.stepNumber = i + 1
    })
  }
}

// 步驟類型改變
const onStepTypeChange = (index) => {
  // 清空資源選擇
  playbook.value.steps[index].resourceId = ''
  playbook.value.steps[index].title = ''
}

// 資源改變
const onResourceChange = (index) => {
  const step = playbook.value.steps[index]
  const resources = getResourceOptions(step.type)
  const selectedResource = resources.find(r => r._id === step.resourceId)
  
  if (selectedResource) {
    // 自動設定步驟標題為資源標題
    step.title = selectedResource.title
  }
}

// 獲取資源選項
const getResourceOptions = (type) => {
  console.log(`獲取 ${type} 類型的資源選項`)
  console.log('contentOptions:', contentOptions.value.length)
  console.log('examOptions:', examOptions.value.length)
  console.log('surveyOptions:', surveyOptions.value.length)
  console.log('customPageOptions:', customPageOptions.value.length)
  
  switch (type) {
    case 'content':
      console.log('返回內容選項:', contentOptions.value)
      return contentOptions.value
    case 'exam':
      console.log('返回測驗選項:', examOptions.value)
      return examOptions.value
    case 'survey':
      console.log('返回問卷選項:', surveyOptions.value)
      return surveyOptions.value
    case 'customPage':
      console.log('返回客製化頁面選項:', customPageOptions.value)
      return customPageOptions.value
    default:
      console.log('未知類型，返回空陣列')
      return []
  }
}

// 獲取步驟類型標籤
const getStepTypeLabel = (type) => {
  const option = stepTypeOptions.value.find(opt => opt.value === type)
  return option ? option.label : type
}

// 獲取難度顏色
const getDifficultyColor = (difficulty) => {
  return PlayBookService.getDifficultyColor(difficulty)
}

// 獲取難度標籤
const getDifficultyLabel = (difficulty) => {
  const option = difficultyOptions.value.find(opt => opt.value === difficulty)
  return option ? option.label : difficulty
}

// 預覽PlayBook
const previewPlayBook = () => {
  previewVisible.value = true
}

// 提交PlayBook
const submitPlayBook = async () => {
  if (!playbookForm.value) return
  
  try {
    await playbookForm.value.validate()
    
    if (playbook.value.steps.length === 0) {
      ElMessage.error('至少需要新增一個步驟')
      return
    }
    
    // 驗證步驟
    for (let i = 0; i < playbook.value.steps.length; i++) {
      const step = playbook.value.steps[i]
      if (!step.type || !step.resourceId || !step.title) {
        ElMessage.error(`步驟 ${i + 1} 資料不完整`)
        return
      }
    }
    
    submitting.value = true
    
    const response = await PlayBookService.createPlayBook(playbook.value)
    
    if (response.data.success) {
      ElMessage.success('PlayBook創建成功')
      router.push('/admin/playbooks')
    }
  } catch (error) {
    console.error('創建PlayBook失敗:', error)
    ElMessage.error(error.response?.data?.message || '創建失敗')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/admin/playbooks')
}
</script>

<style scoped>
.step-item {
  transition: all 0.3s ease;
}
</style>
