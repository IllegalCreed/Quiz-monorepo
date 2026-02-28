import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SystemLogsService } from "../../system-logs/system-logs.service";
import { AdminStatus } from "@prisma/client";

// Mock bcrypt module
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));
import * as bcrypt from "bcrypt";

/**
 * Auth Service 单元测试
 * 测试登录逻辑、密码验证、JWT 生成
 */
describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  // Mock 数据
  const mockSuperAdmin = {
    id: 1,
    username: "super_admin",
    password: "$2b$10$hashedPassword", // bcrypt hash placeholder
    nickname: "超级管理员",
    roleId: 1,
    status: "ACTIVE" as AdminStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: 1,
      name: "超级管理员",
      description: "系统最高权限",
      isSystem: true,
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
    },
  };

  const mockNormalAdmin = {
    id: 2,
    username: "admin",
    password: "$2b$10$hashedPassword",
    nickname: "普通管理员",
    roleId: 3,
    status: "ACTIVE" as AdminStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: 3,
      name: "用户管理员",
      description: "管理 App 用户",
      isSystem: false,
      menuPermissions: ["dashboard", "users"],
      apiPermissions: ["users:*"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockDisabledAdmin = {
    ...mockNormalAdmin,
    id: 3,
    username: "disabled_admin",
    status: "DISABLED" as AdminStatus,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            admin: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: SystemLogsService,
          useValue: {
            create: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear mock calls
    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("login", () => {
    it("正确的用户名和密码应该登录成功（超级管理员）", async () => {
      // Arrange
      const findUniqueSpy = jest
        .spyOn(prisma.admin, "findUnique")
        .mockResolvedValue(mockSuperAdmin);
      mockBcryptCompare.mockResolvedValue(true as never);
      const signSpy = jest
        .spyOn(jwtService, "sign")
        .mockReturnValue("mock_jwt_token");

      // Act
      const result = await service.login({
        username: "super_admin",
        password: "super_admin",
      });

      // Assert
      expect(result).toEqual({
        token: "mock_jwt_token",
        admin: {
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
          createdAt: mockSuperAdmin.createdAt,
          updatedAt: mockSuperAdmin.updatedAt,
        },
      });
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { username: "super_admin" },
        include: { role: true },
      });
      expect(signSpy).toHaveBeenCalledWith({
        sub: 1,
        username: "super_admin",
        roleId: 1,
      });
    });

    it("正确的用户名和密码应该登录成功（普通管理员）", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockNormalAdmin);
      mockBcryptCompare.mockResolvedValue(true as never);
      jest.spyOn(jwtService, "sign").mockReturnValue("mock_jwt_token");

      // Act
      const result = await service.login({
        username: "admin",
        password: "admin123",
      });

      // Assert
      expect(result.admin.role).toBe("admin"); // 非超级管理员返回 "admin"
      expect(result.admin.roleId).toBe(3);
      expect(result.admin.apiPermissions).toEqual(["users:*"]);
    });

    it("不存在的用户名应该抛出 UnauthorizedException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ username: "nonexistent", password: "password" }),
      ).rejects.toThrow("账号或密码错误");
    });

    it("错误的密码应该抛出 UnauthorizedException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);
      mockBcryptCompare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        service.login({ username: "super_admin", password: "wrong_password" }),
      ).rejects.toThrow("账号或密码错误");
    });

    it("被禁用的账号应该抛出 ForbiddenException", async () => {
      // Arrange
      jest
        .spyOn(prisma.admin, "findUnique")
        .mockResolvedValue(mockDisabledAdmin);
      mockBcryptCompare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(
        service.login({ username: "disabled_admin", password: "password" }),
      ).rejects.toThrow("账号已被禁用");
    });
  });

  describe("getInfo", () => {
    it("应该返回当前管理员信息（不含密码）", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(mockSuperAdmin);

      // Act
      const result = await service.getInfo(1);

      // Assert
      expect(result).toEqual({
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
        createdAt: mockSuperAdmin.createdAt,
        updatedAt: mockSuperAdmin.updatedAt,
      });
      expect(result).not.toHaveProperty("password");
    });

    it("不存在的管理员应该抛出 UnauthorizedException", async () => {
      // Arrange
      jest.spyOn(prisma.admin, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getInfo(999)).rejects.toThrow(
        new UnauthorizedException("管理员不存在"),
      );
    });

    it("被禁用的管理员应该抛出 ForbiddenException", async () => {
      // Arrange
      jest
        .spyOn(prisma.admin, "findUnique")
        .mockResolvedValue(mockDisabledAdmin);

      // Act & Assert
      await expect(service.getInfo(3)).rejects.toThrow("账号已被禁用");
    });
  });
});
