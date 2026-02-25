/**
 * questions API 单元测试
 * 使用 vi.stubGlobal 模拟 fetch
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchQuestions, submitAnswer } from "../questions";

// 模拟全局 fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/** 构造成功响应 */
const makeOkResponse = (data: unknown) => ({
  ok: true,
  json: () => Promise.resolve({ code: 0, message: "ok", data }),
});

/** 构造失败响应 */
const makeErrResponse = () => ({
  ok: false,
  json: () => Promise.resolve({ code: 1, message: "error" }),
});

describe("fetchQuestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("成功返回题目数组", async () => {
    const mockData = [{ id: 1, stem: "题目1", options: [] }];
    mockFetch.mockResolvedValue(makeOkResponse(mockData));

    const result = await fetchQuestions(1);
    expect(result).toEqual(mockData);
  });

  it("默认 limit 为 1，URL 包含 limit=1", async () => {
    mockFetch.mockResolvedValue(makeOkResponse([]));
    await fetchQuestions();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("limit=1"));
  });

  it("自定义 limit 时 URL 携带对应参数", async () => {
    mockFetch.mockResolvedValue(makeOkResponse([]));
    await fetchQuestions(5);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"));
  });

  it("HTTP 响应非 ok 时抛出 'Failed to fetch questions'", async () => {
    mockFetch.mockResolvedValue(makeErrResponse());
    await expect(fetchQuestions()).rejects.toThrow("Failed to fetch questions");
  });
});

describe("submitAnswer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("成功提交并返回判定结果", async () => {
    const mockResult = {
      correct: true,
      correctOptionId: 1,
      explanation: null,
      options: [],
    };
    mockFetch.mockResolvedValue(makeOkResponse(mockResult));

    const result = await submitAnswer(1, 1);
    expect(result).toEqual(mockResult);
  });

  it("请求使用 POST 方法", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}));
    await submitAnswer(1, 1);
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(config.method).toBe("POST");
  });

  it("请求 body 包含 questionId 和 selectedOptionId", async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}));
    await submitAnswer(42, 7, 1500);
    const [, config] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(config.body as string);
    expect(body).toMatchObject({ questionId: 42, selectedOptionId: 7, elapsedMs: 1500 });
  });

  it("HTTP 响应非 ok 时抛出 'Failed to submit answer'", async () => {
    mockFetch.mockResolvedValue(makeErrResponse());
    await expect(submitAnswer(1, 1)).rejects.toThrow("Failed to submit answer");
  });
});
