<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 導航欄 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-bold text-blue-600">
            PlayBoard
          </router-link>
          <div class="flex items-center gap-4">
            <router-link to="/contents" class="text-blue-600 font-medium">
              所有內容
            </router-link>
            <router-link to="/admin" class="text-gray-600 hover:text-blue-600">
              管理後台
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 頁面標題 -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">內容中心</h1>
        <p class="text-gray-600">探索精彩的學習內容和資源</p>
      </div>

      <!-- 篩選器 -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-4 items-center justify-center">
          <el-select 
            v-model="categoryFilter" 
            placeholder="選擇分類" 
            @change="fetchContents"
            clearable
            style="width: 200px"
          >
            <el-option label="全部分類" value="" />
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
          
          <el-select 
            v-model="tagFilter" 
            placeholder="選擇標籤" 
            @change="fetchContents"
            clearable
            style="width: 200px"
          >
            <el-option label="全部標籤" value="" />
            <el-option
              v-for="tag in tags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
          
          <el-button @click="resetFilters" plain>
            <el-icon><RefreshRight /></el-icon>重置篩選
          </el-button>
        </div>
      </div>

      <!-- 載入中 -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <el-skeleton 
          v-for="i in 6" 
          :key="i"
          :rows="4" 
          animated 
          class="bg-white rounded-lg p-6"
        />
      </div>

      <!-- 內容為空 -->
      <div v-else-if="contents.length === 0" class="text-center py-16">
        <el-icon size="64" class="text-gray-400 mb-4"><DocumentRemove /></el-icon>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">暫無內容</h2>
        <p class="text-gray-600">
          {{ hasFilters ? '當前篩選條件下沒有找到內容' : '還沒有發布的內容' }}
        </p>
        <el-button v-if="hasFilters" @click="resetFilters" type="primary" class="mt-4">
          清除篩選
        </el-button>
      </div>

      <!-- 內容列表 -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <article 
            v-for="content in contents" 
            :key="content._id"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
            @click="viewContent(content)"
          >
            <!-- 特色圖片 -->
            <div v-if="content.featuredImage" class="aspect-video overflow-hidden">
              <img 
                :src="content.featuredImage.url" 
                :alt="content.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <!-- 內容區域 -->
            <div class="p-6">
              <!-- 分類和標籤 -->
              <div class="flex flex-wrap gap-2 mb-3">
                <el-tag 
                  type="warning" 
                  size="small" 
                  effect="plain"
                >
                  {{ content.category || '一般' }}
                </el-tag>
                <el-tag
                  v-for="tag in content.tags.slice(0, 2)"
                  :key="tag"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
                <el-tag 
                  v-if="content.tags.length > 2"
                  type="info"
                  size="small"
                  effect="plain"
                >
                  +{{ content.tags.length - 2 }}
                </el-tag>
              </div>
              
              <!-- 標題 -->
              <h2 class="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {{ content.title }}
              </h2>
              
              <!-- 摘要 -->
              <p v-if="content.excerpt" class="text-gray-600 mb-4 line-clamp-3">
                {{ content.excerpt }}
              </p>
              
              <!-- 元資訊 -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <el-icon><User /></el-icon>
                    <span>{{ content.createdBy?.username || '匿名' }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <el-icon><View /></el-icon>
                    <span>{{ content.viewCount || 0 }}</span>
                  </div>
                </div>
                <time :datetime="content.publishedAt">
                  {{ formatDate(content.publishedAt || content.createdAt) }}
                </time>
              </div>
            </div>
          </article>
        </div>

        <!-- 分頁 -->
        <div class="flex justify-center">
          <el-pagination 
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[9, 18, 36]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalContents"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ContentService from '@/services/content.service'
import { 
  User, View, DocumentRemove, RefreshRight 
} from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(true)
const contents = ref([])
const totalContents = ref(0)
const currentPage = ref(1)
const pageSize = ref(9) // 3x3網格佈局

// 篩選選項
const categories = ref([])
const tags = ref([])
const categoryFilter = ref('')
const tagFilter = ref('')

// 是否有篩選條件
const hasFilters = computed(() => {
  return categoryFilter.value || tagFilter.value
})

onMounted(async () => {
  await Promise.all([
    fetchContents(),
    fetchCategories(),
    fetchTags()
  ])
})

// 獲取內容列表
const fetchContents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (categoryFilter.value) {
      params.category = categoryFilter.value
    }
    
    if (tagFilter.value) {
      params.tag = tagFilter.value
    }
    
    const response = await ContentService.getPublicContents(params)
    if (response.data.success) {
      contents.value = response.data.data
      totalContents.value = response.data.count
    }
  } catch (error) {
    console.error('獲取內容列表失敗:', error)
    ElMessage.error('載入內容失敗')
  } finally {
    loading.value = false
  }
}

// 獲取分類列表
const fetchCategories = async () => {
  try {
    const response = await ContentService.getCategories()
    if (response.data.success) {
      categories.value = response.data.data
    }
  } catch (error) {
    console.error('獲取分類列表失敗:', error)
  }
}

// 獲取標籤列表
const fetchTags = async () => {
  try {
    const response = await ContentService.getTags()
    if (response.data.success) {
      tags.value = response.data.data
    }
  } catch (error) {
    console.error('獲取標籤列表失敗:', error)
  }
}

// 重置篩選
const resetFilters = () => {
  categoryFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  fetchContents()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-TW', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 查看內容
const viewContent = (content) => {
  router.push(`/content/${content.slug}`)
}

// 分頁大小改變
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  fetchContents()
}

// 當前頁改變
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  fetchContents()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
