<script setup lang="ts">
/**
 * 用户管理页面
 * 管理 Quiz App 的普通用户（非管理员）
 * 支持搜索、状态筛选、分页，对接真实/Mock API
 */
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getAppUsers as getAppUsersApi,
  updateAppUserStatus as updateAppUserStatusApi,
  deleteAppUser as deleteAppUserApi,
} from "@/api/users";
import {
  getAppUsers as getAppUsersMock,
  updateAppUserStatus as updateAppUserStatusMock,
  deleteAppUser as deleteAppUserMock,
} from "@/api/mock/users";
import { useMockStore } from "@/composables/use-mock-store";
import type { AppUserListItem } from "@/types/account";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "UsersView",
});

const router = useRouter();
const { isMock } = useMockStore();

/** 用户列表 */
const users = ref<AppUserListItem[]>([]);

/** 总数（用于分页） */
const total = ref(0);

/** 加载中状态 */
const loading = ref(false);

/** 搜索关键词 */
const keyword = ref("");

/** 状态筛选 */
const statusFilter = ref("");

/** 当前页码 */
const currentPage = ref(1);

/** 每页条数 */
const pageSize = ref(20);

/**
 * 加载用户列表
 */
const loadUsers = async () => {
  try {
    loading.value = true;
    const params = {
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    };

    const result = isMock.value ? await getAppUsersMock(params) : await getAppUsersApi(params);

    users.value = result.items;
    total.value = result.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载用户列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索
 */
const handleSearch = () => {
  currentPage.value = 1;
  loadUsers();
};

/**
 * 重置搜索条件
 */
const handleReset = () => {
  keyword.value = "";
  statusFilter.value = "";
  currentPage.value = 1;
  loadUsers();
};

/**
 * 页码变更
 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadUsers();
};

/**
 * 每页条数变更
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadUsers();
};

/**
 * 查看用户详情
 */
const handleView = (userId: number) => {
  router.push(`/home/users/${userId}`);
};

/**
 * 切换用户状态（启用/禁用）
 */
const toggleStatus = async (user: AppUserListItem) => {
  const newStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
  const action = newStatus === "ACTIVE" ? "启用" : "禁用";

  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.nickname || user.username}" 吗？`,
      "提示",
      {
        type: "warning",
      },
    );

    loading.value = true;
    if (isMock.value) {
      await updateAppUserStatusMock(user.id, newStatus);
    } else {
      await updateAppUserStatusApi(user.id, newStatus);
    }
    ElMessage.success(`${action}成功`);
    await loadUsers();
  } catch (error) {
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
const handleDelete = async (user: AppUserListItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.nickname || user.username}" 吗？此操作不可恢复。`,
      "警告",
      { type: "warning" },
    );

    loading.value = true;
    if (isMock.value) {
      await deleteAppUserMock(user.id);
    } else {
      await deleteAppUserApi(user.id);
    }
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
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名/昵称"
        clearable
        class="search-bar__input"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="statusFilter" placeholder="状态筛选" clearable class="search-bar__select">
        <el-option label="正常" value="ACTIVE" />
        <el-option label="禁用" value="DISABLED" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column label="做题次数" width="100" align="center">
        <template #default="{ row }">
          {{ row._count?.answerAttempts ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'" size="small">
            {{ row.status === "ACTIVE" ? "正常" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'users:list'" link type="primary" @click="handleView(row.id)">
            查看
          </el-button>
          <el-button
            v-permission="'users:status'"
            link
            :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
            @click="toggleStatus(row)"
          >
            {{ row.status === "ACTIVE" ? "禁用" : "启用" }}
          </el-button>
          <el-button v-permission="'users:delete'" link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.users-page {
  @apply space-y-4;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.search-bar {
  @apply flex items-center gap-3;

  &__input {
    @apply w-60;
  }

  &__select {
    @apply w-32;
  }
}

.pagination-wrapper {
  @apply flex justify-end pt-2;
}
</style>
