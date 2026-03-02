/**
 * useAccountStore 单元测试
 * 测试登录、获取信息、登出流程（Mock 和真实 API 模式）
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";

// Mock 所有 API 模块
vi.mock("@/api/mock/account", () => ({
  login: vi.fn(),
  getInfo: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@/api/account", () => ({
  login: vi.fn(),
  getInfo: vi.fn(),
  logout: vi.fn(),
}));

// Mock useMockStore
const mockIsMock = { value: false };
vi.mock("@/composables/use-mock-store", () => ({
  useMockStore: () => ({ isMock: mockIsMock }),
}));

// Mock useToken
const mockToken = { value: null as string | null };
const mockSetToken = vi.fn((t: string) => {
  mockToken.value = t;
});
const mockClearToken = vi.fn(() => {
  mockToken.value = null;
});
vi.mock("@/composables/use-token", () => ({
  useToken: () => ({
    token: mockToken,
    setToken: mockSetToken,
    clearToken: mockClearToken,
  }),
}));

import { useAccountStore } from "../account";
import * as mockApi from "@/api/mock/account";
import * as realApi from "@/api/account";
import type { AdminUser } from "@/types/account";

const mockLoginMock = vi.mocked(mockApi.login);
const mockGetInfoMock = vi.mocked(mockApi.getInfo);
const mockLogoutMock = vi.mocked(mockApi.logout);
const mockLoginReal = vi.mocked(realApi.login);
const mockGetInfoReal = vi.mocked(realApi.getInfo);
const mockLogoutReal = vi.mocked(realApi.logout);

/** 模拟管理员用户信息 */
const fakeAdmin: AdminUser = {
  id: 1,
  username: "super_admin",
  nickname: "超级管理员",
  role: "super_admin",
  roleId: 1,
  roleName: "超级管理员",
  menuPermissions: ["*"],
  apiPermissions: ["*:*"],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("useAccountStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockToken.value = null;
    mockIsMock.value = false;
  });

  // ─────────────────────────────────────────────────
  // Mock 模式测试
  // ─────────────────────────────────────────────────
  describe("Mock 模式", () => {
    beforeEach(() => {
      mockIsMock.value = true;
    });

    it("login — 调用 Mock API 并保存 token", async () => {
      mockLoginMock.mockResolvedValue("mock-token-123");
      const store = useAccountStore();

      const token = await store.login({ username: "admin", password: "123456" });

      expect(token).toBe("mock-token-123");
      expect(mockLoginMock).toHaveBeenCalledWith({ username: "admin", password: "123456" });
      expect(mockSetToken).toHaveBeenCalledWith("mock-token-123");
    });

    it("getInfo — 调用 Mock API 并缓存用户信息", async () => {
      mockToken.value = "mock-token-123";
      mockGetInfoMock.mockResolvedValue(fakeAdmin);
      const store = useAccountStore();

      const info = await store.getInfo();

      expect(info).toEqual(fakeAdmin);
      expect(mockGetInfoMock).toHaveBeenCalledWith("mock-token-123");
      expect(store.userInfo).toEqual(fakeAdmin);
    });

    it("getInfo — 已缓存时直接返回（不再请求 API）", async () => {
      mockGetInfoMock.mockResolvedValue(fakeAdmin);
      const store = useAccountStore();
      store.userInfo = fakeAdmin;

      const info = await store.getInfo();

      expect(info).toEqual(fakeAdmin);
      expect(mockGetInfoMock).not.toHaveBeenCalled();
    });

    it("logout — 调用 Mock API 并清除状态", async () => {
      mockToken.value = "mock-token-123";
      mockLogoutMock.mockResolvedValue(undefined);
      const store = useAccountStore();
      store.userInfo = fakeAdmin;

      await store.logout();

      expect(mockLogoutMock).toHaveBeenCalledWith("mock-token-123");
      expect(mockClearToken).toHaveBeenCalled();
      expect(store.userInfo).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────
  // 真实 API 模式测试
  // ─────────────────────────────────────────────────
  describe("真实 API 模式", () => {
    it("login — 调用真实 API 并保存 token + 用户信息", async () => {
      mockLoginReal.mockResolvedValue({ token: "real-token-456", admin: fakeAdmin });
      const store = useAccountStore();

      const token = await store.login({ username: "admin", password: "pass" });

      expect(token).toBe("real-token-456");
      expect(mockLoginReal).toHaveBeenCalledWith({ username: "admin", password: "pass" });
      expect(mockSetToken).toHaveBeenCalledWith("real-token-456");
      expect(store.userInfo).toEqual(fakeAdmin);
    });

    it("getInfo — 调用真实 API 并缓存用户信息", async () => {
      mockGetInfoReal.mockResolvedValue(fakeAdmin);
      const store = useAccountStore();

      const info = await store.getInfo();

      expect(info).toEqual(fakeAdmin);
      expect(mockGetInfoReal).toHaveBeenCalled();
      expect(store.userInfo).toEqual(fakeAdmin);
    });

    it("logout — 调用真实 API 并清除状态", async () => {
      mockLogoutReal.mockResolvedValue(undefined);
      const store = useAccountStore();
      store.userInfo = fakeAdmin;

      await store.logout();

      expect(mockLogoutReal).toHaveBeenCalled();
      expect(mockClearToken).toHaveBeenCalled();
      expect(store.userInfo).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────
  // 错误处理
  // ─────────────────────────────────────────────────
  describe("错误处理", () => {
    it("login 失败时抛出错误", async () => {
      mockLoginReal.mockRejectedValue(new Error("用户名或密码错误"));
      const store = useAccountStore();

      await expect(store.login({ username: "admin", password: "wrong" })).rejects.toThrow(
        "用户名或密码错误",
      );
    });

    it("getInfo 失败时抛出错误", async () => {
      mockGetInfoReal.mockRejectedValue(new Error("未登录"));
      const store = useAccountStore();

      await expect(store.getInfo()).rejects.toThrow("未登录");
    });

    it("logout 失败时抛出错误", async () => {
      mockLogoutReal.mockRejectedValue(new Error("网络错误"));
      const store = useAccountStore();

      await expect(store.logout()).rejects.toThrow("网络错误");
    });
  });
});
