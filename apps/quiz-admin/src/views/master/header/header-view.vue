<script setup lang="ts">
/**
 * 顶部 Header 组件
 */
import { useDark, useToggle } from "@vueuse/core";
import { useMenuCollapse } from "../home/composables/use-menu-collapse";
import UserMenu from "./user-menu.vue";

/** 深浅色模式 */
const isDark = useDark();
const toggleDark = useToggle(isDark);

/** 菜单折叠 */
const { isCollapse, toggleCollapse } = useMenuCollapse();
</script>

<template>
  <header class="app-header">
    <!-- 左侧:折叠按钮 -->
    <div class="header-left">
      <button class="header-icon-btn" @click="toggleCollapse">
        <i-carbon-side-panel-open v-if="isCollapse" class="w-5 h-5" />
        <i-carbon-side-panel-close v-else class="w-5 h-5" />
      </button>
      <h1 class="header-title">Quiz Admin</h1>
    </div>

    <!-- 右侧:深浅色切换 + 用户菜单 -->
    <div class="header-right">
      <button class="header-icon-btn" @click="toggleDark()">
        <i-carbon-sun v-if="!isDark" class="w-5 h-5" />
        <i-carbon-moon v-else class="w-5 h-5" />
      </button>

      <UserMenu />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  @apply flex items-center justify-between px-6 h-16;
  @apply bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700;
}

.header-left {
  @apply flex items-center gap-4;
}

.header-title {
  @apply text-xl font-bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  @apply flex items-center gap-2;
}

/* Header 图标按钮（对齐 UI 库 ghost 变体风格） */
.header-icon-btn {
  @apply inline-flex items-center justify-center;
  @apply w-9 h-9 rounded-lg cursor-pointer transition-all;
  @apply bg-transparent text-gray-600 dark:text-slate-300;
  border: none;

  &:hover {
    @apply bg-slate-100 dark:bg-slate-700;
  }

  &:focus-visible {
    @apply outline-none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
  }
}
</style>
