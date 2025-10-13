<template>
  <div class="min-h-screen">
    <!-- 導航欄 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-bold text-[color:var(--pb-color-primary)]">
            PlayBoard
          </router-link>
          <div class="flex items-center gap-4">
            <router-link to="/contents" class="text-gray-600 hover:text-[color:var(--pb-color-primary)]">
              所有內容
            </router-link>
            <router-link to="/admin" class="text-gray-600 hover:text-[color:var(--pb-color-primary)]">
              管理後台
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 載入中 -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 py-8">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 內容不存在 -->
    <div v-else-if="!content" class="max-w-4xl mx-auto px-4 py-8">
      <div class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><DocumentRemove /></el-icon>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">內容不存在</h2>
        <p class="text-gray-600 mb-6">您要查看的內容可能已被刪除或不存在。</p>
        <el-button type="primary" @click="goHome">返回首頁</el-button>
      </div>
    </div>

    <!-- 內容顯示 -->
    <article v-else class="max-w-4xl mx-auto px-4 py-8">
      <!-- 文章標題區域 -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ content.title }}</h1>
        
        <!-- 文章摘要 -->
        <div v-if="content.excerpt" class="text-xl text-gray-600 mb-6 leading-relaxed">
          {{ content.excerpt }}
        </div>
        
        <!-- 文章元資訊 -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <div class="flex items-center gap-1">
            <el-icon><Calendar /></el-icon>
            <time :datetime="content.publishedAt">
              {{ formatDate(content.publishedAt || content.createdAt) }}
            </time>
          </div>
          <div class="flex items-center gap-1">
            <el-icon><User /></el-icon>
            <span>{{ content.createdBy?.username || '匿名作者' }}</span>
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
          <el-tag 
            type="warning" 
            size="small" 
            effect="plain"
            class="px-3 py-1"
          >
            {{ content.category || '一般' }}
          </el-tag>
          <el-tag
            v-for="tag in content.tags"
            :key="tag"
            type="info"
            size="small"
            effect="plain"
            class="px-3 py-1"
          >
            {{ tag }}
          </el-tag>
        </div>
      </header>

      <!-- 特色圖片 -->
      <div v-if="content.featuredImage" class="mb-8">
        <img 
          :src="content.featuredImage.url" 
          :alt="content.title"
          class="w-full rounded-lg shadow-lg"
        />
        <p v-if="showImageCaption" class="text-sm text-gray-500 mt-2 text-center">
          {{ content.featuredImage.originalName }}
        </p>
      </div>

      <!-- 文章內容 -->
      <div class="prose prose-lg max-w-none">
        <!-- HTML內容 -->
        <div 
          v-if="content.contentType === 'html'" 
          v-html="content.content" 
          class="rich-content"
        ></div>
        
        <!-- Markdown內容（暫時以純文字顯示，可以後續整合markdown解析器） -->
        <div 
          v-else-if="content.contentType === 'markdown'" 
          class="markdown-content whitespace-pre-wrap"
        >
          {{ content.content }}
        </div>
        
        <!-- 純文字內容 -->
        <div 
          v-else 
          class="plain-content whitespace-pre-wrap font-sans"
        >
          {{ content.content }}
        </div>
      </div>

      <!-- 附加圖片 -->
      <div v-if="content.images && content.images.length > 0" class="mt-12">
        <h3 class="text-xl font-semibold text-gray-800 mb-6">相關圖片</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(image, index) in content.images" 
            :key="index"
            class="group cursor-pointer"
            @click="previewImage(image)"
          >
            <img 
              :src="image.url" 
              :alt="image.originalName"
              class="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
            />
            <p class="text-sm text-gray-600 mt-2">{{ image.originalName }}</p>
          </div>
        </div>
      </div>

      <!-- 文章底部資訊 -->
      <footer class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- 分享按鈕 -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">分享：</span>
            <el-button 
              @click="copyCurrentUrl" 
              size="small" 
              type="primary" 
              plain
            >
              <el-icon><Link /></el-icon>複製連結
            </el-button>
          </div>
          
          <!-- 返回按鈕 -->
          <div class="flex gap-2">
            <el-button @click="goBack" size="small" plain>
              <el-icon><ArrowLeft /></el-icon>返回
            </el-button>
            <el-button @click="goHome" size="small" plain>
              <el-icon><House /></el-icon>首頁
            </el-button>
          </div>
        </div>
      </footer>
    </article>

    <!-- 圖片預覽對話框 -->
    <el-dialog v-model="imagePreviewVisible" title="圖片預覽" width="80%" center>
      <div v-if="previewImageData" class="text-center">
        <img 
          :src="previewImageData.url" 
          :alt="previewImageData.originalName"
          class="max-w-full max-h-96 object-contain"
        />
        <p class="text-sm text-gray-600 mt-4">{{ previewImageData.originalName }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentService from '@/services/content.service'
import { 
  Calendar, User, View, Document, DocumentRemove, Link, 
  ArrowLeft, House 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const content = ref(null)
const imagePreviewVisible = ref(false)
const previewImageData = ref(null)
const showImageCaption = ref(false) // 可以設為true來顯示圖片說明

onMounted(async () => {
  await fetchContent()
})

// 獲取內容資料
const fetchContent = async () => {
  try {
    const slug = route.params.slug
    const response = await ContentService.getPublicContent(slug)
    
    if (response.data.success) {
      content.value = response.data.data
      // 設置頁面標題
      document.title = `${content.value.title} - PlayBoard`
    }
  } catch (error) {
    console.error('獲取內容失敗:', error)
    if (error.response?.status === 404) {
      content.value = null
    } else {
      ElMessage.error('載入內容失敗')
    }
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取內容類型標籤
const getContentTypeLabel = (type) => {
  return ContentService.getContentTypeLabel(type)
}

// 預覽圖片
const previewImage = (image) => {
  previewImageData.value = image
  imagePreviewVisible.value = true
}

// 複製當前URL
const copyCurrentUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    ElMessage.success('連結已複製到剪貼簿')
  } catch (error) {
    ElMessage.error('複製連結失敗')
  }
}

// 返回上一頁
const goBack = () => {
  router.go(-1)
}

// 返回首頁
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
/* 基礎樣式 */
.prose {
  line-height: 1.7;
  color: #374151;
}

/* 標題樣式 */
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3),
.prose :deep(h4),
.prose :deep(h5),
.prose :deep(h6) {
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #111827;
}

.prose :deep(h1) { font-size: 2.5rem; }
.prose :deep(h2) { font-size: 2rem; }
.prose :deep(h3) { font-size: 1.5rem; }
.prose :deep(h4) { font-size: 1.25rem; }

/* 段落樣式 */
.prose :deep(p) {
  margin-bottom: 1.5rem;
  text-align: justify;
}

/* 列表樣式 */
.prose :deep(ul),
.prose :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

/* 引用樣式 */
.prose :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
  background-color: #f8fafc;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
}

/* 代碼樣式 */
.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: #e11d48;
}

.prose :deep(pre) {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  font-size: 0.875rem;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: #374151;
}

/* 圖片樣式 */
.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 2rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 表格樣式 */
.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.prose :deep(th),
.prose :deep(td) {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.prose :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

/* 連結樣式 */
.prose :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
  transition: color 0.2s;
}

.prose :deep(a:hover) {
  color: #1d4ed8;
}

/* 富文本內容特殊樣式 */
.rich-content :deep(.ql-align-center) {
  text-align: center;
}

.rich-content :deep(.ql-align-right) {
  text-align: right;
}

.rich-content :deep(.ql-align-justify) {
  text-align: justify;
}

/* Markdown內容樣式 */
.markdown-content {
  font-family: inherit;
}

/* 純文字內容樣式 */
.plain-content {
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .prose {
    font-size: 1rem;
  }
  
  .prose :deep(h1) { font-size: 2rem; }
  .prose :deep(h2) { font-size: 1.5rem; }
  .prose :deep(h3) { font-size: 1.25rem; }
}
</style>
