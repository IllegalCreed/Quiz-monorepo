<script setup lang="ts">
/**
 * 根组件
 */
import { onMounted } from "vue";
import { useRouterStore } from "@/stores/modules/router";

const routerStore = useRouterStore();

/**
 * 应用启动时初始化缓存配置
 */
onMounted(() => {
  routerStore.initCacheConfig();
});
</script>

<template>
  <router-view />
</template>

<style scoped></style>
