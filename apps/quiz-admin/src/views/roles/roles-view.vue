<script setup lang="ts">
/**
 * 角色管理页面
 * 管理系统中的角色，支持动态创建和配置权限
 *
 * 保护规则：
 * - 超级管理员角色（isSystem=true）不可删除、不可修改
 * - 删除角色前检查是否有管理员使用
 * - 角色名称唯一性校验
 */
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getRoles, createRole, updateRole, deleteRole } from "@/api/roles";
import { getAdminUsers } from "@/api/admins";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "RolesView",
});

import {
  getRoles as getRolesMock,
  createRole as createRoleMock,
  updateRole as updateRoleMock,
  deleteRole as deleteRoleMock,
} from "@/api/mock/roles";
import { getAdminUsers as getAdminUsersMock } from "@/api/mock/admins";
import { useMockStore } from "@/composables/use-mock-store";
import {
  ALL_MENU_PERMISSIONS,
  ALL_API_PERMISSION_GROUPS,
  type ApiPermissionGroup,
} from "@/types/permission";
import type { Role, CreateRoleForm } from "@/types/role";

const { isMock } = useMockStore();

/** 角色列表 */
const roles = ref<Role[]>([]);

/** 加载中状态 */
const loading = ref(false);

/** 新增角色对话框 */
const createDialogVisible = ref(false);

/** 编辑角色对话框 */
const editDialogVisible = ref(false);

/** 权限配置对话框 */
const permissionDialogVisible = ref(false);

/** 当前权限对话框是否为只读模式（用于查看系统角色） */
const isPermissionReadonly = ref(false);

/** 当前编辑的角色 */
const currentRole = ref<Role | null>(null);

/** 新增角色表单 */
const createForm = ref<CreateRoleForm>({
  name: "",
  description: "",
  menuPermissions: [],
  apiPermissions: [],
});

/** 编辑角色表单 */
const editForm = ref({
  name: "",
  description: "",
});

/** 选中的菜单权限 */
const selectedMenuPermissions = ref<string[]>([]);

/** 选中的 API 权限 */
const selectedApiPermissions = ref<string[]>([]);

/** API 权限折叠面板的激活项 */
const activeCollapseNames = ref<string[]>([]);

/**
 * 加载角色列表
 */
