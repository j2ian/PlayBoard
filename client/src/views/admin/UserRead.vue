<template>
  <AdminLayout title="使用者詳情">
    <el-card v-if="user">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">使用者詳情</span>
          <div>
            <el-button type="primary" @click="goEdit" class="mr-2">編輯</el-button>
            <el-button type="danger" @click="confirmDelete">刪除</el-button>
            <el-button @click="goBack" plain>返回列表</el-button>
          </div>
        </div>
      </template>

      <div class="flex items-center mb-6">
        <el-avatar :size="80" :src="user.avatar || undefined" class="mr-4">
          {{ user.username.charAt(0).toUpperCase() }}
        </el-avatar>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">{{ user.username }}</h2>
          <el-tag
            :type="user.role === 'admin' ? 'danger' : 'success'"
            effect="plain"
            size="large"
            class="mt-2"
          >
            {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
          </el-tag>
        </div>
      </div>

      <el-divider />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="mb-4">
          <span class="font-semibold text-gray-600">用戶名：</span>
          <span class="ml-2">{{ user.username }}</span>
        </div>

        <div class="mb-4">
          <span class="font-semibold text-gray-600">電子郵件：</span>
          <span class="ml-2" v-if="user.email">{{ user.email }}</span>
          <span class="ml-2 text-gray-400 text-sm" v-else>未設定</span>
        </div>

        <div class="mb-4">
          <span class="font-semibold text-gray-600">角色：</span>
          <el-tag
            :type="user.role === 'admin' ? 'danger' : 'success'"
            effect="plain"
            size="small"
            class="ml-2"
          >
            {{ user.role === 'admin' ? '管理員' : '一般用戶' }}
          </el-tag>
        </div>

        <div class="mb-4">
          <span class="font-semibold text-gray-600">狀態：</span>
          <el-tag
            :type="user.active ? 'success' : 'info'"
            effect="plain"
            size="small"
            class="ml-2"
          >
            {{ user.active ? '啟用' : '停用' }}
          </el-tag>
        </div>

        <div class="mb-4">
          <span class="font-semibold text-gray-600">建立時間：</span>
          <span class="ml-2 text-sm text-gray-700">{{ formatDate(user.createdAt) }}</span>
        </div>

        <div class="mb-4">
          <span class="font-semibold text-gray-600">更新時間：</span>
          <span class="ml-2 text-sm text-gray-700">{{ formatDate(user.updatedAt) }}</span>
        </div>
      </div>

      <el-divider />

      <div class="mb-4" v-if="user.avatar">
        <span class="font-semibold text-gray-600">頭像URL：</span>
        <div class="mt-2">
          <el-link :href="user.avatar" target="_blank" type="primary">
            {{ user.avatar }}
          </el-link>
        </div>
      </div>
    </el-card>

    <el-empty v-else description="查無此使用者" />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import UserService from '@/services/user.service'

const router = useRouter()
const route = useRoute()
const user = ref(null)

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const { data } = await UserService.getUser(id)
      user.value = data.data
    } catch (error) {
      ElMessage.error('載入使用者資料失敗')
      goBack()
    }
  }
})

const goBack = () => {
  router.push('/admin/users')
}

const goEdit = () => {
  router.push(`/admin/users/${route.params.id}/edit`)
}

const confirmDelete = () => {
  ElMessageBox.confirm(
    '確定要刪除此使用者嗎？此操作不可恢復。',
    '刪除確認',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteUser()
  }).catch(() => {})
}

const deleteUser = async () => {
  try {
    await UserService.deleteUser(route.params.id)
    ElMessage.success('使用者已成功刪除')
    goBack()
  } catch (error) {
    const msg = error?.response?.data?.message || '刪除使用者失敗，請稍後再試'
    ElMessage.error(msg)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
