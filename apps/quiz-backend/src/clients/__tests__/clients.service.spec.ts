import { Subject } from "rxjs";
import type { MessageEvent } from "@nestjs/common";
import { ClientsService } from "../clients.service";

/**
 * ClientsService 单元测试
 * 测试内存客户端注册表的增删改查和广播功能
 */
describe("ClientsService", () => {
  let service: ClientsService;

  beforeEach(() => {
    service = new ClientsService();
  });

  afterEach(() => {
    // 清理定时器
    service.destroy();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("register / unregister", () => {
    it("注册后 getAll 应包含该客户端", () => {
      const subject = new Subject<MessageEvent>();
      service.register("client-1", subject, "127.0.0.1");

      const all = service.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].clientId).toBe("client-1");
      expect(all[0].ip).toBe("127.0.0.1");
      expect(all[0].userId).toBeNull();
      expect(all[0].username).toBeNull();
      expect(all[0].currentPage).toBe("/");
    });

    it("注销后 getAll 应不包含该客户端", () => {
      const subject = new Subject<MessageEvent>();
      service.register("client-1", subject, "127.0.0.1");
      service.unregister("client-1");

      expect(service.getAll()).toHaveLength(0);
    });

    it("重复注册相同 clientId 应替换旧连接", () => {
      const subject1 = new Subject<MessageEvent>();
      const subject2 = new Subject<MessageEvent>();

      service.register("client-1", subject1, "10.0.0.1");
      service.register("client-1", subject2, "10.0.0.2");

      // 旧 Subject 应已完成
      let completed = false;
      subject1.subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);

      // 仅保留一个客户端，IP 为新注册的
      const all = service.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].ip).toBe("10.0.0.2");
    });

    it("注销不存在的 clientId 不应报错", () => {
      expect(() => service.unregister("nonexistent")).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updateHeartbeat", () => {
    it("应更新客户端的页面和用户信息", () => {
      const subject = new Subject<MessageEvent>();
      service.register("client-1", subject, "127.0.0.1");

      service.updateHeartbeat("client-1", {
        currentPage: "/quiz",
        userId: 42,
        username: "testuser",
      });

      const client = service.getAll()[0];
      expect(client.currentPage).toBe("/quiz");
      expect(client.userId).toBe(42);
      expect(client.username).toBe("testuser");
    });

    it("退出登录时 userId/username 应被设为 null", () => {
      const subject = new Subject<MessageEvent>();
      service.register("client-1", subject, "127.0.0.1");
      // 先设置登录状态
      service.updateHeartbeat("client-1", { userId: 1, username: "user1" });
      // 退出登录
      service.updateHeartbeat("client-1", { userId: null, username: null });

      const client = service.getAll()[0];
      expect(client.userId).toBeNull();
      expect(client.username).toBeNull();
    });

    it("心跳不存在的 clientId 不应报错", () => {
      expect(() =>
        service.updateHeartbeat("nonexistent", { currentPage: "/quiz" }),
      ).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getStats", () => {
    it("空注册表返回全零统计", () => {
      expect(service.getStats()).toEqual({
        total: 0,
        loggedIn: 0,
        guest: 0,
      });
    });

    it("正确统计已登录和游客人数", () => {
      // 注册 3 个客户端
      service.register("c1", new Subject(), "1.1.1.1");
      service.register("c2", new Subject(), "2.2.2.2");
      service.register("c3", new Subject(), "3.3.3.3");

      // c1 登录
      service.updateHeartbeat("c1", { userId: 1, username: "user1" });
      // c2 登录
      service.updateHeartbeat("c2", { userId: 2, username: "user2" });
      // c3 保持游客

      const stats = service.getStats();
      expect(stats.total).toBe(3);
      expect(stats.loggedIn).toBe(2);
      expect(stats.guest).toBe(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("broadcast", () => {
    it("应向所有在线客户端广播消息", () => {
      const received: string[] = [];

      const s1 = new Subject<MessageEvent>();
      const s2 = new Subject<MessageEvent>();
      s1.subscribe((event) => received.push(event.data as string));
      s2.subscribe((event) => received.push(event.data as string));

      service.register("c1", s1, "1.1.1.1");
      service.register("c2", s2, "2.2.2.2");

      const result = service.broadcast("announcement", {
        message: "测试公告",
      });

      expect(result.sent).toBe(2);
      expect(received).toHaveLength(2);

      const parsed = JSON.parse(received[0]) as Record<string, unknown>;
      expect(parsed.type).toBe("announcement");
      expect(parsed.message).toBe("测试公告");
    });

    it("空注册表广播返回 sent: 0", () => {
      const result = service.broadcast("refresh", {});
      expect(result.sent).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getAll", () => {
    it("返回的摘要不包含 Subject 对象", () => {
      service.register("c1", new Subject(), "1.1.1.1");

      const all = service.getAll();
      expect(all[0]).not.toHaveProperty("subject");
      expect(all[0]).toHaveProperty("clientId");
      expect(all[0]).toHaveProperty("connectedAt");
      expect(all[0]).toHaveProperty("lastHeartbeat");
    });

    it("connectedAt 和 lastHeartbeat 应为 ISO 字符串", () => {
      service.register("c1", new Subject(), "1.1.1.1");

      const client = service.getAll()[0];
      expect(typeof client.connectedAt).toBe("string");
      expect(typeof client.lastHeartbeat).toBe("string");
      // 验证是合法的 ISO 日期字符串
      expect(new Date(client.connectedAt).toISOString()).toBe(
        client.connectedAt,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("destroy", () => {
    it("销毁后注册表应为空", () => {
      service.register("c1", new Subject(), "1.1.1.1");
      service.register("c2", new Subject(), "2.2.2.2");

      service.destroy();

      expect(service.getAll()).toHaveLength(0);
    });
  });
});
