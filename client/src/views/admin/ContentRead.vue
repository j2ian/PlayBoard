<template>
  <AdminLayout title="內容詳情">
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">內容詳情</span>
          <div class="flex gap-2">
            <el-button 
              v-if="content.status === 'published' && content.isPublic"
              type="success" 
              @click="openPublicLink"
            >
              <el-icon><Link /></el-icon>查看公開頁面
            </el-button>
            <el-button type="primary" @click="editContent">
              <el-icon><EditPen /></el-icon>編輯
            </el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="content" class="max-w-4xl mx-auto">
        <!-- 標題和狀態 -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-3">
            <h1 class="text-3xl font-bold text-gray-800">{{ content.title }}</h1>
            <el-tag :type="getStatusTagType(content.status)" size="large">
              {{ getStatusLabel(content.status) }}
            </el-tag>
            <el-tag v-if="!content.isPublic" type="warning" size="large">
              私人
            </el-tag>
          </div>
          
          <div v-if="content.excerpt" class="text-lg text-gray-600 mb-4">
            {{ content.excerpt }}
          </div>
          
          <!-- 元資訊 -->
          <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div class="flex items-center gap-1">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(content.createdAt) }}</span>
            </div>
            <div v-if="content.publishedAt" class="flex items-center gap-1">
              <el-icon><Upload /></el-icon>
              <span>發布於 {{ formatDate(content.publishedAt) }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><User /></el-icon>
              <span>{{ content.createdBy?.username || '未知作者' }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><View /></el-icon>
              <span>{{ content.viewCount || 0 }} 次瀏覽</span>
            </div>
            <div class="flex items-center gap-1">
              <el-icon><Document /></el-icon>
              <span>{{ getContentTypeLabel(content.contentType) }}</span>
            </div>
          </div>
          
          <!-- 分類和標籤 -->
          <div class="flex flex-wrap gap-2 mb-6">
            <el-tag type="warning" size="small" effect="plain">
              {{ content.category || '無分類' }}
            </el-tag>
            <el-tag
              v-for="tag in content.tags"
              :key="tag"
              type="info"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 特色圖片 -->
        <div v-if="content.featuredImage" class="mb-6">
          <img 
            :src="content.featuredImage.url" 
            :alt="content.title"
            class="w-full max-w-2xl rounded-lg shadow-lg"
          />
          <p class="text-sm text-gray-500 mt-2">{{ content.featuredImage.originalName }}</p>
        </div>

        <!-- 內容 -->
        <div class="prose max-w-none">
          <div v-if="content.contentType === 'html'" v-html="content.content" class="rich-content"></div>
          <pre v-else-if="content.contentType === 'plain'" class="whitespace-pre-wrap font-sans">{{ content.content }}</pre>
          <div v-else class="markdown-content whitespace-pre-wrap">{{ content.content }}</div>
        </div>

        <!-- 附加圖片 -->
        <div v-if="content.images && content.images.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">附加圖片</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(image, index) in content.images" 
              :key="index"
              class="group relative"
            >
              <img 
                :src="image.url" 
                :alt="image.originalName"
                class="w-full h-32 object-cover rounded-lg border cursor-pointer"
                @click="previewImage(image)"
              />
              <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <el-button 
                  @click="copyImageUrl(image.url)" 
                  size="small" 
                  type="primary"
                >
                  複製URL
                </el-button>
              </div>
              <p class="text-xs text-gray-500 mt-1 truncate">{{ image.originalName }}</p>
            </div>
          </div>
        </div>

        <!-- 技術資訊 -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">技術資訊</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">內容ID：</span>
              <code class="bg-gray-200 px-2 py-1 rounded">{{ content._id }}</code>
            </div>
            <div>
              <span class="text-gray-600">URL識別符：</span>
              <code class="bg-gray-200 px-2 py-1 rounded">{{ content.slug }}</code>
            </div>
            <div>
              <span class="text-gray-600">建立時間：</span>
              <span>{{ formatDate(content.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-600">更新時間：</span>
              <span>{{ formatDate(content.updatedAt) }}</span>
            </div>
            <div v-if="content.lastModifiedBy">
              <span class="text-gray-600">最後修改者：</span>
              <span>{{ content.lastModifiedBy.username }}</span>
            </div>
            <div>
              <span class="text-gray-600">內容長度：</span>
              <span>{{ content.content?.length || 0 }} 字元</span>
            </div>
          </div>
        </div>

        <!-- 公開連結資訊 -->
        <div v-if="content.status === 'published' && content.isPublic" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 class="text-lg font-medium text-green-800 mb-2">公開連結</h4>
          <p class="text-sm text-green-600 mb-3">此內容已發布並可公開訪問：</p>
          <div class="flex items-center gap-2">
            <el-input 
              :value="publicUrl" 
              readonly 
              class="flex-1"
            />
            <el-button type="success" @click="copyUrl">
              <el-icon><CopyDocument /></el-icon>複製
            </el-button>
            <el-button type="success" @click="openPublicLink">
              <el-icon><Link /></el-icon>開啟
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 圖片預覽對話框 -->
    <el-dialog v-model="imagePreviewVisible" title="圖片預覽" width="80%" center>
      <div v-if="previewImageData" class="text-center">
        <img 
          :src="previewImageData.url" 
          :alt="previewImageData.originalName"
          class="max-w-full max-h-96 object-contain"
        />
        <div class="mt-4 text-sm text-gray-600">
          <p><strong>檔案名稱：</strong>{{ previewImageData.originalName }}</p>
          <p><strong>檔案大小：</strong>{{ formatFileSize(previewImageData.size) }}</p>
          <p><strong>圖片URL：</strong></p>
          <el-input 
            :value="previewImageData.url" 
            readonly 
            class="mt-2"
          >
            <template #append>
              <el-button @click="copyImageUrl(previewImageData.url)">複製</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import ContentService from '@/services/content.service'
import { 
  Link, EditPen, Calendar, Upload, User, View, Document, 
  CopyDocument 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const content = ref(null)
const imagePreviewVisible = ref(false)
const previewImageData = ref(null)

onMounted(async () => {
  await fetchContent()
})

// 公開URL
const publicUrl = computed(() => {
  if (!content.value) return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/PlayBoard/content/${content.value.slug}`
})

// 獲取內容資料
const fetchContent = async () => {
  try {
    const id = route.params.id
    const response = await ContentService.getContent(id)
    
    if (response.data.success) {
      content.value = response.data.data
    }
  } catch (error) {
    console.error('獲取內容失敗:', error)
    ElMessage.error('獲取內容失敗')
    router.push('/admin/contents')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化檔案大小
const formatFileSize = (bytes) => {
  return ContentService.formatFileSize(bytes)
}

// 獲取狀態標籤樣式
const getStatusTagType = (status) => {
  return ContentService.getStatusTagType(status)
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  return ContentService.getStatusLabel(status)
}

// 獲取內容類型標籤
const getContentTypeLabel = (type) => {
  return ContentService.getContentTypeLabel(type)
}

// 複製URL
const copyUrl = async () => {
  try {
    // 優先使用現代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(publicUrl.value)
      ElMessage.success('連結已複製到剪貼簿')
    } else {
      // 降級到傳統方法
      const textArea = document.createElement('textarea')
      textArea.value = publicUrl.value
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        ElMessage.success('連結已複製到剪貼簿')
      } else {
        throw new Error('複製命令失敗')
      }
    }
  } catch (error) {
    console.error('複製連結失敗:', error)
    ElMessage.error('複製連結失敗，請手動複製')
  }
}

// 複製圖片URL
const copyImageUrl = async (url) => {
  try {
    // 優先使用現代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url)
      ElMessage.success('圖片URL已複製到剪貼簿')
    } else {
      // 降級到傳統方法
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        ElMessage.success('圖片URL已複製到剪貼簿')
      } else {
        throw new Error('複製命令失敗')
      }
    }
  } catch (error) {
    console.error('複製失敗:', error)
    ElMessage.error('複製失敗，請手動複製')
  }
}

// 開啟公開連結
const openPublicLink = () => {
  window.open(publicUrl.value, '_blank')
}

// 編輯內容
const editContent = () => {
  router.push(`/admin/contents/${content.value._id}/edit`)
}

// 預覽圖片
const previewImage = (image) => {
  previewImageData.value = image
  imagePreviewVisible.value = true
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

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.prose h1 { font-size: 2rem; }
.prose h2 { font-size: 1.5rem; }
.prose h3 { font-size: 1.25rem; }

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.prose pre {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.rich-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.markdown-content {
  font-family: inherit;
}
</style>
