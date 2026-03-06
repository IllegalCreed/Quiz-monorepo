/**
 * Dashboard 服务
 * 聚合查询首页所需的统计数据：
 * - 概览计数（题目、用户、答题、正确率）含今日增量
 * - 近7天每日答题趋势（折线图）
 * - 分类题目分布 Top10（柱状图）
 * - 最近10条操作日志
 */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** 带今日数值的统计项 */
interface StatWithToday {
  total: number;
  today: number;
}

/** 概览统计 */
interface DashboardOverview {
  questions: StatWithToday;
  users: StatWithToday;
  attempts: StatWithToday;
  /** 正确率（百分比数值，如 68.5） */
  accuracy: StatWithToday;
}

/** 每日答题趋势 */
interface DailyTrendItem {
  date: string;
  attempts: number;
  correct: number;
}

/** 分类题目分布 */
interface CategoryDistItem {
  categoryId: number;
  categoryName: string;
  questionCount: number;
}

/** 最近日志条目 */
interface RecentLogItem {
  id: number;
  actorName: string | null;
  module: string;
  action: string;
  success: boolean;
  createdAt: Date;
}

/** Dashboard 响应数据 */
export interface DashboardData {
  overview: DashboardOverview;
  dailyTrend: DailyTrendItem[];
  categoryDistribution: CategoryDistItem[];
  recentLogs: RecentLogItem[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取首页聚合统计数据
   * 所有查询通过 Promise.all 并行执行，总耗时 ≈ 最慢单查询
   */
  async getDashboard(): Promise<DashboardData> {
    const today = this.startOfDay(new Date());
    const sevenDaysAgo = new Date(today.getTime() - 7 * 86_400_000);

    const [
      questionTotal,
      questionToday,
      userTotal,
      userToday,
      attemptTotal,
      attemptToday,
      correctTotal,
      correctToday,
      recentLogs,
      dailyTrend,
      categoryDistribution,
    ] = await Promise.all([
      // 题目总数（排除软删除）
      this.prisma.question.count({ where: { deletedAt: null } }),
      // 今日新增题目
      this.prisma.question.count({
        where: { deletedAt: null, createdAt: { gte: today } },
      }),
      // 用户总数
      this.prisma.user.count(),
      // 今日新注册用户
      this.prisma.user.count({ where: { createdAt: { gte: today } } }),
      // 答题总数
      this.prisma.answerAttempt.count(),
      // 今日答题数
      this.prisma.answerAttempt.count({
        where: { createdAt: { gte: today } },
      }),
      // 总答对数（计算正确率）
      this.prisma.answerAttempt.count({ where: { correct: true } }),
      // 今日答对数
      this.prisma.answerAttempt.count({
        where: { correct: true, createdAt: { gte: today } },
      }),
      // 最近 10 条操作日志
      this.prisma.systemLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          actorName: true,
          module: true,
          action: true,
          success: true,
          createdAt: true,
        },
      }),
      // 近7天每日答题统计
      this.getDailyTrend(sevenDaysAgo),
      // 分类题目分布 Top10
      this.getCategoryDistribution(),
    ]);

    return {
      overview: {
        questions: { total: questionTotal, today: questionToday },
        users: { total: userTotal, today: userToday },
        attempts: { total: attemptTotal, today: attemptToday },
        accuracy: {
          total: this.calcPercent(correctTotal, attemptTotal),
          today: this.calcPercent(correctToday, attemptToday),
        },
      },
      dailyTrend,
      categoryDistribution,
      recentLogs,
    };
  }

  /**
   * 获取近7天每日答题趋势
   * 对每天分别查总数和正确数，无数据的日期补 0
   */
  private async getDailyTrend(_since: Date): Promise<DailyTrendItem[]> {
    const result: DailyTrendItem[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [attempts, correct] = await Promise.all([
        this.prisma.answerAttempt.count({
          where: { createdAt: { gte: dayStart, lt: dayEnd } },
        }),
        this.prisma.answerAttempt.count({
          where: { correct: true, createdAt: { gte: dayStart, lt: dayEnd } },
        }),
      ]);

      result.push({
        date: dayStart.toISOString().slice(0, 10),
        attempts,
        correct,
      });
    }

    return result;
  }

  /**
   * 获取分类题目分布 Top10
   * 通过 QuestionCategory 关联表 groupBy 统计，拼接 "维度名 / 分类名"
   */
  private async getCategoryDistribution(): Promise<CategoryDistItem[]> {
    // 按分类 ID 分组统计题目数量
    const grouped = await this.prisma.questionCategory.groupBy({
      by: ["categoryId"],
      _count: { questionId: true },
      orderBy: { _count: { questionId: "desc" } },
      take: 10,
    });

    if (grouped.length === 0) return [];

    // 批量查询分类详情（含维度关系和父分类）
    const categoryIds = grouped.map((g) => g.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      include: { group: true, parent: true },
    });

    // 构建 ID → 分类 Map
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    return grouped.map((g) => {
      const cat = categoryMap.get(g.categoryId);
      let categoryName = "未知分类";
      if (cat) {
        // 有父分类时拼接："父分类名 / 子分类名"，否则 "维度名 / 分类名"
        const prefix = cat.parent ? cat.parent.name : cat.group.name;
        categoryName = `${prefix} / ${cat.name}`;
      }
      return {
        categoryId: g.categoryId,
        categoryName,
        questionCount: g._count.questionId,
      };
    });
  }

  /**
   * 计算百分比（保留一位小数）
   */
  private calcPercent(correct: number, total: number): number {
    if (total === 0) return 0;
    return +((correct / total) * 100).toFixed(1);
  }

  /**
   * 获取当天 00:00:00 时间
   */
  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
