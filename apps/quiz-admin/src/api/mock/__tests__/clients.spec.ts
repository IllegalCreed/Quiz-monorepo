/**
 * 客户端管理 Mock API 单元测试
 * 验证 Mock 数据结构和返回值
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("clients mock API", () => {
  let getClients: (typeof import("../clients"))["getClients"];
  let broadcastEvent: (typeof import("../clients"))["broadcastEvent"];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    const module = await import("../clients");
    getClients = module.getClients;
    broadcastEvent = module.broadcastEvent;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getClients", () => {
    it("应该返回包含 stats 和 clients 的结果", async () => {
      const p = getClients();
      await vi.runAllTimersAsync();
      const result = await p;

      expect(result.stats).toBeDefined();
      expect(result.clients).toBeDefined();
      expect(Array.isArray(result.clients)).toBe(true);
    });

    it("stats 统计数字应正确", async () => {
      const p = getClients();
      await vi.runAllTimersAsync();
      const result = await p;

      const { stats, clients } = result;
      expect(stats.total).toBe(clients.length);
      expect(stats.loggedIn + stats.guest).toBe(stats.total);
    });

    it("每个客户端应包含必要字段", async () => {
      const p = getClients();
      await vi.runAllTimersAsync();
      const result = await p;

      for (const client of result.clients) {
        expect(client).toHaveProperty("clientId");
        expect(client).toHaveProperty("ip");
        expect(client).toHaveProperty("currentPage");
        expect(client).toHaveProperty("connectedAt");
        expect(client).toHaveProperty("lastHeartbeat");
        expect(typeof client.clientId).toBe("string");
      }
    });

    it("应包含已登录用户和游客", async () => {
      const p = getClients();
      await vi.runAllTimersAsync();
      const result = await p;

      const loggedIn = result.clients.filter((c) => c.userId !== null);
      const guests = result.clients.filter((c) => c.userId === null);

      expect(loggedIn.length).toBeGreaterThan(0);
      expect(guests.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("broadcastEvent", () => {
    it("应该返回 sent 数量", async () => {
      const p = broadcastEvent({ type: "refresh" });
      await vi.runAllTimersAsync();
      const result = await p;

      expect(result).toHaveProperty("sent");
      expect(typeof result.sent).toBe("number");
      expect(result.sent).toBeGreaterThan(0);
    });

    it("announcement 类型应接受 message 参数", async () => {
      const p = broadcastEvent({
        type: "announcement",
        message: "测试公告",
      });
      await vi.runAllTimersAsync();
      const result = await p;

      expect(result.sent).toBeGreaterThan(0);
    });
  });
});
