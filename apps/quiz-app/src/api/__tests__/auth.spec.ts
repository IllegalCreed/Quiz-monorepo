/**
 * auth API 单元测试
 *
 * mock request 模块，验证 API 函数调用正确端点
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock request 模块
vi.mock("@/utils/request", () => ({
  post: vi.fn(),
  get: vi.fn(),
}));

import { login, register, getUserInfo } from "../auth";
import { post, get } from "@/utils/request";

const mockPost = vi.mocked(post);
const mockGet = vi.mocked(get);

describe("auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("调用 POST /user/auth/login", async () => {
      const form = { username: "testuser", password: "123456" };
      const response = { token: "jwt-token", user: { id: 1, username: "testuser" } };
      mockPost.mockResolvedValue(response);

      const result = await login(form);
      expect(mockPost).toHaveBeenCalledWith("/user/auth/login", form);
      expect(result).toEqual(response);
    });
  });

  describe("register", () => {
    it("调用 POST /user/auth/register", async () => {
      const form = { username: "newuser", password: "123456", nickname: "新用户" };
      const response = { token: "jwt-token", user: { id: 2, username: "newuser" } };
      mockPost.mockResolvedValue(response);

      const result = await register(form);
      expect(mockPost).toHaveBeenCalledWith("/user/auth/register", form);
      expect(result).toEqual(response);
    });

    it("可选字段不传时仅发送必填字段", async () => {
      const form = { username: "user2", password: "abcdef" };
      mockPost.mockResolvedValue({ token: "t", user: {} });

      await register(form);
      expect(mockPost).toHaveBeenCalledWith("/user/auth/register", form);
    });
  });

  describe("getUserInfo", () => {
    it("调用 GET /user/auth/info", async () => {
      const userInfo = { id: 1, username: "test", nickname: null, email: null };
      mockGet.mockResolvedValue(userInfo);

      const result = await getUserInfo();
      expect(mockGet).toHaveBeenCalledWith("/user/auth/info");
      expect(result).toEqual(userInfo);
    });
  });
});
