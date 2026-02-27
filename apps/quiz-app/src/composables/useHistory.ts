/**
 * useHistory — 答题历史管理 composable
 *
 * 模块级 singleton，跨组件共享：
 * - 分页加载历史数据（支持无限滚动）
 * - 客户端筛选：全部 / 答对 / 答错
 * - 抽屉开关控制
 */
import { ref, computed } from "vue";
import { fetchHistory } from "@/api/user-profile";
import type { HistoryItem } from "@/types/history";

/** 每页加载条数 */
const PAGE_SIZE = 20;

/** 已加载的所有历史条目 */
const items = ref<HistoryItem[]>([]);

/** 服务端总数 */
const total = ref(0);

/** 当前已加载的页数 */
const currentPage = ref(0);

/** 是否正在加载 */
const loading = ref(false);

/** 筛选条件 */
const filter = ref<"all" | "correct" | "wrong">("all");

/** 抽屉开关 */
const showDrawer = ref(false);

export function useHistory() {
  /** 是否还有更多数据可加载 */
  const hasMore = computed(() => items.value.length < total.value);

  /** 根据筛选条件过滤后的条目 */
  const filteredItems = computed(() => {
    if (filter.value === "all") return items.value;
    const isCorrect = filter.value === "correct";
    return items.value.filter((item) => item.correct === isCorrect);
  });

  /**
   * 加载下一页（追加到已有数据）
   */
  async function loadMore() {
    if (loading.value) return;
    if (currentPage.value > 0 && !hasMore.value) return;

    loading.value = true;
    try {
      const nextPage = currentPage.value + 1;
      const data = await fetchHistory(nextPage, PAGE_SIZE);
      items.value = [...items.value, ...data.items];
      total.value = data.total;
      currentPage.value = nextPage;
    } catch (e) {
      console.error("加载历史记录失败", e);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 重置并重新加载第一页
   */
  async function reset() {
    items.value = [];
    total.value = 0;
    currentPage.value = 0;
    await loadMore();
  }

  /**
   * 打开抽屉并加载数据
   */
  function openDrawer() {
    showDrawer.value = true;
    // 每次打开时重置加载（获取最新数据）
    reset();
  }

  /**
   * 关闭抽屉
   */
  function closeDrawer() {
    showDrawer.value = false;
  }

  /**
   * 切换筛选条件
   */
  function setFilter(f: "all" | "correct" | "wrong") {
    filter.value = f;
  }

  return {
    items,
    total,
    currentPage,
    loading,
    hasMore,
    filter,
    filteredItems,
    showDrawer,
    loadMore,
    reset,
    openDrawer,
    closeDrawer,
    setFilter,
  };
}
