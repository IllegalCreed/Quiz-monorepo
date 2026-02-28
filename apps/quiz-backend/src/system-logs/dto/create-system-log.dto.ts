import type { LogType, ActorType } from "@prisma/client";

/**
 * 创建系统日志 DTO（内部使用，不暴露为 API）
 * 由 LoggingInterceptor 和 AuthService 调用
 */
export class CreateSystemLogDto {
  /** 日志类型 */
  type!: LogType;

  /** 操作者类型 */
  actorType!: ActorType;

  /** 操作者 ID（匿名操作为 null） */
  actorId?: number;

  /** 操作者名称快照 */
  actorName?: string;

  /** 具体动作：CREATE / UPDATE / DELETE / LOGIN */
  action!: string;

  /** 业务模块名称 */
  module!: string;

  /** 请求路径 */
  path!: string;

  /** HTTP 方法 */
  method!: string;

  /** 请求参数（已过滤敏感字段） */
  params?: Record<string, unknown> | null;

  /** 响应结果（截断至 2KB） */
  result?: Record<string, unknown> | null;

  /** 操作是否成功 */
  success!: boolean;

  /** 错误信息 */
  error?: string;

  /** 请求者 IP */
  ip?: string;

  /** 请求耗时（毫秒） */
  durationMs?: number;
}
