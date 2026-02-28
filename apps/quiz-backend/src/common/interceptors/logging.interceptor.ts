import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import type { Request } from "express";
import { SystemLogsService } from "../../system-logs/system-logs.service";

/** 结果 JSON 最大长度（2KB） */
const MAX_RESULT_LENGTH = 2048;

/** 需要从日志参数中过滤的敏感字段 */
const SENSITIVE_FIELDS = new Set([
  "password",
  "newPassword",
  "confirmPassword",
  "oldPassword",
]);

/** 需要跳过日志记录的路径前缀 */
const SKIP_PATH_PREFIXES = [
  "/api/test",
  "/api/ws",
  "/admin/auth/login",
  "/api/user/auth/login",
  "/api/user/auth/register",
];

/**
 * 全局日志拦截器
 * 自动记录所有 POST/PATCH/PUT/DELETE 请求到 SystemLog 表
 *
 * - 跳过 GET/OPTIONS/HEAD 请求
 * - 跳过测试、WebSocket、登录路径（登录由 Service 层显式记录）
 * - 过滤 password 等敏感字段
 * - 响应结果截断至 2KB
 * - 非阻塞写入（日志失败不影响主请求）
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;

    // 只拦截数据变更类请求
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return next.handle();
    }

    // 跳过特定路径
    if (SKIP_PATH_PREFIXES.some((prefix) => originalUrl.startsWith(prefix))) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        // 成功：异步写日志
        this._writeLog(
          request,
          startTime,
          true,
          responseData as Record<string, unknown> | null,
          undefined,
        );
      }),
      catchError((error: Error) => {
        // 失败：异步写日志后重新抛出
        this._writeLog(request, startTime, false, null, error.message);
        throw error;
      }),
    );
  }

  /**
   * 异步写入日志（fire-and-forget）
   */
  private _writeLog(
    request: Request,
    startTime: number,
    success: boolean,
    responseData: Record<string, unknown> | null,
    error?: string,
  ): void {
    const { method, originalUrl, ip } = request;
    const user = (request as unknown as Record<string, unknown>).user as
      | { sub?: number; username?: string; role?: string }
      | undefined;

    const durationMs = Date.now() - startTime;
    const { module: moduleName, action } = this._parsePathInfo(
      originalUrl,
      method,
    );

    // 过滤敏感参数（request.body 类型为 any，需显式转换）
    const filteredParams = this._filterSensitiveFields(
      request.body as Record<string, unknown> | undefined,
    );

    // 截断响应结果
    const truncatedResult = this._truncateResult(responseData);

    // 推导操作者类型：admin 路径 → ADMIN，其余 → USER
    const isAdmin =
      originalUrl.startsWith("/admin/") ||
      (user?.role !== "user" && user?.sub !== undefined);

    this.systemLogsService
      .create({
        type: "API_MUTATION",
        actorType: isAdmin ? "ADMIN" : "USER",
        actorId: user?.sub ?? undefined,
        actorName: user?.username ?? undefined,
        action,
        module: moduleName,
        path: originalUrl,
        method,
        params:
          filteredParams && Object.keys(filteredParams).length > 0
            ? filteredParams
            : null,
        result: truncatedResult,
        success,
        error,
        ip: ip ?? undefined,
        durationMs,
      })
      .catch((err: Error) => {
        console.error("LoggingInterceptor: 写入日志失败", err.message);
      });
  }

  /**
   * 从请求路径提取模块名和动作
   * 例如: /admin/questions/1 → { module: "questions", action: "UPDATE" }
   */
  private _parsePathInfo(
    url: string,
    method: string,
  ): { module: string; action: string } {
    // 移除查询参数
    const pathOnly = url.split("?")[0];
    // 路径段：["", "admin", "questions", "1"]
    const segments = pathOnly.split("/").filter(Boolean);

    // 跳过 "admin" 或 "api" 前缀，取业务模块名
    let moduleName = "unknown";
    if (segments.length >= 2) {
      // /admin/questions → segments[1] = "questions"
      // /api/answers → segments[1] = "answers"
      moduleName = segments[1]!;
    }

    // 从 HTTP method 推导动作
    const actionMap: Record<string, string> = {
      POST: "CREATE",
      PATCH: "UPDATE",
      PUT: "UPDATE",
      DELETE: "DELETE",
    };
    const action = actionMap[method] ?? method;

    return { module: moduleName, action };
  }

  /**
   * 递归过滤敏感字段（password 等）
   */
  private _filterSensitiveFields(
    obj: Record<string, unknown> | undefined | null,
  ): Record<string, unknown> | null {
    if (!obj || typeof obj !== "object") return null;

    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.has(key)) {
        filtered[key] = "***";
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        filtered[key] = this._filterSensitiveFields(
          value as Record<string, unknown>,
        );
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }

  /**
   * 截断响应结果至 2KB 以内
   */
  private _truncateResult(
    data: Record<string, unknown> | null,
  ): Record<string, unknown> | null {
    if (!data) return null;

    try {
      const json = JSON.stringify(data);
      if (json.length <= MAX_RESULT_LENGTH) {
        return data;
      }
      // 超长时只保留摘要
      return { _truncated: true, _originalLength: json.length };
    } catch {
      return { _error: "无法序列化响应数据" };
    }
  }
}
