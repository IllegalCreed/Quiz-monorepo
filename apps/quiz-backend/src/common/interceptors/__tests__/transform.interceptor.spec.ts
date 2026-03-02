import { of } from "rxjs";
import { Reflector } from "@nestjs/core";
import { TransformInterceptor } from "../transform.interceptor";
import type { ExecutionContext, CallHandler } from "@nestjs/common";

/**
 * TransformInterceptor 单元测试
 * 测试全局响应格式包装 + @SkipTransform 跳过逻辑
 */
describe("TransformInterceptor", () => {
  let interceptor: TransformInterceptor<unknown>;
  let reflector: Reflector;

  /** 创建模拟 ExecutionContext */
  function createMockContext(): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  /** 创建模拟 CallHandler（返回指定数据） */
  function createMockCallHandler(data: unknown): CallHandler {
    return { handle: () => of(data) };
  }

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  it("应该被正确实例化", () => {
    expect(interceptor).toBeDefined();
  });

  describe("正常转换", () => {
    it("将普通对象包装为 { code: 0, message, data }", (done) => {
      const ctx = createMockContext();
      const handler = createMockCallHandler({ id: 1, name: "test" });
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          code: 0,
          message: "success",
          data: { id: 1, name: "test" },
        });
        done();
      });
    });

    it("将 null 数据包装为统一格式", (done) => {
      const ctx = createMockContext();
      const handler = createMockCallHandler(null);
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          code: 0,
          message: "success",
          data: null,
        });
        done();
      });
    });

    it("将数组数据包装为统一格式", (done) => {
      const ctx = createMockContext();
      const handler = createMockCallHandler([1, 2, 3]);
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          code: 0,
          message: "success",
          data: [1, 2, 3],
        });
        done();
      });
    });

    it("将字符串数据包装为统一格式", (done) => {
      const ctx = createMockContext();
      const handler = createMockCallHandler("hello");
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      interceptor.intercept(ctx, handler).subscribe((result) => {
        expect(result).toEqual({
          code: 0,
          message: "success",
          data: "hello",
        });
        done();
      });
    });
  });

  describe("@SkipTransform 跳过转换", () => {
    it("标记 @SkipTransform 时直接返回原始数据", (done) => {
      const ctx = createMockContext();
      const rawData = { type: "sse-event", payload: "data" };
      const handler = createMockCallHandler(rawData);
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      interceptor.intercept(ctx, handler).subscribe((result) => {
        // 不包装，直接返回原始数据
        expect(result).toEqual(rawData);
        done();
      });
    });

    it("Reflector 使用正确的 metadata key 和目标", () => {
      const ctx = createMockContext();
      const handler = createMockCallHandler(null);
      const spy = jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue(false);

      interceptor.intercept(ctx, handler).subscribe();

      expect(spy).toHaveBeenCalledWith("skipTransform", [
        ctx.getHandler(),
        ctx.getClass(),
      ]);
    });
  });
});
