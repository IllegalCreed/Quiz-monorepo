/**
 * account mock API 单元测试
 * 测试登录/获取用户信息/登出流程
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 模拟 roles，让 getInfo 中的 inheritPermissionsFromRole 立即返回
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
      id: 3,
      name: "用户管理员",
      isSystem: false,
      menuPermissions: ["dashboard", "users"],
      apiPermissions: ["users:list", "users:create"],
    },
  ]),
}));

describe("account mock API", () => {
  let login: (typeof import("../account"))["login"];
  let getInfo: (typeof import("../account"))["getInfo"];
  let logout: (typeof import("../account"))["logout"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../account");
    login = module.login;
    getInfo = module.getInfo;
    logout = module.logout;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("正确账号密码登录返回 token", async () => {
      const p = login({ username: "super_admin", password: "super_admin" });
      await vi.runAllTimersAsync();
      const token = await p;
      expect(token).toMatch(/^mock-token-\d+-\d+$/);
    });

    it("token 包含用户 ID", async () => {
      const p = login({ username: "super_admin", password: "super_admin" });
      await vi.runAllTimersAsync();
      const token = await p;
      // super_admin 的 id = 1
      expect(token).toContain("mock-token-1-");
    });

    it("普通管理员登录成功", async () => {
      const p = login({ username: "admin", password: "admin" });
      await vi.runAllTimersAsync();
      const token = await p;
      expect(token).toMatch(/^mock-token-2-\d+$/);
    });

    it("用户名错误时抛出错误", async () => {
      await Promise.all([
        expect(login({ username: "unknown", password: "unknown" })).rejects.toThrow(
          "账号或密码错误",
        ),
        vi.runAllTimersAsync(),
      ]);
    });

    it("密码错误时抛出错误", async () => {
      await Promise.all([
        expect(login({ username: "admin", password: "wrong_password" })).rejects.toThrow(
          "账号或密码错误",
        ),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── getInfo ────────────────────────────────────────────────────────────────

  describe("getInfo", () => {
    it("有效 token 返回用户信息", async () => {
      // 先登录获取 token
      const loginP = login({ username: "super_admin", password: "super_admin" });
      await vi.runAllTimersAsync();
      const token = await loginP;

      const infoP = getInfo(token);
      await vi.runAllTimersAsync();
      const info = await infoP;
      expect(info.username).toBe("super_admin");
      expect(info.id).toBe(1);
    });

    it("超级管理员继承角色权限", async () => {
      const loginP = login({ username: "super_admin", password: "super_admin" });
      await vi.runAllTimersAsync();
      const token = await loginP;

      const infoP = getInfo(token);
      await vi.runAllTimersAsync();
      const info = await infoP;
      expect(info.menuPermissions).toContain("*");
      expect(info.apiPermissions).toContain("*");
    });

    it("普通管理员继承对应角色权限", async () => {
      const loginP = login({ username: "admin", password: "admin" });
      await vi.runAllTimersAsync();
      const token = await loginP;

      const infoP = getInfo(token);
      await vi.runAllTimersAsync();
      const info = await infoP;
      expect(info.menuPermissions).toContain("users");
      expect(info.apiPermissions).toContain("users:list");
    });

    it("无效 token 格式时抛出错误", async () => {
      await Promise.all([
        expect(getInfo("invalid-token")).rejects.toThrow("未登录或登录已过期"),
        vi.runAllTimersAsync(),
      ]);
    });

    it("token 中 userId 不存在时抛出错误", async () => {
      // 构造格式正确但 userId 不在数据库的 token
      await Promise.all([
        expect(getInfo("mock-token-9999-12345")).rejects.toThrow("未登录或登录已过期"),
        vi.runAllTimersAsync(),
      ]);
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("登出不抛出错误", async () => {
      const p = logout("mock-token-1-12345");
      await vi.runAllTimersAsync();
      await expect(p).resolves.toBeUndefined();
    });
  });
});
