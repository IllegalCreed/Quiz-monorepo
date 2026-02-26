/**
 * App 用户管理 API（真实后端）
 * 管理端调用 /admin/app-users 端点，需 admin JWT
 */
import { get, patch, del } from "@/utils/request";
import type {
  AppUserListItem,
  AppUserDetail,
  AnswerAttemptItem,
  UserPreferenceItem,
} from "@/types/account";

/** 用户列表查询参数 */
export interface QueryAppUsersParams {
  keyword?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

/** 分页响应格式 */
export interface PaginatedResult<T> {
  total: number;
  items: T[];
}

/**
 * 获取用户列表（分页+搜索）
 */
export const getAppUsers = async (
  params: QueryAppUsersParams = {},
): Promise<PaginatedResult<AppUserListItem>> => {
  const query = new URLSearchParams();
  if (params.keyword) query.set("keyword", params.keyword);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return get<PaginatedResult<AppUserListItem>>(`/admin/app-users${qs ? `?${qs}` : ""}`);
};

/**
 * 获取用户详情
 */
export const getAppUser = async (id: number): Promise<AppUserDetail> => {
  return get<AppUserDetail>(`/admin/app-users/${id}`);
};

/**
 * 获取用户做题历史（分页）
 */
export const getAppUserHistory = async (
  id: number,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<AnswerAttemptItem>> => {
  return get<PaginatedResult<AnswerAttemptItem>>(
    `/admin/app-users/${id}/history?page=${page}&pageSize=${pageSize}`,
  );
};

/**
 * 获取用户偏好分类
 */
export const getAppUserPreferences = async (id: number): Promise<UserPreferenceItem[]> => {
  return get<UserPreferenceItem[]>(`/admin/app-users/${id}/preferences`);
};

/**
 * 更新用户状态（启用/禁用）
 */
export const updateAppUserStatus = async (
  id: number,
  status: "ACTIVE" | "DISABLED",
): Promise<void> => {
  await patch(`/admin/app-users/${id}/status`, { status });
};

/**
 * 删除用户
 */
export const deleteAppUser = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/app-users/${id}`);
};
