<script setup lang="ts">
/**
 * 客户端管理页面
 * 实时查看在线 quiz-app 客户端 + 广播推送
 * 支持自动刷新、统计卡片、广播面板和客户端表格
 */
import { ref, onMounted, onUnmounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getClients as getClientsApi, broadcastEvent as broadcastEventApi } from "@/api/clients";
import {
  getClients as getClientsMock,
  broadcastEvent as broadcastEventMock,
} from "@/api/mock/clients";
import { useMockStore } from "@/composables/use-mock-store";
import type { ClientItem, ClientStats, BroadcastType } from "@/api/clients";

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "ClientsView",
});

const { isMock } = useMockStore();

/** 客户端列表 */
const clients = ref<ClientItem[]>([]);

/** 在线统计 */
const stats = ref<ClientStats>({ total: 0, loggedIn: 0, guest: 0 });

/** 加载中状态 */
const loading = ref(false);

/** 自动刷新开关 */
const autoRefresh = ref(true);

/** 自动刷新定时器 */
let refreshTimer: ReturnType<typeof setInterval> | null = null;

/** 广播事件类型 */
const broadcastType = ref<BroadcastType>("announcement");

/** 广播消息内容 */
const broadcastMessage = ref("");

/** 广播发送中 */
const broadcasting = ref(false);

/** 广播按钮是否禁用 */
const broadcastDisabled = computed(() => {
  if (broadcasting.value) return true;
  // announcement 类型必须填写消息
  if (broadcastType.value === "announcement" && !broadcastMessage.value.trim()) return true;
  return false;
});

/**
 * 加载在线客户端列表
 */
