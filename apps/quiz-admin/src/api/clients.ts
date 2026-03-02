/**
 * 客户端管理 API（真实后端）
 * 管理端调用 /admin/clients 端点，需 admin JWT
 */
import { get, post } from "@/utils/request";

/** 客户端摘要信息 */
export interface ClientItem {
  clientId: string;
  ip: string;
  userId: number | null;
  username: string | null;
  currentPage: string;
  connectedAt: string;
  lastHeartbeat: string;
}

/** 在线统计 */
export interface ClientStats {
  total: number;
  loggedIn: number;
  guest: number;
}

/** 客户端列表响应 */
export interface ClientsListResult {
  stats: ClientStats;
  clients: ClientItem[];
}

/** 广播事件类型 */
export type BroadcastType = "refresh" | "announcement";

/** 广播请求参数 */
export interface BroadcastParams {
  type: BroadcastType;
  message?: string;
}

/** 广播结果 */
export interface BroadcastResult {
  sent: number;
}

/**
 * 获取在线客户端列表 + 统计
 */
export const getClients = async (): Promise<ClientsListResult> => {
  return get<ClientsListResult>("/admin/clients");
};

/**
 * 向所有在线客户端广播事件
 */
export const broadcastEvent = async (params: BroadcastParams): Promise<BroadcastResult> => {
  return post<BroadcastResult>("/admin/clients/broadcast", params);
};
