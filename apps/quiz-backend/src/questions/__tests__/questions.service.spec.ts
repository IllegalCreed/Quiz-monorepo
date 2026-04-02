import { QuestionsService } from "../questions.service";
import { PrismaService } from "../../prisma/prisma.service";

type MockPrisma = {
  $queryRaw: jest.Mock;
  question: {
    findUnique: jest.Mock;
  };
};

function createMockPrisma(queryResults: unknown[] = []): MockPrisma {
  const queryRaw = jest.fn();
  for (const result of queryResults) {
    queryRaw.mockResolvedValueOnce(result);
  }

  return {
    $queryRaw: queryRaw,
    question: {
      findUnique: jest.fn(),
    },
  };
}

function createService(mockPrisma: MockPrisma) {
  return new QuestionsService(mockPrisma as unknown as PrismaService);
}

describe("QuestionsService (unit)", () => {
  describe("getRandom", () => {
    it("should return options with description field", async () => {
      const mockPrisma = createMockPrisma([
        [{ id: 1, stem: "测试题目", explanation: "解析", tags: null }],
        [],
        [
          {
            questionId: 1,
            id: 10,
            text: "选项A",
            description: "A 的解析",
          },
          {
            questionId: 1,
            id: 11,
            text: "选项B",
            description: "B 的解析",
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      const results = await svc.getRandom(1);

      expect(results).toHaveLength(1);
      expect(results[0].options).toEqual([
        {
          id: 10,
          text: "选项A",
          description: "A 的解析",
        },
        {
          id: 11,
          text: "选项B",
          description: "B 的解析",
        },
      ]);
      expect(results[0].categoryNames).toEqual([]);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(3);
    });

    it("should handle null description", async () => {
      const mockPrisma = createMockPrisma([
        [{ id: 1, stem: "测试题目", explanation: null, tags: null }],
        [],
        [
          {
            questionId: 1,
            id: 10,
            text: "选项A",
            description: null,
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      const results = await svc.getRandom(1);

      expect(results[0].options[0].description).toBeNull();
    });

    it("应返回分类显示名称（含通识拼接）", async () => {
      const mockPrisma = createMockPrisma([
        [{ id: 1, stem: "题目", explanation: null, tags: null }],
        [
          {
            questionId: 1,
            categoryId: 10,
            categoryName: "Vue",
            categoryIsDefault: false,
            parentCategoryName: "前端",
          },
          {
            questionId: 1,
            categoryId: 99,
            categoryName: "通识",
            categoryIsDefault: true,
            parentCategoryName: "前端",
          },
        ],
        [],
      ]);
      const svc = createService(mockPrisma);

      const results = await svc.getRandom(1);

      expect(results[0].categoryNames).toEqual(["Vue", "前端通识"]);
    });

    it("传入 categoryIds 时，$queryRaw 应被调用", async () => {
      const mockPrisma = createMockPrisma([
        [{ id: 1, stem: "题目", explanation: null, tags: null }],
        [],
        [],
      ]);
      const svc = createService(mockPrisma);

      await svc.getRandom(1, [3, 5]);

      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(3);
      expect(mockPrisma.$queryRaw.mock.calls[0]).toBeDefined();
    });

    it("不传 categoryIds 时，正常返回结果（无分类筛选）", async () => {
      const mockPrisma = createMockPrisma([
        [{ id: 1, stem: "题目", explanation: null, tags: null }],
        [],
        [
          {
            questionId: 1,
            id: 10,
            text: "选项A",
            description: null,
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      const results = await svc.getRandom(1);

      expect(results).toHaveLength(1);
      expect(results[0].options).toHaveLength(1);
      expect(results[0].categoryNames).toEqual([]);
    });

    it("categoryIds 为空数组时，与不传 categoryIds 行为一致", async () => {
      const mockPrisma = createMockPrisma([[]]);
      const svc = createService(mockPrisma);

      const results = await svc.getRandom(1, []);

      expect(results).toHaveLength(0);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe("evaluateAnswer", () => {
    it("应该成功返回完整答题结果", async () => {
      const mockPrisma = createMockPrisma([
        [
          {
            questionId: 1,
            explanation: "这是解析",
            optionId: 10,
            optionText: "选项A",
            optionDescription: "A的解析",
            optionIsCorrect: true,
          },
          {
            questionId: 1,
            explanation: "这是解析",
            optionId: 11,
            optionText: "选项B",
            optionDescription: "B的解析",
            optionIsCorrect: false,
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      const result = await svc.evaluateAnswer(1, 10);

      expect(result).toEqual({
        correct: true,
        correctOptionId: 10,
        explanation: "这是解析",
        options: [
          {
            id: 10,
            text: "选项A",
            description: "A的解析",
            isCorrect: true,
          },
          {
            id: 11,
            text: "选项B",
            description: "B的解析",
            isCorrect: false,
          },
        ],
      });
    });

    it("选项不属于该题时应该抛出错误", async () => {
      const mockPrisma = createMockPrisma([
        [
          {
            questionId: 1,
            explanation: "这是解析",
            optionId: 10,
            optionText: "选项A",
            optionDescription: "A的解析",
            optionIsCorrect: true,
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      await expect(svc.evaluateAnswer(1, 999)).rejects.toThrow(
        "Option not found",
      );
    });

    it("题目不存在时应该返回空结果", async () => {
      const mockPrisma = createMockPrisma([[]]);
      const svc = createService(mockPrisma);

      const result = await svc.evaluateAnswer(999, 10);

      expect(result).toEqual({
        correct: false,
        correctOptionId: null,
        explanation: null,
        options: [],
      });
    });
  });

  describe("checkAnswer", () => {
    it("should return correct boolean for selected option in question", async () => {
      const mockPrisma = createMockPrisma([
        [
          {
            questionId: 1,
            explanation: "解析",
            optionId: 1,
            optionText: "选项A",
            optionDescription: null,
            optionIsCorrect: true,
          },
        ],
      ]);
      const svc = createService(mockPrisma);

      const res = await svc.checkAnswer(1, 1);

      expect(res.correct).toBe(true);
      expect(res.correctOptionId).toBe(1);
    });
  });

  describe("findQuestionById", () => {
    it("应该返回题目及其所有选项", async () => {
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
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue(mockQuestion);
      const svc = createService(mockPrisma);

      const result = await svc.findQuestionById(1);

      expect(result).toEqual(mockQuestion);
      expect(result?.options).toHaveLength(1);
    });

    it("题目不存在时应该返回 null", async () => {
      const mockPrisma = createMockPrisma();
      mockPrisma.question.findUnique.mockResolvedValue(null);
      const svc = createService(mockPrisma);

      const result = await svc.findQuestionById(999);

      expect(result).toBeNull();
    });
  });
});
