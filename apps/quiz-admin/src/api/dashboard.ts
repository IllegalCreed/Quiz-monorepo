/**
 * Dashboard API（真实后端）
 * 管理端调用 /admin/dashboard 端点获取首页聚合数据
 */
import { get } from "@/utils/request";

/** 带今日数值的统计项 */
export interface StatWithToday {
  total: number;
  today: number;
}

/** 概览统计 */
export interface DashboardOverview {
  /** 题目统计 */
  questions: StatWithToday;
  /** 用户统计 */
  users: StatWithToday;
  /** 答题统计 */
  attempts: StatWithToday;
  /** 正确率（百分比数值，如 68.5） */
  accuracy: StatWithToday;
}

/** 每日答题趋势（折线图数据） */
export interface DailyTrendItem {
  /** 日期字符串，如 "2026-03-03" */
  date: string;
  /** 当日答题总数 */
  attempts: number;
  /** 当日答对数 */
  correct: number;
}

/** 分类题目分布（柱状图数据） */
export interface CategoryDistItem {
  categoryId: number;
  /** 显示名称，如 "前端 / JavaScript" */
  categoryName: string;
  questionCount: number;
}

/** 最近日志条目 */
export interface RecentLogItem {
  id: number;
  actorName: string | null;
  module: string;
  action: string;
  success: boolean;
  createdAt: string;
}

/** Dashboard 完整响应 */
export interface DashboardData {
  overview: DashboardOverview;
  dailyTrend: DailyTrendItem[];
  categoryDistribution: CategoryDistItem[];
  recentLogs: RecentLogItem[];
}

/**
 * 获取首页聚合统计数据
 */
export const getDashboard = async (): Promise<DashboardData> => {
  return get<DashboardData>("/admin/dashboard");
};
