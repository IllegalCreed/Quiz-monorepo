/**
 * useSse 单元测试
 * 测试 SSE 连接管理、心跳发送和公告处理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/** Mock request.ts */
vi.mock("@/utils/request", () => ({
  post: vi.fn().mockResolvedValue(undefined),
}));

/** 模拟 EventSource */
class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 1;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  close() {
    this.readyState = 2;
  }

  /** 辅助方法：模拟服务端发送消息 */
  _emit(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

describe("useSse", () => {
  let useSse: (typeof import("../useSse"))["useSse"];

  beforeEach(async () => {
    // 重置模块确保 singleton 状态隔离
    vi.resetModules();

    // 挂载 Mock EventSource 到 globalThis
    MockEventSource.instances = [];
    vi.stubGlobal("EventSource", MockEventSource);

    // Mock sessionStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });

    // 重新导入以获取干净实例
    const module = await import("../useSse");
    useSse = module.useSse;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("clientId", () => {
    it("connect 应在 sessionStorage 中生成 clientId", () => {
      vi.stubGlobal("crypto", {
        randomUUID: () => "mock-uuid-1234",
      });

      const { connect, disconnect } = useSse();
      connect();

      const es = MockEventSource.instances[0]!;
      expect(es.url).toContain("clientId=mock-uuid-1234");

      disconnect();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("connect / disconnect", () => {
    it("connect 应创建 EventSource 连接", () => {
      const { connect, disconnect } = useSse();
      connect();

      expect(MockEventSource.instances).toHaveLength(1);
      expect(MockEventSource.instances[0]!.url).toContain("/clients/stream");

      disconnect();
    });

    it("重复 connect 不应创建多个连接", () => {
      const { connect, disconnect } = useSse();
      connect();
      connect();

      expect(MockEventSource.instances).toHaveLength(1);

      disconnect();
    });

    it("disconnect 应关闭 EventSource", () => {
      const { connect, disconnect } = useSse();
      connect();

      const es = MockEventSource.instances[0]!;
      expect(es.readyState).toBe(1);

      disconnect();
      expect(es.readyState).toBe(2);
    });

    it("disconnect 后可以重新 connect", () => {
      const { connect, disconnect } = useSse();
      connect();
      disconnect();
      connect();

      expect(MockEventSource.instances).toHaveLength(2);

      disconnect();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("announcement 事件", () => {
    it("收到 announcement 应设置公告消息", () => {
      const { connect, disconnect, announcement } = useSse();
      connect();

      const es = MockEventSource.instances[0]!;
      es._emit(JSON.stringify({ type: "announcement", message: "测试公告" }));

      expect(announcement.value).toBe("测试公告");

      disconnect();
    });

    it("收到非法 JSON 不应报错", () => {
      const { connect, disconnect, announcement } = useSse();
      connect();

      const es = MockEventSource.instances[0]!;
      expect(() => es._emit("not-json")).not.toThrow();
      expect(announcement.value).toBe("");

      disconnect();
    });

    it("收到 ping 事件应被忽略", () => {
      const { connect, disconnect, announcement } = useSse();
      connect();

      const es = MockEventSource.instances[0]!;
      es._emit(JSON.stringify({ type: "ping", ts: Date.now() }));

      expect(announcement.value).toBe("");

      disconnect();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("sendHeartbeat", () => {
    it("应调用 post 发送心跳", async () => {
      const { post } = await import("@/utils/request");
      const { sendHeartbeat } = useSse();

      await sendHeartbeat("/quiz");

      expect(post).toHaveBeenCalledWith("/clients/heartbeat", {
        clientId: expect.any(String),
        currentPage: "/quiz",
      });
    });

    it("心跳失败不应抛出错误", async () => {
      const { post } = await import("@/utils/request");
      vi.mocked(post).mockRejectedValueOnce(new Error("网络错误"));

      const { sendHeartbeat } = useSse();

      // 不应抛出
      await expect(sendHeartbeat("/quiz")).resolves.toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("singleton", () => {
    it("多次调用 useSse 应共享同一份 announcement", () => {
      const instance1 = useSse();
      const instance2 = useSse();

      instance1.connect();

      const es = MockEventSource.instances[0]!;
      es._emit(JSON.stringify({ type: "announcement", message: "共享测试" }));

      expect(instance2.announcement.value).toBe("共享测试");

      instance1.disconnect();
    });
  });
});
