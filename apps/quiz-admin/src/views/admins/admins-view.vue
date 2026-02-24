<script setup lang="ts">
/**
 * 管理员管理页面
 * 仅超级管理员可访问，管理 Admin 后台的管理员账号
 *
 * RBAC 模型：管理员 → 角色 → 权限
 * - 管理员通过 roleId 关联角色
 * - 权限从角色继承（动态计算）
 *
 * 保护规则：
 * - 超级管理员不可被删除
 * - 超级管理员的角色不可被修改
 */
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAdminUsers,
  createAdmin,
  updateAdminRole,
  deleteAdmin,
  type AdminUserItem,
} from "@/api/admins";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "AdminsView",
});

import { getRoles } from "@/api/roles";
import {
  getAdminUsers as getAdminUsersMock,
  createAdmin as createAdminMock,
  updateAdminRole as updateAdminRoleMock,
  deleteAdmin as deleteAdminMock,
} from "@/api/mock/admins";
import { getRoles as getRolesMock } from "@/api/mock/roles";
import { useMockStore } from "@/composables/use-mock-store";
import type { AdminUser } from "@/types/account";
import type { Role } from "@/types/role";

const { isMock } = useMockStore();

/** 管理员列表（支持 Mock 和真实 API 的类型） */
const admins = ref<(AdminUserItem | AdminUser)[]>([]);

/** 角色列表 */
const roles = ref<Role[]>([]);

/** 加载中状态 */
const loading = ref(false);

/** 新增管理员对话框 */
const createDialogVisible = ref(false);

/** 角色分配对话框 */
const roleDialogVisible = ref(false);

/** 查看管理员详情对话框 */
const viewDialogVisible = ref(false);

/** 当前编辑的管理员 */
const currentAdmin = ref<AdminUserItem | null>(null);

/** 选中的角色 ID */
const selectedRoleId = ref<number | string>("");

/** 新增管理员表单 */
const createForm = ref({
  username: "",
  password: "",
  nickname: "",
  roleId: "" as number | string,
});

/**
 * 可分配的角色列表（排除超级管理员角色）
 * 超级管理员角色仅系统内置，不可分配给新建管理员
 */
const assignableRoles = computed(() => roles.value.filter((r) => !r.isSystem));

/**
 * 当前管理员的角色（用于显示权限）
 */
const currentAdminRole = computed(() => {
  if (!currentAdmin.value) return null;
  return roles.value.find((r) => r.id === currentAdmin.value!.roleId);
});

/**
 * 当前管理员的菜单权限（从角色继承）
 */
const currentAdminMenuPermissions = computed(() => {
  return currentAdminRole.value?.menuPermissions || [];
});

/**
 * 当前管理员的API权限（从角色继承）
 */
const currentAdminApiPermissions = computed(() => {
  return currentAdminRole.value?.apiPermissions || [];
});

/**
 * 加载角色列表
 */
const loadRoles = async () => {
  try {
    roles.value = isMock.value ? await getRolesMock() : await getRoles();
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载角色列表失败";
    ElMessage.error(message);
  }
};

/**
 * 加载管理员列表
 */
