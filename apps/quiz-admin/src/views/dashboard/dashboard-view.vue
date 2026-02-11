<script setup lang="ts">
/**
 * 欢迎页/仪表盘
 */
import { ref } from 'vue'
import { useAccountStore } from '@/stores/modules/account'

const accountStore = useAccountStore()

/**
 * 统计数据
 * @unocss-include
 */
const stats = ref([
  { title: '总用户数', value: 1256, icon: 'i-carbon-user-multiple' },
  { title: '今日访问', value: 328, icon: 'i-carbon-analytics' },
  { title: '活跃用户', value: 856, icon: 'i-carbon-user-activity' },
  { title: '系统消息', value: 12, icon: 'i-carbon-email' },
])
</script>

<template>
  <div class="dashboard-page">
    <div class="welcome-card">
      <h2 class="welcome-title">欢迎,{{ accountStore.userInfo?.nickname }}!</h2>
      <p class="welcome-text">角色: {{ accountStore.userInfo?.role }}</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col v-for="stat in stats" :key="stat.title" :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <i :class="stat.icon" class="stat-icon" />
            <div class="stat-info">
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-title">{{ stat.title }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 占位内容 -->
    <el-row :gutter="20" class="mt-6">
      <el-col :span="12">
        <el-card>
          <template #header>最近活动</template>
          <p class="text-gray-500">功能开发中...</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>快捷操作</template>
          <p class="text-gray-500">功能开发中...</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  @apply space-y-6;
}

.welcome-card {
  @apply bg-gradient-to-r from-indigo-500 to-purple-600;
  @apply text-white rounded-xl p-8 shadow-lg;
}

.welcome-title {
  @apply text-3xl font-bold mb-2;
}

.welcome-text {
  @apply text-lg opacity-90;
}

.stats-row {
  @apply mt-6;
}

.stat-card {
  @apply cursor-pointer transition-all;

  &:hover {
    @apply shadow-lg transform scale-105;
  }
}

.stat-content {
  @apply flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 text-primary inline-block;
}

.stat-info {
  @apply flex-1;
}

.stat-value {
  @apply text-3xl font-bold text-gray-900 dark:text-gray-100;
}

.stat-title {
  @apply text-sm text-gray-500 dark:text-gray-400 mt-1;
}
</style>
