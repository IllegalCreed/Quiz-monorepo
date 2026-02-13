<script setup lang="ts">
/**
 * 历史 Tab 面板
 * 显示所有访问过的页面 Tab，支持横向滚动
 */
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import HistoryTabItem from "./history-tab-item.vue";
import { useHistoryRouter } from "./composables/use-history-router";
import { useRouterStore } from "@/stores/modules/router";

const { visitedViews, close } = useHistoryRouter();
const routerStore = useRouterStore();
const route = useRoute();

/** 滚动容器引用 */
const scrollContainer = ref<HTMLDivElement | null>(null);

/** 刷新中状态 */
const refreshing = ref(false);

/** 是否有激活的 tab（用于禁用刷新按钮） */
const hasActiveTab = computed(() => visitedViews.length > 0);

/**
 * 处理鼠标滚轮横向滚动
 * 将垂直滚动转换为水平滚动
 */
const handleWheel = (event: WheelEvent) => {
  if (scrollContainer.value) {
    event.preventDefault();
    scrollContainer.value.scrollLeft += event.deltaY;
  }
};

/**
 * 刷新当前激活的页面
 */
const refresh = async () => {
  console.log("🔄 刷新按钮被点击");
  console.log("当前状态:", {
    refreshing: refreshing.value,
    hasActiveTab: hasActiveTab.value,
    visitedViewsLength: visitedViews.length,
  });

  if (refreshing.value || !hasActiveTab.value) {
    console.warn("刷新被阻止:", {
      refreshing: refreshing.value,
      hasActiveTab: hasActiveTab.value,
    });
    return;
  }

  try {
    refreshing.value = true;

    // 获取当前路由的组件名
    const componentName = route.meta?.componentName;
    console.log("当前路由信息:", {
      path: route.path,
      name: route.name,
      componentName,
      meta: route.meta,
    });

    if (!componentName) {
      console.warn("当前路由未配置 componentName，无法刷新");
      return;
    }

    console.log("开始刷新组件:", componentName);
    console.log("当前 cachedViews:", routerStore.cachedViews);

    // 调用 store 方法刷新
    await routerStore.refreshView(componentName);

    console.log("刷新完成，新的 cachedViews:", routerStore.cachedViews);
  } finally {
    // 延迟 300ms 恢复按钮状态，让用户看到刷新动画
    setTimeout(() => {
      refreshing.value = false;
      console.log("刷新状态已恢复");
    }, 300);
  }
};
</script>

<template>
  <div class="history-tab-panel-wrapper">
    <div ref="scrollContainer" class="history-tab-panel" @wheel="handleWheel">
      <HistoryTabItem v-for="item in visitedViews" :key="item.path" :data="item" @close="close" />
    </div>

    <!-- 刷新按钮 -->
    <button
      class="refresh-btn"
      :class="{ 'is-refreshing': refreshing, 'is-disabled': !hasActiveTab }"
      :disabled="!hasActiveTab || refreshing"
      @click="refresh"
      title="刷新当前页面"
    >
      <i class="i-carbon-renew" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.history-tab-panel-wrapper {
  @apply flex items-center h-10;
  @apply border-b border-gray-200 dark:border-slate-700;
  @apply bg-white dark:bg-slate-800;
}

.history-tab-panel {
  @apply flex items-center flex-1 h-full;
  @apply overflow-x-auto whitespace-nowrap;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    @apply hidden;
  }

  scrollbar-width: none;
}

.refresh-btn {
  @apply flex items-center justify-center;
  @apply w-10 h-full shrink-0;
  @apply border-l border-gray-200 dark:border-slate-700;
  @apply text-gray-600 dark:text-slate-400;
  @apply cursor-pointer transition-all duration-200;

  &:hover:not(.is-disabled) {
    @apply bg-gray-50 dark:bg-slate-700;
    @apply text-primary dark:text-indigo-300;
  }

  &.is-refreshing {
    i {
      animation: rotate 0.6s linear infinite;
    }
  }

  &.is-disabled {
    @apply opacity-40 cursor-not-allowed;
  }

  i {
    @apply w-4 h-4;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