const loadAdmins = async () => {
  try {
    loading.value = true;
    admins.value = isMock.value ? await getAdminUsersMock() : await getAdminUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载管理员列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 判断是否为超级管理员（受保护，不可删除/修改角色）
 */
const isSuperAdmin = (admin: AdminUserItem): boolean => {
  return admin.roleId === 1; // 角色 ID 为 1 的是超级管理员
};

/**
 * 打开新增管理员对话框
 */
const openCreateDialog = () => {
  createForm.value = {
    username: "",
    password: "",
    nickname: "",
    roleId: assignableRoles.value[0]?.id || "",
  };
  createDialogVisible.value = true;
};

/**
 * 创建管理员
 */
const handleCreate = async () => {
  // 验证必填字段（密码使用用户名作为初始密码，无需单独填写）
  if (!createForm.value.username || !createForm.value.nickname) {
    ElMessage.warning("请填写完整信息");
    return;
  }

  if (!createForm.value.roleId) {
    ElMessage.warning("请选择角色");
    return;
  }

  try {
    loading.value = true;
    // 使用用户名作为初始密码
    const formData = {
      ...createForm.value,
      password: createForm.value.username,
      roleId: Number(createForm.value.roleId),
    };

    if (isMock.value) {
      await createAdminMock(formData);
    } else {
      await createAdmin(formData);
    }
    ElMessage({
      message: "创建成功",
      type: "success",
      customClass: "admin-create-success",
    });
    createDialogVisible.value = false;
    await loadAdmins();
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建管理员失败";
    ElMessage({
      message,
      type: "error",
      customClass: "admin-create-error",
    });
  } finally {
    loading.value = false;
  }
};

/**
 * 打开查看管理员详情对话框
 */
const openViewDialog = (admin: AdminUserItem) => {
  currentAdmin.value = admin;
  viewDialogVisible.value = true;
};

/**
 * 打开角色分配对话框
 */
const openRoleDialog = (admin: AdminUserItem) => {
  if (isSuperAdmin(admin)) {
    ElMessage.warning("超级管理员的角色不可修改");
    return;
  }

  currentAdmin.value = admin;
  selectedRoleId.value = admin.roleId;
  roleDialogVisible.value = true;
};

/**
 * 保存角色分配
 */
const saveRole = async () => {
  if (!currentAdmin.value) return;

  if (!selectedRoleId.value) {
    ElMessage.warning("请选择角色");
    return;
  }

  try {
    loading.value = true;
    if (isMock.value) {
      await updateAdminRoleMock(currentAdmin.value.id, Number(selectedRoleId.value));
    } else {
      await updateAdminRole(currentAdmin.value.id, {
        roleId: Number(selectedRoleId.value),
      });
    }
    ElMessage({
      message: "角色更新成功",
      type: "success",
      customClass: "admin-role-update-success",
    });
    roleDialogVisible.value = false;
    await loadAdmins();
  } catch (error) {
    const message = error instanceof Error ? error.message : "角色更新失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 删除管理员
 */
const handleDelete = async (admin: AdminUserItem) => {
  if (isSuperAdmin(admin)) {
    ElMessage.warning("超级管理员不可被删除");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除管理员 "${admin.nickname}" 吗？此操作不可恢复。`,
      "警告",
      { type: "warning" },
    );

    loading.value = true;
    if (isMock.value) {
      await deleteAdminMock(admin.id);
    } else {
      await deleteAdmin(admin.id);
    }
    ElMessage({
      message: "删除成功",
      type: "success",
      customClass: "admin-delete-success",
    });
    await loadAdmins();
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

onMounted(async () => {
  await loadRoles();
  await loadAdmins();
});
</script>

<template>
  <div class="admins-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">管理员管理</h1>
      <el-button type="primary" @click="openCreateDialog"> 新增管理员 </el-button>
    </div>

    <!-- 管理员列表 -->
    <el-table :data="admins" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="roleName" label="角色" min-width="120">
        <template #default="{ row }">
          <el-tag v-if="isSuperAdmin(row)" type="danger">{{ row.roleName }}</el-tag>
          <el-tag v-else type="info">{{ row.roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240">
        <template #default="{ row }">
          <el-button link type="primary" @click="openViewDialog(row)"> 查看 </el-button>
          <el-button link type="primary" :disabled="isSuperAdmin(row)" @click="openRoleDialog(row)">
            分配角色
          </el-button>
          <el-button link type="danger" :disabled="isSuperAdmin(row)" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增管理员对话框 -->
    <el-dialog v-model="createDialogVisible" title="新增管理员" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" placeholder="请输入用户名（同时作为初始密码）" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="createForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item label="角色">
          <el-select v-model="createForm.roleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in assignableRoles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            >
              <div class="flex items-center justify-between">
                <span>{{ role.name }}</span>
                <span class="text-xs text-gray-400">{{ role.description }}</span>
              </div>
            </el-option>
          </el-select>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            新建管理员将继承所选角色的全部权限
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate"> 创建 </el-button>
      </template>
    </el-dialog>

    <!-- 查看管理员详情对话框 -->
    <el-dialog v-model="viewDialogVisible" title="管理员详情" width="600px">
      <div v-if="currentAdmin">
        <!-- 基本信息 -->
        <div class="mb-6">
          <h4 class="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">基本信息</h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-20">ID：</span>
              <span class="text-sm">{{ currentAdmin.id }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-20">用户名：</span>
              <span class="text-sm">{{ currentAdmin.username }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-20">昵称：</span>
              <span class="text-sm">{{ currentAdmin.nickname }}</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-20">角色：</span>
              <el-tag v-if="isSuperAdmin(currentAdmin)" type="danger" size="small">
                {{ currentAdmin.roleName }}
              </el-tag>
              <el-tag v-else type="info" size="small">
                {{ currentAdmin.roleName }}
              </el-tag>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-20">创建时间：</span>
              <span class="text-sm">{{ formatDate(currentAdmin.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 权限信息 -->
        <div>
          <h4 class="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            权限信息（从角色继承）
          </h4>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="mb-3">
              <span class="text-xs text-gray-500 dark:text-gray-400">菜单权限：</span>
              <div class="mt-1">
                <!-- 超级管理员通配符：显示"全部权限"标签 -->
                <el-tag
                  v-if="currentAdminMenuPermissions.includes('*')"
                  size="small"
                  type="danger"
                  class="mr-1 mb-1"
                >
                  全部权限
                </el-tag>
                <template v-else>
                  <el-tag
                    v-for="perm in currentAdminMenuPermissions"
                    :key="perm"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ perm }}
                  </el-tag>
                  <span
                    v-if="currentAdminMenuPermissions.length === 0"
                    class="text-xs text-gray-400 dark:text-gray-500"
                  >
                    无
                  </span>
                </template>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                API 权限（{{ currentAdminApiPermissions.length }} 个）：
              </span>
              <div class="mt-1 max-h-40 overflow-y-auto">
                <el-tag
                  v-for="perm in currentAdminApiPermissions"
                  :key="perm"
                  size="small"
                  class="mr-1 mb-1"
                >
                  {{ perm }}
                </el-tag>
                <span
                  v-if="currentAdminApiPermissions.length === 0"
                  class="text-xs text-gray-400 dark:text-gray-500"
                >
                  无
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 角色分配对话框 -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="600px">
      <div v-if="currentAdmin">
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          为管理员 <strong>{{ currentAdmin.nickname }}</strong> 分配角色
        </p>

        <!-- 角色选择 -->
        <el-form label-width="100px">
          <el-form-item label="选择角色">
            <el-select v-model="selectedRoleId" placeholder="请选择角色" style="width: 100%">
              <el-option
                v-for="role in assignableRoles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              >
                <div class="flex items-center justify-between">
                  <span>{{ role.name }}</span>
                  <span class="text-xs text-gray-400">{{ role.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 当前权限展示 -->
        <div class="mt-4">
          <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            当前权限（从角色继承）
          </h4>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <div class="mb-3">
              <span class="text-xs text-gray-500 dark:text-gray-400">菜单权限：</span>
              <div class="mt-1">
                <!-- 超级管理员通配符：显示"全部权限"标签 -->
                <el-tag
                  v-if="currentAdminMenuPermissions.includes('*')"
                  size="small"
                  type="danger"
                  class="mr-1 mb-1"
                >
                  全部权限
                </el-tag>
                <template v-else>
                  <el-tag
                    v-for="perm in currentAdminMenuPermissions"
                    :key="perm"
                    size="small"
                    class="mr-1 mb-1"
                  >
                    {{ perm }}
                  </el-tag>
                </template>
              </div>
            </div>
            <div>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                API 权限（{{ currentAdminApiPermissions.length }} 个）：
              </span>
              <div class="mt-1 max-h-40 overflow-y-auto">
                <el-tag
                  v-for="perm in currentAdminApiPermissions"
                  :key="perm"
                  size="small"
                  class="mr-1 mb-1"
                >
                  {{ perm }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            更改角色后，权限将自动更新为新角色的权限
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="saveRole"> 保存 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admins-page {
  @apply space-y-6;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}
</style>
