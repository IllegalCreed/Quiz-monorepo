/**
 * categories API 单元测试
 *
 * mock request 模块，验证 API 函数调用正确端点
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock request 模块
vi.mock("@/utils/request", () => ({
  get: vi.fn(),
}));

import { fetchCategoryGroups } from "../categories";
import { get } from "@/utils/request";

const mockGet = vi.mocked(get);

describe("fetchCategoryGroups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("调用 GET /categories/groups", async () => {
    const mockData = [{ id: 1, name: "技术方向", sort: 0, categories: [] }];
    mockGet.mockResolvedValue(mockData);

    const result = await fetchCategoryGroups();
    expect(mockGet).toHaveBeenCalledWith("/categories/groups");
    expect(result).toEqual(mockData);
  });
});
