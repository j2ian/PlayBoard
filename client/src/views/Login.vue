<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md px-4">
      <h1 class="text-center text-2xl font-bold text-gray-800 mb-6">後台管理系統</h1>
      
      <el-card class="shadow-lg rounded-lg">
        <template #header>
          <h2 class="text-center text-xl font-medium">登入</h2>
        </template>
        
        <el-alert
          v-if="message"
          :title="message"
          :type="isError ? 'error' : 'success'"
          :closable="true"
          show-icon
          center
          class="mb-5"
        />
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          status-icon
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :prefix-icon="User"
              placeholder="用戶名"
              clearable
              :disabled="loading"
              autofocus
              class="mb-2"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :prefix-icon="Lock"
              type="password"
              placeholder="密碼"
              show-password
              clearable
              :disabled="loading"
              class="mb-2"
            />
          </el-form-item>
          
          <el-form-item>
            <el-checkbox v-model="loginForm.remember" :disabled="loading">記住我</el-checkbox>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="w-full py-3 text-base"
            >
              登入
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="text-center text-gray-500 text-sm mt-4">
          <p>PlayBoard 管理系統</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import AuthService from '@/services/auth.service'

const router = useRouter()
const route = useRoute()

// 表單數據
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 狀態變數
const loading = ref(false)
const message = ref('')
const isError = ref(false)

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為6個字符', trigger: 'blur' }
  ]
}

// 檢查是否已登入
const loggedIn = computed(() => AuthService.isLoggedIn())

// 生命週期鉤子
onMounted(() => {
  // 如果用戶已登入，跳轉到首頁
  if (loggedIn.value) {
    const user = AuthService.getCurrentUser()
    
    if (user && user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
  
  // 如果是從其他頁面重定向來的，顯示信息
  const redirect = route.query.redirect
  if (redirect) {
    message.value = '請先登入以訪問該頁面'
    isError.value = true
  }
})

// 處理登入
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return false
    
    loading.value = true
    message.value = ''
    
    try {
      // 呼叫登入API
      const response = await AuthService.login({
        username: loginForm.username,
        password: loginForm.password
      })
      
      // 登入成功
      isError.value = false
      ElMessage({
        type: 'success',
        message: '登入成功'
      })
      
      // 根據角色跳轉到不同頁面
      setTimeout(() => {
        const user = response.user
        const redirect = route.query.redirect
        
        if (user.role === 'admin') {
          router.push(redirect || '/admin')
        } else {
          router.push(redirect || '/')
        }
      }, 1000)
      
    } catch (error) {
      isError.value = true
      message.value = (error && error.message) || '登入失敗，請檢查憑證'
      
      ElMessage({
        type: 'error',
        message: message.value
      })
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e6e6e6;

}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.login-card :deep(.el-card__header) {
  padding: 15px 20px;
  text-align: center;
  font-weight: 500;
}

.login-card :deep(.el-card__body) {
  padding: 25px;
}

.login-card h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 4px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 480px) {
  .login-form-wrapper {
    max-width: 90%;
  }
  
  h1 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .login-card :deep(.el-card__body) {
    padding: 15px;
  }
}

@media (max-width: 320px) {
  h1 {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
  
  .login-card h2 {
    font-size: 1.2rem;
  }
}

/* 使元素加載動畫更流暢 */
.el-form-item {
  margin-bottom: 20px;
}

.el-alert {
  margin-bottom: 20px;
}
</style>