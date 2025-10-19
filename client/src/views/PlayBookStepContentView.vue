<template>
  <component
    v-if="ThemeComponent"
    :is="ThemeComponent"
  />
  <div v-else-if="loading" class="min-h-screen flex items-center justify-center">
    <el-skeleton :rows="8" animated />
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600">載入主題失敗</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import PlayBookService from '@/services/playbook.service'
import { loadThemeComponent } from '@/utils/themeLoader'

const route = useRoute()
const loading = ref(true)
const ThemeComponent = ref(null)

onMounted(async () => {
  try {
    loading.value = true

    // 根據 slug 取得 playbook 資料以獲得 theme
    const slug = route.params.slug
    const response = await PlayBookService.getPublicPlayBook(slug)

    if (response.data.success) {
      const playbook = response.data.data
      const theme = playbook.theme || 'default'

      // 動態載入對應主題的元件
      const component = await loadThemeComponent(theme, 'PlayBookStepContentView')
      ThemeComponent.value = defineAsyncComponent(() => Promise.resolve(component))
    }
  } catch (error) {
    console.error('載入 PlayBook 主題元件失敗:', error)
  } finally {
    loading.value = false
  }
})
</script>
