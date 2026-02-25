/**
 * users mock API 单元测试
 * 每个测试通过 vi.resetModules() 获得独立的 mockAppUsers 状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("users mock API", () => {
  let getAppUsers: (typeof import("../users"))["getAppUsers"];
  let createAppUser: (typeof import("../users"))["createAppUser"];
  let updateAppUserStatus: (typeof import("../users"))["updateAppUserStatus"];
  let deleteAppUser: (typeof import("../users"))["deleteAppUser"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../users");
    getAppUsers = module.getAppUsers;
    createAppUser = module.createAppUser;
    updateAppUserStatus = module.updateAppUserStatus;
    deleteAppUser = module.deleteAppUser;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getAppUsers ───────────────────────────────────────────────────────────

  describe("getAppUsers", () => {
    it("返回初始 5 个用户", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await p;
      expect(users).toHaveLength(5);
    });

    it("每个用户包含必要字段", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await p;
      for (const user of users) {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("username");
        expect(user).toHaveProperty("nickname");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("status");
        expect(user).toHaveProperty("createdAt");
      }
    });

    it("返回副本，修改外部数组不影响内部状态", async () => {
      const p1 = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await p1;
      const originalLength = users.length;
      (users as unknown[]).push({});

      const p2 = getAppUsers();
      await vi.runAllTimersAsync();
      const users2 = await p2;
      expect(users2).toHaveLength(originalLength);
    });

    it("初始数据中包含 active 和 disabled 状态的用户", async () => {
      const p = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await p;
      expect(users.some((u) => u.status === "active")).toBe(true);
      expect(users.some((u) => u.status === "disabled")).toBe(true);
    });
  });

  // ── createAppUser ─────────────────────────────────────────────────────────

  describe("createAppUser", () => {
    it("成功创建用户并返回新用户", async () => {
      const p = createAppUser({
        username: "testuser",
        nickname: "测试用户",
        email: "test@example.com",
      });
      await vi.runAllTimersAsync();
      const user = await p;
      expect(user.username).toBe("testuser");
      expect(user.status).toBe("active");
      expect(user.id).toBeGreaterThan(0);
    });

    it("创建后用户出现在列表中", async () => {
      const cp = createAppUser({
        username: "newuser",
        nickname: "新用户",
        email: "new@example.com",
      });
      await vi.runAllTimersAsync();
      const newUser = await cp;

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await lp;
      expect(users.find((u) => u.id === newUser.id)).toBeDefined();
    });

    it("用户名重复时抛出错误", async () => {
      await Promise.all([
        expect(
          createAppUser({
            username: "zhangsan",
            nickname: "重复",
            email: "dup@example.com",
          }),
        ).rejects.toThrow("已存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── updateAppUserStatus ───────────────────────────────────────────────────

  describe("updateAppUserStatus", () => {
    it("成功将用户状态改为 disabled", async () => {
      // id=1 初始是 active
      const p = updateAppUserStatus(1, "disabled");
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await lp;
      expect(users.find((u) => u.id === 1)?.status).toBe("disabled");
    });

    it("成功将用户状态改为 active", async () => {
      // id=3 初始是 disabled
      const p = updateAppUserStatus(3, "active");
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAppUsers();
      await vi.runAllTimersAsync();
      const users = await lp;
      expect(users.find((u) => u.id === 3)?.status).toBe("active");
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(updateAppUserStatus(9999, "disabled")).rejects.toThrow("不存在"),
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
      const users = await lp;
      expect(users.find((u) => u.id === 1)).toBeUndefined();
    });

    it("删除后列表总数减 1", async () => {
      const beforeP = getAppUsers();
      await vi.runAllTimersAsync();
      const before = await beforeP;
      const beforeCount = before.length;

      const dp = deleteAppUser(2);
      await vi.runAllTimersAsync();
      await dp;

      const afterP = getAppUsers();
      await vi.runAllTimersAsync();
      const after = await afterP;
      expect(after).toHaveLength(beforeCount - 1);
    });

    it("用户不存在时抛出错误", async () => {
      await Promise.all([
        expect(deleteAppUser(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
