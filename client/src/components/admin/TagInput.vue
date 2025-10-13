<template>
  <div class="tag-input">
    <!-- 標籤顯示區域 -->
    <div v-if="selectedTags.length > 0" class="mb-3">
      <el-tag
        v-for="tag in selectedTags"
        :key="tag"
        size="small"
        class="mr-2 mb-2"
        closable
        @close="removeTag(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 輸入框和建議 -->
    <el-autocomplete
      v-model="inputValue"
      :fetch-suggestions="querySearch"
      placeholder="輸入標籤名稱，按Enter新增"
      @select="handleSelect"
      @keyup.enter="addTag"
      clearable
      style="width: 100%"
    >
      <template #default="{ item }">
        <div class="flex items-center justify-between">
          <span>{{ item.value }}</span>
          <span class="text-xs text-gray-500 ml-2">{{ item.count || 0 }} 次使用</span>
        </div>
      </template>
      <template #append>
        <el-button @click="addTag" :disabled="!inputValue.trim()">
          <el-icon><Plus /></el-icon>
        </el-button>
      </template>
    </el-autocomplete>

    <!-- 常用標籤快速選擇 -->
    <div v-if="popularTags.length > 0" class="mt-3">
      <div class="text-sm text-gray-600 mb-2">常用標籤：</div>
      <div class="flex flex-wrap gap-2">
        <el-tag
          v-for="tag in popularTags"
          :key="tag.value"
          size="small"
          effect="plain"
          class="cursor-pointer hover:bg-blue-50"
          @click="selectPopularTag(tag.value)"
        >
          {{ tag.value }} ({{ tag.count }})
        </el-tag>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="text-xs text-gray-500 mt-2">
      標籤有助於分類和搜尋內容，建議使用2-5個相關標籤
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import ContentService from '@/services/content.service'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxTags: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputValue = ref('')
const selectedTags = ref([...props.modelValue])
const allTags = ref([])
const popularTags = ref([])

// 監聽props變化
watch(() => props.modelValue, (newValue) => {
  selectedTags.value = [...newValue]
})

// 監聽selectedTags變化，同步到父組件
watch(selectedTags, (newTags) => {
  emit('update:modelValue', newTags)
  emit('change', newTags)
}, { deep: true })

onMounted(async () => {
  await loadTags()
})

// 載入所有標籤
const loadTags = async () => {
  try {
    const response = await ContentService.getTags()
    if (response.data.success) {
      allTags.value = response.data.data.map(tag => ({
        value: tag,
        count: Math.floor(Math.random() * 20) + 1 // 暫時模擬使用次數
      }))
      
      // 取得熱門標籤（使用次數最多的前6個）
      popularTags.value = allTags.value
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .filter(tag => !selectedTags.value.includes(tag.value))
    }
  } catch (error) {
    console.error('載入標籤失敗:', error)
  }
}

// 搜尋建議
const querySearch = (queryString, callback) => {
  if (!queryString) {
    callback(allTags.value.filter(tag => !selectedTags.value.includes(tag.value)))
    return
  }

  const results = allTags.value.filter(tag => {
    return tag.value.toLowerCase().includes(queryString.toLowerCase()) &&
           !selectedTags.value.includes(tag.value)
  })

  // 如果沒有找到完全匹配的標籤，新增新建標籤的選項
  const exactMatch = results.find(tag => tag.value.toLowerCase() === queryString.toLowerCase())
  if (!exactMatch && queryString.trim()) {
    results.unshift({
      value: queryString.trim(),
      count: 0,
      isNew: true
    })
  }

  callback(results)
}

// 選擇建議項
const handleSelect = (item) => {
  addTagValue(item.value)
  inputValue.value = ''
}

// 新增標籤（從輸入框）
const addTag = () => {
  const tagValue = inputValue.value.trim()
  if (tagValue) {
    addTagValue(tagValue)
    inputValue.value = ''
  }
}

// 新增標籤值
const addTagValue = (tagValue) => {
  if (!tagValue || selectedTags.value.includes(tagValue)) {
    return
  }

  if (selectedTags.value.length >= props.maxTags) {
    ElMessage.warning(`最多只能新增 ${props.maxTags} 個標籤`)
    return
  }

  selectedTags.value.push(tagValue)
  
  // 更新熱門標籤列表（移除已選中的標籤）
  popularTags.value = popularTags.value.filter(tag => tag.value !== tagValue)
}

// 移除標籤
const removeTag = (tagValue) => {
  const index = selectedTags.value.indexOf(tagValue)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  }
  
  // 重新載入熱門標籤
  loadTags()
}

// 選擇熱門標籤
const selectPopularTag = (tagValue) => {
  addTagValue(tagValue)
}
</script>

<style scoped>
.tag-input :deep(.el-autocomplete) {
  width: 100%;
}

.tag-input :deep(.el-input-group__append) {
  padding: 0 12px;
}
</style>
