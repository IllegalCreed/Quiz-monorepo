import { UnauthorizedException } from "@nestjs/common";
import { UserJwtAuthGuard } from "../user-jwt-auth.guard";

/**
 * UserJwtAuthGuard 单元测试
 * 测试用户 JWT 认证守卫：认证失败抛出 UnauthorizedException
 */
describe("UserJwtAuthGuard", () => {
  let guard: UserJwtAuthGuard;

  beforeEach(() => {
    guard = new UserJwtAuthGuard();
  });

  it("应该被正确实例化", () => {
    expect(guard).toBeDefined();
  });

  describe("handleRequest", () => {
    it("有效用户时返回用户信息", () => {
      const user = { id: 1, username: "testuser" };

      const result = guard.handleRequest(null, user, null);

      expect(result).toEqual(user);
    });

    it("无用户时抛出 UnauthorizedException", () => {
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        new UnauthorizedException("未登录或登录已过期"),
      );
    });

    it("有错误时抛出该错误", () => {
      const err = new Error("JWT malformed");

      expect(() => guard.handleRequest(err, false, null)).toThrow(err);
    });

    it("有错误且有用户时仍抛出错误", () => {
      const err = new Error("token expired");
      const user = { id: 1, username: "testuser" };

      expect(() => guard.handleRequest(err, user, null)).toThrow(err);
    });
  });
});
