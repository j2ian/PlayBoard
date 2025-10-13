<template>
  <AdminLayout title="編輯PlayBook">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">編輯PlayBook</span>
          <div class="flex gap-2">
            <el-button 
              v-if="playbook.status === 'published' && playbook.isPublic"
              type="success" 
              @click="openPublicLink"
            >
              <el-icon><Link /></el-icon>查看公開頁面
            </el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>

      <el-form 
        v-if="!loading"
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
          
          <el-form-item label="URL識別符" prop="slug" required>
            <el-input 
              v-model="playbook.slug" 
              placeholder="用於公開連結的識別符"
              readonly
              disabled
            >
              <template #prefix>
                <span class="text-gray-500">/playbook/</span>
              </template>
            </el-input>
            <div class="text-sm text-gray-500 mt-1">
              URL識別符在創建後無法修改
            </div>
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
                <el-form-item :label="`步驟${index + 1}類型`" required>
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
                <el-form-item :label="`選擇${getStepTypeLabel(step.type)}`" required>
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
                <el-form-item :label="`步驟${index + 1}標題`" required>
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

        <!-- 統計資訊 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800 mb-4">PlayBook資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">總步驟數：</span>
              <span class="font-semibold">{{ playbook.totalSteps || playbook.steps.length }}</span>
            </div>
            <div>
              <span class="text-gray-600">預估時間：</span>
              <span class="font-semibold">{{ formatDuration(playbook.estimatedTime) }}</span>
            </div>
            <div>
              <span class="text-gray-600">瀏覽次數：</span>
              <span class="font-semibold">{{ playbook.viewCount || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-600">完成次數：</span>
              <span class="font-semibold">{{ playbook.completionCount || 0 }}</span>
            </div>
            <div>
              <span class="text-gray-600">建立時間：</span>
              <span>{{ formatDate(playbook.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">更新時間：</span>
              <span>{{ formatDate(playbook.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 提交按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="submitPlayBook" :loading="submitting">更新PlayBook</el-button>
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
          <el-tag :type="getDifficultyColor(playbook.difficulty)">
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
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import TagInput from '@/components/admin/TagInput.vue'
import PlayBookService from '@/services/playbook.service'
import ContentService from '@/services/content.service'
import ExamService from '@/services/exam.service'
import SurveyService from '@/services/survey.service'
import customPageService from '@/services/customPage.service'
import { Plus, DocumentAdd, ArrowUp, ArrowDown, Delete, Link } from '@element-plus/icons-vue'
import appConfig from '@/config/app.config'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const submitting = ref(false)
const playbookForm = ref(null)
const previewVisible = ref(false)

// PlayBook資料
const playbook = ref({
  title: '',
  slug: '',
  description: '',
  category: '一般',
  difficulty: 'beginner',
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
  statusOptions.value = PlayBookService.getStatusOptions()
  stepTypeOptions.value = PlayBookService.getStepTypeOptions()
  
  await Promise.all([
    loadResources(),
    fetchPlayBook()
  ])
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
    const contentResponse = await ContentService.getAllContents({ 
      status: 'published', 
      pageSize: 100 
    })
    if (contentResponse.data.success) {
      contentOptions.value = contentResponse.data.data
    }
    
    // 載入測驗
    const examResponse = await ExamService.getAllExams({ pageSize: 100 })
    if (examResponse.data.success) {
      examOptions.value = examResponse.data.data
    }
    
    // 載入問卷
    const surveyResponse = await SurveyService.getAllSurveys({ pageSize: 100 })
    if (surveyResponse.data.success) {
      surveyOptions.value = surveyResponse.data.data
    }
    
    // 載入客製化頁面
    const customPageResponse = await customPageService.getAvailableCustomPages()
    if (customPageResponse.data.success) {
      customPageOptions.value = customPageResponse.data.data
    }
  } catch (error) {
    console.error('載入資源失敗:', error)
  }
}

// 獲取PlayBook資料
const fetchPlayBook = async () => {
  try {
    loading.value = true
    const id = route.params.id
    const response = await PlayBookService.getPlayBook(id)
    
    if (response.data.success) {
      const data = response.data.data
      // 合併指派以保留表單 model 的引用，避免觸發 ElFormItem 遞迴更新
      Object.assign(playbook.value, data)
    }
  } catch (error) {
    console.error('獲取PlayBook失敗:', error)
    ElMessage.error('獲取PlayBook失敗')
    router.push('/admin/playbooks')
  } finally {
    loading.value = false
    await nextTick()
    if (playbookForm.value && typeof playbookForm.value.clearValidate === 'function') {
      playbookForm.value.clearValidate()
    }
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW')
}

// 格式化持續時間
const formatDuration = (minutes) => {
  return PlayBookService.formatDuration(minutes || 0)
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
  switch (type) {
    case 'content':
      return contentOptions.value
    case 'exam':
      return examOptions.value
    case 'survey':
      return surveyOptions.value
    case 'customPage':
      return customPageOptions.value
    default:
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

// 開啟公開連結
const openPublicLink = () => {
  const url = `/playbook/${playbook.value.slug}`
  window.open(url, '_blank')
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
    
    const id = route.params.id
    const response = await PlayBookService.updatePlayBook(id, playbook.value)
    
    if (response.data.success) {
      ElMessage.success('PlayBook更新成功')
      // 重新抓取一次，避免本地狀態覆蓋導致顯示錯亂
      await fetchPlayBook()
      router.push('/admin/playbooks')
    }
  } catch (error) {
    console.error('更新PlayBook失敗:', error)
    ElMessage.error(error.response?.data?.message || '更新失敗')
  } finally {
    submitting.value = false
  }
}

// 移除即時儲存，公開設定改由提交按鈕一併更新

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
