<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <el-input
      :model-value="searchValue"
      :placeholder="searchPlaceholder"
      clearable
      @input="onInput"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <el-select
      :model-value="sortValue"
      :placeholder="sortPlaceholder"
      class="w-full"
      @change="onSortChange"
    >
      <el-option
        v-for="option in sortOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
    <el-button type="primary" plain @click="emitSearch">
      <el-icon class="mr-1"><RefreshRight /></el-icon>重新整理
    </el-button>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  search: String,
  sort: String,
  searchPlaceholder: {
    type: String,
    default: '搜尋關鍵字'
  },
  sortPlaceholder: {
    type: String,
    default: '排序方式'
  },
  sortOptions: {
    type: Array,
    default: () => ([
      { label: '最新建立', value: 'latest' },
      { label: '最舊建立', value: 'oldest' },
      { label: '標題 A-Z', value: 'titleAsc' },
      { label: '標題 Z-A', value: 'titleDesc' },
      { label: '更新時間（新→舊）', value: 'updatedDesc' },
      { label: '更新時間（舊→新）', value: 'updatedAsc' }
    ])
  }
})
const emit = defineEmits(['update:search', 'update:sort', 'search'])

// 直接使用 props 作為 v-model 綁定來源
const searchValue = ref(props.search)
const sortValue = ref(props.sort)

watch(() => props.search, val => { searchValue.value = val })
watch(() => props.sort, val => { sortValue.value = val })

const onInput = (val) => {
  emit('update:search', val)
  emit('search')
}
const onSortChange = (val) => {
  emit('update:sort', val)
  emit('search')
}
const emitSearch = () => {
  emit('search')
}
</script> 