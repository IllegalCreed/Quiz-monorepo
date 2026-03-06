/**
 * Dashboard Mock API 单元测试
 * 验证 mock 数据结构与真实 API 类型一致
 */
import { describe, it, expect } from "vitest";
import { getDashboard } from "../dashboard";

describe("Dashboard Mock API", () => {
  it("getDashboard 应返回完整数据结构", async () => {
    const data = await getDashboard();

    // 概览
    expect(data.overview).toBeDefined();
    expect(data.overview.questions).toHaveProperty("total");
    expect(data.overview.questions).toHaveProperty("today");
    expect(data.overview.users).toHaveProperty("total");
    expect(data.overview.users).toHaveProperty("today");
    expect(data.overview.attempts).toHaveProperty("total");
    expect(data.overview.attempts).toHaveProperty("today");
    expect(data.overview.accuracy).toHaveProperty("total");
    expect(data.overview.accuracy).toHaveProperty("today");
  });

  it("近7天趋势应有 7 个数据点", async () => {
    const data = await getDashboard();

    expect(data.dailyTrend).toHaveLength(7);
    for (const item of data.dailyTrend) {
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof item.attempts).toBe("number");
      expect(typeof item.correct).toBe("number");
      expect(item.correct).toBeLessThanOrEqual(item.attempts);
    }
  });

  it("分类分布应有 10 条数据", async () => {
    const data = await getDashboard();

    expect(data.categoryDistribution).toHaveLength(10);
    for (const item of data.categoryDistribution) {
      expect(item.categoryId).toBeGreaterThan(0);
      expect(item.categoryName).toContain("/");
      expect(item.questionCount).toBeGreaterThan(0);
    }
  });

  it("最近日志应有 10 条数据", async () => {
    const data = await getDashboard();

    expect(data.recentLogs).toHaveLength(10);
    for (const log of data.recentLogs) {
      expect(log.id).toBeGreaterThan(0);
      expect(typeof log.module).toBe("string");
      expect(typeof log.action).toBe("string");
      expect(typeof log.success).toBe("boolean");
      expect(typeof log.createdAt).toBe("string");
    }
  });

  it("正确率应在 0-100 范围内", async () => {
    const data = await getDashboard();

    expect(data.overview.accuracy.total).toBeGreaterThanOrEqual(0);
    expect(data.overview.accuracy.total).toBeLessThanOrEqual(100);
    expect(data.overview.accuracy.today).toBeGreaterThanOrEqual(0);
    expect(data.overview.accuracy.today).toBeLessThanOrEqual(100);
  });

  it("分类分布应按题目数降序", async () => {
    const data = await getDashboard();

    for (let i = 1; i < data.categoryDistribution.length; i++) {
      expect(data.categoryDistribution[i]!.questionCount).toBeLessThanOrEqual(
        data.categoryDistribution[i - 1]!.questionCount,
      );
    }
  });
});
