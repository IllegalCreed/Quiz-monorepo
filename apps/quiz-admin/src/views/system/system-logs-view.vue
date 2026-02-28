<script setup lang="ts">
/**
 * 系统日志页面
 * 只读查看系统操作日志（登录 + API 变更）
 * 支持类型/操作者/模块/成功失败/日期范围筛选 + 分页 + 展开行查看详情
 */
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getSystemLogs as getSystemLogsApi } from "@/api/system-logs";
import { getSystemLogs as getSystemLogsMock } from "@/api/mock/system-logs";
import { useMockStore } from "@/composables/use-mock-store";
import type { SystemLogItem, QuerySystemLogsParams, LogType, ActorType } from "@/api/system-logs";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "SystemLogsView",
});

const { isMock } = useMockStore();

/** 日志列表 */
const logs = ref<SystemLogItem[]>([]);

/** 总数（用于分页） */
const total = ref(0);

/** 加载中状态 */
const loading = ref(false);

/** 筛选条件 */
const typeFilter = ref("");
const actorTypeFilter = ref("");
const moduleFilter = ref("");
const successFilter = ref("");
const dateRange = ref<[string, string] | null>(null);

/** 当前页码 */
const currentPage = ref(1);

/** 每页条数 */
const pageSize = ref(20);

/**
 * 加载日志列表
 */
const loadLogs = async () => {
  try {
    loading.value = true;
    const params: QuerySystemLogsParams = {
      type: (typeFilter.value || undefined) as LogType | undefined,
      actorType: (actorTypeFilter.value || undefined) as ActorType | undefined,
      module: moduleFilter.value || undefined,
      success: successFilter.value || undefined,
      startDate: dateRange.value?.[0] || undefined,
      endDate: dateRange.value?.[1] || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    };

    const result = isMock.value ? await getSystemLogsMock(params) : await getSystemLogsApi(params);

    logs.value = result.items;
    total.value = result.total;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载系统日志失败";
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
  loadLogs();
};

/**
 * 重置筛选条件
 */
const handleReset = () => {
  typeFilter.value = "";
  actorTypeFilter.value = "";
  moduleFilter.value = "";
  successFilter.value = "";
  dateRange.value = null;
  currentPage.value = 1;
  loadLogs();
};

/**
 * 页码变更
 */
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadLogs();
};

/**
 * 每页条数变更
 */
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadLogs();
};

/**
 * 格式化日期时间
 */
const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * 格式化 JSON 数据用于展开行展示
 */
const formatJson = (data: Record<string, unknown> | null): string => {
  if (!data) return "-";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

/**
 * 获取动作显示文字
 */
const getActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    LOGIN: "登录",
    REGISTER: "注册",
    CREATE: "创建",
    UPDATE: "更新",
    DELETE: "删除",
  };
  return map[action] ?? action;
};

/**
 * 获取动作对应的 tag 类型
 */
const getActionTagType = (action: string): string => {
  const map: Record<string, string> = {
    LOGIN: "info",
    REGISTER: "info",
    CREATE: "success",
    UPDATE: "warning",
    DELETE: "danger",
  };
  return map[action] ?? "info";
};

onMounted(() => {
  loadLogs();
});
</script>

<template>
  <div class="system-logs-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">系统日志</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="typeFilter" placeholder="日志类型" clearable class="filter-bar__select">
        <el-option label="登录日志" value="LOGIN" />
        <el-option label="操作日志" value="API_MUTATION" />
      </el-select>
      <el-select
        v-model="actorTypeFilter"
        placeholder="操作者类型"
        clearable
        class="filter-bar__select"
      >
        <el-option label="管理员" value="ADMIN" />
        <el-option label="用户" value="USER" />
      </el-select>
      <el-input
        v-model="moduleFilter"
        placeholder="模块名称"
        clearable
        class="filter-bar__input"
        @keyup.enter="handleSearch"
      />
      <el-select
        v-model="successFilter"
        placeholder="操作结果"
        clearable
        class="filter-bar__select"
      >
        <el-option label="成功" value="true" />
        <el-option label="失败" value="false" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        class="filter-bar__date"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 日志表格 -->
    <el-table :data="logs" v-loading="loading" row-key="id">
      <!-- 展开行：显示请求参数和响应结果 -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-detail">
            <div v-if="row.params" class="expand-detail__section">
              <span class="expand-detail__label">请求参数：</span>
              <pre class="expand-detail__json">{{ formatJson(row.params) }}</pre>
            </div>
            <div v-if="row.result" class="expand-detail__section">
              <span class="expand-detail__label">响应结果：</span>
              <pre class="expand-detail__json">{{ formatJson(row.result) }}</pre>
            </div>
            <div v-if="row.error" class="expand-detail__section">
              <span class="expand-detail__label">错误信息：</span>
              <span class="expand-detail__error">{{ row.error }}</span>
            </div>
            <div v-if="!row.params && !row.result && !row.error" class="expand-detail__empty">
              无详细信息
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="id" label="ID" width="70" />

      <el-table-column label="时间" min-width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="actorName" label="操作者" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.actorName || "-" }}
        </template>
      </el-table-column>

      <el-table-column label="类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="row.actorType === 'ADMIN' ? 'warning' : 'info'" size="small">
            {{ row.actorType === "ADMIN" ? "管理员" : "用户" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="动作" width="100">
        <template #default="{ row }">
          <el-tag :type="getActionTagType(row.action)" size="small">
            {{ getActionLabel(row.action) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="module" label="模块" width="120" />

      <el-table-column prop="path" label="路径" min-width="200" show-overflow-tooltip />

      <el-table-column label="耗时" width="80" align="right">
        <template #default="{ row }">
          {{ row.durationMs != null ? `${row.durationMs}ms` : "-" }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'" size="small">
            {{ row.success ? "成功" : "失败" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="ip" label="IP" width="130" />
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
.system-logs-page {
  @apply space-y-4;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

.filter-bar {
  @apply flex items-center gap-3 flex-wrap;

  /* 重置 Element Plus 相邻按钮自带的 margin，统一用 flex gap 控制间距 */
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  &__select {
    @apply w-32;
  }

  &__input {
    @apply w-32;
  }

  &__date {
    @apply w-60;
  }
}

.expand-detail {
  @apply px-12 py-4 space-y-3;

  &__section {
    @apply flex flex-col gap-1;
  }

  &__label {
    @apply text-sm font-semibold;
    color: var(--el-text-color-secondary);
  }

  &__json {
    @apply text-xs p-3 rounded-lg overflow-auto max-h-48;
    background: var(--el-fill-color-lighter);
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__error {
    @apply text-sm;
    color: var(--el-color-danger);
  }

  &__empty {
    @apply text-sm;
    color: var(--el-text-color-placeholder);
  }
}

.pagination-wrapper {
  @apply flex justify-end pt-2;
}
</style>
