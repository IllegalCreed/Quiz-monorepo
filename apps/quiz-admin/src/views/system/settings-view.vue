<script setup lang="ts">
/**
 * 系统设置页面(占位)
 */

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "SettingsView",
});
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">系统设置</h1>
    <el-card class="mt-4">
      <p class="text-gray-500">功能开发中...</p>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply space-y-6;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}
</style>
