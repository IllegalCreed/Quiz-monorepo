/**
 * 用户自服务 API（历史 + 偏好）
 *
 * 需要登录（UserJwtAuthGuard），请求自动携带 token
 */
import { get, put } from "@/utils/request";
import type { HistoryPage } from "@/types/history";
import type { UserPreference } from "@/types/category";

/**
 * 获取当前用户做题历史（分页）
 *
 * @param page - 页码（默认 1）
 * @param pageSize - 每页条数（默认 20）
 */
export function fetchHistory(page = 1, pageSize = 20): Promise<HistoryPage> {
  return get<HistoryPage>(`/user/history?page=${page}&pageSize=${pageSize}`);
}

/**
 * 获取当前用户偏好分类列表
 */
export function fetchPreferences(): Promise<UserPreference[]> {
  return get<UserPreference[]>("/user/preferences");
}

/**
 * 更新当前用户偏好分类（全量替换）
 *
 * @param categoryIds - 叶子分类 ID 数组
 */
export function updatePreferences(categoryIds: number[]): Promise<UserPreference[]> {
  return put<UserPreference[]>("/user/preferences", { categoryIds });
}
