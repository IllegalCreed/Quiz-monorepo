<script setup lang="ts">
/**
 * 单个历史 Tab 项
 * 显示页面标题，支持点击切换和关闭
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouterStore } from '@/stores/modules/router'
import type { RouteLike } from '@/types/router'

const { deleteView } = useRouterStore()
const router = useRouter()
const route = useRoute()

const props = defineProps<{
  /** Tab 对应的路由数据 */
  data: RouteLike
}>()

const emit = defineEmits<{
  /** 关闭事件 */
  close: [view: RouteLike]
}>()

/** 是否为当前激活的 Tab */
const isActive = computed(() => route.path === props.data.path)

/** 关闭当前 Tab */
function close() {
  deleteView(props.data)
  emit('close', props.data)
}

/** 点击切换到对应页面 */
function change() {
  router.push({
    path: props.data.path,
    query: props.data.query,
  })
}
</script>

<template>
  <div :class="['history-tab-item', { 'is-active': isActive }]" @click="change">
    <span class="tab-title">{{ data.meta?.title || data.name }}</span>
    <span class="tab-close i-carbon-close" @click.stop="close" />
  </div>
</template>

<style lang="scss" scoped>
.history-tab-item {
  @apply flex items-center gap-2 px-4 h-full cursor-pointer select-none;
  @apply border-r border-gray-200 dark:border-slate-700;
  @apply text-sm text-gray-600 dark:text-slate-400;
  @apply transition-colors duration-200;

  &:hover {
    @apply bg-gray-50 dark:bg-slate-700;
  }

  &.is-active {
    @apply text-primary dark:text-indigo-300;
    @apply bg-primary-50 dark:bg-indigo-900/30;
    box-shadow: inset 0 -2px 0 var(--el-color-primary);
  }
}

.tab-title {
  @apply whitespace-nowrap text-3.5;
}

.tab-close {
  @apply w-3.5 h-3.5 rounded-full;
  @apply opacity-60 transition-opacity duration-200;

  &:hover {
    @apply opacity-100 bg-gray-200 dark:bg-slate-600;
  }
}
</style>
