/**
 * roles mock API 单元测试
 * 每个测试通过 vi.resetModules() 获得独立的 mockRoles 状态
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Role } from "@/types/role";
import type { AdminUser } from "@/types/account";

// 拦截 deleteRole 内的动态 import("./admins")，避免循环依赖
vi.mock("../admins", () => ({
  getAdminUsers: vi.fn().mockResolvedValue([]),
}));

describe("roles mock API", () => {
  // 每次测试前重置模块，获得全新的 mockRoles 数组和 nextId
  let getRoles: (typeof import("../roles"))["getRoles"];
  let createRole: (typeof import("../roles"))["createRole"];
  let updateRole: (typeof import("../roles"))["updateRole"];
  let deleteRole: (typeof import("../roles"))["deleteRole"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../roles");
    getRoles = module.getRoles;
    createRole = module.createRole;
    updateRole = module.updateRole;
    deleteRole = module.deleteRole;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getRoles ──────────────────────────────────────────────────────────────

  describe("getRoles", () => {
    it("返回初始 4 个角色", async () => {
      const p = getRoles();
      await vi.runAllTimersAsync();
      const roles = await p;
      expect(roles).toHaveLength(4);
    });

    it("每个角色包含必要字段", async () => {
      const p = getRoles();
      await vi.runAllTimersAsync();
      const roles = await p;
      for (const role of roles) {
        expect(role).toHaveProperty("id");
        expect(role).toHaveProperty("name");
        expect(role).toHaveProperty("isSystem");
        expect(role).toHaveProperty("menuPermissions");
        expect(role).toHaveProperty("apiPermissions");
      }
    });

    it("返回副本，修改不影响内部状态", async () => {
      const p1 = getRoles();
      await vi.runAllTimersAsync();
      const roles = await p1;
      const originalLength = roles.length;
      roles.push({} as unknown as Role);

      const p2 = getRoles();
      await vi.runAllTimersAsync();
      const roles2 = await p2;
      expect(roles2).toHaveLength(originalLength);
    });
  });

  // ── createRole ─────────────────────────────────────────────────────────────

  describe("createRole", () => {
    it("成功创建角色并返回新角色", async () => {
      const p = createRole({
        name: "测试角色",
        description: "单元测试",
        menuPermissions: ["dashboard"],
        apiPermissions: [],
      });
      await vi.runAllTimersAsync();
      const role = await p;
      expect(role.name).toBe("测试角色");
      expect(role.isSystem).toBe(false);
      expect(role.id).toBeGreaterThan(0);
    });

    it("创建后角色出现在列表中", async () => {
      const cp = createRole({
        name: "新角色",
        description: "",
        menuPermissions: [],
        apiPermissions: [],
      });
      await vi.runAllTimersAsync();
      const newRole = await cp;

      const lp = getRoles();
      await vi.runAllTimersAsync();
      const roles = await lp;
      expect(roles.find((r) => r.id === newRole.id)).toBeDefined();
    });

    it("名称重复时抛出错误", async () => {
      await Promise.all([
        expect(
          createRole({
            name: "超级管理员",
            description: "",
            menuPermissions: [],
            apiPermissions: [],
          }),
        ).rejects.toThrow("已存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── updateRole ─────────────────────────────────────────────────────────────

  describe("updateRole", () => {
    it("成功更新非系统角色", async () => {
      // 角色 id=2 是非系统角色
      const p = updateRole(2, { name: "内容管理员V2", description: "更新描述" });
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getRoles();
      await vi.runAllTimersAsync();
      const roles = await lp;
      expect(roles.find((r) => r.id === 2)?.name).toBe("内容管理员V2");
    });

    it("更新不存在的角色时抛出错误", async () => {
      await Promise.all([
        expect(updateRole(9999, { name: "不存在" })).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("更新系统内置角色时抛出错误", async () => {
      await Promise.all([
        expect(updateRole(1, { name: "修改内置" })).rejects.toThrow("系统内置角色不可修改"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("名称与其他角色重复时抛出错误", async () => {
      await Promise.all([
        expect(updateRole(2, { name: "用户管理员" })).rejects.toThrow("已存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── deleteRole ─────────────────────────────────────────────────────────────

  describe("deleteRole", () => {
    it("成功删除无人使用的非系统角色", async () => {
      // getAdminUsers mock 返回空数组，角色无人使用
      const p = deleteRole(2);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getRoles();
      await vi.runAllTimersAsync();
      const roles = await lp;
      expect(roles.find((r) => r.id === 2)).toBeUndefined();
    });

    it("删除不存在的角色时抛出错误", async () => {
      await Promise.all([
        expect(deleteRole(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("删除系统内置角色时抛出错误", async () => {
      await Promise.all([
        expect(deleteRole(1)).rejects.toThrow("系统内置角色不可删除"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("角色被管理员使用时拒绝删除", async () => {
      const { getAdminUsers } = await import("../admins");
      vi.mocked(getAdminUsers).mockResolvedValueOnce([
        { id: 1, roleId: 2 } as unknown as AdminUser,
        { id: 2, roleId: 2 } as unknown as AdminUser,
      ]);

      await Promise.all([
        expect(deleteRole(2)).rejects.toThrow("2 个管理员"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
