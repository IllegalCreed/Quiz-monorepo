<script setup lang="ts">
/**
 * 历史 Tab 面板
 * 显示所有访问过的页面 Tab，支持横向滚动
 */
import { ref } from 'vue'
import HistoryTabItem from './history-tab-item.vue'
import { useHistoryRouter } from './composables/use-history-router'

const { visitedViews, close } = useHistoryRouter()

/** 滚动容器引用 */
const scrollContainer = ref<HTMLDivElement | null>(null)

/**
 * 处理鼠标滚轮横向滚动
 * 将垂直滚动转换为水平滚动
 */
const handleWheel = (event: WheelEvent) => {
  if (scrollContainer.value) {
    event.preventDefault()
    scrollContainer.value.scrollLeft += event.deltaY
  }
}
</script>

<template>
  <div ref="scrollContainer" class="history-tab-panel" @wheel="handleWheel">
    <HistoryTabItem v-for="item in visitedViews" :key="item.path" :data="item" @close="close" />
  </div>
</template>

<style lang="scss" scoped>
.history-tab-panel {
  @apply flex items-center h-10;
  @apply border-b border-gray-200 dark:border-slate-700;
  @apply bg-white dark:bg-slate-800;
  @apply overflow-x-auto whitespace-nowrap;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    @apply hidden;
  }

  scrollbar-width: none;
}
</style>
