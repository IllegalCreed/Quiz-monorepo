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
    } as unknown as PrismaService;

    const svc = new QuestionsService(mockPrisma);
    const results = await svc.getRandom(1);

    expect(results[0].options[0].description).toBeNull();
  });
});
