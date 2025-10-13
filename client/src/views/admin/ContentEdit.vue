<template>
  <AdminLayout title="編輯內容">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">編輯內容</span>
          <div class="flex gap-2">
            <el-button 
              v-if="content.status === 'published' && content.isPublic"
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
        :model="content" 
        ref="contentForm" 
        :rules="rules" 
        label-width="120px" 
        class="max-w-4xl mx-auto"
      >
        <!-- 基本資訊 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">基本資訊</h3>
          
          <el-form-item label="標題" prop="title" required>
            <el-input 
              v-model="content.title" 
              placeholder="請輸入內容標題"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="URL識別符" prop="slug" required>
            <el-input 
              v-model="content.slug" 
              placeholder="請輸入URL識別符（將用於公開連結）"
              @input="validateSlug"
            >
              <template #prefix>
                <span class="text-gray-500">/content/</span>
              </template>
              <template #suffix>
                <el-button 
                  @click="generateSlugFromTitle" 
                  size="small" 
                  type="primary" 
                  text
                  :disabled="!content.title"
                >
                  重新生成
                </el-button>
              </template>
            </el-input>
            <div v-if="slugError" class="text-red-500 text-sm mt-1">{{ slugError }}</div>
            <div v-else-if="content.slug" class="text-green-500 text-sm mt-1">
              預覽連結：/content/{{ content.slug }}
            </div>
          </el-form-item>
          
          <el-form-item label="摘要" prop="excerpt">
            <el-input 
              v-model="content.excerpt" 
              type="textarea" 
              :rows="3" 
              placeholder="請輸入內容摘要（可選）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 內容設定 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">內容設定</h3>
          
          <el-form-item label="內容類型" prop="contentType" required>
            <el-select 
              v-model="content.contentType" 
              placeholder="請選擇內容類型"
              @change="onContentTypeChange"
            >
              <el-option
                v-for="type in contentTypeOptions"
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
            <div v-if="contentTypeChanged" class="text-amber-600 text-sm mt-1">
              ⚠️ 更改內容類型可能影響現有內容的顯示效果
            </div>
          </el-form-item>
          
          <el-form-item label="內容" prop="content" required>
            <div v-if="content.contentType === 'html'">
              <RichTextEditor
                v-model="content.content"
                :placeholder="getContentPlaceholder()"
                height="450px"
                @change="onContentChange"
              />
            </div>
            <el-input 
              v-else
              v-model="content.content" 
              type="textarea" 
              :rows="15" 
              :placeholder="getContentPlaceholder()"
            />
            <div class="mt-2 text-sm text-gray-600">
              <span v-if="content.contentType === 'html'">
                使用富文本編輯器編輯HTML內容，支援圖片上傳和豐富的格式設定。
              </span>
              <span v-else-if="content.contentType === 'markdown'">
                使用Markdown語法編寫內容，如：# 標題、**粗體**、*斜體*等。
              </span>
              <span v-else>
                純文字模式，不支援任何格式化。
              </span>
            </div>
          </el-form-item>
        </div>

        <!-- 分類和標籤 -->
        <div class="mb-6 mt-8">
          <h3 class="text-lg font-medium text-gray-800 mb-4">分類和標籤</h3>
          
          <el-form-item label="分類" prop="category">
            <el-input 
              v-model="content.category" 
              placeholder="請輸入分類（例如：教學、新聞、技術等）"
            />
          </el-form-item>
          
          <el-form-item label="標籤" prop="tags">
            <TagInput
              v-model="content.tags"
              :max-tags="10"
              @change="onTagsChange"
            />
          </el-form-item>
        </div>

        <!-- 圖片管理 -->
        <div class="mb-6" style="display: none;">
          <h3 class="text-lg font-medium text-gray-800 mb-4">圖片管理</h3>
          
          <!-- 特色圖片 -->
          <el-form-item label="特色圖片" prop="featuredImage">
            <div class="w-full">
              <div v-if="content.featuredImage" class="mb-3">
                <img 
                  :src="content.featuredImage.url" 
                  :alt="content.featuredImage.originalName"
                  class="w-32 h-32 object-cover rounded-lg border"
                />
                <div class="mt-2 text-sm text-gray-600">
                  {{ content.featuredImage.originalName }} 
                  ({{ formatFileSize(content.featuredImage.size) }})
                </div>
                <el-button 
                  @click="removeFeaturedImage" 
                  size="small" 
                  type="danger" 
                  plain
                  class="mt-2"
                >
                  移除特色圖片
                </el-button>
              </div>
              <el-upload
                v-else
                :show-file-list="false"
                :before-upload="beforeUploadFeatured"
                :http-request="uploadFeaturedImage"
                accept="image/*"
                drag
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽圖片到此處或<em>點擊上傳</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支援 jpg/png/gif/webp 格式，檔案大小不超過 5MB
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>
          
          <!-- 內容圖片 -->
          <el-form-item label="內容圖片">
            <div class="w-full">
              <div v-if="content.images.length > 0" class="mb-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    v-for="(image, index) in content.images" 
                    :key="index"
                    class="relative group"
                  >
                    <img 
                      :src="image.url" 
                      :alt="image.originalName"
                      class="w-full h-24 object-cover rounded-lg border"
                    />
                    <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <el-button 
                        @click="copyImageUrl(image.url)" 
                        size="small" 
                        type="primary"
                        class="mr-1"
                      >
                        複製
                      </el-button>
                      <el-button 
                        @click="removeImage(index)" 
                        size="small" 
                        type="danger"
                      >
                        刪除
                      </el-button>
                    </div>
                    <div class="mt-1 text-xs text-gray-600 truncate">
                      {{ image.originalName }}
                    </div>
                  </div>
                </div>
              </div>
              
              <el-upload
                :show-file-list="false"
                :before-upload="beforeUploadContent"
                :http-request="uploadContentImage"
                accept="image/*"
                multiple
              >
                <el-button type="primary" plain>
                  <el-icon><Plus /></el-icon>
                  上傳內容圖片
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    可同時選擇多張圖片上傳，上傳後可複製圖片URL插入到內容中
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>
        </div>

        <!-- 發布設定 -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">發布設定</h3>
          
          <el-form-item label="狀態" prop="status" required>
            <el-select v-model="content.status" placeholder="請選擇發布狀態">
              <el-option
                v-for="status in statusOptions"
                :key="status.value"
                :label="status.label"
                :value="status.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="公開設定" prop="isPublic">
            <el-switch
              v-model="content.isPublic"
              active-text="公開"
              inactive-text="私人"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            />
            <div class="text-sm text-gray-600 mt-1">
              {{ content.isPublic ? '所有人都可以透過公開連結訪問此內容' : '只有管理員可以查看此內容' }}
            </div>
          </el-form-item>
        </div>

        <!-- 中繼資訊 -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800 mb-4">內容資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">建立時間：</span>
              <span>{{ formatDate(content.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">更新時間：</span>
              <span>{{ formatDate(content.updatedAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">建立者：</span>
              <span>{{ content.createdBy?.username || '未知' }}</span>
            </div>
            <div v-if="content.lastModifiedBy">
              <span class="text-gray-600">最後修改者：</span>
              <span>{{ content.lastModifiedBy.username }}</span>
            </div>
            <div v-if="content.publishedAt">
              <span class="text-gray-600">發布時間：</span>
              <span>{{ formatDate(content.publishedAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">瀏覽次數：</span>
              <span>{{ content.viewCount || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 提交按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="submitContent" :loading="submitting">更新內容</el-button>
          <el-button @click="goBack">取消</el-button>
          <el-button @click="previewContent" type="info" plain :disabled="!content.title">預覽</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 預覽對話框 -->
    <el-dialog v-model="previewVisible" title="內容預覽" width="80%" top="5vh">
      <div class="prose max-w-none">
        <h1>{{ content.title }}</h1>
        <div v-if="content.excerpt" class="text-gray-600 italic mb-4">
          {{ content.excerpt }}
        </div>
        <div v-if="content.featuredImage" class="mb-4">
          <img :src="content.featuredImage.url" :alt="content.title" class="w-full max-w-md rounded-lg" />
        </div>
        <pre v-if="content.contentType === 'plain'" class="whitespace-pre-wrap">{{ content.content }}</pre>
        <div v-else-if="content.contentType === 'html'" v-html="content.content"></div>
        <div v-else class="whitespace-pre-wrap">{{ content.content }}</div>
        
        <div v-if="content.tags.length > 0" class="mt-6 pt-4 border-t">
          <strong>標籤：</strong>
          <span v-for="(tag, index) in content.tags" :key="tag">
            {{ tag }}<span v-if="index < content.tags.length - 1">、</span>
          </span>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'
import TagInput from '@/components/admin/TagInput.vue'
import ContentService from '@/services/content.service'
import { Plus, UploadFilled, Link } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const submitting = ref(false)
const contentForm = ref(null)
const previewVisible = ref(false)

// 內容資料
const content = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentType: 'html',
  category: '一般',
  tags: [],
  featuredImage: null,
  images: [],
  status: 'draft',
  isPublic: true
})

// 原始內容類型（用於檢測是否有變更）
const originalContentType = ref('')
const contentTypeChanged = ref(false)

const slugError = ref('')

// 選項資料
const contentTypeOptions = ref([])
const statusOptions = ref([])

// 表單驗證規則
const rules = {
  title: [{ required: true, message: '標題為必填', trigger: 'blur' }],
  slug: [
    { required: true, message: 'URL識別符為必填', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!ContentService.validateSlug(value)) {
          callback(new Error('URL識別符只能包含小寫字母、數字和連字號'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  content: [{ required: true, message: '內容為必填', trigger: 'blur' }],
  contentType: [{ required: true, message: '內容類型為必填', trigger: 'change' }],
  status: [{ required: true, message: '發布狀態為必填', trigger: 'change' }]
}

onMounted(async () => {
  contentTypeOptions.value = ContentService.getContentTypeOptions()
  statusOptions.value = ContentService.getStatusOptions()
  
  await fetchContent()
})

// 獲取內容資料
const fetchContent = async () => {
  try {
    const id = route.params.id
    const response = await ContentService.getContent(id)
    
    if (response.data.success) {
      content.value = response.data.data
      originalContentType.value = content.value.contentType
    }
  } catch (error) {
    console.error('獲取內容失敗:', error)
    ElMessage.error('獲取內容失敗')
    router.push('/admin/contents')
  } finally {
    loading.value = false
  }
}

// 內容類型改變時
const onContentTypeChange = () => {
  contentTypeChanged.value = content.value.contentType !== originalContentType.value
}

// 從標題生成slug
const generateSlugFromTitle = () => {
  if (content.value.title) {
    content.value.slug = ContentService.generateSlug(content.value.title)
    validateSlug()
  }
}

// 驗證slug
const validateSlug = () => {
  if (content.value.slug) {
    if (!ContentService.validateSlug(content.value.slug)) {
      slugError.value = 'URL識別符只能包含小寫字母、數字和連字號'
    } else {
      slugError.value = ''
    }
  } else {
    slugError.value = ''
  }
}

// 標籤改變時
const onTagsChange = (newTags) => {
  content.value.tags = newTags
}

// 獲取內容佔位符
const getContentPlaceholder = () => {
  const placeholders = {
    markdown: '# 標題\n\n請輸入Markdown格式的內容...\n\n## 副標題\n\n- 項目1\n- 項目2',
    html: '請使用富文本編輯器編輯內容...',
    plain: '請輸入純文字內容...'
  }
  return placeholders[content.value.contentType] || '請輸入內容...'
}

// 內容改變時的處理
const onContentChange = (newContent) => {
  console.log('Content changed:', newContent.length, 'characters')
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  return ContentService.formatFileSize(bytes)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW')
}

// 圖片上傳前檢查
const beforeUploadFeatured = (file) => {
  return beforeUpload(file, '特色圖片')
}

const beforeUploadContent = (file) => {
  return beforeUpload(file, '內容圖片')
}

const beforeUpload = (file, type) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error(`${type}只能是 JPG/PNG/GIF/WEBP 格式!`)
    return false
  }
  if (!isLt5M) {
    ElMessage.error(`${type}大小不能超過 5MB!`)
    return false
  }
  return true
}

// 上傳特色圖片
const uploadFeaturedImage = async (options) => {
  try {
    const response = await ContentService.uploadImage(options.file)
    if (response.data.success) {
      content.value.featuredImage = response.data.data
      ElMessage.success('特色圖片上傳成功')
    }
  } catch (error) {
    console.error('特色圖片上傳失敗:', error)
    ElMessage.error('特色圖片上傳失敗')
  }
}

// 上傳內容圖片
const uploadContentImage = async (options) => {
  try {
    const response = await ContentService.uploadImage(options.file)
    if (response.data.success) {
      content.value.images.push(response.data.data)
      ElMessage.success('內容圖片上傳成功')
    }
  } catch (error) {
    console.error('內容圖片上傳失敗:', error)
    ElMessage.error('內容圖片上傳失敗')
  }
}

// 移除特色圖片
const removeFeaturedImage = () => {
  content.value.featuredImage = null
}

// 移除內容圖片
const removeImage = (index) => {
  content.value.images.splice(index, 1)
}

// 複製圖片URL
const copyImageUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('圖片URL已複製到剪貼簿')
  } catch (error) {
    ElMessage.error('複製失敗')
  }
}

// 開啟公開連結
const openPublicLink = () => {
  const url = `/content/${content.value.slug}`
  window.open(url, '_blank')
}

// 預覽內容
const previewContent = () => {
  previewVisible.value = true
}

// 提交內容
const submitContent = async () => {
  if (!contentForm.value) return
  
  try {
    await contentForm.value.validate()
    
    if (slugError.value) {
      ElMessage.error('請修正URL識別符格式錯誤')
      return
    }
    
    submitting.value = true
    
    const id = route.params.id
    const response = await ContentService.updateContent(id, content.value)
    
    if (response.data.success) {
      ElMessage.success('內容更新成功')
      router.push('/admin/contents')
    }
  } catch (error) {
    console.error('更新內容失敗:', error)
    ElMessage.error('更新內容失敗')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/admin/contents')
}
</script>

<style scoped>
.prose {
  line-height: 1.6;
}

.prose h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.prose pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>
