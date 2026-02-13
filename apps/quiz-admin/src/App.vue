<script setup lang="ts">
/**
 * 根组件
 */
import { onMounted } from "vue";
import { useRouterStore } from "@/stores/modules/router";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const routerStore = useRouterStore();

/**
 * 应用启动时初始化缓存配置
 */
onMounted(() => {
  routerStore.initCacheConfig();
});
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
