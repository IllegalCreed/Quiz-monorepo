<script setup lang="ts">
/**
 * 欢迎页/仪表盘
 * 展示平台运营总览：统计卡片 + 图表（折线/柱状/环形）+ 日志 + 快捷操作
 */
import { ref, computed, onMounted } from "vue";
import { useDark } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { Line, Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useAccountStore } from "@/stores/modules/account";
import { useMockStore } from "@/composables/use-mock-store";
import { getDashboard as getDashboardApi } from "@/api/dashboard";
import { getDashboard as getDashboardMock } from "@/api/mock/dashboard";
import { getClients as getClientsApi } from "@/api/clients";
import { getClients as getClientsMock } from "@/api/mock/clients";
import type { DashboardData } from "@/api/dashboard";
import type { ClientStats } from "@/api/clients";
import dayjs from "dayjs";

/** 注册 Chart.js 所需组件 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

/**
 * 设置组件名称，与路由 meta.componentName 一致，用于 keep-alive 缓存
 */
defineOptions({
  name: "DashboardView",
});

const accountStore = useAccountStore();
const { isMock } = useMockStore();
const isDark = useDark();

/** 加载状态 */
const loading = ref(false);

/** Dashboard 聚合数据 */
const data = ref<DashboardData | null>(null);

/** 在线客户端统计 */
const onlineStats = ref<ClientStats | null>(null);

/**
 * 时间段问候语
 * @unocss-include
 */
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "夜深了 🌙";
  if (hour < 12) return "早上好 ☀️";
  if (hour < 14) return "中午好 🌤️";
  if (hour < 18) return "下午好 🌅";
  return "晚上好 🌙";
});

/** 统计卡片配置 */
const statCards = computed(() => {
  const o = data.value?.overview;
  return [
    {
      title: "题目总数",
      total: o?.questions.total ?? 0,
      today: o?.questions.today ?? 0,
      icon: "i-carbon-document",
      color: "text-blue-500",
      todayLabel: "今日新增",
    },
    {
      title: "注册用户",
      total: o?.users.total ?? 0,
      today: o?.users.today ?? 0,
      icon: "i-carbon-user-multiple",
      color: "text-green-500",
      todayLabel: "今日注册",
    },
    {
      title: "答题总数",
      total: o?.attempts.total ?? 0,
      today: o?.attempts.today ?? 0,
      icon: "i-carbon-analytics",
      color: "text-orange-500",
      todayLabel: "今日答题",
    },
    {
      title: "平均正确率",
      total: o?.accuracy.total ?? 0,
      today: o?.accuracy.today ?? 0,
      icon: "i-carbon-checkmark-filled",
      color: "text-emerald-500",
      isPercent: true,
      todayLabel: "今日正确率",
    },
  ];
});

// ──────── 图表相关 computed ────────

/** 图表文字颜色（适配深色模式） */
const textColor = computed(() => (isDark.value ? "#a3a3a3" : "#6b7280"));

/** 图表网格颜色 */
const gridColor = computed(() => (isDark.value ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"));

/** 近7天答题趋势 - 折线图数据 */
const lineChartData = computed(() => {
  const trend = data.value?.dailyTrend ?? [];
  return {
    labels: trend.map((d) => d.date.slice(5)), // "MM-DD"
    datasets: [
      {
        label: "答题量",
        data: trend.map((d) => d.attempts),
        borderColor: "#409eff",
        backgroundColor: "rgba(64,158,255,0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "答对数",
        data: trend.map((d) => d.correct),
        borderColor: "#67c23a",
        backgroundColor: "rgba(103,194,58,0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
});

/** 折线图配置 */
const lineChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: textColor.value, usePointStyle: true } },
  },
  scales: {
    x: {
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
    y: {
      beginAtZero: true,
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
  },
}));

/** 分类题目分布 - 横向柱状图数据 */
const barChartData = computed(() => {
  const dist = data.value?.categoryDistribution ?? [];
  return {
    labels: dist.map((d) => d.categoryName),
    datasets: [
      {
        label: "题目数",
        data: dist.map((d) => d.questionCount),
        backgroundColor: [
          "#409eff",
          "#67c23a",
          "#e6a23c",
          "#f56c6c",
          "#909399",
          "#8b5cf6",
          "#06b6d4",
          "#f59e0b",
          "#ec4899",
          "#14b8a6",
        ],
        borderRadius: 4,
      },
    ],
  };
});

/** 横向柱状图配置 */
const barChartOptions = computed(() => ({
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: textColor.value },
      grid: { color: gridColor.value },
    },
    y: {
      ticks: { color: textColor.value, font: { size: 11 } },
      grid: { display: false },
    },
  },
}));

