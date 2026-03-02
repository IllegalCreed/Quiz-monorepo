import { ExecutionContext } from "@nestjs/common";
import { OptionalUserJwtGuard } from "../optional-user-jwt.guard";

/**
 * OptionalUserJwtGuard 单元测试
 * 测试可选 JWT 认证守卫：认证失败不抛异常，返回 null
 */
describe("OptionalUserJwtGuard", () => {
  let guard: OptionalUserJwtGuard;

  beforeEach(() => {
    guard = new OptionalUserJwtGuard();
  });

  it("应该被正确实例化", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("应该调用父类 canActivate", () => {
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(OptionalUserJwtGuard.prototype),
        "canActivate",
      );
      superCanActivate.mockReturnValue(true);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(superCanActivate).toHaveBeenCalledWith(mockContext);
    });
  });

  describe("handleRequest", () => {
    it("有效用户时返回用户信息", () => {
      const user = { id: 1, username: "testuser" };

      const result = guard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it("用户为 false 时返回 null（不抛异常）", () => {
      const result = guard.handleRequest(null, false);

      expect(result).toBeNull();
    });

    it("有错误但无用户时返回 null（不抛异常）", () => {
      const err = new Error("JWT expired");

      const result = guard.handleRequest(err, false);

      expect(result).toBeNull();
    });
  });
});
