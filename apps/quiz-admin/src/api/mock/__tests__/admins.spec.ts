/**
 * admins mock API 单元测试
 * admins.ts 依赖 roles，通过 vi.mock 隔离角色数据
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 提供稳定的角色数据，屏蔽 roles 模块的内部状态
vi.mock("../roles", () => ({
  getRoles: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "超级管理员",
      isSystem: true,
      menuPermissions: ["*"],
      apiPermissions: ["*"],
    },
    {
      id: 2,
      name: "内容管理员",
      isSystem: true,
      menuPermissions: ["dashboard", "questions"],
      apiPermissions: ["questions:list", "questions:create"],
    },
    {
      id: 3,
      name: "用户管理员",
      isSystem: false,
      menuPermissions: ["dashboard", "users"],
      apiPermissions: ["users:list", "users:create"],
    },
    {
      id: 4,
      name: "只读管理员",
      isSystem: false,
      menuPermissions: ["dashboard"],
      apiPermissions: [],
    },
  ]),
}));

describe("admins mock API", () => {
  let getAdminUsers: (typeof import("../admins"))["getAdminUsers"];
  let createAdmin: (typeof import("../admins"))["createAdmin"];
  let updateAdminRole: (typeof import("../admins"))["updateAdminRole"];
  let deleteAdmin: (typeof import("../admins"))["deleteAdmin"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../admins");
    getAdminUsers = module.getAdminUsers;
    createAdmin = module.createAdmin;
    updateAdminRole = module.updateAdminRole;
    deleteAdmin = module.deleteAdmin;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── getAdminUsers ─────────────────────────────────────────────────────────

  describe("getAdminUsers", () => {
    it("返回初始 3 个管理员", async () => {
      const p = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await p;
      expect(admins).toHaveLength(3);
    });

    it("每个管理员包含必要字段", async () => {
      const p = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await p;
      for (const admin of admins) {
        expect(admin).toHaveProperty("id");
        expect(admin).toHaveProperty("username");
        expect(admin).toHaveProperty("nickname");
        expect(admin).toHaveProperty("roleId");
        expect(admin).toHaveProperty("menuPermissions");
        expect(admin).toHaveProperty("apiPermissions");
      }
    });

    it("超级管理员继承 * 权限", async () => {
      const p = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await p;
      const superAdmin = admins.find((a) => a.username === "super_admin");
      expect(superAdmin?.menuPermissions).toContain("*");
      expect(superAdmin?.apiPermissions).toContain("*");
    });

    it("普通管理员继承对应角色权限", async () => {
      const p = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await p;
      // admin 对应 roleId=3（用户管理员）
      const admin = admins.find((a) => a.username === "admin");
      expect(admin?.menuPermissions).toContain("users");
      expect(admin?.apiPermissions).toContain("users:list");
    });
  });

  // ── createAdmin ───────────────────────────────────────────────────────────

  describe("createAdmin", () => {
    it("成功创建管理员并返回含权限的数据", async () => {
      const p = createAdmin({
        username: "new_admin",
        nickname: "新管理员",
        roleId: 3,
      });
      await vi.runAllTimersAsync();
      const admin = await p;
      expect(admin.username).toBe("new_admin");
      expect(admin.id).toBeGreaterThan(0);
      expect(admin.menuPermissions).toBeDefined();
    });

    it("创建后管理员出现在列表中", async () => {
      const cp = createAdmin({ username: "test_admin", nickname: "测试", roleId: 3 });
      await vi.runAllTimersAsync();
      const newAdmin = await cp;

      const lp = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await lp;
      expect(admins.find((a) => a.id === newAdmin.id)).toBeDefined();
    });

    it("用户名重复时抛出错误", async () => {
      await Promise.all([
        expect(
          createAdmin({ username: "super_admin", nickname: "重复", roleId: 3 }),
        ).rejects.toThrow("已存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("角色 ID 不存在时抛出错误", async () => {
      await Promise.all([
        expect(
          createAdmin({ username: "new_admin", nickname: "新管理员", roleId: 9999 }),
        ).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── updateAdminRole ───────────────────────────────────────────────────────

  describe("updateAdminRole", () => {
    it("成功更新普通管理员的角色", async () => {
      // admin(id=2) 当前是 roleId=3，改为 roleId=4
      const p = updateAdminRole(2, 4);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      // 验证列表中角色已更新
      const lp = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await lp;
      const admin = admins.find((a) => a.id === 2);
      expect(admin?.roleId).toBe(4);
    });

    it("更新不存在的管理员时抛出错误", async () => {
      await Promise.all([
        expect(updateAdminRole(9999, 3)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("修改超级管理员角色时抛出错误", async () => {
      await Promise.all([
        expect(updateAdminRole(1, 3)).rejects.toThrow("不可修改"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("新角色 ID 不存在时抛出错误", async () => {
      await Promise.all([
        expect(updateAdminRole(2, 9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── deleteAdmin ───────────────────────────────────────────────────────────

  describe("deleteAdmin", () => {
    it("成功删除普通管理员", async () => {
      // editor(id=3) 是普通管理员
      const p = deleteAdmin(3);
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();

      const lp = getAdminUsers();
      await vi.runAllTimersAsync();
      const admins = await lp;
      expect(admins.find((a) => a.id === 3)).toBeUndefined();
    });

    it("删除不存在的管理员时抛出错误", async () => {
      await Promise.all([
        expect(deleteAdmin(9999)).rejects.toThrow("不存在"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("删除超级管理员时抛出错误", async () => {
      await Promise.all([
        expect(deleteAdmin(1)).rejects.toThrow("不可被删除"),
        vi.runAllTimersAsync(),
      ]);
    });
  });
});
