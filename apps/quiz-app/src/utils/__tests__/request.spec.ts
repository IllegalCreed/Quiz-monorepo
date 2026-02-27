/**
 * request 统一请求封装单元测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { request, get, post, put, setOn401Handler } from "../request";

// 模拟全局 fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/** 构造成功响应 */
function makeOkResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ code: 0, message: "ok", data }),
  };
}

/** 构造指定状态码的失败响应 */
function makeErrorResponse(status: number, message = "error") {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
  };
}

describe("request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 重置 401 handler
    setOn401Handler(() => {});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("发送请求到正确的 URL", async () => {
    mockFetch.mockResolvedValue(makeOkResponse("ok"));
    await request("/test");
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/test"), expect.any(Object));
  });

  it("自动解包 data 字段", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ id: 1 }));
    const result = await request("/test");
    expect(result).toEqual({ id: 1 });
  });

  it("有 token 时自动注入 Authorization 头", async () => {
    localStorage.setItem("quiz-user-token", "test-token");
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("无 token 时不注入 Authorization 头", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test");

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
  });

  it("POST 请求自动设置 Content-Type: application/json", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("401 响应时调用 on401Handler 并抛出错误", async () => {
    const handler = vi.fn();
    setOn401Handler(handler);
    mockFetch.mockResolvedValue(makeErrorResponse(401));

    await expect(request("/test")).rejects.toThrow("未登录或登录已过期");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("非 2xx 响应时抛出错误（包含后端 message）", async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(400, "用户名已存在"));
    await expect(request("/test")).rejects.toThrow("用户名已存在");
  });

  it("非 2xx 且无法解析 JSON 时使用默认错误信息", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("parse error")),
    });
    await expect(request("/test")).rejects.toThrow("请求失败 (500)");
  });
});

describe("get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("使用 GET 方法", async () => {
    mockFetch.mockResolvedValue(makeOkResponse([]));
    await get("/items");
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    // GET 请求不带 method（或 undefined）
    expect(options.method).toBeUndefined();
  });
});

describe("post", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("使用 POST 方法并序列化 body", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await post("/create", { name: "test" });

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toEqual({ name: "test" });
  });
});

describe("put", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("使用 PUT 方法并序列化 body", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await put("/update", { id: 1 });

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body as string)).toEqual({ id: 1 });
  });
});
