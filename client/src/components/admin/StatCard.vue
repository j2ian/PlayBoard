<template>
  <el-card shadow="hover" class="stat-card flex items-center">
    <el-icon :class="`text-4xl text-${color}-500 mr-4`">
      <component :is="icon" />
    </el-icon>
    <div>
      <p class="text-sm text-gray-500">{{ title }}</p>
      <p class="text-2xl font-bold">{{ value }}</p>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'orange', 'red', 'gray'].includes(value)
  }
})
</script>

<style scoped>
@media (max-width: 640px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-card .el-icon {
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }
}
</style> 