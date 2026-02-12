<script setup lang="ts">
/**
 * 侧边菜单组件
 * 支持动态图标、折叠、深浅色模式
 */
import { useMenuStore } from "@/stores/modules/menu";
import { useMenuNavigation } from "./composables/use-menu-navigation";
import { useMenuCollapse } from "./composables/use-menu-collapse";

/** 菜单数据 */
const menuStore = useMenuStore();

/** 菜单导航 */
const { activeIndex, handleSelect } = useMenuNavigation();

/** 菜单折叠 */
const { isCollapse } = useMenuCollapse();
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    :collapse="isCollapse"
    class="sidebar-menu"
    @select="handleSelect"
  >
    <el-menu-item v-for="menu in menuStore.menus" :key="menu.index" :index="menu.index">
      <!-- el-icon 包裹：确保折叠模式下图标不被隐藏 -->
      <el-icon v-if="menu.icon">
        <span :class="menu.icon" />
      </el-icon>
      <template #title>{{ menu.title }}</template>
    </el-menu-item>
  </el-menu>
</template>

<style lang="scss" scoped>
.sidebar-menu {
  @apply border-none h-full;

  /* 图标尺寸 */
  :deep(.el-icon) {
    @apply text-lg;
  }

  /* 折叠模式下图标居中：&.el-menu--collapse 确保 scoped 属性在同一元素上 */
  &.el-menu--collapse :deep(.el-menu-item) {
    @apply mx-0 my-0 rounded-none justify-center;
    padding: 0 !important;
    border-left: none !important;
  }
}

/* Element Plus 菜单样式覆盖 */
:deep(.el-menu-item) {
  @apply rounded-lg mx-2 my-1;

  &.is-active {
    @apply text-primary;
    background-color: rgba(99, 102, 241, 0.1);
    border-left: 3px solid var(--el-color-primary);
  }

  /* 统一 hover 颜色（与 Header 按钮一致） */
  &:hover {
    @apply bg-slate-100;
  }
}
</style>

<!-- 深色模式样式（不使用 scoped，因为 .dark 在 html 元素上） -->
<style lang="scss">
html.dark .sidebar-menu {
  --el-menu-bg-color: #1e293b;
  --el-menu-text-color: #cbd5e1;
  --el-menu-active-color: #a5b4fc;

  .el-menu-item {
    &.is-active {
      color: #a5b4fc;
      background-color: rgba(99, 102, 241, 0.15);
    }

    /* 统一 hover 颜色（与 Header 按钮一致） */
    &:hover {
      @apply bg-slate-700;
    }
  }
}
</style>
