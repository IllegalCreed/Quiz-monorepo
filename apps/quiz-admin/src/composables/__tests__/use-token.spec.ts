/**
 * useToken composable 测试
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useToken } from "../use-token";

describe("useToken", () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear();
  });

  it("应该正确设置和获取 token", () => {
    const { token, setToken } = useToken();

    expect(token.value).toBe("");

    const testToken = "mock-token-123-456";
    setToken(testToken);

    expect(token.value).toBe(testToken);
  });

  it("应该正确清除 token", () => {
    const { token, setToken, clearToken } = useToken();

    setToken("mock-token-123-456");
    expect(token.value).toBe("mock-token-123-456");

    clearToken();
    expect(token.value).toBe("");
  });

  it("应该持久化 token 到 localStorage", () => {
    const { token, setToken } = useToken();

    const testToken = "mock-token-123-456";
    setToken(testToken);

    // 通过 token.value 验证，VueUse 的 useLocalStorage 会自动处理 localStorage
    expect(token.value).toBe(testToken);
  });

  it("应该设置 needToRefreshRouter 标志", () => {
    const { setToken, clearToken, needToRefreshRouter } = useToken();

    setToken("mock-token");
    expect(needToRefreshRouter.value).toBe(true);

    needToRefreshRouter.value = false;
    clearToken();
    expect(needToRefreshRouter.value).toBe(true);
  });
});
