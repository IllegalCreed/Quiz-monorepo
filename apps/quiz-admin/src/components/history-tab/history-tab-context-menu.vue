<script setup lang="ts">
/**
 * 历史 Tab 右键上下文菜单
 * 支持关闭当前、关闭其他、关闭全部操作
 */
import { onMounted, onUnmounted } from "vue";
import type { RouteLike } from "@/types/router";

const props = defineProps<{
  /** 是否显示菜单 */
  visible: boolean;
  /** 菜单左边界 X 坐标（px） */
  x: number;
  /** 菜单上边界 Y 坐标（px） */
  y: number;
  /** 右键点击的目标 Tab */
  targetView: RouteLike | null;
  /** 是否可以关闭其他（只有 1 个 Tab 时禁用） */
  canCloseOthers: boolean;
}>();

const emit = defineEmits<{
  /** 关闭当前 Tab */
  "close-current": [];
  /** 关闭其他 Tab */
  "close-others": [];
  /** 关闭全部 Tab */
  "close-all": [];
  /** 隐藏菜单 */
  hide: [];
}>();

/** 点击页面任意区域关闭菜单（左键点击） */
function handleClickOutside() {
  if (props.visible) {
    emit("hide");
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <ul
        v-if="visible"
        class="history-tab-context-menu"
        :style="{ left: `${x}px`, top: `${y}px` }"
        @click.stop
        @contextmenu.prevent.stop
      >
        <!-- 关闭当前 -->
        <li class="menu-item" @click="emit('close-current')">
          <i class="menu-icon i-carbon-close" />
          <span>关闭当前页签</span>
        </li>

        <!-- 关闭其他（只有 1 个 Tab 时禁用） -->
        <li
          class="menu-item"
          :class="{ 'is-disabled': !canCloseOthers }"
          @click="canCloseOthers ? emit('close-others') : undefined"
        >
          <i class="menu-icon i-carbon-subtract" />
          <span>关闭其他页签</span>
        </li>

        <li class="menu-divider" />

        <!-- 关闭全部 -->
        <li class="menu-item menu-item--danger" @click="emit('close-all')">
          <i class="menu-icon i-carbon-trash-can" />
          <span>关闭全部页签</span>
        </li>
      </ul>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.history-tab-context-menu {
  @apply fixed z-[9999] min-w-36 py-1;
  @apply bg-white dark:bg-slate-800;
  @apply border border-gray-200 dark:border-slate-600;
  @apply rounded-lg shadow-xl;
  @apply select-none;
}

.menu-item {
  @apply flex items-center gap-2 px-3 py-2;
  @apply text-sm text-gray-700 dark:text-slate-300;
  @apply cursor-pointer transition-colors duration-150;

  &:hover:not(.is-disabled) {
    @apply bg-gray-50 dark:bg-slate-700;
    @apply text-primary dark:text-indigo-300;

    .menu-icon {
      @apply text-primary dark:text-indigo-300;
    }
  }

  &.is-disabled {
    @apply opacity-40 cursor-not-allowed;
  }

  /* 危险操作（关闭全部）悬浮时显示红色 */
  &--danger:hover:not(.is-disabled) {
    @apply text-red-500 dark:text-red-400;

    .menu-icon {
      @apply text-red-500 dark:text-red-400;
    }
  }
}

.menu-icon {
  @apply w-4 h-4 shrink-0;
  @apply text-gray-500 dark:text-slate-400;
  @apply transition-colors duration-150;
}

.menu-divider {
  @apply my-1 border-t border-gray-100 dark:border-slate-700;
}

/* 菜单弹出过渡动画 */
.context-menu-enter-active,
.context-menu-leave-active {
  @apply transition-all duration-150;
  transform-origin: top left;
}

.context-menu-enter-from,
.context-menu-leave-to {
  @apply opacity-0;
  transform: scale(0.92);
}
</style>
