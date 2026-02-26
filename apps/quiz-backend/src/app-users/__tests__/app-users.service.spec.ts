import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { AppUsersService } from "../app-users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { UserStatus } from "@prisma/client";

/**
 * AppUsersService 单元测试
 * 测试管理端用户 CRUD、做题历史、偏好分类
 */
describe("AppUsersService", () => {
  let service: AppUsersService;
  let prisma: PrismaService;

  /** 模拟用户数据（select 结果，不含 password） */
  const mockUser = {
    id: 1,
    username: "testuser",
    nickname: "测试用户",
    email: "test@example.com",
    status: "ACTIVE" as UserStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { answerAttempts: 5, preferences: 2 },
  };

  const mockUserList = {
    id: 1,
    username: "testuser",
    nickname: "测试用户",
    email: "test@example.com",
    status: "ACTIVE" as UserStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { answerAttempts: 5 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppUsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            answerAttempt: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            userPreference: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppUsersService>(AppUsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("应该返回分页用户列表", async () => {
      // Arrange
      const mockItems = [mockUserList];
      jest.spyOn(prisma, "$transaction").mockResolvedValue([mockItems, 1]);

      // Act
      const result = await service.findAll({ page: 1, pageSize: 20 });

      // Assert
      expect(result).toEqual({ total: 1, items: mockItems });
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该支持关键词搜索", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);

      // Act
      await service.findAll({ keyword: "test", page: 1, pageSize: 20 });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("应该支持状态过滤", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);

      // Act
      await service.findAll({ status: "DISABLED", page: 1, pageSize: 20 });

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("应该返回用户详情（不含密码）", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
    });

    it("不存在的用户应抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException("用户 ID 999 不存在"),
      );
    });
  });

  describe("getHistory", () => {
    it("应该返回用户做题历史（分页）", async () => {
      // Arrange：findOne 先检查用户存在
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);

      const mockAttempts = [
        {
          id: 1,
          questionId: 1,
          selectedOption: 10,
          correct: true,
          elapsedMs: 5000,
          userId: 1,
          createdAt: new Date(),
          question: { id: 1, stem: "测试题", type: "single_choice" },
        },
      ];
      jest.spyOn(prisma, "$transaction").mockResolvedValue([mockAttempts, 1]);

      // Act
      const result = await service.getHistory(1, 1, 20);

      // Assert
      expect(result).toEqual({ total: 1, items: mockAttempts });
    });

    it("不存在的用户应抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.getHistory(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getPreferences", () => {
    it("应该返回用户偏好分类", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);

      const mockPrefs = [
        {
          userId: 1,
          categoryId: 1,
          category: { id: 1, name: "前端", group: { id: 1, name: "技术方向" } },
        },
      ];
      jest
        .spyOn(prisma.userPreference, "findMany")
        .mockResolvedValue(mockPrefs as any);

      // Act
      const result = await service.getPreferences(1);

      // Assert
      expect(result).toEqual(mockPrefs);
    });
  });

  describe("updateStatus", () => {
    it("应该成功切换用户状态", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);
      const updatedUser = { ...mockUser, status: "DISABLED" as UserStatus };
      jest.spyOn(prisma.user, "update").mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updateStatus(1, "DISABLED");

      // Assert
      expect(result.status).toBe("DISABLED");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: "DISABLED" },
        select: expect.any(Object),
      });
    });

    it("不存在的用户应抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateStatus(999, "DISABLED")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("应该成功删除用户", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, "delete").mockResolvedValue(mockUser as any);

      // Act
      const result = await service.remove(1);

      // Assert
      expect(result).toEqual({ message: "用户删除成功" });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("不存在的用户应抛出 NotFoundException", async () => {
      // Arrange
      jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
