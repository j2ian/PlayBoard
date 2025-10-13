<template>
  <div class="admin-layout flex h-screen overflow-hidden bg-gray-50">
    <!-- 側邊欄 -->
    <AdminSidebar 
      :is-collapse="isCollapse" 
      @toggle-sidebar="toggleSidebar" 
    />

    <!-- 主要內容區域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 頂部導航 -->
      <el-header class="bg-white shadow-sm px-4 flex items-center justify-between">
        <div class="flex items-center">
          <el-icon @click="toggleSidebar" class="cursor-pointer text-gray-600 md:hidden mr-3">
            <Menu />
          </el-icon>
          <h1 class="text-xl font-medium text-gray-800">{{ title }}</h1>
        </div>
        
        <el-dropdown>
          <div class="user-info flex items-center cursor-pointer">
            <span class="username mr-2 text-sm font-medium hidden md:block">{{ username }}</span>
            <el-avatar :size="32" class="bg-blue-500">{{ userInitial }}</el-avatar>
          </div>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>個人資料</el-dropdown-item>
              <el-dropdown-item>設置</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 頁面內容 -->
      <div class="content-body p-6 overflow-y-auto">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'
import AdminSidebar from './AdminSidebar.vue'
import { Menu } from '@element-plus/icons-vue'

// 接收props
const props = defineProps({
  title: {
    type: String,
    default: '管理後台'
  }
})

const router = useRouter()
const isCollapse = ref(false)
const username = ref('管理員')
const userInitial = ref('A')

// 切換側邊欄
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 登出處理
const handleLogout = () => {
  AuthService.logout()
  router.push('/login')
}

onMounted(() => {
  // 獲取當前登入用戶
  const user = AuthService.getCurrentUser()
  if (user) {
    username.value = user.username || '管理員'
    userInitial.value = username.value.charAt(0).toUpperCase()
  }

  // 檢查用戶是否為管理員
  if (!AuthService.isAdmin()) {
    router.push('/')
  }
  
  // 響應式設計 - 在小屏幕上預設摺疊側邊欄
  if (window.innerWidth < 768) {
    isCollapse.value = true
  }
  
  // 監聽視窗大小變化
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
      isCollapse.value = true
    }
  })
})
</script>

<style scoped>
.el-header {
  height: 64px;
}

@media (max-width: 640px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-card .el-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style> 