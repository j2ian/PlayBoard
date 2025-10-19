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
      <p class="text-gray-600">載入失敗</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import PlayBookService from '@/services/playbook.service'
import { loadThemeComponent } from '@/utils/themeLoader'

const route = useRoute()
const loading = ref(true)
const ThemeComponent = ref(null)

onMounted(async () => {
  try {
    loading.value = true

    let theme = 'default'

    // 檢查是否從 PlayBook 進入（透過 query.playbook）
    if (route.query.playbook) {
      console.log('[SurveyTake] 從 PlayBook 進入，playbook ID:', route.query.playbook)

      try {
        // 透過 playbook slug 取得 playbook 資料
        const playbookSlug = route.query.playbookSlug
        if (playbookSlug) {
          const response = await PlayBookService.getPublicPlayBook(playbookSlug)
          if (response.data.success) {
            theme = response.data.data.theme || 'default'
            console.log('[SurveyTake] PlayBook theme:', theme)
          }
        }
      } catch (error) {
        console.error('[SurveyTake] 取得 PlayBook 主題失敗，使用預設主題:', error)
      }
    } else {
      console.log('[SurveyTake] 獨立進入，使用預設主題')
    }

    // 動態載入對應主題的元件
    const component = await loadThemeComponent(theme, 'SurveyTake')
    console.log('[SurveyTake] 元件載入成功，theme:', theme)
    ThemeComponent.value = markRaw(component)
  } catch (error) {
    console.error('[SurveyTake] 載入失敗:', error)
  } finally {
    loading.value = false
  }
})
</script>
