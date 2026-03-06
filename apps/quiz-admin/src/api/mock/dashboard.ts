/**
 * Dashboard Mock API
 * 模拟首页聚合统计数据，用于 VITE_MOCK=true 模式
 */
import type { DashboardData } from "@/api/dashboard";

/**
 * 生成近7天日期标签（MM-DD 格式用于图表坐标轴）
 */
const generateDailyTrend = (): DashboardData["dailyTrend"] => {
  const result: DashboardData["dailyTrend"] = [];
  const baseAttempts = [120, 150, 180, 135, 200, 220, 190];
  const baseCorrect = [78, 102, 115, 88, 140, 155, 130];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().slice(0, 10),
      attempts: baseAttempts[6 - i]!,
      correct: baseCorrect[6 - i]!,
    });
  }
  return result;
};

/** Mock Dashboard 完整数据 */
const mockDashboardData: DashboardData = {
  overview: {
    questions: { total: 156, today: 3 },
    users: { total: 42, today: 1 },
    attempts: { total: 1280, today: 56 },
    accuracy: { total: 68.5, today: 72.1 },
  },
  dailyTrend: generateDailyTrend(),
  categoryDistribution: [
    { categoryId: 1, categoryName: "前端 / JavaScript", questionCount: 45 },
    { categoryId: 2, categoryName: "后端 / Node.js", questionCount: 38 },
    { categoryId: 3, categoryName: "前端 / Vue", questionCount: 32 },
    { categoryId: 4, categoryName: "前端 / TypeScript", questionCount: 28 },
    { categoryId: 5, categoryName: "后端 / Python", questionCount: 22 },
    { categoryId: 6, categoryName: "前端 / CSS", questionCount: 18 },
    { categoryId: 7, categoryName: "前端 / React", questionCount: 15 },
    { categoryId: 8, categoryName: "计算机基础 / 网络", questionCount: 12 },
    { categoryId: 9, categoryName: "计算机基础 / 算法", questionCount: 10 },
    { categoryId: 10, categoryName: "后端 / Java", questionCount: 8 },
  ],
  recentLogs: [
    {
      id: 1,
      actorName: "admin",
      module: "questions",
      action: "创建题目",
      success: true,
      createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    },
    {
      id: 2,
      actorName: "admin",
      module: "app-users",
      action: "禁用用户",
      success: true,
      createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    },
    {
      id: 3,
      actorName: "editor",
      module: "questions",
      action: "更新题目",
      success: true,
      createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    },
    {
      id: 4,
      actorName: "admin",
      module: "categories",
      action: "创建分类",
      success: true,
      createdAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    },
    {
      id: 5,
      actorName: "admin",
      module: "auth",
      action: "管理员登录",
      success: true,
      createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    },
    {
      id: 6,
      actorName: "editor",
      module: "auth",
      action: "管理员登录",
      success: true,
      createdAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
    },
    {
      id: 7,
      actorName: "admin",
      module: "roles",
      action: "更新角色",
      success: false,
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    },
    {
      id: 8,
      actorName: "admin",
      module: "questions",
      action: "删除题目",
      success: true,
      createdAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    },
    {
      id: 9,
      actorName: "admin",
      module: "admins",
      action: "创建管理员",
      success: true,
      createdAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
    },
    {
      id: 10,
      actorName: "admin",
      module: "questions",
      action: "创建题目",
      success: true,
      createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    },
  ],
};

/**
 * Mock 获取首页聚合统计数据
 */
export const getDashboard = async (): Promise<DashboardData> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...mockDashboardData, dailyTrend: generateDailyTrend() };
};
