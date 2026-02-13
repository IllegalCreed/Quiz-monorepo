<script setup lang="ts">
/**
 * 系统设置页面 - 页面缓存管理
 */
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouterStore } from "@/stores/modules/router";
import {
  getPageCacheSettings,
  updatePageCache,
  batchUpdatePageCache,
  resetPageCacheSettings,
} from "@/api/mock/settings";
import type { PageCacheConfig } from "@/types/settings";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "SettingsView",
});

const routerStore = useRouterStore();

/** 页面缓存配置列表 */
const cacheConfigs = ref<PageCacheConfig[]>([]);

/** 加载中状态 */
const loading = ref(false);

/** 最后更新时间 */
const lastUpdated = ref("");

/**
 * 加载缓存配置
 */
const loadCacheSettings = async () => {
  try {
    loading.value = true;
    const settings = await getPageCacheSettings();
    cacheConfigs.value = settings.pages;
    lastUpdated.value = settings.updatedAt;
  } catch (error) {
    console.error("加载配置失败:", error);
    ElMessage.error("加载配置失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 切换单个页面的缓存状态
 * 特点：实时生效，无需刷新页面
 */
const handleCacheToggle = async (page: PageCacheConfig) => {
  try {
    loading.value = true;

    // 更新配置
    await updatePageCache({
      routeName: page.routeName,
      cacheEnabled: page.cacheEnabled,
    });

    // 同步更新路由缓存配置（修复：防止下次访问时又被添加到缓存）
    routerStore.updateCacheConfig(page.componentName, page.cacheEnabled);

    // 实时更新路由缓存列表
    if (page.cacheEnabled) {
      // 启用缓存：将组件名添加到缓存列表
      if (!routerStore.cachedViews.includes(page.componentName)) {
        routerStore.cachedViews.push(page.componentName);
      }
    } else {
      // 禁用缓存：从缓存列表移除组件名
      const index = routerStore.cachedViews.indexOf(page.componentName);
      if (index > -1) {
        routerStore.cachedViews.splice(index, 1);
      }
    }

    ElMessage.success(`${page.title} 缓存已${page.cacheEnabled ? "启用" : "禁用"}`);
    lastUpdated.value = new Date().toISOString();
  } catch (error) {
    console.error("更新缓存配置失败:", error);
    // 失败时回滚状态
    page.cacheEnabled = !page.cacheEnabled;
    ElMessage.error("更新失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 一键全部启用
 */
const enableAll = async () => {
  try {
    loading.value = true;
    const updates = cacheConfigs.value.map((p) => ({
      routeName: p.routeName,
      cacheEnabled: true,
    }));
    await batchUpdatePageCache(updates);

    // 更新本地状态
    cacheConfigs.value.forEach((p) => (p.cacheEnabled = true));

    // 同步更新路由缓存配置
    cacheConfigs.value.forEach((p) => {
      routerStore.updateCacheConfig(p.componentName, true);
    });

    // 更新路由缓存列表（添加所有组件名）
    const allComponentNames = cacheConfigs.value.map((p) => p.componentName);
    routerStore.cachedViews = [...new Set([...routerStore.cachedViews, ...allComponentNames])];

    ElMessage.success("已全部启用缓存");
    lastUpdated.value = new Date().toISOString();
  } catch (error) {
    console.error("批量启用缓存失败:", error);
    ElMessage.error("批量更新失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 一键全部禁用
 */
const disableAll = async () => {
  try {
    await ElMessageBox.confirm("禁用所有页面缓存会影响用户体验，确定继续吗？", "警告", {
      type: "warning",
      appendTo: "body",
    });

    loading.value = true;
    const updates = cacheConfigs.value.map((p) => ({
      routeName: p.routeName,
      cacheEnabled: false,
    }));
    await batchUpdatePageCache(updates);

    // 更新本地状态
    cacheConfigs.value.forEach((p) => (p.cacheEnabled = false));

    // 同步更新路由缓存配置
    cacheConfigs.value.forEach((p) => {
      routerStore.updateCacheConfig(p.componentName, false);
    });

    // 清空路由缓存列表
    routerStore.cachedViews = [];

    ElMessage.success("已全部禁用缓存");
    lastUpdated.value = new Date().toISOString();
  } catch (error) {
    if (error === "cancel") return;
    ElMessage.error("批量更新失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 重置为默认配置
 */
const resetToDefault = async () => {
  try {
    await ElMessageBox.confirm("将恢复到系统默认配置，确定继续吗？", "提示", {
      type: "info",
      appendTo: "body",
    });

    loading.value = true;
    await resetPageCacheSettings();
    await loadCacheSettings();

    // 同步更新路由缓存配置
    cacheConfigs.value.forEach((p) => {
      routerStore.updateCacheConfig(p.componentName, p.cacheEnabled);
    });

    // 重新同步路由缓存列表
    const enabledComponents = cacheConfigs.value
      .filter((p) => p.cacheEnabled)
      .map((p) => p.componentName);
    routerStore.cachedViews = enabledComponents;

    ElMessage.success("已重置为默认配置");
  } catch (error) {
    if (error === "cancel") return;
    ElMessage.error("重置失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化时间
 */
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("zh-CN");
};

onMounted(() => {
  loadCacheSettings();
});
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">系统设置</h1>

    <!-- 页面缓存配置 -->
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <div>
            <h3 class="card-title">页面缓存管理</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              控制页面是否使用 KeepAlive 缓存，启用后切换页面时保留状态
            </p>
          </div>
          <div class="flex gap-2">
            <el-button size="small" @click="enableAll" :disabled="loading"> 全部启用 </el-button>
            <el-button size="small" @click="disableAll" :disabled="loading"> 全部禁用 </el-button>
            <el-button size="small" @click="resetToDefault" :disabled="loading">
              重置默认
            </el-button>
          </div>
        </div>
      </template>

      <!-- 配置表格 -->
      <el-table :data="cacheConfigs" v-loading="loading" stripe>
        <el-table-column prop="title" label="页面名称" width="160">
          <template #default="{ row }">
            <strong>{{ row.title }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="routeName" label="路由名称" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.routeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="componentName" label="组件名称" width="200">
          <template #default="{ row }">
            <code class="text-sm text-gray-600 dark:text-gray-400">
              {{ row.componentName }}
            </code>
          </template>
        </el-table-column>
        <el-table-column label="缓存状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.cacheEnabled"
              :disabled="loading"
              @change="handleCacheToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="说明" min-width="300">
          <template #default="{ row }">
            <span v-if="row.cacheEnabled" class="text-sm text-green-600 dark:text-green-400">
              页面已缓存，切换时保留滚动位置、表单输入等状态
            </span>
            <span v-else class="text-sm text-gray-500 dark:text-gray-400">
              页面不缓存，每次进入都重新加载数据
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 更新时间 -->
      <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        最后更新：{{ formatTime(lastUpdated) }}
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.settings-page {
  @apply space-y-6;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.card-header {
  @apply flex items-start justify-between;
}

.card-title {
  @apply text-lg font-semibold;
  color: var(--color-text);
}
</style>
