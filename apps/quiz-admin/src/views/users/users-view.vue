<script setup lang="ts">
/**
 * 用户管理页面
 * 管理 Quiz App 的普通用户（非管理员）
 */
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getAppUsers, createAppUser, updateAppUserStatus, deleteAppUser } from "@/api/mock/users";
import type { AppUser } from "@/types/account";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "UsersView",
});

/** 用户列表 */
const users = ref<AppUser[]>([]);

/** 加载中状态 */
const loading = ref(false);

/** 新增用户对话框可见性 */
const createDialogVisible = ref(false);

/** 新增用户表单 */
const createForm = ref({
  username: "",
  nickname: "",
  email: "",
});

/**
 * 加载用户列表
 */
const loadUsers = async () => {
  try {
    loading.value = true;
    users.value = await getAppUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载用户列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 打开新增用户对话框
 */
const openCreateDialog = () => {
  createForm.value = { username: "", nickname: "", email: "" };
  createDialogVisible.value = true;
};

/**
 * 创建用户
 */
const handleCreate = async () => {
  if (!createForm.value.username || !createForm.value.nickname) {
    ElMessage.warning("请填写用户名和昵称");
    return;
  }

  try {
    loading.value = true;
    await createAppUser(createForm.value);
    ElMessage.success("创建成功");
    createDialogVisible.value = false;
    await loadUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建用户失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 切换用户状态（启用/禁用）
 */
const toggleStatus = async (user: AppUser) => {
  const newStatus = user.status === "active" ? "disabled" : "active";
  const action = newStatus === "active" ? "启用" : "禁用";

  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${user.nickname}" 吗？`, "提示", {
      type: "warning",
    });

    loading.value = true;
    await updateAppUserStatus(user.id, newStatus);
    ElMessage.success(`${action}成功`);
    await loadUsers();
  } catch (error) {
    // 用户取消操作不报错
    if (error === "cancel") return;
    const message = error instanceof Error ? error.message : `${action}失败`;
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 删除用户
 */
const handleDelete = async (user: AppUser) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.nickname}" 吗？此操作不可恢复。`, "警告", {
      type: "warning",
    });

    loading.value = true;
    await deleteAppUser(user.id);
    ElMessage.success("删除成功");
    await loadUsers();
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
  loadUsers();
});
</script>

<template>
  <div class="users-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <el-button v-permission="'users:create'" type="primary" @click="openCreateDialog">
        新增用户
      </el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === "active" ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'users:status'"
            link
            :type="row.status === 'active' ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === "active" ? "禁用" : "启用" }}
          </el-button>
          <el-button v-permission="'users:delete'" link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增用户对话框 -->
    <el-dialog v-model="createDialogVisible" title="新增用户" width="480px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="createForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createForm.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleCreate"> 创建 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.users-page {
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
