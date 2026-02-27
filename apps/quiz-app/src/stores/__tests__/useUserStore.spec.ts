/**
 * useUserStore 单元测试
 *
 * mock auth API，验证 store 状态管理逻辑
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// mock auth API
vi.mock("@/api/auth", () => ({
  login: vi.fn(),
  register: vi.fn(),
  getUserInfo: vi.fn(),
}));

import { useUserStore } from "../useUserStore";
import * as authApi from "@/api/auth";

const mockLogin = vi.mocked(authApi.login);
const mockRegister = vi.mocked(authApi.register);
const mockGetUserInfo = vi.mocked(authApi.getUserInfo);

/** 模拟用户信息 */
const fakeUser = {
  id: 1,
  username: "testuser",
  nickname: "测试用户",
  email: null,
  status: "ACTIVE" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("useUserStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("初始状态：未登录", () => {
    const store = useUserStore();
    expect(store.isLoggedIn).toBe(false);
    expect(store.userInfo).toBeNull();
    expect(store.token).toBe("");
  });

  describe("login", () => {
    it("登录成功后存储 token 和用户信息", async () => {
      mockLogin.mockResolvedValue({ token: "jwt-123", user: fakeUser });
      const store = useUserStore();

      await store.login({ username: "testuser", password: "123456" });

      expect(store.token).toBe("jwt-123");
      expect(store.userInfo).toEqual(fakeUser);
      expect(store.isLoggedIn).toBe(true);
    });

    it("登录成功后 token 持久化到 localStorage", async () => {
      mockLogin.mockResolvedValue({ token: "jwt-123", user: fakeUser });
      const store = useUserStore();

      await store.login({ username: "testuser", password: "123456" });

      expect(localStorage.getItem("quiz-user-token")).toBe("jwt-123");
    });

    it("登录失败时抛出错误，状态不变", async () => {
      mockLogin.mockRejectedValue(new Error("账号或密码错误"));
      const store = useUserStore();

      await expect(store.login({ username: "wrong", password: "wrong" })).rejects.toThrow(
        "账号或密码错误",
      );
      expect(store.isLoggedIn).toBe(false);
    });
  });

  describe("register", () => {
    it("注册成功后存储 token 和用户信息", async () => {
      mockRegister.mockResolvedValue({ token: "jwt-456", user: fakeUser });
      const store = useUserStore();

      await store.register({ username: "newuser", password: "abcdef" });

      expect(store.token).toBe("jwt-456");
      expect(store.userInfo).toEqual(fakeUser);
      expect(store.isLoggedIn).toBe(true);
    });
  });

  describe("logout", () => {
    it("清空 token 和用户信息", async () => {
      mockLogin.mockResolvedValue({ token: "jwt-123", user: fakeUser });
      const store = useUserStore();
      await store.login({ username: "testuser", password: "123456" });

      store.logout();

      expect(store.token).toBe("");
      expect(store.userInfo).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });
  });

  describe("fetchUserInfo", () => {
    it("有 token 时获取用户信息", async () => {
      mockGetUserInfo.mockResolvedValue(fakeUser);
      const store = useUserStore();
      store.token = "existing-token";

      await store.fetchUserInfo();

      expect(store.userInfo).toEqual(fakeUser);
      expect(store.isLoggedIn).toBe(true);
    });

    it("无 token 时不发请求", async () => {
      const store = useUserStore();
      await store.fetchUserInfo();
      expect(mockGetUserInfo).not.toHaveBeenCalled();
    });

    it("token 失效时静默清空状态", async () => {
      mockGetUserInfo.mockRejectedValue(new Error("未登录"));
      const store = useUserStore();
      store.token = "expired-token";

      await store.fetchUserInfo();

      expect(store.token).toBe("");
      expect(store.userInfo).toBeNull();
      expect(store.isLoggedIn).toBe(false);
    });
  });
});
