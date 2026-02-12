import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionGuard } from "../guards/permission.guard";
import { AdminInfo } from "../interfaces/admin-info.interface";

/**
 * Permission Guard 单元测试
 * 测试权限检查和通配符支持
 */
describe("PermissionGuard", () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  const mockSuperAdmin: AdminInfo = {
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

  const mockNormalAdmin: AdminInfo = {
    id: 2,
    username: "admin",
    nickname: "普通管理员",
    role: "admin",
    roleId: 3,
    roleName: "用户管理员",
    menuPermissions: ["dashboard", "users"],
    apiPermissions: ["users:*"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
  });

  it("应该被定义", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    it("无需权限的接口应该直接放行", () => {
      // Arrange
      const mockExecutionContext = createMockContext(mockNormalAdmin);
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("超级管理员应该跳过权限检查", () => {
      // Arrange
      const mockExecutionContext = createMockContext(mockSuperAdmin);
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue("admins:delete");

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("有精确权限应该通过", () => {
      // Arrange
      const mockExecutionContext = createMockContext({
        ...mockNormalAdmin,
        apiPermissions: ["users:list", "users:create"],
      });
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("users:list");

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("有通配符权限应该通过", () => {
      // Arrange
      const mockExecutionContext = createMockContext(mockNormalAdmin); // users:*
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue("users:create");

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("无权限应该抛出 ForbiddenException", () => {
      // Arrange
      const mockExecutionContext = createMockContext(mockNormalAdmin); // users:*
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("admins:list");

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException("无权限访问该接口"),
      );
    });

    it("通配符不匹配模块应该抛出 ForbiddenException", () => {
      // Arrange
      const mockExecutionContext = createMockContext({
        ...mockNormalAdmin,
        apiPermissions: ["users:*"],
      });
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("roles:list");

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException("无权限访问该接口"),
      );
    });

    it("全局通配符 *:* 应该通过所有权限", () => {
      // Arrange
      const mockExecutionContext = createMockContext({
        ...mockNormalAdmin,
        roleId: 1,
        apiPermissions: ["*:*"],
      });
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue("any:permission");

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it("空权限列表应该抛出 ForbiddenException", () => {
      // Arrange
      const mockExecutionContext = createMockContext({
        ...mockNormalAdmin,
        apiPermissions: [],
      });
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("users:list");

      // Act & Assert
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException("无权限访问该接口"),
      );
    });
  });
});

/**
 * 创建 Mock ExecutionContext
 */
function createMockContext(user: AdminInfo): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
}
