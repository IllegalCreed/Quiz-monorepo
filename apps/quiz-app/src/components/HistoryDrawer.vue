<script setup lang="ts">
/**
 * HistoryDrawer — 答题历史右侧抽屉面板
 *
 * BaseDialog right 模式，无限滚动 + 客户端筛选
 */
import { ref, watch, onBeforeUnmount } from "vue";
import { BaseDialog, BaseButton } from "@quiz/ui";
import { useHistory } from "@/composables/useHistory";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthDialog } from "@/composables/useAuthDialog";

const userStore = useUserStore();
const { openLogin } = useAuthDialog();
const { filteredItems, loading, hasMore, filter, showDrawer, loadMore, closeDrawer, setFilter } =
  useHistory();

/** IntersectionObserver 触底哨兵 */
const sentinelRef = ref<HTMLElement>();
let observer: IntersectionObserver | null = null;

/** 设置 IntersectionObserver */
function setupObserver() {
  if (observer) observer.disconnect();
  if (!sentinelRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && hasMore.value && !loading.value) {
        loadMore();
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(sentinelRef.value);
}

/** 哨兵元素变化时重建 observer */
watch(sentinelRef, () => setupObserver());

onBeforeUnmount(() => {
  observer?.disconnect();
});

/** 筛选 Tab 配置 */
const filterTabs: Array<{ key: "all" | "correct" | "wrong"; label: string }> = [
  { key: "all", label: "全部" },
  { key: "correct", label: "答对" },
  { key: "wrong", label: "答错" },
];

/**
 * 格式化相对时间
 */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "刚刚";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月前`;

  return `${Math.floor(months / 12)}年前`;
}
</script>

<template>
  <BaseDialog v-model="showDrawer" placement="right" width="24rem" @close="closeDrawer">
    <!-- 自定义 header：标题 + 筛选 Tab -->
    <template #header>
      <div class="history-header">
        <h3 class="history-header__title">做题历史</h3>
        <!-- 筛选 Tab（仅登录时显示） -->
        <div v-if="userStore.isLoggedIn" class="history-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="history-tabs__item"
            :class="{ 'history-tabs__item--active': filter === tab.key }"
            @click="setFilter(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- 主内容区 -->
    <div class="history-body">
      <!-- 未登录 → 提示登录 -->
      <div v-if="!userStore.isLoggedIn" class="history-empty">
        <p>登录后查看做题历史</p>
        <BaseButton size="sm" @click="openLogin">登录</BaseButton>
      </div>

      <!-- 已登录 → 历史列表 -->
      <template v-else>
        <!-- 无记录 -->
        <div v-if="!loading && filteredItems.length === 0" class="history-empty">
          <p>{{ filter === "all" ? "还没有做题记录" : "没有符合条件的记录" }}</p>
        </div>

        <!-- 历史条目列表 -->
        <div v-for="item in filteredItems" :key="item.id" class="history-item">
          <div class="history-item__header">
            <!-- 正误徽标 -->
            <span
              class="history-item__badge"
              :class="item.correct ? 'history-item__badge--correct' : 'history-item__badge--wrong'"
            >
              {{ item.correct ? "✓" : "✗" }}
            </span>
            <!-- 相对时间 -->
            <span class="history-item__time">{{ timeAgo(item.createdAt) }}</span>
          </div>
          <!-- 题干（截断 2 行） -->
          <p class="history-item__stem">{{ item.question.stem }}</p>
        </div>

        <!-- 加载中提示 -->
        <div v-if="loading" class="history-loading">加载中…</div>

        <!-- 触底哨兵（IntersectionObserver） -->
        <div v-if="hasMore" ref="sentinelRef" class="history-sentinel" />

        <!-- 已加载全部 -->
        <div v-if="!hasMore && filteredItems.length > 0" class="history-end">已加载全部记录</div>
      </template>
    </div>
  </BaseDialog>
</template>

<style scoped lang="scss">
/* ── Header ──────────────────────────────────────────── */
.history-header {
  @apply flex flex-col gap-3 w-full;

  &__title {
    @apply m-0 text-lg font-semibold;
    color: var(--quiz-ui-text);
  }
}

/* ── 筛选 Tab ───────────────────────────────────────── */
.history-tabs {
  @apply flex gap-1;

  &__item {
    @apply px-3 py-1 text-xs font-medium rounded-md cursor-pointer;
    background: transparent;
    border: 1px solid var(--quiz-ui-border);
    color: var(--quiz-ui-muted);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--quiz-ui-primary);
      color: var(--quiz-ui-primary);
    }

    &--active {
      background-color: var(--quiz-ui-primary);
      border-color: var(--quiz-ui-primary);
      color: white;
    }
  }
}

/* ── 内容区域 ───────────────────────────────────────── */
.history-body {
  @apply flex flex-col gap-2;
  min-height: 200px;
}

/* ── 历史条目 ───────────────────────────────────────── */
.history-item {
  @apply flex flex-col gap-1 px-3 py-3 rounded-lg;
  border: 1px solid var(--quiz-ui-border);
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--quiz-ui-control-bg);
  }

  &__header {
    @apply flex items-center justify-between;
  }

  &__badge {
    @apply inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold;

    &--correct {
      background-color: var(--quiz-ui-success, #22c55e);
      color: white;
    }

    &--wrong {
      background-color: var(--quiz-ui-danger, #ef4444);
      color: white;
    }
  }

  &__time {
    @apply text-xs;
    color: var(--quiz-ui-muted);
  }

  &__stem {
    @apply m-0 text-sm leading-relaxed;
    color: var(--quiz-ui-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* ── 空状态 + 加载 ──────────────────────────────────── */
.history-empty {
  @apply flex flex-col items-center justify-center gap-3 py-12;
  color: var(--quiz-ui-muted);
}

.history-loading {
  @apply text-center py-4 text-sm;
  color: var(--quiz-ui-muted);
}

.history-sentinel {
  height: 1px;
}

.history-end {
  @apply text-center py-4 text-xs;
  color: var(--quiz-ui-muted);
}
</style>
