<script setup lang="ts">
/**
 * 权限管理页面
 * 只读展示所有权限信息，包括菜单权限和 API 权限
 */
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getMenuPermissions,
  getApiPermissions,
  getPermissionRouteMapping,
} from "@/api/mock/permissions";
import type { ApiPermissionGroup, MenuPermission } from "@/types/permission";

/** 菜单权限列表 */
const menuPermissions = ref<MenuPermission[]>([]);

/** API 权限列表（分组） */
const apiPermissionGroups = ref<ApiPermissionGroup[]>([]);

/** 权限-路由映射 */
const permissionRouteMapping = ref<Record<string, string[]>>({});

/** 加载中状态 */
const loading = ref(false);

/** 当前激活的 Tab */
const activeTab = ref("menu");

/**
 * 加载所有数据
 */
const loadData = async () => {
  try {
    loading.value = true;
    const [menus, apis, mapping] = await Promise.all([
      getMenuPermissions(),
      getApiPermissions(),
      getPermissionRouteMapping(),
    ]);
    menuPermissions.value = menus;
    apiPermissionGroups.value = apis;
    permissionRouteMapping.value = mapping;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载权限数据失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 统计 API 权限总数
 */
const totalApiPermissions = () => {
  return apiPermissionGroups.value.reduce((sum, group) => sum + group.permissions.length, 0);
};

/**
 * 合并菜单权限和路由映射数据
 */
const menuPermissionsWithRoutes = () => {
  return menuPermissions.value.map((perm) => ({
    ...perm,
    routes: permissionRouteMapping.value[perm.key] || [],
  }));
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="permissions-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">权限管理</h1>
      <div class="text-sm text-gray-500 dark:text-gray-400">权限是代码定义的，不支持动态修改</div>
    </div>

    <!-- Tab 导航 -->
    <el-tabs v-model="activeTab" v-loading="loading">
      <!-- Tab 1: 菜单权限 -->
      <el-tab-pane label="菜单权限" name="menu">
        <div class="tab-content">
          <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            共
            <strong>{{ menuPermissions.length }}</strong>
            个菜单权限，控制侧边栏菜单和路由的访问
          </div>
          <el-table :data="menuPermissionsWithRoutes()" stripe>
            <el-table-column prop="key" label="权限 Key" width="160">
              <template #default="{ row }">
                <el-tag type="primary">{{ row.key }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="label" label="权限名称" width="140" />
            <el-table-column label="对应路由" min-width="200">
              <template #default="{ row }">
                <el-tag v-for="route in row.routes" :key="route" size="small" class="mr-1">
                  {{ route }}
                </el-tag>
                <span v-if="row.routes.length === 0" class="text-gray-400">-</span>
              </template>
            </el-table-column>
            <el-table-column label="说明" min-width="200">
              <template #default="{ row }">
                <span class="text-sm text-gray-500">
                  拥有此权限的用户可以访问
                  {{ row.routes.join("、") || "相关" }} 页面
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- Tab 2: API 权限 -->
      <el-tab-pane label="API 权限" name="api">
        <div class="tab-content">
          <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            共 <strong>{{ totalApiPermissions() }}</strong> 个 API 权限，分为
            <strong>{{ apiPermissionGroups.length }}</strong>
            个模块，控制按钮和接口的访问
          </div>
          <div class="space-y-4">
            <el-card v-for="group in apiPermissionGroups" :key="group.module" shadow="never">
              <template #header>
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold">{{ group.label }}</span>
                  <el-tag type="info"> {{ group.permissions.length }} 个权限 </el-tag>
                </div>
              </template>
              <el-table :data="group.permissions" :show-header="false">
                <el-table-column prop="key" label="权限 Key" width="240">
                  <template #default="{ row }">
                    <el-tag>{{ row.key }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="label" label="权限名称" />
              </el-table>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.permissions-page {
  @apply space-y-6;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.tab-content {
  @apply py-4;
}

:deep(.el-card__header) {
  @apply py-3;
}
</style>
