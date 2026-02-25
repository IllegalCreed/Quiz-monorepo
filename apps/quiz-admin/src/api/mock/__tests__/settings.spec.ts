/**
 * settings mock API 单元测试
 * settings.ts 使用 localStorage 持久化，jsdom 环境已提供 localStorage
 * 每个测试前清空 localStorage + resetModules 获得初始状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("settings mock API", () => {
  let getPageCacheSettings: (typeof import("../settings"))["getPageCacheSettings"];
  let updatePageCache: (typeof import("../settings"))["updatePageCache"];
  let batchUpdatePageCache: (typeof import("../settings"))["batchUpdatePageCache"];
  let resetPageCacheSettings: (typeof import("../settings"))["resetPageCacheSettings"];

  beforeEach(async () => {
    vi.useFakeTimers();
    // localStorage 是 settings.ts 的唯一状态，清空后相当于全新状态
    localStorage.clear();
    vi.resetModules();
    const module = await import("../settings");
    getPageCacheSettings = module.getPageCacheSettings;
    updatePageCache = module.updatePageCache;
    batchUpdatePageCache = module.batchUpdatePageCache;
    resetPageCacheSettings = module.resetPageCacheSettings;
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  // ── getPageCacheSettings ──────────────────────────────────────────────────

  describe("getPageCacheSettings", () => {
    it("localStorage 为空时返回默认配置", async () => {
      const p = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await p;
      expect(settings.pages.length).toBeGreaterThan(0);
    });

    it("默认配置包含 7 个页面配置项", async () => {
      const p = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await p;
      expect(settings.pages).toHaveLength(7);
    });

    it("每个页面配置包含必要字段", async () => {
      const p = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await p;
      for (const page of settings.pages) {
        expect(page).toHaveProperty("routeName");
        expect(page).toHaveProperty("componentName");
        expect(page).toHaveProperty("title");
        expect(page).toHaveProperty("cacheEnabled");
      }
    });

    it("系统设置页面默认不缓存（cacheEnabled=false）", async () => {
      const p = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await p;
      const settingsPage = settings.pages.find((p) => p.routeName === "settings");
      expect(settingsPage?.cacheEnabled).toBe(false);
    });

    it("其他页面默认启用缓存（cacheEnabled=true）", async () => {
      const p = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await p;
      const dashboard = settings.pages.find((p) => p.routeName === "dashboard");
      expect(dashboard?.cacheEnabled).toBe(true);
    });
  });

  // ── updatePageCache ───────────────────────────────────────────────────────

  describe("updatePageCache", () => {
    it("成功更新指定页面的缓存配置", async () => {
      const p = updatePageCache({ routeName: "users", cacheEnabled: false });
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const gp = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await gp;
      const usersPage = settings.pages.find((pg) => pg.routeName === "users");
      expect(usersPage?.cacheEnabled).toBe(false);
    });

    it("更新后的配置可被下次 getPageCacheSettings 读取", async () => {
      // 先关闭 questions 页面缓存
      const up = updatePageCache({ routeName: "questions", cacheEnabled: false });
      await vi.runAllTimersAsync();
      await up;

      const gp = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await gp;
      expect(settings.pages.find((p) => p.routeName === "questions")?.cacheEnabled).toBe(false);
    });

    it("不存在的页面 routeName 时抛出错误", async () => {
      await Promise.all([
        expect(updatePageCache({ routeName: "nonexistent", cacheEnabled: false })).rejects.toThrow(
          "不存在",
        ),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── batchUpdatePageCache ──────────────────────────────────────────────────

  describe("batchUpdatePageCache", () => {
    it("批量更新多个页面的缓存配置", async () => {
      const p = batchUpdatePageCache([
        { routeName: "users", cacheEnabled: false },
        { routeName: "admins", cacheEnabled: false },
      ]);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const gp = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await gp;
      expect(settings.pages.find((pg) => pg.routeName === "users")?.cacheEnabled).toBe(false);
      expect(settings.pages.find((pg) => pg.routeName === "admins")?.cacheEnabled).toBe(false);
    });

    it("不存在的 routeName 被静默跳过（不抛出错误）", async () => {
      const p = batchUpdatePageCache([
        { routeName: "users", cacheEnabled: false },
        { routeName: "nonexistent", cacheEnabled: false }, // 静默跳过
      ]);
      await vi.runAllTimersAsync();
      // 只要不抛出错误即可
      await expect(p).resolves.toBeUndefined();
    });

    it("空数组时不修改任何配置", async () => {
      const p = batchUpdatePageCache([]);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      // 配置应与默认值一致
      const gp = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await gp;
      expect(settings.pages.find((pg) => pg.routeName === "dashboard")?.cacheEnabled).toBe(true);
    });
  });

  // ── resetPageCacheSettings ────────────────────────────────────────────────

  describe("resetPageCacheSettings", () => {
    it("重置后所有配置恢复为默认值", async () => {
      // 先修改一些配置
      const up = updatePageCache({ routeName: "users", cacheEnabled: false });
      await vi.runAllTimersAsync();
      await up;

      // 执行重置
      const rp = resetPageCacheSettings();
      await vi.runAllTimersAsync();
      await expect(rp).resolves.toBeUndefined();

      // 验证配置已恢复
      const gp = getPageCacheSettings();
      await vi.runAllTimersAsync();
      const settings = await gp;
      expect(settings.pages.find((pg) => pg.routeName === "users")?.cacheEnabled).toBe(true);
      expect(settings.pages.find((pg) => pg.routeName === "settings")?.cacheEnabled).toBe(false);
    });
  });
});