/** 正确率环形图数据 */
const doughnutChartData = computed(() => {
  const accuracy = data.value?.overview.accuracy.total ?? 0;
  const wrong = +(100 - accuracy).toFixed(1);
  return {
    labels: ["正确", "错误"],
    datasets: [
      {
        data: [accuracy, wrong],
        backgroundColor: ["#67c23a", "#f56c6c"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };
});

/** 环形图配置（隐藏内置图例，使用自定义标注） */
const doughnutChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
}));

// ──────── 数据加载 ────────

/**
 * 加载首页数据（聚合统计 + 在线客户端）
 */
const loadDashboard = async () => {
  loading.value = true;
  try {
    const [dashboard, clientsResult] = await Promise.all([
      isMock.value ? getDashboardMock() : getDashboardApi(),
      isMock.value ? getClientsMock() : getClientsApi(),
    ]);
    data.value = dashboard;
    onlineStats.value = clientsResult.stats;
  } catch {
    ElMessage.error("加载仪表盘数据失败");
  } finally {
    loading.value = false;
  }
};

/**
 * 格式化相对时间
 */
const formatTime = (dateStr: string): string => {
  return dayjs(dateStr).format("MM-DD HH:mm");
};

/**
 * 格式化模块名
 */
const formatModule = (mod: string): string => {
  const map: Record<string, string> = {
    questions: "题目管理",
    "app-users": "用户管理",
    admins: "管理员",
    roles: "角色管理",
    categories: "分类管理",
    auth: "认证",
    clients: "客户端",
  };
  return map[mod] ?? mod;
};

/**
 * 数字千分位格式化
 */
const formatNumber = (n: number): string => {
  return n.toLocaleString("zh-CN");
};

onMounted(loadDashboard);
</script>

