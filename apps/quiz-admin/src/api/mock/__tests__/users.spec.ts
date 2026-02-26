/**
 * users mock API 单元测试
 * 每个测试通过 vi.resetModules() 获得独立的 mockAppUsers 状态
 * 测试分页返回格式 { total, items } 和大写状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("users mock API", () => {
  let getAppUsers: (typeof import("../users"))["getAppUsers"];
  let getAppUser: (typeof import("../users"))["getAppUser"];
  let getAppUserHistory: (typeof import("../users"))["getAppUserHistory"];
  let getAppUserPreferences: (typeof import("../users"))["getAppUserPreferences"];
  let updateAppUserStatus: (typeof import("../users"))["updateAppUserStatus"];
  let deleteAppUser: (typeof import("../users"))["deleteAppUser"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../users");
    getAppUsers = module.getAppUsers;
    getAppUser = module.getAppUser;
    getAppUserHistory = module.getAppUserHistory;
    getAppUserPreferences = module.getAppUserPreferences;
    updateAppUserStatus = module.updateAppUserStatus;
    deleteAppUser = module.deleteAppUser;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getAppUsers ───────────────────────────────────────────────────────────

  describe("getAppUsers", () => {
    it("返回分页格式，初始 5 个用户", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(5);
    });

    it("每个用户包含必要字段和 _count", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await p;
      for (const user of result.items) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("nickname");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("status");
        expect(user).toHaveProperty("createdAt");
        expect(user).toHaveProperty("_count");
        expect(user._count).toHaveProperty("answerAttempts");
      }
    });

    it("支持关键词搜索", async () => {
      const p = getAppUsers({ keyword: "zhang" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(1);
      expect(result.items[0]!.username).toBe("zhangsan");
    });

    it("支持状态筛选", async () => {
      const p = getAppUsers({ status: "DISABLED" });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(1);
      expect(result.items[0]!.status).toBe("DISABLED");
    });

    it("支持分页", async () => {
      const p = getAppUsers({ page: 1, pageSize: 2 });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(5);
      expect(result.items).toHaveLength(2);
    });

    it("初始数据中包含 ACTIVE 和 DISABLED 状态的用户", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items.some((u) => u.status === "ACTIVE")).toBe(true);
      expect(result.items.some((u) => u.status === "DISABLED")).toBe(true);
    });
  });

  // ── getAppUser ──────────────────────────────────────────────────────────

  describe("getAppUser", () => {
    it("返回用户详情含 _count", async () => {
      const p = getAppUser(1);
      await vi.runAllTimersAsync();
      const user = await p;
      expect(user.id).toBe(1);
      expect(user._count).toHaveProperty("answerAttempts");
      expect(user._count).toHaveProperty("preferences");
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(getAppUser(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── getAppUserHistory ───────────────────────────────────────────────────

  describe("getAppUserHistory", () => {
    it("返回分页做题历史", async () => {
      const p = getAppUserHistory(1, 1, 10);
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("items");
      expect(Array.isArray(result.items)).toBe(true);
    });

    it("每条记录包含完整字段", async () => {
      const p = getAppUserHistory(1, 1, 5);
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("questionId");
        expect(item).toHaveProperty("selectedOption");
        expect(typeof item.correct).toBe("boolean");
        expect(typeof item.elapsedMs).toBe("number");
        expect(item).toHaveProperty("createdAt");
        expect(item.question).toHaveProperty("id");
        expect(item.question).toHaveProperty("stem");
        expect(item.question).toHaveProperty("type");
      }
    });

    it("total 等于用户做题次数", async () => {
      // zhangsan 有 15 条记录
      const p = getAppUserHistory(1, 1, 5);
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(15);
      expect(result.items).toHaveLength(5);
    });

    it("分页第二页返回正确数量", async () => {
      // zhangsan 15 条，第二页（pageSize=10）应返回 5 条
      const p = getAppUserHistory(1, 2, 10);
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(15);
      expect(result.items).toHaveLength(5);
    });

    it("做题次数为 0 的用户返回空列表", async () => {
      // sunqi (id=5) 做题次数为 0
      const p = getAppUserHistory(5, 1, 10);
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(getAppUserHistory(9999, 1, 10)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── getAppUserPreferences ───────────────────────────────────────────────

  describe("getAppUserPreferences", () => {
    it("返回偏好分类数组", async () => {
      const p = getAppUserPreferences(1);
      await vi.runAllTimersAsync();
      const prefs = await p;
      expect(Array.isArray(prefs)).toBe(true);
      expect(prefs.length).toBeGreaterThan(0);
      expect(prefs[0]).toHaveProperty("category");
      expect(prefs[0]!.category).toHaveProperty("group");
    });

    it("每个偏好项包含完整嵌套结构", async () => {
      const p = getAppUserPreferences(1);
      await vi.runAllTimersAsync();
      const prefs = await p;
      for (const pref of prefs) {
        expect(pref).toHaveProperty("userId");
        expect(pref).toHaveProperty("categoryId");
        expect(typeof pref.category.id).toBe("number");
        expect(typeof pref.category.name).toBe("string");
        expect(typeof pref.category.group.id).toBe("number");
        expect(typeof pref.category.group.name).toBe("string");
      }
    });

    it("返回的 userId 与请求 id 一致", async () => {
      const p = getAppUserPreferences(2);
      await vi.runAllTimersAsync();
      const prefs = await p;
      for (const pref of prefs) {
        expect(pref.userId).toBe(2);
      }
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(getAppUserPreferences(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── updateAppUserStatus ───────────────────────────────────────────────────

  describe("updateAppUserStatus", () => {
    it("成功将用户状态改为 DISABLED", async () => {
      const p = updateAppUserStatus(1, "DISABLED");
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.items.find((u) => u.id === 1)?.status).toBe("DISABLED");
    });

    it("成功将用户状态改为 ACTIVE", async () => {
      const p = updateAppUserStatus(3, "ACTIVE");
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.items.find((u) => u.id === 3)?.status).toBe("ACTIVE");
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(updateAppUserStatus(9999, "DISABLED")).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── deleteAppUser ─────────────────────────────────────────────────────────

  describe("deleteAppUser", () => {
    it("成功删除用户", async () => {
      const p = deleteAppUser(1);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const result = await lp;
      expect(result.items.find((u) => u.id === 1)).toBeUndefined();
    });

    it("删除后列表总数减 1", async () => {
      const beforeP = getAppUsers();
      await vi.runAllTimersAsync();
      const beforeResult = await beforeP;
      const beforeCount = beforeResult.total;

      const dp = deleteAppUser(2);
      await vi.runAllTimersAsync();
      await dp;

      const afterP = getAppUsers();
      await vi.runAllTimersAsync();
      const afterResult = await afterP;
      expect(afterResult.total).toBe(beforeCount - 1);
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(deleteAppUser(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
