<script setup lang="ts">
/**
 * 单个历史 Tab 项
 * 显示页面标题，支持点击切换和关闭
 */
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRouterStore } from "@/stores/modules/router";
import type { RouteLike } from "@/types/router";

const { deleteView } = useRouterStore();
const router = useRouter();
const route = useRoute();

const props = defineProps<{
  /** Tab 对应的路由数据 */
  data: RouteLike;
}>();

const emit = defineEmits<{
  /** 关闭事件 */
  close: [view: RouteLike];
  /** 右键菜单事件，携带鼠标坐标 */
  contextmenu: [view: RouteLike, event: MouseEvent];
}>();

/** 是否为当前激活的 Tab */
const isActive = computed(() => route.path === props.data.path);

/** 关闭当前 Tab */
function close() {
  deleteView(props.data);
  emit("close", props.data);
}

/** 点击切换到对应页面 */
function change() {
  router.push({
    path: props.data.path,
    query: props.data.query,
  });
}
</script>

<template>
  <div
    :class="['history-tab-item', { 'is-active': isActive }]"
    @click="change"
    @contextmenu.prevent="emit('contextmenu', props.data, $event)"
  >
    <span class="tab-title">{{ data.meta?.title || data.name }}</span>
    <span class="tab-close" @click.stop="close">
      <span class="i-carbon-close" />
    </span>
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
  @apply flex items-center justify-center w-4 h-4 rounded-sm;
  @apply opacity-100 transition-all duration-200;

  &:hover {
    @apply opacity-100 bg-red-400 dark:bg-red-700 text-white;
    @apply scale-110;
  }

  // 内部图标尺寸
  > span {
    @apply w-4 h-4;
  }
}
</style>
