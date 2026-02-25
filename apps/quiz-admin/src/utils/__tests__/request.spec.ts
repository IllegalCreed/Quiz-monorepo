/**
 * request 工具函数单元测试
 * 测试 HTTP 封装：鉴权头、方法快捷函数、错误处理
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { request, get, post, put, patch, del } from "../request";

// 模拟全局 fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/** 构造成功响应 */
const makeOkResponse = (data: unknown) => ({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ data }),
});

/** 构造失败响应 */
const makeErrResponse = (status: number, message?: string) => ({
  ok: false,
  status,
  json: () => Promise.resolve({ data: null, message }),
});

describe("request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("成功时返回 data 字段", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ id: 1 }));
    const result = await request<{ id: number }>("/test");
    expect(result).toEqual({ id: 1 });
  });

  it("URL 包含传入路径", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/users");
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/users");
  });

  it("默认包含 Content-Type: application/json", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test");
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((config.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
  });

  it("localStorage 有 token 时自动携带 Authorization 头", async () => {
    localStorage.setItem("admin-token", "my-jwt-token");
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test");
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((config.headers as Record<string, string>).Authorization).toBe("Bearer my-jwt-token");
  });

  it("localStorage 无 token 时不添加 Authorization 头", async () => {
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test");
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((config.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("skipAuth=true 时不添加 Authorization 头（即使有 token）", async () => {
    localStorage.setItem("admin-token", "my-jwt-token");
    mockFetch.mockResolvedValue(makeOkResponse(null));
    await request("/test", { skipAuth: true });
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((config.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("HTTP 非 ok 时抛出响应中的 message", async () => {
    mockFetch.mockResolvedValue(makeErrResponse(403, "权限不足"));
    await expect(request("/test")).rejects.toThrow("权限不足");
  });

  it("HTTP 非 ok 且无 message 时抛出含状态码的错误", async () => {
    mockFetch.mockResolvedValue(makeErrResponse(500));
    await expect(request("/test")).rejects.toThrow("500");
  });
});

describe("HTTP 方法快捷函数", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(makeOkResponse(null));
  });

  it("get 使用 GET 方法", async () => {
    await get("/test");
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("GET");
  });

  it("post 使用 POST 方法并序列化 body", async () => {
    await post("/test", { name: "张三" });
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("POST");
    expect(JSON.parse(config.body as string)).toEqual({ name: "张三" });
  });

  it("put 使用 PUT 方法并序列化 body", async () => {
    await put("/test", { id: 1 });
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("PUT");
    expect(JSON.parse(config.body as string)).toEqual({ id: 1 });
  });

  it("patch 使用 PATCH 方法并序列化 body", async () => {
    await patch("/test", { status: true });
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("PATCH");
    expect(JSON.parse(config.body as string)).toEqual({ status: true });
  });

  it("del 使用 DELETE 方法", async () => {
    await del("/test");
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("DELETE");
  });
});
