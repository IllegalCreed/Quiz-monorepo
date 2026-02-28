import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserAuthService } from "../user-auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SystemLogsService } from "../../system-logs/system-logs.service";
import { UserStatus } from "@prisma/client";

// Mock bcrypt module
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
import * as bcrypt from "bcrypt";

/**
 * UserAuthService 单元测试
 * 测试用户注册、登录逻辑
 */
describe("UserAuthService", () => {
  let service: UserAuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
  const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<
    typeof bcrypt.compare
  >;

  /** 模拟用户数据 */
  const mockUser = {
    id: 1,
    username: "testuser",
    password: "$2b$10$hashedPassword",
    nickname: "测试用户",
    email: "test@example.com",
    status: "ACTIVE" as UserStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisabledUser = {
    ...mockUser,
    id: 3,
    username: "disableduser",
    status: "DISABLED" as UserStatus,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
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

    service = module.get<UserAuthService>(UserAuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("注册成功应返回 token 和用户信息（不含密码）", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue("$2b$10$hashed" as never);
      jest.spyOn(prisma.user, "create").mockResolvedValue(mockUser);
      jest.spyOn(jwtService, "sign").mockReturnValue("mock_user_token");

      // Act
      const result = await service.register({
        username: "testuser",
        password: "user123",
        nickname: "测试用户",
        email: "test@example.com",
      });

      // Assert
      expect(result.token).toBe("mock_user_token");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user.username).toBe("testuser");
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: "testuser",
        role: "user",
      });
    });

    it("用户名重复应抛出 BadRequestException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.register({ username: "testuser", password: "user123" }),
      ).rejects.toThrow(new BadRequestException("用户名已存在"));
    });

    it("邮箱重复应抛出 BadRequestException", async () => {
      // Arrange: 第一次 findUnique（username）返回 null，第二次（email）返回已存在
      jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValueOnce(null) // username 不重复
        .mockResolvedValueOnce(mockUser); // email 重复

      // Act & Assert
      await expect(
        service.register({
          username: "newuser",
          password: "user123",
          email: "test@example.com",
        }),
      ).rejects.toThrow(new BadRequestException("邮箱已被注册"));
    });

    it("密码应使用 bcrypt 加密后存储", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);
      mockBcryptHash.mockResolvedValue("$2b$10$encrypted" as never);
      jest.spyOn(prisma.user, "create").mockResolvedValue(mockUser);
      jest.spyOn(jwtService, "sign").mockReturnValue("token");

      // Act
      await service.register({ username: "newuser", password: "user123" });

      // Assert
      expect(mockBcryptHash).toHaveBeenCalledWith("user123", 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: "$2b$10$encrypted",
          }),
        }),
      );
    });
  });

  describe("login", () => {
    it("正确的凭证应登录成功", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(true as never);
      jest.spyOn(jwtService, "sign").mockReturnValue("mock_user_token");

      // Act
      const result = await service.login({
        username: "testuser",
        password: "user123",
      });

      // Assert
      expect(result.token).toBe("mock_user_token");
      expect(result.user).not.toHaveProperty("password");
      expect(result.user.username).toBe("testuser");
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: "testuser",
        role: "user",
      });
    });

    it("不存在的用户名应抛出 UnauthorizedException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ username: "nonexistent", password: "user123" }),
      ).rejects.toThrow(new UnauthorizedException("账号或密码错误"));
    });

    it("错误的密码应抛出 UnauthorizedException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser);
      mockBcryptCompare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        service.login({ username: "testuser", password: "wrong" }),
      ).rejects.toThrow(new UnauthorizedException("账号或密码错误"));
    });

    it("被禁用的账号应抛出 ForbiddenException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockDisabledUser);
      mockBcryptCompare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(
        service.login({ username: "disableduser", password: "user123" }),
      ).rejects.toThrow("账号已被禁用");
    });
  });
});
