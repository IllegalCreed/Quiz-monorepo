<script setup lang="ts">
/**
 * 主布局页面
 * Header + Sidebar + Tab 历史 + Main
 */
import HeaderView from '../header/header-view.vue'
import HomeMenu from './home-menu.vue'
import HistoryTabPanel from '@/components/history-tab/history-tab-panel.vue'
import { useMenuCollapse } from './composables/use-menu-collapse'
import { useRouterStore } from '@/stores/modules/router'

const { isCollapse } = useMenuCollapse()
const routerStore = useRouterStore()
</script>

<template>
  <el-container class="home-container">
    <!-- 顶部 Header -->
    <el-header class="home-header">
      <HeaderView />
    </el-header>

    <el-container class="home-body">
      <!-- 侧边菜单 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="home-sidebar">
        <HomeMenu />
      </el-aside>

      <!-- 右侧内容区（Tab + Main） -->
      <el-container class="home-content">
        <!-- Tab 历史面板 -->
        <HistoryTabPanel />

        <!-- 主内容区 -->
        <el-main class="home-main">
          <router-view v-slot="{ Component }">
            <keep-alive :include="routerStore.cachedViews">
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.home-container {
  @apply min-h-screen;
}

.home-header {
  @apply p-0 h-16;
}

.home-body {
  @apply h-[calc(100vh-64px)];
}

.home-sidebar {
  @apply bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700;
  @apply overflow-y-auto;
  transition: width 0.3s;
}

.home-content {
  @apply flex flex-col flex-1 overflow-hidden;
}

.home-main {
  @apply bg-gray-50 dark:bg-slate-900 overflow-y-auto flex-1;
  padding: 24px;
}
</style>
