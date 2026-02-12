import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AdminInfo } from "../interfaces/admin-info.interface";

/**
 * JWT Auth Guard 单元测试
 * 测试 JWT 验证和 @Public() 装饰器支持
 */
describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockAdminInfo: AdminInfo = {
    id: 1,
    username: "super_admin",
    nickname: "超级管理员",
    role: "super_admin",
    roleId: 1,
    roleName: "超级管理员",
    menuPermissions: [
      "dashboard",
      "users",
      "admins",
      "roles",
      "questions",
      "system",
    ],
    apiPermissions: ["*:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it("应该被定义", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("@Public() 装饰的接口应该直接放行", () => {
      // Arrange
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("非 @Public() 接口应该调用父类 canActivate（JWT 验证）", () => {
      // Arrange
      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      // Mock 父类的 canActivate 方法
      const superCanActivate = jest.spyOn(
        Object.getPrototypeOf(JwtAuthGuard.prototype),
        "canActivate",
      );
      superCanActivate.mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(superCanActivate).toHaveBeenCalled();
    });
  });

  describe("handleRequest", () => {
    it("有效的用户信息应该返回用户", () => {
      // Act
      const result = guard.handleRequest(null, mockAdminInfo, null);

      // Assert
      expect(result).toEqual(mockAdminInfo);
    });

    it("无用户信息应该抛出 UnauthorizedException", () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        new UnauthorizedException("未登录或登录已过期"),
      );
    });

    it("有错误应该抛出该错误", () => {
      // Arrange
      const mockError = new Error("JWT expired");

      // Act & Assert
      expect(() => guard.handleRequest(mockError, false, null)).toThrow(
        mockError,
      );
    });

    it("用户信息为 false 应该抛出 UnauthorizedException", () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, false, null)).toThrow(
        new UnauthorizedException("未登录或登录已过期"),
      );
    });
  });
});
