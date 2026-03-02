/**
 * 客户端管理 Mock API
 * 模拟在线客户端数据，用于 VITE_MOCK=true 模式
 */
import type {
  ClientItem,
  ClientStats,
  ClientsListResult,
  BroadcastParams,
  BroadcastResult,
} from "@/api/clients";

/** 时间辅助常量 */
const now = Date.now();
const MINUTE = 60_000;

/** Mock 在线客户端列表 */
const mockClients: ClientItem[] = [
  {
    clientId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    ip: "192.168.1.10",
    userId: 1,
    username: "testuser1",
    currentPage: "/",
    connectedAt: new Date(now - 45 * MINUTE).toISOString(),
    lastHeartbeat: new Date(now - 2 * MINUTE).toISOString(),
  },
  {
    clientId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    ip: "10.0.0.5",
    userId: 2,
    username: "testuser2",
    currentPage: "/",
    connectedAt: new Date(now - 20 * MINUTE).toISOString(),
    lastHeartbeat: new Date(now - 1 * MINUTE).toISOString(),
  },
  {
    clientId: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    ip: "172.16.0.33",
    userId: null,
    username: null,
    currentPage: "/",
    connectedAt: new Date(now - 10 * MINUTE).toISOString(),
    lastHeartbeat: new Date(now - 5 * MINUTE).toISOString(),
  },
  {
    clientId: "d4e5f6a7-b8c9-0123-defa-234567890123",
    ip: "192.168.1.22",
    userId: null,
    username: null,
    currentPage: "/",
    connectedAt: new Date(now - 3 * MINUTE).toISOString(),
    lastHeartbeat: new Date(now - 30_000).toISOString(),
  },
];

/**
 * Mock 获取在线客户端列表
 */
export const getClients = async (): Promise<ClientsListResult> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const loggedIn = mockClients.filter((c) => c.userId !== null).length;
  const guest = mockClients.length - loggedIn;

  const stats: ClientStats = {
    total: mockClients.length,
    loggedIn,
    guest,
  };

  return { stats, clients: [...mockClients] };
};

/**
 * Mock 广播事件
 */
export const broadcastEvent = async (_params: BroadcastParams): Promise<BroadcastResult> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { sent: mockClients.length };
};
