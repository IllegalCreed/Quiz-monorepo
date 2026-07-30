import { of, throwError } from "rxjs";
import { LoggingInterceptor } from "../logging.interceptor";
import { SystemLogsService } from "../../../system-logs/system-logs.service";
import type { ExecutionContext, CallHandler } from "@nestjs/common";

/**
 * LoggingInterceptor 单元测试
 * 测试全局日志拦截器的核心逻辑：
 * - 写入变更请求（POST/PATCH/PUT/DELETE）
 * - 跳过 GET 等只读请求
 * - 跳过登录等特殊路径
 * - 过滤密码等敏感字段
 * - 截断超大响应结果
 */
describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let mockSystemLogsService: { create: jest.Mock };

  /** 获取日志服务 create 方法的第一次调用参数（带类型转换避免 any 访问） */
  function getCreateCallArgs(): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return mockSystemLogsService.create.mock.calls[0]![0] as Record<
      string,
      unknown
    >;
  }

  /** 创建模拟 ExecutionContext */
  function createMockContext(overrides: {
    method?: string;
    originalUrl?: string;
    body?: Record<string, unknown>;
    ip?: string;
    user?: { sub?: number; username?: string; role?: string } | undefined;
  }): ExecutionContext {
    // 显式传入 user: undefined 时不使用默认值（模拟匿名用户）
    const defaultUser = {
      sub: 1,
      username: "super_admin",
      role: "super_admin",
    };
    const request = {
      method: overrides.method ?? "POST",
      originalUrl: overrides.originalUrl ?? "/admin/questions",
      body: overrides.body ?? {},
      ip: overrides.ip ?? "127.0.0.1",
      user: "user" in overrides ? overrides.user : defaultUser,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  /** 创建模拟 CallHandler（返回成功 Observable） */
  function createMockHandler(responseData: unknown = { id: 1 }): CallHandler {
    return { handle: () => of(responseData) };
  }

  /** 创建模拟 CallHandler（返回错误 Observable） */
  function createErrorHandler(message: string): CallHandler {
    return { handle: () => throwError(() => new Error(message)) };
  }

  beforeEach(() => {
    mockSystemLogsService = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    };
    interceptor = new LoggingInterceptor(
      mockSystemLogsService as unknown as SystemLogsService,
    );

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(interceptor).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("变更请求记录", () => {
    it("POST 请求应触发日志写入", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert：日志服务被调用
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              type: "API_MUTATION",
              actorType: "ADMIN",
              action: "CREATE",
              module: "questions",
              method: "POST",
              path: "/admin/questions",
              success: true,
            }),
          );
          done();
        },
      });
    });

    it("PATCH 请求应触发日志写入（action = UPDATE）", (done) => {
      // Arrange
      const context = createMockContext({
        method: "PATCH",
        originalUrl: "/admin/questions/1",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              action: "UPDATE",
              method: "PATCH",
            }),
          );
          done();
        },
      });
    });

    it("DELETE 请求应触发日志写入（action = DELETE）", (done) => {
      // Arrange
      const context = createMockContext({
        method: "DELETE",
        originalUrl: "/admin/questions/1",
      });
      const handler = createMockHandler({ message: "删除成功" });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              action: "DELETE",
              method: "DELETE",
            }),
          );
          done();
        },
      });
    });

    it("错误请求应记录 success=false 和错误信息", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
      });
      const handler = createErrorHandler("题目创建失败");

      // Act
      interceptor.intercept(context, handler).subscribe({
        error: () => {
          // Assert：日志中记录失败信息
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              success: false,
              error: "题目创建失败",
            }),
          );
          done();
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("跳过规则", () => {
    it("GET 请求不应记录日志", (done) => {
      // Arrange
      const context = createMockContext({
        method: "GET",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler([]);

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert：未调用日志服务
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("OPTIONS 请求不应记录日志", (done) => {
      // Arrange
      const context = createMockContext({
        method: "OPTIONS",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler();

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("HEAD 请求不应记录日志", (done) => {
      // Arrange
      const context = createMockContext({
        method: "HEAD",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler();

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("admin 登录路径应被跳过", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/auth/login",
      });
      const handler = createMockHandler({ token: "jwt" });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert：登录由 AuthService 显式记录，拦截器跳过
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("用户登录路径应被跳过", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/api/user/auth/login",
      });
      const handler = createMockHandler({ token: "jwt" });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("用户注册路径应被跳过", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/api/user/auth/register",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("用户答题不应复制到通用操作日志", (done) => {
      const context = createMockContext({
        method: "POST",
        originalUrl: "/api/answers",
        body: { questionId: 7, selectedOption: 3 },
        user: undefined,
      });
      const handler = createMockHandler({ correct: false, correctOptionId: 2 });

      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("测试端点路径应被跳过", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/api/test/reset",
      });
      const handler = createMockHandler({ ok: true });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it("WebSocket 路径应被跳过", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/api/ws/connect",
      });
      const handler = createMockHandler();

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("敏感字段过滤", () => {
    it("password 字段应被替换为 '***'", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/admins",
        body: { username: "new_admin", password: "secret123" },
      });
      const handler = createMockHandler({ id: 2 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert：params 中密码被脱敏
          const callArgs = getCreateCallArgs();
          expect(callArgs.params).toEqual({
            username: "new_admin",
            password: "***",
          });
          done();
        },
      });
    });

    it("多个密码字段都应被过滤", (done) => {
      // Arrange
      const context = createMockContext({
        method: "PATCH",
        originalUrl: "/admin/admins/1",
        body: {
          oldPassword: "old123",
          newPassword: "new456",
          confirmPassword: "new456",
        },
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          const callArgs = getCreateCallArgs();
          expect(callArgs.params).toEqual({
            oldPassword: "***",
            newPassword: "***",
            confirmPassword: "***",
          });
          done();
        },
      });
    });

    it("非敏感字段不应被过滤", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
        body: { stem: "什么是 TypeScript？", tags: ["前端"] },
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          const callArgs = getCreateCallArgs();
          expect(callArgs.params).toEqual({
            stem: "什么是 TypeScript？",
            tags: ["前端"],
          });
          done();
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("响应结果截断", () => {
    it("超过 2KB 的响应应被截断为摘要", (done) => {
      // Arrange：构造一个超过 2048 字符的响应
      const largeData = { content: "x".repeat(3000) };
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler(largeData);

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          // Assert：result 被截断
          const callArgs = getCreateCallArgs();
          expect(callArgs.result).toEqual({
            _truncated: true,
            _originalLength: expect.any(Number),
          });
          expect(
            (callArgs.result as Record<string, unknown>)._originalLength,
          ).toBeGreaterThan(2048);
          done();
        },
      });
    });

    it("小于 2KB 的响应应保持原样", (done) => {
      // Arrange
      const smallData = { id: 1, message: "创建成功" };
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler(smallData);

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          const callArgs = getCreateCallArgs();
          expect(callArgs.result).toEqual(smallData);
          done();
        },
      });
    });

    it("null 响应数据应记录 result 为 null", (done) => {
      // Arrange
      const context = createMockContext({
        method: "DELETE",
        originalUrl: "/admin/questions/1",
      });
      const handler = createMockHandler(null);

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          const callArgs = getCreateCallArgs();
          expect(callArgs.result).toBeNull();
          done();
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("操作者类型推导", () => {
    it("admin 路径应推导为 ADMIN 类型", (done) => {
      // Arrange
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
        user: { sub: 1, username: "admin", role: "super_admin" },
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({ actorType: "ADMIN" }),
          );
          done();
        },
      });
    });

    it("非 admin 路径且 role=user 应推导为 USER 类型", (done) => {
      // Arrange
      const context = createMockContext({
        method: "PUT",
        originalUrl: "/api/user/preferences",
        user: { sub: 10, username: "testuser", role: "user" },
      });
      const handler = createMockHandler({ categoryIds: [1, 2] });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({ actorType: "USER" }),
          );
          done();
        },
      });
    });

    it("无用户信息时 actorId 和 actorName 应为 undefined", (done) => {
      // Arrange
      const context = createMockContext({
        method: "PUT",
        originalUrl: "/api/user/preferences",
        user: undefined,
      });
      const handler = createMockHandler({ categoryIds: [1, 2] });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({
              actorId: undefined,
              actorName: undefined,
            }),
          );
          done();
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("日志写入失败容错", () => {
    it("日志写入失败不应影响主请求", (done) => {
      // Arrange：模拟日志写入失败
      mockSystemLogsService.create.mockRejectedValue(
        new Error("数据库连接失败"),
      );
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: (value) => {
          // Assert：主请求正常返回
          expect(value).toEqual({ id: 1 });

          // 等一个微任务让 catch 执行
          setTimeout(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
              "LoggingInterceptor: 写入日志失败",
              "数据库连接失败",
            );
            consoleSpy.mockRestore();
            done();
          }, 10);
        },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("路径解析", () => {
    it("应正确提取模块名称", (done) => {
      // Arrange：/admin/categories/1 → module = "categories"
      const context = createMockContext({
        method: "PATCH",
        originalUrl: "/admin/categories/1",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({ module: "categories" }),
          );
          done();
        },
      });
    });

    it("应正确处理带查询参数的路径", (done) => {
      // Arrange：查询参数不应影响模块名解析
      const context = createMockContext({
        method: "POST",
        originalUrl: "/admin/questions?draft=true",
      });
      const handler = createMockHandler({ id: 1 });

      // Act
      interceptor.intercept(context, handler).subscribe({
        next: () => {
          expect(mockSystemLogsService.create).toHaveBeenCalledWith(
            expect.objectContaining({ module: "questions" }),
          );
          done();
        },
      });
    });
  });
});
