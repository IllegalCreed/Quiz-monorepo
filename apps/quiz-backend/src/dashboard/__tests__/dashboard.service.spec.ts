/**
 * DashboardService 单元测试
 * 测试聚合查询逻辑：概览计数、近7天趋势、分类分布、最近日志
 */
import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "../dashboard.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("DashboardService", () => {
  let service: DashboardService;

  /** 创建 mock PrismaService */
  const mockPrisma = {
    question: { count: jest.fn() },
    user: { count: jest.fn() },
    answerAttempt: { count: jest.fn() },
    systemLog: { findMany: jest.fn() },
    questionCategory: { groupBy: jest.fn() },
    category: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);

    jest.clearAllMocks();
  });

  it("应该被正确实例化", () => {
    expect(service).toBeDefined();
  });

  describe("getDashboard", () => {
    beforeEach(() => {
      // 设置默认 mock 返回值
      mockPrisma.question.count
        .mockResolvedValueOnce(100) // questionTotal
        .mockResolvedValueOnce(5); // questionToday
      mockPrisma.user.count
        .mockResolvedValueOnce(50) // userTotal
        .mockResolvedValueOnce(2); // userToday
      mockPrisma.answerAttempt.count
        .mockResolvedValueOnce(1000) // attemptTotal
        .mockResolvedValueOnce(80) // attemptToday
        .mockResolvedValueOnce(700) // correctTotal
        .mockResolvedValueOnce(60); // correctToday
      // getDailyTrend 内部每天 2 次 count（共 14 次）
      for (let i = 0; i < 14; i++) {
        mockPrisma.answerAttempt.count.mockResolvedValueOnce(
          i % 2 === 0 ? 50 : 35,
        );
      }
      mockPrisma.systemLog.findMany.mockResolvedValue([
        {
          id: 1,
          actorName: "admin",
          module: "questions",
          action: "创建题目",
          success: true,
          createdAt: new Date(),
        },
      ]);
      mockPrisma.questionCategory.groupBy.mockResolvedValue([
        { categoryId: 1, _count: { questionId: 20 } },
      ]);
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 1,
          name: "JavaScript",
          group: { name: "前端" },
          parent: null,
        },
      ]);
    });

    it("应返回完整的 Dashboard 数据结构", async () => {
      const result = await service.getDashboard();

      expect(result).toHaveProperty("overview");
      expect(result).toHaveProperty("dailyTrend");
      expect(result).toHaveProperty("categoryDistribution");
      expect(result).toHaveProperty("recentLogs");
    });

    it("概览统计应包含正确的字段和今日增量", async () => {
      const result = await service.getDashboard();

      expect(result.overview.questions).toEqual({ total: 100, today: 5 });
      expect(result.overview.users).toEqual({ total: 50, today: 2 });
      expect(result.overview.attempts).toEqual({ total: 1000, today: 80 });
    });

    it("正确率应正确计算百分比", async () => {
      const result = await service.getDashboard();

      // 700 / 1000 = 70%
      expect(result.overview.accuracy.total).toBe(70);
      // 60 / 80 = 75%
      expect(result.overview.accuracy.today).toBe(75);
    });

    it("答题为0时正确率应为0", async () => {
      jest.resetAllMocks();
      mockPrisma.question.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.answerAttempt.count.mockResolvedValue(0);
      mockPrisma.systemLog.findMany.mockResolvedValue([]);
      mockPrisma.questionCategory.groupBy.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);

      const result = await service.getDashboard();

      expect(result.overview.accuracy.total).toBe(0);
      expect(result.overview.accuracy.today).toBe(0);
    });

    it("近7天趋势应返回7个数据点", async () => {
      const result = await service.getDashboard();

      expect(result.dailyTrend).toHaveLength(7);
      for (const item of result.dailyTrend) {
        expect(item).toHaveProperty("date");
        expect(item).toHaveProperty("attempts");
        expect(item).toHaveProperty("correct");
        // 日期格式：YYYY-MM-DD
        expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it("分类分布应拼接 '维度/分类名' 格式", async () => {
      const result = await service.getDashboard();

      expect(result.categoryDistribution).toHaveLength(1);
      expect(result.categoryDistribution[0]).toEqual({
        categoryId: 1,
        categoryName: "前端 / JavaScript",
        questionCount: 20,
      });
    });

    it("分类分布有父分类时应拼接父名", async () => {
      mockPrisma.questionCategory.groupBy.mockResolvedValue([
        { categoryId: 2, _count: { questionId: 15 } },
      ]);
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: 2,
          name: "Vue",
          group: { name: "前端" },
          parent: { name: "框架" },
        },
      ]);

      const result = await service.getDashboard();

      expect(result.categoryDistribution[0]?.categoryName).toBe("框架 / Vue");
    });

    it("无分类数据时应返回空数组", async () => {
      mockPrisma.questionCategory.groupBy.mockResolvedValue([]);

      const result = await service.getDashboard();

      expect(result.categoryDistribution).toEqual([]);
    });

    it("最近日志应从 systemLog.findMany 获取", async () => {
      const result = await service.getDashboard();

      expect(result.recentLogs).toHaveLength(1);
      expect(result.recentLogs[0]).toHaveProperty("actorName", "admin");
      expect(mockPrisma.systemLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      );
    });
  });
});
