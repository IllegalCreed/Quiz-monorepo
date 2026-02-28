/**
 * system-logs mock API 单元测试
 * 测试筛选（type / actorType / success）、分页、排序及字段完整性
 * Mock 数据共 15 条，与 seed-logs.ts 对齐
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("system-logs mock API", () => {
  /** 每个测试重新导入模块，确保状态隔离 */
  let getSystemLogs: (typeof import("../system-logs"))["getSystemLogs"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../system-logs");
    getSystemLogs = module.getSystemLogs;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── 无筛选 ──────────────────────────────────────────────────────────────────

  it("无筛选时返回全部 15 条日志", async () => {
    const p = getSystemLogs();
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result.total).toBe(15);
    expect(result.items).toHaveLength(15);
  });

  // ── type 筛选 ───────────────────────────────────────────────────────────────

  describe("type 筛选", () => {
    it("筛选 LOGIN 类型日志", async () => {
      const p = getSystemLogs({ type: "LOGIN" });
      await vi.runAllTimersAsync();
      const result = await p;
      // LOGIN 类型共 6 条（id: 1-5, 15）
      expect(result.total).toBe(6);
      for (const log of result.items) {
        expect(log.type).toBe("LOGIN");
      }
    });

    it("筛选 API_MUTATION 类型日志", async () => {
      const p = getSystemLogs({ type: "API_MUTATION" });
      await vi.runAllTimersAsync();
      const result = await p;
      // API_MUTATION 类型共 9 条（id: 6-14）
      expect(result.total).toBe(9);
      for (const log of result.items) {
        expect(log.type).toBe("API_MUTATION");
      }
    });
  });

  // ── actorType 筛选 ─────────────────────────────────────────────────────────

  describe("actorType 筛选", () => {
    it("筛选 ADMIN 操作者日志", async () => {
      const p = getSystemLogs({ actorType: "ADMIN" });
      await vi.runAllTimersAsync();
      const result = await p;
      // ADMIN 操作者共 12 条（id: 1-3, 6-14）
      expect(result.total).toBe(12);
      for (const log of result.items) {
        expect(log.actorType).toBe("ADMIN");
      }
    });

    it("筛选 USER 操作者日志", async () => {
      const p = getSystemLogs({ actorType: "USER" });
      await vi.runAllTimersAsync();
      const result = await p;
      // USER 操作者共 3 条（id: 4, 5, 15）
      expect(result.total).toBe(3);
      for (const log of result.items) {
        expect(log.actorType).toBe("USER");
      }
    });
  });

  // ── success 筛选 ───────────────────────────────────────────────────────────

  describe("success 筛选", () => {
    it("筛选成功日志（success = 'true'）", async () => {
      const p = getSystemLogs({ success: "true" });
      await vi.runAllTimersAsync();
      const result = await p;
      // 成功日志共 11 条（id: 1,3,4,6,7,8,9,11,13,14,15）
      expect(result.total).toBe(11);
      for (const log of result.items) {
        expect(log.success).toBe(true);
      }
    });

    it("筛选失败日志（success = 'false'）", async () => {
      const p = getSystemLogs({ success: "false" });
      await vi.runAllTimersAsync();
      const result = await p;
      // 失败日志共 4 条（id: 2,5,10,12）
      expect(result.total).toBe(4);
      for (const log of result.items) {
        expect(log.success).toBe(false);
      }
    });
  });

  // ── 分页 ────────────────────────────────────────────────────────────────────

  describe("分页", () => {
    it("第 1 页 pageSize=10 返回 10 条，total 仍为 15", async () => {
      const p = getSystemLogs({ page: 1, pageSize: 10 });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(15);
      expect(result.items).toHaveLength(10);
    });

    it("第 2 页 pageSize=10 返回剩余 5 条", async () => {
      const p = getSystemLogs({ page: 2, pageSize: 10 });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.total).toBe(15);
      expect(result.items).toHaveLength(5);
    });

    it("默认 pageSize=20 时一次返回全部 15 条", async () => {
      const p = getSystemLogs({ page: 1 });
      await vi.runAllTimersAsync();
      const result = await p;
      expect(result.items).toHaveLength(15);
    });
  });

  // ── 排序 ────────────────────────────────────────────────────────────────────

  it("按 createdAt 降序排列（最新在前）", async () => {
    const p = getSystemLogs();
    await vi.runAllTimersAsync();
    const result = await p;

    for (let i = 0; i < result.items.length - 1; i++) {
      const current = new Date(result.items[i]!.createdAt).getTime();
      const next = new Date(result.items[i + 1]!.createdAt).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  // ── 字段完整性 ──────────────────────────────────────────────────────────────

  it("每条日志包含所有必要字段", async () => {
    const p = getSystemLogs();
    await vi.runAllTimersAsync();
    const result = await p;

    /** 必要字段列表 */
    const requiredFields = [
      "id",
      "type",
      "actorType",
      "action",
      "module",
      "path",
      "method",
      "success",
      "createdAt",
    ] as const;

    for (const log of result.items) {
      for (const field of requiredFields) {
        expect(log).toHaveProperty(field);
      }
      // 类型校验
      expect(typeof log.id).toBe("number");
      expect(["LOGIN", "API_MUTATION"]).toContain(log.type);
      expect(["ADMIN", "USER"]).toContain(log.actorType);
      expect(typeof log.action).toBe("string");
      expect(typeof log.module).toBe("string");
      expect(typeof log.path).toBe("string");
      expect(typeof log.method).toBe("string");
      expect(typeof log.success).toBe("boolean");
      expect(typeof log.createdAt).toBe("string");
    }
  });

  // ── 组合筛选 ────────────────────────────────────────────────────────────────

  it("支持多条件组合筛选（type + actorType）", async () => {
    const p = getSystemLogs({ type: "LOGIN", actorType: "USER" });
    await vi.runAllTimersAsync();
    const result = await p;
    // LOGIN + USER 共 3 条（id: 4, 5, 15）
    expect(result.total).toBe(3);
    for (const log of result.items) {
      expect(log.type).toBe("LOGIN");
      expect(log.actorType).toBe("USER");
    }
  });

  it("支持 module 筛选", async () => {
    const p = getSystemLogs({ module: "questions" });
    await vi.runAllTimersAsync();
    const result = await p;
    // questions 模块共 3 条（id: 6, 7, 14）
    expect(result.total).toBe(3);
    for (const log of result.items) {
      expect(log.module).toBe("questions");
    }
  });
});
