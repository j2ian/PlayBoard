<template>
  <AdminLayout title="新增使用者">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">建立新使用者</span>
          <el-button @click="goBack" plain>返回列表</el-button>
        </div>
      </template>

      <el-form
        :model="user"
        :rules="rules"
        ref="userForm"
        label-width="120px"
        class="max-w-2xl mx-auto"
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

        <el-form-item label="密碼" prop="password" required>
          <el-input
            v-model="user.password"
            type="password"
            placeholder="請輸入密碼（至少6個字符）"
            show-password
          />
        </el-form-item>

        <el-form-item label="確認密碼" prop="confirmPassword" required>
          <el-input
            v-model="user.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
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
          <el-button type="primary" @click="submitUser" :loading="loading">
            送出
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import UserService from '@/services/user.service'

const router = useRouter()
const loading = ref(false)
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
    callback(new Error('請輸入密碼'))
  } else if (value.length < 6) {
    callback(new Error('密碼至少需要6個字符'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('請再次輸入密碼'))
  } else if (value !== user.value.password) {
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

// 返回列表
const goBack = () => {
  router.push('/admin/users')
}

// 送出表單
const submitUser = async () => {
  if (!userForm.value) return

  try {
    await userForm.value.validate()
    loading.value = true

    const payload = {
      username: user.value.username,
      email: user.value.email || undefined,
      password: user.value.password,
      role: user.value.role,
      active: user.value.active,
      avatar: user.value.avatar || ''
    }

    await UserService.createUser(payload)
    ElMessage.success('使用者建立成功！')
    goBack()
  } catch (error) {
    if (error !== false) {
      const msg = error?.response?.data?.message || '建立失敗，請檢查欄位或稍後再試'
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}
</script>
