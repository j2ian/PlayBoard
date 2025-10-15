<template>
  <AdminLayout title="使用者管理">
    <div class="flex justify-between items-center mb-5">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">使用者列表</h2>
        <p class="text-gray-600 mt-1">管理所有使用者帳號</p>
      </div>
      <el-button type="primary" @click="goToCreateUser">
        <el-icon class="mr-1"><Plus /></el-icon>新增使用者
      </el-button>
    </div>

    <el-card class="mb-5">
      <SearchFilterBar
        v-model:search="searchQuery"
        v-model:sort="sortOrder"
        search-placeholder="搜尋使用者（用戶名或郵箱）"
        sort-placeholder="排序方式"
        :sort-options="[
          { label: '最新建立', value: 'latest' },
          { label: '最舊建立', value: 'oldest' },
          { label: '用戶名 A-Z', value: 'usernameAsc' },
          { label: '用戶名 Z-A', value: 'usernameDesc' },
          { label: '郵箱 A-Z', value: 'emailAsc' },
          { label: '郵箱 Z-A', value: 'emailDesc' },
          { label: '角色 A-Z', value: 'roleAsc' },
          { label: '角色 Z-A', value: 'roleDesc' },
          { label: '更新時間（新→舊）', value: 'updatedDesc' },
          { label: '更新時間（舊→新）', value: 'updatedAsc' }
        ]"
        @search="fetchUsers"
      />
    </el-card>

    <!-- 使用者列表 -->
    <el-card v-loading="loading" element-loading-text="載入中...">
      <template #header>
        <div class="flex items-center justify-between">
          <span>共 {{ totalUsers }} 位使用者</span>
        </div>
      </template>

      <!-- 列表為空時 -->
      <el-empty v-if="users.length === 0 && !loading" description="尚無使用者資料">
        <el-button type="primary" @click="goToCreateUser">新增第一位使用者</el-button>
      </el-empty>

      <!-- 使用者列表 -->
      <el-table v-else :data="users" style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="username" label="用戶名" min-width="150" sortable="custom">
          <template #default="{ row }">
            <div class="flex items-center">
              <el-avatar :size="32" :src="row.avatar || undefined" class="mr-2">
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="font-medium text-blue-600">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="電子郵件" min-width="200" sortable="custom">
          <template #default="{ row }">
            <span v-if="row.email" class="text-gray-700">{{ row.email }}</span>
            <span v-else class="text-gray-400 text-xs">未設定</span>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100" align="center" sortable="custom">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'" effect="plain" size="small">
              {{ row.role === 'admin' ? '管理員' : '一般用戶' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="active" label="狀態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" effect="plain" size="small">
              {{ row.active ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="建立日期" width="180" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新日期" width="180" align="center" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="viewUser(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="editUser(row)">
                <el-icon><EditPen /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="confirmDelete(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="mt-4 flex justify-center" v-if="totalUsers > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import UserService from '@/services/user.service'
import {
  Plus, Delete, View, EditPen
} from '@element-plus/icons-vue'
import SearchFilterBar from '@/components/admin/SearchFilterBar.vue'

// 路由
const router = useRouter()

// 資料狀態
const users = ref([])
const loading = ref(false)
const totalUsers = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const sortOrder = ref('latest')

// 初始化
onMounted(() => {
  fetchUsers()
})

// 獲取使用者列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await UserService.getAllUsers({
      search: searchQuery.value,
      sort: sortOrder.value,
      page: currentPage.value,
      pageSize: pageSize.value
    })
    users.value = response.data.data || []
    totalUsers.value = response.data.count || users.value.length
  } catch (error) {
    ElMessage.error('獲取使用者列表失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

// 格式化日期
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

// 分頁處理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

// 導航到創建頁面
const goToCreateUser = () => {
  router.push('/admin/users/create')
}

// 查看使用者
const viewUser = (user) => {
  router.push(`/admin/users/${user._id}`)
}

// 編輯使用者
const editUser = (user) => {
  router.push(`/admin/users/${user._id}/edit`)
}

// 確認刪除
const confirmDelete = (user) => {
  ElMessageBox.confirm(
    `確定要刪除使用者「${user.username}」嗎？此操作不可恢復。`,
    '刪除確認',
    {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteUser(user._id)
  }).catch(() => {
    // 用戶取消操作
  })
}

// 刪除使用者
const deleteUser = async (id) => {
  loading.value = true
  try {
    await UserService.deleteUser(id)
    ElMessage.success('使用者已成功刪除')
    fetchUsers() // 刷新列表
  } catch (error) {
    console.error('刪除使用者失敗:', error)
    const msg = error?.response?.data?.message || '刪除使用者失敗，請稍後再試'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

const handleSortChange = ({ prop, order }) => {
  if (!order) return
  if (prop === 'createdAt') sortOrder.value = order === 'ascending' ? 'oldest' : 'latest'
  else if (prop === 'updatedAt') sortOrder.value = order === 'ascending' ? 'updatedAsc' : 'updatedDesc'
  else if (prop === 'username') sortOrder.value = order === 'ascending' ? 'usernameAsc' : 'usernameDesc'
  else if (prop === 'email') sortOrder.value = order === 'ascending' ? 'emailAsc' : 'emailDesc'
  else if (prop === 'role') sortOrder.value = order === 'ascending' ? 'roleAsc' : 'roleDesc'
  fetchUsers()
}
</script>
