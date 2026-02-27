import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UserProfileService } from "../user-profile.service";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * UserProfileService 单元测试
 * 覆盖做题历史查询、偏好分类查询和更新（含叶子校验）
 */
describe("UserProfileService", () => {
  let service: UserProfileService;
  let prisma: PrismaService;

  /** Mock 做题历史条目 */
  const mockHistoryItem = {
    id: 1,
    userId: 10,
    questionId: 1,
    selectedOptionId: 2,
    isCorrect: false,
    createdAt: new Date("2026-01-15"),
    question: {
      id: 1,
      stem: "测试题干",
      type: "single_choice",
    },
  };

  /** Mock 偏好条目 */
  const mockPreference = {
    id: 1,
    userId: 10,
    categoryId: 3,
    category: {
      id: 3,
      name: "框架",
      groupId: 1,
      parentId: 1,
      isDefault: false,
      group: { id: 1, name: "技术方向" },
      parent: { id: 1, name: "前端" },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProfileService,
        {
          provide: PrismaService,
          useValue: {
            answerAttempt: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            userPreference: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
            category: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserProfileService>(UserProfileService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getHistory", () => {
    it("返回分页的做题历史", async () => {
      // Arrange
      jest
        .spyOn(prisma, "$transaction")
        .mockResolvedValue([[mockHistoryItem], 1]);

      // Act
      const result = await service.getHistory(10);

      // Assert
      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockHistoryItem);
    });

    it("默认 page=1, pageSize=20", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);
      const findManySpy = jest.spyOn(prisma.answerAttempt, "findMany");

      // Act
      await service.getHistory(10);

      // Assert：skip=0, take=20
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it("分页参数正确传递（page=3, pageSize=10 → skip=20）", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);
      const findManySpy = jest.spyOn(prisma.answerAttempt, "findMany");

      // Act
      await service.getHistory(10, 3, 10);

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it("包含关联的 question 基本信息", async () => {
      // Arrange
      jest
        .spyOn(prisma, "$transaction")
        .mockResolvedValue([[mockHistoryItem], 1]);

      // Act
      const result = await service.getHistory(10);

      // Assert
      expect(result.items[0].question).toEqual({
        id: 1,
        stem: "测试题干",
        type: "single_choice",
      });
    });

    it("无历史记录时返回空列表", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue([[], 0]);

      // Act
      const result = await service.getHistory(10);

      // Assert
      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getPreferences", () => {
    it("返回用户偏好分类（含 category + group + parent）", async () => {
      // Arrange
      jest
        .spyOn(prisma.userPreference, "findMany")
        .mockResolvedValue([mockPreference] as never);

      // Act
      const result = await service.getPreferences(10);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPreference);
      // 验证 include 参数
      expect(prisma.userPreference.findMany).toHaveBeenCalledWith({
        where: { userId: 10 },
        include: {
          category: {
            include: {
              group: true,
              parent: { select: { id: true, name: true } },
            },
          },
        },
      });
    });

    it("无偏好时返回空数组", async () => {
      // Arrange
      jest
        .spyOn(prisma.userPreference, "findMany")
        .mockResolvedValue([] as never);

      // Act
      const result = await service.getPreferences(10);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("updatePreferences", () => {
    it("categoryIds 含非叶子节点时，抛出 BadRequestException", async () => {
      // Arrange：findMany 返回非叶子节点
      jest
        .spyOn(prisma.category, "findMany")
        .mockResolvedValue([{ id: 1, name: "前端" }] as never);

      // Act & Assert
      await expect(service.updatePreferences(10, [1, 3])).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updatePreferences(10, [1, 3])).rejects.toThrow(
        "不是叶子节点",
      );
      // 不应执行事务
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("categoryIds 全为叶子节点时，先删后建偏好", async () => {
      // Arrange
      jest.spyOn(prisma.category, "findMany").mockResolvedValue([] as never);
      jest.spyOn(prisma, "$transaction").mockResolvedValue(undefined);
      jest
        .spyOn(prisma.userPreference, "findMany")
        .mockResolvedValue([mockPreference] as never);

      // Act
      const result = await service.updatePreferences(10, [3, 5]);

      // Assert：调用事务
      expect(prisma.$transaction).toHaveBeenCalled();
      // 返回更新后的偏好
      expect(result).toHaveLength(1);
    });

    it("categoryIds 为空数组时，清空偏好（不做叶子校验）", async () => {
      // Arrange
      jest.spyOn(prisma, "$transaction").mockResolvedValue(undefined);
      jest
        .spyOn(prisma.userPreference, "findMany")
        .mockResolvedValue([] as never);

      // Act
      const result = await service.updatePreferences(10, []);

      // Assert：不调用叶子校验
      expect(prisma.category.findMany).not.toHaveBeenCalled();
      // 事务仅包含 deleteMany（无 createMany）
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });
  });
});