const loadClients = async () => {
  try {
    loading.value = true;
    const result = isMock.value ? await getClientsMock() : await getClientsApi();
    stats.value = result.stats;
    clients.value = result.clients;
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载客户端列表失败";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};

/**
 * 手动刷新
 */
const handleRefresh = () => {
  loadClients();
};

/**
 * 切换自动刷新
 */
const toggleAutoRefresh = (val: boolean) => {
  if (val) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

/**
 * 启动自动刷新（每 5 秒）
 */
const startAutoRefresh = () => {
  stopAutoRefresh();
  refreshTimer = setInterval(() => {
    loadClients();
  }, 5000);
};

/**
 * 停止自动刷新
 */
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

/**
 * 发送广播
 */
const handleBroadcast = async () => {
  // refresh 类型需要二次确认
  if (broadcastType.value === "refresh") {
    try {
      await ElMessageBox.confirm(
        "确定要强制刷新所有在线客户端吗？用户当前操作可能被中断。",
        "确认广播",
        { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" },
      );
    } catch {
      return; // 用户取消
    }
  }

  try {
    broadcasting.value = true;
    const params = {
      type: broadcastType.value,
      message: broadcastType.value === "announcement" ? broadcastMessage.value.trim() : undefined,
    };

    const result = isMock.value
      ? await broadcastEventMock(params)
      : await broadcastEventApi(params);

    ElMessage.success(`广播发送成功，已推送至 ${result.sent} 个客户端`);
    broadcastMessage.value = "";
  } catch (error) {
    const message = error instanceof Error ? error.message : "广播发送失败";
    ElMessage.error(message);
  } finally {
    broadcasting.value = false;
  }
};

/**
 * 格式化相对时间
 */
const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
};

onMounted(() => {
  loadClients();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div class="clients-page">
    <!-- 页头 -->
    <div class="page-header">
      <h1 class="page-title">客户端管理</h1>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card shadow="never" class="stats-card">
        <el-statistic title="在线总数" :value="stats.total">
          <template #prefix>
            <el-icon class="stats-card__icon stats-card__icon--total">
              <i class="i-carbon-screen" />
            </el-icon>
          </template>
        </el-statistic>
      </el-card>
      <el-card shadow="never" class="stats-card">
        <el-statistic title="已登录" :value="stats.loggedIn">
          <template #prefix>
            <el-icon class="stats-card__icon stats-card__icon--logged">
              <i class="i-carbon-user" />
            </el-icon>
          </template>
        </el-statistic>
      </el-card>
      <el-card shadow="never" class="stats-card">
        <el-statistic title="游客" :value="stats.guest">
          <template #prefix>
            <el-icon class="stats-card__icon stats-card__icon--guest">
              <i class="i-carbon-user-avatar" />
            </el-icon>
          </template>
        </el-statistic>
      </el-card>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-bar__left">
        <el-button :icon="''" @click="handleRefresh" :loading="loading">
          <i class="i-carbon-renew mr-1" />
          刷新
        </el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="toggleAutoRefresh"
          class="action-bar__switch"
        />
      </div>
    </div>

    <!-- 广播面板 -->
    <el-card shadow="never" class="broadcast-panel">
      <template #header>
        <span class="broadcast-panel__title">广播推送</span>
      </template>
      <div class="broadcast-panel__body">
        <el-select v-model="broadcastType" class="broadcast-panel__select">
          <el-option label="公告通知" value="announcement" />
          <el-option label="强制刷新" value="refresh" />
        </el-select>
        <el-input
          v-if="broadcastType === 'announcement'"
          v-model="broadcastMessage"
          placeholder="请输入公告内容"
          maxlength="500"
          show-word-limit
          class="broadcast-panel__input"
          @keyup.enter="handleBroadcast"
        />
        <el-button
          v-permission="'clients:broadcast'"
          type="primary"
          :loading="broadcasting"
          :disabled="broadcastDisabled"
          @click="handleBroadcast"
        >
          发送
        </el-button>
      </div>
    </el-card>

    <!-- 客户端表格 -->
    <el-table :data="clients" v-loading="loading" row-key="clientId">
      <el-table-column label="用户" min-width="140">
        <template #default="{ row }">
          <span v-if="row.username">{{ row.username }}</span>
          <el-tag v-else type="info" size="small">游客</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="ip" label="IP 地址" width="150" />

      <el-table-column prop="currentPage" label="当前页面" min-width="160" show-overflow-tooltip />

      <el-table-column label="连接时间" min-width="130">
        <template #default="{ row }">
          {{ formatRelativeTime(row.connectedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="最后心跳" min-width="130">
        <template #default="{ row }">
          {{ formatRelativeTime(row.lastHeartbeat) }}
        </template>
      </el-table-column>

      <el-table-column label="Client ID" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="client-id">{{ row.clientId }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.clients-page {
  @apply space-y-4;
}

.page-header {
  @apply flex items-center justify-between;
}

.page-title {
  @apply text-2xl font-bold;
  color: var(--color-text);
}

/* ── 统计卡片行 ───────────────────────────── */
.stats-row {
  @apply grid grid-cols-3 gap-4;
}

.stats-card {
  &__icon {
    @apply text-xl mr-1;

    &--total {
      color: var(--el-color-primary);
    }

    &--logged {
      color: var(--el-color-success);
    }

    &--guest {
      color: var(--el-color-info);
    }
  }
}

/* ── 操作栏 ───────────────────────────────── */
.action-bar {
  @apply flex items-center justify-between;

  &__left {
    @apply flex items-center gap-3;
  }

  &__switch {
    @apply ml-2;
  }
}

/* ── 广播面板 ──────────────────────────────── */
.broadcast-panel {
  &__title {
    @apply text-sm font-semibold;
  }

  &__body {
    @apply flex items-center gap-3;

    /* 重置 Element Plus 相邻按钮自带的 margin */
    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }

  &__select {
    @apply w-36;
  }

  &__input {
    @apply flex-1;
  }
}

/* ── 表格内样式 ─────────────────────────────── */
.client-id {
  @apply text-xs;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  color: var(--el-text-color-secondary);
}
</style>
