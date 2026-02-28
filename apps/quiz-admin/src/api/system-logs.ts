/**
 * 系统日志 API（真实后端）
 * 管理端调用 /admin/system-logs 端点，需 admin JWT
 */
import { get } from "@/utils/request";

/** 日志类型枚举 */
export type LogType = "LOGIN" | "API_MUTATION";

/** 操作者类型枚举 */
export type ActorType = "ADMIN" | "USER";

/** 系统日志条目 */
export interface SystemLogItem {
  id: number;
  type: LogType;
  actorType: ActorType;
  actorId: number | null;
  actorName: string | null;
  action: string;
  module: string;
  path: string;
  method: string;
  params: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  success: boolean;
  error: string | null;
  ip: string | null;
  durationMs: number | null;
  createdAt: string;
}

/** 系统日志查询参数 */
export interface QuerySystemLogsParams {
  type?: LogType;
  actorType?: ActorType;
  module?: string;
  success?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/** 分页响应格式 */
export interface PaginatedResult<T> {
  total: number;
  items: T[];
}

/**
 * 获取系统日志列表（分页+筛选）
 */
export const getSystemLogs = async (
  params: QuerySystemLogsParams = {},
): Promise<PaginatedResult<SystemLogItem>> => {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.actorType) query.set("actorType", params.actorType);
  if (params.module) query.set("module", params.module);
  if (params.success) query.set("success", params.success);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return get<PaginatedResult<SystemLogItem>>(`/admin/system-logs${qs ? `?${qs}` : ""}`);
};
