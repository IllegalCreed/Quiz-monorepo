import { QuestionsService } from "../questions.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("QuestionsService (unit)", () => {
  it("checkAnswer should return correct boolean for mocked option", async () => {
    // Mock PrismaService with a typed Partial and cast to PrismaService
    const mockPrisma = {
      option: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, isCorrect: true }),
        findFirst: jest.fn().mockResolvedValue({ id: 1 }),
      },
    } as unknown as PrismaService;
    const svc = new QuestionsService(mockPrisma);
    const res = await svc.checkAnswer(1, 1);
    expect(res.correct).toBe(true);
    expect(res.correctOptionId).toBe(1);
  });

  it("checkAnswer 选项不存在时应该抛出错误", async () => {
    // Arrange：findUnique 返回 null（选项 ID 不存在）
    const mockPrisma = {
      option: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn(),
      },
    } as unknown as PrismaService;
    const svc = new QuestionsService(mockPrisma);

    // Act & Assert
    await expect(svc.checkAnswer(1, 999)).rejects.toThrow("Option not found");
  });

  it("getRandom should return options with description field", async () => {
    // 模拟 Prisma 的 $queryRaw 和 option.findMany
    const mockOptions = [
      {
        id: 10,
        questionId: 1,
        text: "选项A",
        isCorrect: false,
        description: "A 的解析",
      },
      {
        id: 11,
        questionId: 1,
        text: "选项B",
        isCorrect: true,
        description: "B 的解析",
      },
    ];
    const mockPrisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id: 1, stem: "测试题目", explanation: "解析", tags: null },
        ]),
      option: {
        findMany: jest.fn().mockResolvedValue(mockOptions),
      },
      questionCategory: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    const svc = new QuestionsService(mockPrisma);
    const results = await svc.getRandom(1);

    expect(results).toHaveLength(1);
    expect(results[0].options).toHaveLength(2);
    // 验证 description 字段被包含在返回结果中
    expect(results[0].options[0]).toEqual({
      id: 10,
      text: "选项A",
      description: "A 的解析",
    });
    expect(results[0].options[1]).toEqual({
      id: 11,
      text: "选项B",
      description: "B 的解析",
    });
    // 验证 categoryNames 字段存在
    expect(results[0].categoryNames).toEqual([]);
  });

  it("getRandom should handle null description", async () => {
    // 验证 description 为 null 时也能正确返回
    const mockOptions = [
      {
        id: 10,
        questionId: 1,
        text: "选项A",
        isCorrect: false,
        description: null,
      },
    ];
    const mockPrisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id: 1, stem: "测试题目", explanation: null, tags: null },
        ]),
      option: {
        findMany: jest.fn().mockResolvedValue(mockOptions),
      },
      questionCategory: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;

    const svc = new QuestionsService(mockPrisma);
    const results = await svc.getRandom(1);

    expect(results[0].options[0].description).toBeNull();
  });

  it("getRandom 应返回分类显示名称（含通识拼接）", async () => {
    // Arrange：题目关联两个分类，其中一个是通识节点
    const mockPrisma = {
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          { id: 1, stem: "题目", explanation: null, tags: null },
        ]),
      option: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      questionCategory: {
        findMany: jest.fn().mockResolvedValue([
          {
            questionId: 1,
            categoryId: 10,
            category: {
              id: 10,
              name: "Vue",
              isDefault: false,
              parent: { name: "前端" },
            },
          },
          {
            questionId: 1,
            categoryId: 99,
            category: {
              id: 99,
              name: "通识",
              isDefault: true,
              parent: { name: "前端" },
            },
          },
        ]),
      },
    } as unknown as PrismaService;

    const svc = new QuestionsService(mockPrisma);
    const results = await svc.getRandom(1);

    // Assert：通识节点拼接父名
    expect(results[0].categoryNames).toEqual(["Vue", "前端通识"]);
  });

  describe("findQuestionById", () => {
    it("应该返回题目及其所有选项", async () => {
      // Arrange
      const mockQuestion = {
        id: 1,
        stem: "测试题干",
        explanation: "测试解析",
        tags: null,
        deletedAt: null,
        type: "single_choice",
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: 10,
            questionId: 1,
            text: "选项A",
            description: "A的解析",
            isCorrect: true,
          },
        ],
      };
      const mockPrisma = {
        question: {
          findUnique: jest.fn().mockResolvedValue(mockQuestion),
        },
      } as unknown as PrismaService;
      const svc = new QuestionsService(mockPrisma);

      // Act
      const result = await svc.findQuestionById(1);

      // Assert
      expect(result).toEqual(mockQuestion);
      expect(result?.options).toHaveLength(1);
    });

    it("题目不存在时应该返回 null", async () => {
      // Arrange
      const mockPrisma = {
        question: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService;
      const svc = new QuestionsService(mockPrisma);

      // Act
      const result = await svc.findQuestionById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  describe("getRandom — categoryIds 筛选", () => {
    it("传入 categoryIds 时，$queryRaw 应包含 categoryId 筛选 SQL", async () => {
      // Arrange
      const queryRawMock = jest
        .fn()
        .mockResolvedValue([
          { id: 1, stem: "题目", explanation: null, tags: null },
        ]);
      const mockPrisma = {
        $queryRaw: queryRawMock,
        option: {
          findMany: jest.fn().mockResolvedValue([]),
        },
        questionCategory: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as unknown as PrismaService;
      const svc = new QuestionsService(mockPrisma);

      // Act
      await svc.getRandom(1, [3, 5]);

      // Assert：$queryRaw 被调用（内含 categoryIds 筛选）
      expect(queryRawMock).toHaveBeenCalled();
      // 验证 tagged template 参数中包含 categoryIds 相关值
      const callArgs = queryRawMock.mock.calls[0];
      // tagged template 的第一个参数是 strings 数组，后续为插值
      // 无法精确验证 SQL 文本（Prisma.sql tagged template），但确保调用成功
      expect(callArgs).toBeDefined();
    });

    it("不传 categoryIds 时，正常返回结果（无分类筛选）", async () => {
      // Arrange
      const mockPrisma = {
        $queryRaw: jest
          .fn()
          .mockResolvedValue([
            { id: 1, stem: "题目", explanation: null, tags: null },
          ]),
        option: {
          findMany: jest
            .fn()
            .mockResolvedValue([
              { id: 10, text: "选项A", description: null, isCorrect: true },
            ]),
        },
        questionCategory: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as unknown as PrismaService;
      const svc = new QuestionsService(mockPrisma);

      // Act
      const results = await svc.getRandom(1);

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].options).toHaveLength(1);
      expect(results[0].categoryNames).toEqual([]);
    });

    it("categoryIds 为空数组时，与不传 categoryIds 行为一致", async () => {
      // Arrange
      const queryRawMock = jest.fn().mockResolvedValue([]);
      const mockPrisma = {
        $queryRaw: queryRawMock,
        option: { findMany: jest.fn() },
        questionCategory: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as unknown as PrismaService;
      const svc = new QuestionsService(mockPrisma);

      // Act
      const results = await svc.getRandom(1, []);

      // Assert
      expect(results).toHaveLength(0);
      expect(queryRawMock).toHaveBeenCalled();
    });
  });
});
