<template>
  <!-- 側邊欄 -->
  <el-menu :collapse="isCollapse" :default-active="activeMenu" class="sidebar border-r border-gray-200"
    :class="{ 'w-64': !isCollapse, 'w-16': isCollapse }" background-color="#2c3e50" text-color="#ecf0f1"
    active-text-color="#3498db">

    <div class="sidebar-header flex items-center justify-between h-16 px-4 bg-[#1a2530]">
      <h3 v-if="!isCollapse" class="text-white text-lg font-medium truncate">PlayBoard 管理</h3>
      <el-icon @click="toggleSidebar" class="text-white cursor-pointer hover:text-blue-300">
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
    </div>

    <el-menu-item index="1" @click="navigateTo('admin')">
      <el-icon>
        <DataLine />
      </el-icon>
      <template #title>儀表板</template>
    </el-menu-item>

    <el-menu-item index="2" @click="navigateTo('admin/users')">
      <el-icon>
        <User />
      </el-icon>
      <template #title>用戶管理</template>
    </el-menu-item>

    <el-menu-item index="3" @click="navigateTo('admin/games')">
      <el-icon>
        <VideoPlay />
      </el-icon>
      <template #title>遊戲管理</template>
    </el-menu-item>

    <el-sub-menu index="4">
      <template #title>
        <el-icon><Collection /></el-icon>
        <span>內容管理</span>
      </template>
      <el-menu-item index="4-1" @click="navigateTo('admin/contents')">
        <el-icon><Document /></el-icon>
        <template #title>一般內容</template>
      </el-menu-item>
      <el-menu-item index="4-2" @click="navigateTo('admin/exams')">
        <el-icon><Reading /></el-icon>
        <template #title>測驗管理</template>
      </el-menu-item>
      <el-menu-item index="4-3" @click="navigateTo('admin/questions')">
        <el-icon><EditPen /></el-icon>
        <template #title>題目管理</template>
      </el-menu-item>
      <el-menu-item index="4-4" @click="navigateTo('admin/surveys')">
        <el-icon><DataAnalysis /></el-icon>
        <template #title>滿意度調查</template>
      </el-menu-item>
      <el-menu-item index="4-5" @click="navigateTo('admin/playbooks')">
        <el-icon><Collection /></el-icon>
        <template #title>PlayBook管理</template>
      </el-menu-item>
      <el-menu-item index="4-6" @click="navigateTo('admin/custom-pages')">
        <el-icon><Document /></el-icon>
        <template #title>客製化頁面</template>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="5" @click="navigateTo('admin/settings')">
      <el-icon>
        <Setting />
      </el-icon>
      <template #title>系統設置</template>
    </el-menu-item>

    <el-menu-item index="6" @click="handleLogout" class="mt-auto">
      <el-icon class="text-red-400">
        <SwitchButton />
      </el-icon>
      <template #title><span class="text-red-400">登出</span></template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthService from '@/services/auth.service'
import {
  Fold,
  Expand,
  User,
  Setting,
  Document,
  VideoPlay,
  DataLine,
  SwitchButton,
  Collection,
  Reading,
  EditPen,
  DataAnalysis
} from '@element-plus/icons-vue'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const route = useRoute()

// 當前活動菜單
const activeMenu = ref('1')

// 頁面加載時設置當前活動菜單
onMounted(() => {
  setActiveMenu()
})

// 根據當前路由設置活動菜單
const setActiveMenu = () => {
  const path = route.path

  if (path === '/admin') activeMenu.value = '1'
  else if (path.includes('/admin/users')) activeMenu.value = '2'
  else if (path.includes('/admin/games')) activeMenu.value = '3'
  else if (
    path.startsWith('/admin/exams') // 包含 /admin/exams、/admin/exams/:id、/admin/exams/create、/admin/exams/:id/edit
  ) {
    activeMenu.value = '4-2'
  }
  else if (
    path.startsWith('/admin/questions') // 包含 /admin/questions、/admin/questions/:id、/admin/questions/:id/edit、/admin/questions/create
  ) {
    activeMenu.value = '4-3'
  }
  else if (
    path.startsWith('/admin/surveys') // 包含 /admin/surveys、/admin/surveys/:id、/admin/surveys/:id/edit、/admin/surveys/create
  ) {
    activeMenu.value = '4-4'
  }
  else if (
    path.startsWith('/admin/playbooks') // 包含 /admin/playbooks、/admin/playbooks/:id、/admin/playbooks/:id/edit、/admin/playbooks/create
  ) {
    activeMenu.value = '4-5'
  }
  else if (path.startsWith('/admin/custom-pages')) {
    activeMenu.value = '4-6'
  }
  else if (path.startsWith('/admin/contents')) {
    activeMenu.value = '4-1'
  }
  else if (path.includes('/admin/settings')) activeMenu.value = '5'
}

// 導航到指定頁面
const navigateTo = (path) => {
  router.push('/' + path)
}

// 切換側邊欄
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 登出處理
const handleLogout = () => {
  AuthService.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  transition: width 0.3s;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  transition: all 0.3s;
}

.el-menu {
  border-right: none !important;
}

/* 隱藏 el-menu 的折疊按鈕，我們使用自定義按鈕 */
.el-menu--collapse .el-sub-menu__title span,
.el-menu--collapse .el-menu-item span {
  display: none;
}

/* 為最後一個菜單項新增外邊距，確保它在摺疊時也能顯示在底部 */
.el-menu--collapse .el-menu-item:last-child {
  margin-top: auto;
}
</style>