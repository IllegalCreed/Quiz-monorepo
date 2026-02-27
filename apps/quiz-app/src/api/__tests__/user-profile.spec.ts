/**
 * user-profile API 单元测试
 *
 * mock request 模块，验证 API 函数调用正确端点和参数
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// mock request 模块
vi.mock("@/utils/request", () => ({
  get: vi.fn(),
  put: vi.fn(),
}));

import { fetchHistory, fetchPreferences, updatePreferences } from "../user-profile";
import { get, put } from "@/utils/request";

const mockGet = vi.mocked(get);
const mockPut = vi.mocked(put);

describe("user-profile API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchHistory", () => {
    it("默认参数调用 GET /user/history?page=1&pageSize=20", async () => {
      mockGet.mockResolvedValue({ total: 0, items: [] });
      await fetchHistory();
      expect(mockGet).toHaveBeenCalledWith("/user/history?page=1&pageSize=20");
    });

    it("自定义分页参数", async () => {
      mockGet.mockResolvedValue({ total: 0, items: [] });
      await fetchHistory(3, 10);
      expect(mockGet).toHaveBeenCalledWith("/user/history?page=3&pageSize=10");
    });

    it("返回分页数据", async () => {
      const mockData = {
        total: 50,
        items: [{ id: 1, questionId: 1, correct: true }],
      };
      mockGet.mockResolvedValue(mockData);
      const result = await fetchHistory();
      expect(result).toEqual(mockData);
    });
  });

  describe("fetchPreferences", () => {
    it("调用 GET /user/preferences", async () => {
      mockGet.mockResolvedValue([]);
      await fetchPreferences();
      expect(mockGet).toHaveBeenCalledWith("/user/preferences");
    });
  });

  describe("updatePreferences", () => {
    it("调用 PUT /user/preferences 并传递 categoryIds", async () => {
      mockPut.mockResolvedValue([]);
      await updatePreferences([1, 2, 3]);
      expect(mockPut).toHaveBeenCalledWith("/user/preferences", {
        categoryIds: [1, 2, 3],
      });
    });

    it("空数组清空偏好", async () => {
      mockPut.mockResolvedValue([]);
      await updatePreferences([]);
      expect(mockPut).toHaveBeenCalledWith("/user/preferences", {
        categoryIds: [],
      });
    });
  });
});
