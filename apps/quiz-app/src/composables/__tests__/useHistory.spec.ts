/**
 * useHistory composable 单元测试
 *
 * mock user-profile API，测试分页加载和筛选逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock user-profile API
vi.mock("@/api/user-profile", () => ({
  fetchHistory: vi.fn(),
  fetchPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}));

import { useHistory } from "../useHistory";
import { fetchHistory } from "@/api/user-profile";
import type { HistoryItem } from "@/types/history";

const mockFetchHistory = vi.mocked(fetchHistory);

/** 生成测试用历史条目 */
function makeItem(id: number, correct: boolean): HistoryItem {
  return {
    id,
    questionId: id,
    selectedOptionId: 1,
    correct,
    elapsedMs: 1000,
    createdAt: new Date().toISOString(),
    question: { id, stem: `题目 ${id}`, type: "single_choice" },
  };
}

describe("useHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 singleton 状态
    const h = useHistory();
    h.items.value = [];
    h.total.value = 0;
    h.currentPage.value = 0;
    h.loading.value = false;
    h.filter.value = "all";
    h.showDrawer.value = false;
  });

  it("初始状态", () => {
    const h = useHistory();
    expect(h.items.value).toEqual([]);
    expect(h.total.value).toBe(0);
    expect(h.loading.value).toBe(false);
    expect(h.hasMore.value).toBe(false);
    expect(h.filter.value).toBe("all");
    expect(h.showDrawer.value).toBe(false);
  });

  describe("loadMore", () => {
    it("加载第一页数据", async () => {
      const items = [makeItem(1, true), makeItem(2, false)];
      mockFetchHistory.mockResolvedValue({ total: 10, items });

      const h = useHistory();
      await h.loadMore();

      expect(mockFetchHistory).toHaveBeenCalledWith(1, 20);
      expect(h.items.value).toHaveLength(2);
      expect(h.total.value).toBe(10);
      expect(h.hasMore.value).toBe(true);
    });

    it("追加加载第二页", async () => {
      const page1 = [makeItem(1, true)];
      const page2 = [makeItem(2, false)];
      mockFetchHistory
        .mockResolvedValueOnce({ total: 2, items: page1 })
        .mockResolvedValueOnce({ total: 2, items: page2 });

      const h = useHistory();
      await h.loadMore();
      await h.loadMore();

      expect(h.items.value).toHaveLength(2);
      expect(mockFetchHistory).toHaveBeenCalledTimes(2);
      expect(mockFetchHistory).toHaveBeenLastCalledWith(2, 20);
    });

    it("已加载全部时不再请求", async () => {
      mockFetchHistory.mockResolvedValue({ total: 1, items: [makeItem(1, true)] });

      const h = useHistory();
      await h.loadMore();
      await h.loadMore();

      expect(mockFetchHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe("filteredItems", () => {
    it("默认显示全部", async () => {
      const items = [makeItem(1, true), makeItem(2, false), makeItem(3, true)];
      mockFetchHistory.mockResolvedValue({ total: 3, items });

      const h = useHistory();
      await h.loadMore();

      expect(h.filteredItems.value).toHaveLength(3);
    });

    it("筛选答对", async () => {
      const items = [makeItem(1, true), makeItem(2, false), makeItem(3, true)];
      mockFetchHistory.mockResolvedValue({ total: 3, items });

      const h = useHistory();
      await h.loadMore();
      h.setFilter("correct");

      expect(h.filteredItems.value).toHaveLength(2);
      expect(h.filteredItems.value.every((i) => i.correct)).toBe(true);
    });

    it("筛选答错", async () => {
      const items = [makeItem(1, true), makeItem(2, false)];
      mockFetchHistory.mockResolvedValue({ total: 2, items });

      const h = useHistory();
      await h.loadMore();
      h.setFilter("wrong");

      expect(h.filteredItems.value).toHaveLength(1);
      expect(h.filteredItems.value[0]!.correct).toBe(false);
    });
  });

  describe("reset", () => {
    it("重置后重新加载第一页", async () => {
      mockFetchHistory
        .mockResolvedValueOnce({ total: 10, items: [makeItem(1, true)] })
        .mockResolvedValueOnce({ total: 5, items: [makeItem(2, false)] });

      const h = useHistory();
      await h.loadMore();
      expect(h.total.value).toBe(10);

      await h.reset();
      expect(h.total.value).toBe(5);
      expect(h.items.value).toHaveLength(1);
    });
  });

  describe("openDrawer / closeDrawer", () => {
    it("打开抽屉并加载数据", async () => {
      mockFetchHistory.mockResolvedValue({ total: 0, items: [] });

      const h = useHistory();
      h.openDrawer();

      expect(h.showDrawer.value).toBe(true);
      // 等待异步加载完成
      await vi.waitFor(() => {
        expect(mockFetchHistory).toHaveBeenCalled();
      });
    });

    it("关闭抽屉", () => {
      const h = useHistory();
      h.showDrawer.value = true;
      h.closeDrawer();
      expect(h.showDrawer.value).toBe(false);
    });
  });
});
