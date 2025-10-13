<template>
  <AdminLayout title="儀表板">
    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      <StatCard 
        title="用戶總數" 
        :value="0" 
        icon="User" 
        color="blue" 
      />
      
      <StatCard 
        title="遊戲總數" 
        :value="0" 
        icon="VideoPlay" 
        color="green" 
      />
      
      <StatCard 
        title="今日訪問" 
        :value="0" 
        icon="DataLine" 
        color="purple" 
      />
      
      <StatCard 
        title="數據總量" 
        value="0 MB" 
        icon="DataAnalysis" 
        color="orange" 
      />
    </div>

    <!-- 歡迎卡片 -->
    <el-card class="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <h2 class="text-xl font-bold mb-2">歡迎來到 PlayBoard 管理後台！</h2>
      <p class="mb-2">這裡是您管理 PlayBoard 平台的中心。您可以管理用戶、遊戲內容、系統設置等。</p>
      <p>當前系統仍在開發中，更多功能將陸續推出。</p>
    </el-card>

    <!-- 最近活動 -->
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-medium">最近活動</span>
          <el-button type="primary" plain size="small">查看所有</el-button>
        </div>
      </template>
      
      <el-empty description="暫無活動記錄"></el-empty>
    </el-card>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/components/admin/AdminLayout.vue'
import StatCard from '@/components/admin/StatCard.vue'
import { User, VideoPlay, DataLine, DataAnalysis } from '@element-plus/icons-vue'
</script>

