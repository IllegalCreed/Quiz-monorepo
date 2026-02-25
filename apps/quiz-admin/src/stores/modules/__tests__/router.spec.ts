/**
 * useRouterStore 单元测试
 * 测试 Tab 历史记录管理和 keep-alive 缓存逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// 模拟 settings API
vi.mock("@/api/mock/settings", () => ({
  getPageCacheSettings: vi.fn().mockResolvedValue({
    pages: [
      { componentName: "UsersView", cacheEnabled: true },
      { componentName: "AdminsView", cacheEnabled: false },
    ],
  }),
}));

import { useRouterStore } from "../router";
import type { RouteLike } from "@/types/router";

/** 构造测试用路由对象 */
const makeRoute = (
  path: string,
  name: string,
  opts: { componentName?: string; noCache?: boolean } = {},
): RouteLike => ({
  path,
  fullPath: path,
  name,
  meta: opts,
  query: {},
});

describe("useRouterStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // ── addVisitedView ──────────────────────────────────────────────────────────

  describe("addVisitedView", () => {
    it("新路由加入历史记录", () => {
      const store = useRouterStore();
      store.addVisitedView(makeRoute("/home/users", "users"));
      expect(store.visitedViews).toHaveLength(1);
      expect(store.visitedViews[0]!.path).toBe("/home/users");
    });

    it("相同路径不重复添加", () => {
      const store = useRouterStore();
      const route = makeRoute("/home/users", "users");
      store.addVisitedView(route);
      store.addVisitedView(route);
      expect(store.visitedViews).toHaveLength(1);
    });

    it("不同路径分别添加", () => {
      const store = useRouterStore();
      store.addVisitedView(makeRoute("/home/users", "users"));
      store.addVisitedView(makeRoute("/home/admins", "admins"));
      expect(store.visitedViews).toHaveLength(2);
    });
  });

  // ── addCachedView ───────────────────────────────────────────────────────────

  describe("addCachedView", () => {
    it("优先使用 meta.componentName 作为缓存 key", () => {
      const store = useRouterStore();
      store.addCachedView(makeRoute("/home/users", "users", { componentName: "UsersView" }));
      expect(store.cachedViews).toContain("UsersView");
    });

    it("无 componentName 时回退到 route.name", () => {
      const store = useRouterStore();
      store.addCachedView(makeRoute("/home/dashboard", "dashboard"));
      expect(store.cachedViews).toContain("dashboard");
    });

    it("相同 cacheName 不重复添加", () => {
      const store = useRouterStore();
      const route = makeRoute("/home/users", "users", { componentName: "UsersView" });
      store.addCachedView(route);
      store.addCachedView(route);
      expect(store.cachedViews).toHaveLength(1);
    });

    it("meta.noCache=true 时不加入缓存", () => {
      const store = useRouterStore();
      store.addCachedView(makeRoute("/home/users", "users", { noCache: true }));
      expect(store.cachedViews).not.toContain("users");
    });

    it("updateCacheConfig 禁用后不加入缓存", () => {
      const store = useRouterStore();
      store.updateCacheConfig("AdminsView", false);
      store.addCachedView(makeRoute("/home/admins", "admins", { componentName: "AdminsView" }));
      expect(store.cachedViews).not.toContain("AdminsView");
    });

    it("updateCacheConfig 启用后正常加入缓存", () => {
      const store = useRouterStore();
      store.updateCacheConfig("AdminsView", true);
      store.addCachedView(makeRoute("/home/admins", "admins", { componentName: "AdminsView" }));
      expect(store.cachedViews).toContain("AdminsView");
    });
  });

  // ── addView ─────────────────────────────────────────────────────────────────

  describe("addView", () => {
    it("同时添加到 visitedViews 和 cachedViews", () => {
      const store = useRouterStore();
      store.addView(makeRoute("/home/users", "users", { componentName: "UsersView" }));
      expect(store.visitedViews).toHaveLength(1);
      expect(store.cachedViews).toContain("UsersView");
    });
  });

  // ── deleteVisitedView / deleteCachedView ────────────────────────────────────

  describe("deleteVisitedView", () => {
    it("从历史记录中删除指定路由", () => {
      const store = useRouterStore();
      const route = makeRoute("/home/users", "users");
      store.addVisitedView(route);
      store.deleteVisitedView(route);
      expect(store.visitedViews).toHaveLength(0);
    });

    it("删除不存在的路由不报错", () => {
      const store = useRouterStore();
      expect(() =>
        store.deleteVisitedView(makeRoute("/home/nonexistent", "nonexistent")),
      ).not.toThrow();
    });
  });

  describe("deleteCachedView", () => {
    it("从缓存列表中删除指定路由", () => {
      const store = useRouterStore();
      const route = makeRoute("/home/users", "users", { componentName: "UsersView" });
      store.addCachedView(route);
      store.deleteCachedView(route);
      expect(store.cachedViews).not.toContain("UsersView");
    });
  });

  describe("deleteView", () => {
    it("同时从历史和缓存中删除", () => {
      const store = useRouterStore();
      const route = makeRoute("/home/users", "users", { componentName: "UsersView" });
      store.addView(route);
      store.deleteView(route);
      expect(store.visitedViews).toHaveLength(0);
      expect(store.cachedViews).not.toContain("UsersView");
    });
  });

  // ── clearAllViews ───────────────────────────────────────────────────────────

  describe("clearAllViews", () => {
    it("清空所有历史和缓存", () => {
      const store = useRouterStore();
      store.addView(makeRoute("/home/users", "users", { componentName: "UsersView" }));
      store.addView(makeRoute("/home/admins", "admins", { componentName: "AdminsView" }));
      store.clearAllViews();
      expect(store.visitedViews).toHaveLength(0);
      expect(store.cachedViews).toHaveLength(0);
    });
  });

  // ── initCacheConfig ─────────────────────────────────────────────────────────

  describe("initCacheConfig", () => {
    it("从 settings 加载缓存配置后，disabled 组件不缓存", async () => {
      const store = useRouterStore();
      await store.initCacheConfig();
      // AdminsView cacheEnabled=false
      store.addCachedView(makeRoute("/home/admins", "admins", { componentName: "AdminsView" }));
      expect(store.cachedViews).not.toContain("AdminsView");
    });

    it("从 settings 加载缓存配置后，enabled 组件正常缓存", async () => {
      const store = useRouterStore();
      await store.initCacheConfig();
      // UsersView cacheEnabled=true
      store.addCachedView(makeRoute("/home/users", "users", { componentName: "UsersView" }));
      expect(store.cachedViews).toContain("UsersView");
    });

    it("settings 加载失败时不影响默认行为（未配置的组件默认缓存）", async () => {
      const { getPageCacheSettings } = await import("@/api/mock/settings");
      vi.mocked(getPageCacheSettings).mockRejectedValueOnce(new Error("网络错误"));
      const store = useRouterStore();
      await store.initCacheConfig(); // 不应抛出
      // 未配置的组件默认缓存
      store.addCachedView(makeRoute("/home/dashboard", "dashboard"));
      expect(store.cachedViews).toContain("dashboard");
    });
  });

  // ── refreshView ─────────────────────────────────────────────────────────────

  describe("refreshView", () => {
    it("refreshView 后 isRouterAlive 恢复为 true", async () => {
      const store = useRouterStore();
      expect(store.isRouterAlive).toBe(true);
      await store.refreshView();
      expect(store.isRouterAlive).toBe(true);
    });
  });

  // ── updateViewTitle ─────────────────────────────────────────────────────────

  describe("updateViewTitle", () => {
    it("更新已存在视图的 meta.title", () => {
      // Arrange
      const store = useRouterStore();
      store.addVisitedView(makeRoute("/home/questions/1", "questionDetail"));

      // Act
      store.updateViewTitle("/home/questions/1", "编辑：Vue 面试题");

      // Assert
      const view = store.visitedViews.find((v) => v.path === "/home/questions/1");
      expect(view?.meta?.title).toBe("编辑：Vue 面试题");
    });

    it("路径不存在时静默忽略，不抛出错误", () => {
      // Arrange
      const store = useRouterStore();

      // Act & Assert
      expect(() => store.updateViewTitle("/home/questions/999", "不存在的页面")).not.toThrow();
    });

    it("只更新目标视图，其他视图 meta 不受影响", () => {
      // Arrange
      const store = useRouterStore();
      store.addVisitedView(makeRoute("/home/questions/1", "questionDetail1"));
      store.addVisitedView(makeRoute("/home/questions/2", "questionDetail2"));

      // Act
      store.updateViewTitle("/home/questions/1", "编辑：题目 1");

      // Assert：view1 标题已更新
      const view1 = store.visitedViews.find((v) => v.path === "/home/questions/1");
      expect(view1?.meta?.title).toBe("编辑：题目 1");
      // view2 不受影响
      const view2 = store.visitedViews.find((v) => v.path === "/home/questions/2");
      expect(view2?.meta?.title).toBeUndefined();
    });

    it("多次调用时后一次的标题覆盖前一次", () => {
      // Arrange
      const store = useRouterStore();
      store.addVisitedView(makeRoute("/home/questions/1", "questionDetail"));

      // Act
      store.updateViewTitle("/home/questions/1", "第一次标题");
      store.updateViewTitle("/home/questions/1", "第二次标题");

      // Assert
      const view = store.visitedViews.find((v) => v.path === "/home/questions/1");
      expect(view?.meta?.title).toBe("第二次标题");
    });
  });
});
