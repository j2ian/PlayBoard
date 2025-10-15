<template>
  <AdminLayout title="編輯使用者">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">編輯使用者</span>
          <el-button @click="goBack" plain>返回詳情</el-button>
        </div>
      </template>

      <el-form
        :model="user"
        :rules="rules"
        ref="userForm"
        label-width="120px"
        class="max-w-2xl mx-auto"
        v-loading="loading"
      >
        <el-form-item label="用戶名" prop="username" required>
          <el-input
            v-model="user.username"
            placeholder="請輸入用戶名（3-20個字符）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="電子郵件" prop="email">
          <el-input
            v-model="user.email"
            type="email"
            placeholder="請輸入電子郵件"
          />
        </el-form-item>

        <el-form-item label="新密碼" prop="password">
          <el-input
            v-model="user.password"
            type="password"
            placeholder="留空表示不修改密碼"
            show-password
          />
          <span class="text-xs text-gray-500">留空則不更改密碼</span>
        </el-form-item>

        <el-form-item label="確認新密碼" prop="confirmPassword" v-if="user.password">
          <el-input
            v-model="user.confirmPassword"
            type="password"
            placeholder="請再次輸入新密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role" required>
          <el-select v-model="user.role" placeholder="請選擇角色">
            <el-option label="一般用戶" value="user" />
            <el-option label="管理員" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="狀態" prop="active">
          <el-switch
            v-model="user.active"
            active-text="啟用"
            inactive-text="停用"
          />
        </el-form-item>

        <el-form-item label="頭像URL" prop="avatar">
          <el-input
            v-model="user.avatar"
            placeholder="請輸入頭像圖片URL（選填）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitUser" :loading="submitting">
            儲存變更
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import UserService from '@/services/user.service'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const userForm = ref(null)

const user = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  active: true,
  avatar: ''
})

// 自定義驗證規則
const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('請輸入用戶名'))
  } else if (value.length < 3) {
    callback(new Error('用戶名至少需要3個字符'))
  } else if (value.length > 20) {
    callback(new Error('用戶名不能超過20個字符'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback() // 密碼可選
  } else if (value.length < 6) {
    callback(new Error('密碼至少需要6個字符'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (user.value.password && !value) {
    callback(new Error('請再次輸入密碼'))
  } else if (user.value.password && value !== user.value.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(value)) {
      callback(new Error('請輸入有效的電子郵件地址'))
    } else {
      callback()
    }
  }
}

const rules = {
  username: [{ validator: validateUsername, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  role: [{ required: true, message: '請選擇角色', trigger: 'change' }]
}

// 載入現有資料
onMounted(async () => {
  const id = route.params.id
  if (id) {
    loading.value = true
    try {
      const { data } = await UserService.getUser(id)
      user.value = {
        username: data.data.username,
        email: data.data.email || '',
        password: '',
        confirmPassword: '',
        role: data.data.role,
        active: data.data.active,
        avatar: data.data.avatar || ''
      }
    } catch (error) {
      ElMessage.error('載入使用者資料失敗')
      goBack()
    } finally {
      loading.value = false
    }
  }
})

// 返回詳情頁
const goBack = () => {
  router.push(`/admin/users/${route.params.id}`)
}

// 送出表單
const submitUser = async () => {
  if (!userForm.value) return

  try {
    await userForm.value.validate()
    submitting.value = true

    const payload = {
      username: user.value.username,
      email: user.value.email || undefined,
      role: user.value.role,
      active: user.value.active,
      avatar: user.value.avatar || ''
    }

    // 只有在輸入新密碼時才傳送密碼
    if (user.value.password) {
      payload.password = user.value.password
    }

    await UserService.updateUser(route.params.id, payload)
    ElMessage.success('使用者已更新！')
    goBack()
  } catch (error) {
    if (error !== false) {
      const msg = error?.response?.data?.message || '更新失敗，請檢查欄位或稍後再試'
      ElMessage.error(msg)
    }
  } finally {
    submitting.value = false
  }
}
</script>