<template>
  <div v-loading="loading" class="dashboard-page" data-testid="dashboard-page">
    <!-- 欢迎卡片 -->
    <div class="welcome-card" data-testid="welcome-card">
      <h2 class="welcome-card__title">{{ greeting }}，{{ accountStore.userInfo?.nickname }}！</h2>
      <p class="welcome-card__text">角色：{{ accountStore.userInfo?.role }}</p>
    </div>

    <!-- 统计卡片行 -->
    <div class="stats-row" data-testid="stats-row">
      <el-card
        v-for="stat in statCards"
        :key="stat.title"
        class="stat-card"
        :data-testid="'stat-card-' + stat.title"
      >
        <div class="stat-card__content">
          <i :class="[stat.icon, stat.color]" class="stat-card__icon" />
          <div class="stat-card__info">
            <p class="stat-card__value">
              {{ stat.isPercent ? stat.total + "%" : formatNumber(stat.total) }}
            </p>
            <p class="stat-card__title">{{ stat.title }}</p>
            <p class="stat-card__today">
              {{ stat.todayLabel }}：{{ stat.isPercent ? stat.today + "%" : "+" + stat.today }}
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表行上：折线图 + 柱状图 -->
    <div class="chart-row">
      <el-card class="chart-card" data-testid="line-chart-card">
        <template #header>
          <span class="chart-card__title">
            <i class="i-carbon-chart-line mr-2 align-middle" />近 7 天答题趋势
          </span>
        </template>
        <div class="chart-card__body">
          <Line v-if="data" :data="lineChartData" :options="lineChartOptions" />
        </div>
      </el-card>
      <el-card class="chart-card" data-testid="bar-chart-card">
        <template #header>
          <span class="chart-card__title">
            <i class="i-carbon-chart-bar mr-2 align-middle" />分类题目分布 Top10
          </span>
        </template>
        <div class="chart-card__body">
          <Bar v-if="data" :data="barChartData" :options="barChartOptions" />
        </div>
      </el-card>
    </div>

    <!-- 图表行下：在线状态 + 正确率环形图 -->
    <div class="chart-row">
      <el-card class="online-card" data-testid="online-card">
        <template #header>
          <span class="chart-card__title">
            <i class="i-carbon-screen mr-2 align-middle" />实时在线
          </span>
        </template>
        <div class="online-card__body">
          <div class="online-card__item">
            <span class="online-card__num online-card__num--total">
              {{ onlineStats?.total ?? 0 }}
            </span>
            <span class="online-card__label">在线总数</span>
          </div>
          <div class="online-card__item">
            <span class="online-card__num online-card__num--logged">
              {{ onlineStats?.loggedIn ?? 0 }}
            </span>
            <span class="online-card__label">已登录</span>
          </div>
          <div class="online-card__item">
            <span class="online-card__num online-card__num--guest">
              {{ onlineStats?.guest ?? 0 }}
            </span>
            <span class="online-card__label">游客</span>
          </div>
        </div>
      </el-card>
      <el-card class="chart-card" data-testid="doughnut-chart-card">
        <template #header>
          <span class="chart-card__title">
            <i class="i-carbon-meter mr-2 align-middle" />正确率统计
          </span>
        </template>
        <div class="doughnut-card__body">
          <div class="doughnut-card__chart">
            <Doughnut v-if="data" :data="doughnutChartData" :options="doughnutChartOptions" />
            <!-- 中心百分比文字 -->
            <div class="doughnut-card__center">{{ data?.overview.accuracy.total ?? 0 }}%</div>
          </div>
          <div class="doughnut-card__info">
            <p class="doughnut-card__row">
              <span class="doughnut-card__dot doughnut-card__dot--correct" />
              总正确率：<strong>{{ data?.overview.accuracy.total ?? 0 }}%</strong>
            </p>
            <p class="doughnut-card__row">
              <span class="doughnut-card__dot doughnut-card__dot--today" />
              今日正确率：<strong>{{ data?.overview.accuracy.today ?? 0 }}%</strong>
            </p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近操作日志 -->
    <el-card data-testid="recent-logs-card">
      <template #header>
        <span class="chart-card__title">
          <i class="i-carbon-recently-viewed mr-2 align-middle" />最近操作
        </span>
      </template>
      <el-table :data="data?.recentLogs ?? []" size="small">
        <el-table-column label="时间" width="120">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="actorName" label="操作人" width="120">
          <template #default="{ row }">
            {{ row.actorName ?? "-" }}
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120">
          <template #default="{ row }">
            {{ formatModule(row.module) }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" />
        <el-table-column label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" size="small">
              {{ row.success ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  @apply flex flex-col gap-4;
}

/* ── 欢迎卡片 ────────────────────────────── */
.welcome-card {
  @apply bg-gradient-to-r from-indigo-500 to-purple-600;
  @apply text-white rounded-xl px-8 py-6 shadow-lg;

  &__title {
    @apply text-2xl font-bold mb-1;
  }

  &__text {
    @apply text-sm opacity-85;
  }
}

/* ── 统计卡片行 ──────────────────────────── */
.stats-row {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply transition-all;

  &:hover {
    @apply shadow-lg;
  }

  &__content {
    @apply flex items-center gap-4;
  }

  &__icon {
    @apply w-10 h-10 inline-block shrink-0;
  }

  &__info {
    @apply flex-1 min-w-0;
  }

  &__value {
    @apply text-2xl font-bold;
    color: var(--el-text-color-primary);
  }

  &__title {
    @apply text-xs mt-0.5;
    color: var(--el-text-color-secondary);
  }

  &__today {
    @apply text-xs mt-1;
    color: var(--el-text-color-regular);
  }
}

/* ── 图表卡片 ────────────────────────────── */
.chart-row {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-4;
}

.chart-card {
  &__title {
    @apply text-sm font-semibold inline-flex items-center;
  }

  &__body {
    @apply h-64;
  }
}

/* ── 在线状态卡片 ─────────────────────────── */
.online-card {
  &__body {
    @apply flex items-center justify-around py-8;
  }

  &__item {
    @apply flex flex-col items-center gap-2;
  }

  &__num {
    @apply text-4xl font-bold;

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

  &__label {
    @apply text-sm;
    color: var(--el-text-color-secondary);
  }
}

/* ── 正确率环形图 ─────────────────────────── */
.doughnut-card {
  &__body {
    @apply flex items-center gap-8 px-4 py-2;
  }

  &__chart {
    @apply relative w-40 h-40 shrink-0;
  }

  &__center {
    @apply absolute inset-0 flex items-center justify-center;
    @apply text-2xl font-bold;
    color: var(--el-text-color-primary);
  }

  &__info {
    @apply flex flex-col gap-3;
  }

  &__row {
    @apply flex items-center gap-2 text-sm;
    color: var(--el-text-color-regular);
  }

  &__dot {
    @apply w-3 h-3 rounded-full inline-block shrink-0;

    &--correct {
      background: #67c23a;
    }

    &--today {
      background: #409eff;
    }
  }
}
</style>
