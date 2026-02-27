/**
 * questions API 单元测试
 *
 * mock request 模块，验证 API 函数调用正确端点
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock request 模块
vi.mock("@/utils/request", () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

import { fetchQuestions, submitAnswer } from "../questions";
import { get, post } from "@/utils/request";

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);

describe("fetchQuestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("成功返回题目数组", async () => {
    const mockData = [{ id: 1, stem: "题目1", options: [] }];
    mockGet.mockResolvedValue(mockData);

    const result = await fetchQuestions(1);
    expect(result).toEqual(mockData);
  });

  it("默认 limit 为 1，URL 包含 limit=1", async () => {
    mockGet.mockResolvedValue([]);
    await fetchQuestions();
    expect(mockGet).toHaveBeenCalledWith("/questions?limit=1");
  });

  it("自定义 limit 时 URL 携带对应参数", async () => {
    mockGet.mockResolvedValue([]);
    await fetchQuestions(5);
    expect(mockGet).toHaveBeenCalledWith("/questions?limit=5");
  });

  it("请求失败时抛出错误", async () => {
    mockGet.mockRejectedValue(new Error("请求失败 (500)"));
    await expect(fetchQuestions()).rejects.toThrow("请求失败 (500)");
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
    mockPost.mockResolvedValue(mockResult);

    const result = await submitAnswer(1, 1);
    expect(result).toEqual(mockResult);
  });

  it("调用 POST /answers 并传递正确参数", async () => {
    mockPost.mockResolvedValue({});
    await submitAnswer(42, 7, 1500);
    expect(mockPost).toHaveBeenCalledWith("/answers", {
      questionId: 42,
      selectedOptionId: 7,
      elapsedMs: 1500,
    });
  });

  it("elapsedMs 可选，不传时为 undefined", async () => {
    mockPost.mockResolvedValue({});
    await submitAnswer(1, 2);
    expect(mockPost).toHaveBeenCalledWith("/answers", {
      questionId: 1,
      selectedOptionId: 2,
      elapsedMs: undefined,
    });
  });

  it("请求失败时抛出错误", async () => {
    mockPost.mockRejectedValue(new Error("请求失败"));
    await expect(submitAnswer(1, 1)).rejects.toThrow("请求失败");
  });
});