const loadRoles = async () => {
  try {
    loading.value = true;

    // 并行加载角色和管理员数据
    const [rolesData, admins] = await Promise.all([
      isMock.value ? getRolesMock() : getRoles(),
      isMock.value ? getAdminUsersMock() : getAdminUsers(),
    ]);

    // 为每个角色计算 adminCount
    roles.value = rolesData.map((role) => ({
      ...role,
      adminCount: admins.filter((admin) => admin.roleId === role.id).length,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载角色列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 判断是否为系统角色（受保护，不可删除/修改）
 */
const isSystemRole = (role: Role): boolean => {
  return role.isSystem;
};

/**
 * 获取每个 API 权限组已选中的数量
 */
const getSelectedCountInGroup = (group: ApiPermissionGroup): number => {
  return group.permissions.filter((p) => selectedApiPermissions.value.includes(p.key)).length;
};

/**
 * 打开新增角色对话框
 */
const openCreateDialog = () => {
  createForm.value = {
    name: "",
    description: "",
    menuPermissions: [],
    apiPermissions: [],
  };
  createDialogVisible.value = true;
};

/**
 * 创建角色
 */
const handleCreate = async () => {
  if (!createForm.value.name || !createForm.value.description) {
    ElMessage.warning("请填写角色名称和描述");
    return;
  }

  try {
    loading.value = true;
    if (isMock.value) {
      await createRoleMock(createForm.value);
    } else {
      await createRole(createForm.value);
    }
    ElMessage.success("创建成功");
    createDialogVisible.value = false;
    await loadRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建角色失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 打开编辑角色对话框
 */
const openEditDialog = (role: Role) => {
  if (isSystemRole(role)) {
    ElMessage.warning("系统内置角色不可编辑");
    return;
  }

  currentRole.value = role;
  editForm.value = {
    name: role.name,
    description: role.description,
  };
  editDialogVisible.value = true;
};

/**
 * 保存编辑
 */
const handleEdit = async () => {
  if (!currentRole.value) return;
  if (!editForm.value.name || !editForm.value.description) {
    ElMessage.warning("请填写角色名称和描述");
    return;
  }

  try {
    loading.value = true;
    if (isMock.value) {
      await updateRoleMock(currentRole.value.id, editForm.value);
    } else {
      await updateRole(currentRole.value.id, editForm.value);
    }
    ElMessage.success("更新成功");
    editDialogVisible.value = false;
    await loadRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新角色失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 打开权限配置对话框（编辑模式）
 */
const openPermissionDialog = (role: Role) => {
  if (isSystemRole(role)) {
    ElMessage.warning("系统内置角色的权限不可修改");
    return;
  }

  currentRole.value = role;
  selectedMenuPermissions.value = [...role.menuPermissions];
  selectedApiPermissions.value = [...role.apiPermissions];
  isPermissionReadonly.value = false;
  // 默认展开所有模块
  activeCollapseNames.value = ALL_API_PERMISSION_GROUPS.map((g) => g.module);
  permissionDialogVisible.value = true;
};

/**
 * 打开权限查看对话框（只读模式）
 */
const openViewPermissionDialog = (role: Role) => {
  currentRole.value = role;
  selectedMenuPermissions.value = [...role.menuPermissions];
  selectedApiPermissions.value = [...role.apiPermissions];
  isPermissionReadonly.value = true;
  // 默认展开所有模块
  activeCollapseNames.value = ALL_API_PERMISSION_GROUPS.map((g) => g.module);
  permissionDialogVisible.value = true;
};

/**
 * 保存权限
 */
const savePermissions = async () => {
  if (!currentRole.value) return;

  try {
    loading.value = true;
    if (isMock.value) {
      await updateRoleMock(currentRole.value.id, {
        menuPermissions: selectedMenuPermissions.value,
        apiPermissions: selectedApiPermissions.value,
      });
    } else {
      await updateRole(currentRole.value.id, {
        menuPermissions: selectedMenuPermissions.value,
        apiPermissions: selectedApiPermissions.value,
      });
    }
    ElMessage.success("权限更新成功");
    permissionDialogVisible.value = false;
    await loadRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : "权限更新失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 删除角色
 */
const handleDelete = async (role: Role) => {
  if (isSystemRole(role)) {
    ElMessage.warning("系统内置角色不可删除");
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？此操作不可恢复。`, "警告", {
      type: "warning",
    });

    loading.value = true;
    if (isMock.value) {
      await deleteRoleMock(role.id);
    } else {
      await deleteRole(role.id);
    }
    ElMessage.success("删除成功");
    await loadRoles();
  } catch (error) {
    if (error === "cancel") return;
    const message = error instanceof Error ? error.message : "删除失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("zh-CN");
};

onMounted(() => {
  loadRoles();
});
</script>

<template>
  <div class="roles-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">角色管理</h1>
      <el-button type="primary" @click="openCreateDialog"> 新增角色 </el-button>
    </div>

    <!-- 角色列表 -->
    <el-table :data="roles" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" min-width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <span>{{ row.name }}</span>
            <el-tag v-if="isSystemRole(row)" type="danger" size="small"> 系统角色 </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column prop="adminCount" label="使用人数" width="100">
        <template #default="{ row }">
          <span>{{ row.adminCount || 0 }} 人</span>
        </template>
      </el-table-column>
      <el-table-column label="菜单权限" min-width="240">
        <template #default="{ row }">
          <el-tag
            v-for="perm in row.menuPermissions.slice(0, 3)"
            :key="perm"
            size="small"
            class="mr-1 mb-1"
          >
            {{ perm }}
          </el-tag>
          <el-tag v-if="row.menuPermissions.length > 3" size="small" type="info">
            +{{ row.menuPermissions.length - 3 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="API 权限" width="100">
        <template #default="{ row }">
          <span>{{ row.apiPermissions.length }} 个</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="isSystemRole(row)" @click="openEditDialog(row)">
            编辑
          </el-button>
          <el-button
            v-if="!isSystemRole(row)"
            link
            type="primary"
            @click="openPermissionDialog(row)"
          >
            配置权限
          </el-button>
          <el-button v-else link type="primary" @click="openViewPermissionDialog(row)">
            查看权限
          </el-button>
          <el-button link type="danger" :disabled="isSystemRole(row)" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增角色对话框 -->
    <el-dialog v-model="createDialogVisible" title="新增角色" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="createForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false"> 取消 </el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate"> 创建 </el-button>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑角色" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false"> 取消 </el-button>
        <el-button type="primary" :loading="loading" @click="handleEdit"> 保存 </el-button>
      </template>
    </el-dialog>

    <!-- 权限配置/查看对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="isPermissionReadonly ? '查看权限' : '配置权限'"
      width="700px"
      class="permission-dialog"
    >
      <div v-if="currentRole">
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          <template v-if="isPermissionReadonly">
            角色 <strong>{{ currentRole.name }}</strong> 的权限信息
            <el-tag v-if="isSystemRole(currentRole)" type="danger" size="small" class="ml-2">
              系统角色
            </el-tag>
          </template>
          <template v-else> 为角色 <strong>{{ currentRole.name }}</strong> 配置权限 </template>
        </p>

        <!-- 菜单权限 -->
        <div class="mb-6">
          <h3 class="section-title">菜单权限</h3>
          <el-checkbox-group v-model="selectedMenuPermissions" :disabled="isPermissionReadonly">
            <el-checkbox v-for="perm in ALL_MENU_PERMISSIONS" :key="perm.key" :value="perm.key">
              {{ perm.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- API 权限（折叠面板） -->
        <div>
          <h3 class="section-title">API 权限</h3>
          <el-collapse v-model="activeCollapseNames">
            <el-collapse-item
              v-for="group in ALL_API_PERMISSION_GROUPS"
              :key="group.module"
              :name="group.module"
            >
              <template #title>
                <div class="collapse-title">
                  <span>{{ group.label }}</span>
                  <el-tag size="small" type="info">
                    {{ getSelectedCountInGroup(group) }} /
                    {{ group.permissions.length }}
                  </el-tag>
                </div>
              </template>
              <el-checkbox-group
                v-model="selectedApiPermissions"
                class="permission-group"
                :disabled="isPermissionReadonly"
              >
                <el-checkbox
                  v-for="perm in group.permissions"
                  :key="perm.key"
                  :value="perm.key"
                  class="permission-item"
                >
                  {{ perm.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <template #footer>
        <template v-if="isPermissionReadonly">
          <el-button @click="permissionDialogVisible = false"> 关闭 </el-button>
        </template>
        <template v-else>
          <el-button @click="permissionDialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="loading" @click="savePermissions"> 保存 </el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.roles-page {
  @apply space-y-6;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.section-title {
  @apply text-lg font-semibold mb-3;
  color: var(--color-text);
}

.collapse-title {
  @apply flex items-center justify-between w-full pr-4;
}

.permission-group {
  @apply grid grid-cols-2 gap-2;
}

.permission-item {
  @apply mb-2;
}

:deep(.el-collapse-item__header) {
  @apply font-medium;
}
</style>
