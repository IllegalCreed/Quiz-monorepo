import { Injectable, type MessageEvent } from "@nestjs/common";
import { Subject } from "rxjs";

/** 客户端连接信息（内部使用） */
interface ClientEntry {
  clientId: string;
  subject: Subject<MessageEvent>;
  ip: string;
  userId: number | null;
  username: string | null;
  currentPage: string;
  connectedAt: Date;
  lastHeartbeat: Date;
}

/** 管理端展示用的客户端摘要 */
export interface ClientSummary {
  clientId: string;
  ip: string;
  userId: number | null;
  username: string | null;
  currentPage: string;
  connectedAt: string;
  lastHeartbeat: string;
}

/** 在线客户端统计 */
export interface ClientStats {
  total: number;
  loggedIn: number;
  guest: number;
}

/** ping 间隔（30 秒，防止代理/防火墙超时断开） */
const PING_INTERVAL_MS = 30_000;

/**
 * 客户端注册表服务
 * 内存存储所有 SSE 连接的客户端信息，无需数据库持久化
 */
@Injectable()
export class ClientsService {
  /** 客户端注册表：clientId → ClientEntry */
  private readonly registry = new Map<string, ClientEntry>();

  /** ping 定时器引用 */
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startPingLoop();
  }

  /**
   * 注册新客户端连接
   * 若 clientId 已存在（同 tab 重连），关闭旧 Subject 并替换
   */
  register(clientId: string, subject: Subject<MessageEvent>, ip: string): void {
    // 关闭已有连接（同 tab 重连场景）
    const existing = this.registry.get(clientId);
    if (existing) {
      existing.subject.complete();
    }

    this.registry.set(clientId, {
      clientId,
      subject,
      ip,
      userId: null,
      username: null,
      currentPage: "/",
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
    });
  }

  /**
   * 注销客户端（SSE 连接关闭时调用）
   */
  unregister(clientId: string): void {
    const entry = this.registry.get(clientId);
    if (entry) {
      entry.subject.complete();
      this.registry.delete(clientId);
    }
  }

  /**
   * 更新客户端心跳信息
   * 页面路径和用户信息（从 JWT 提取）
   */
  updateHeartbeat(
    clientId: string,
    data: {
      currentPage?: string;
      userId?: number | null;
      username?: string | null;
    },
  ): void {
    const entry = this.registry.get(clientId);
    if (!entry) return;

    if (data.currentPage !== undefined) {
      entry.currentPage = data.currentPage;
    }
    // userId/username 允许设为 null（退出登录）
    if ("userId" in data) {
      entry.userId = data.userId ?? null;
    }
    if ("username" in data) {
      entry.username = data.username ?? null;
    }
    entry.lastHeartbeat = new Date();
  }

  /**
   * 获取所有在线客户端列表（管理端展示用）
   */
  getAll(): ClientSummary[] {
    return Array.from(this.registry.values()).map(
      ({ subject: _, ...rest }) => ({
        ...rest,
        connectedAt: rest.connectedAt.toISOString(),
        lastHeartbeat: rest.lastHeartbeat.toISOString(),
      }),
    );
  }

  /**
   * 获取在线客户端统计
   */
  getStats(): ClientStats {
    let loggedIn = 0;
    let guest = 0;

    for (const entry of this.registry.values()) {
      if (entry.userId) {
        loggedIn++;
      } else {
        guest++;
      }
    }

    return { total: this.registry.size, loggedIn, guest };
  }

  /**
   * 向所有在线客户端广播事件
   * @returns 成功发送的客户端数量
   */
  broadcast(type: string, payload: Record<string, unknown>): { sent: number } {
    const event: MessageEvent = {
      data: JSON.stringify({ type, ...payload }),
    } as MessageEvent;

    let sent = 0;
    for (const entry of this.registry.values()) {
      try {
        entry.subject.next(event);
        sent++;
      } catch {
        // Subject 已关闭，忽略
      }
    }

    return { sent };
  }

  /**
   * 启动 30s ping 循环
   * 防止代理/防火墙因空闲超时断开 SSE 连接
   */
  private startPingLoop(): void {
    this.pingTimer = setInterval(() => {
      const pingEvent: MessageEvent = {
        data: JSON.stringify({ type: "ping", ts: Date.now() }),
      } as MessageEvent;

      for (const entry of this.registry.values()) {
        try {
          entry.subject.next(pingEvent);
        } catch {
          // Subject 已关闭，忽略
        }
      }
    }, PING_INTERVAL_MS);
  }

  /**
   * 清理资源（测试或模块销毁时使用）
   */
  destroy(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    for (const entry of this.registry.values()) {
      entry.subject.complete();
    }
    this.registry.clear();
  }
}
