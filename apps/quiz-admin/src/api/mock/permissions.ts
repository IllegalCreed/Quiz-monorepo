/**
 * 权限管理 Mock API
 */

import {
  ALL_API_PERMISSION_GROUPS,
  ALL_MENU_PERMISSIONS,
  type ApiPermissionGroup,
  type MenuPermission,
} from "@/types/permission";

/**
 * 获取所有菜单权限
 */
export const getMenuPermissions = async (): Promise<MenuPermission[]> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [...ALL_MENU_PERMISSIONS];
};

/**
 * 获取所有 API 权限（分组）
 */
export const getApiPermissions = async (): Promise<ApiPermissionGroup[]> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [...ALL_API_PERMISSION_GROUPS];
};

/**
 * 权限-路由映射
 */
export const getPermissionRouteMapping = async (): Promise<Record<string, string[]>> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    dashboard: ["dashboard"],
    users: ["users"],
    questions: ["questions", "question-detail"],
    admins: ["admins"],
    roles: ["roles"],
    permissions: ["permissions"],
    system: ["settings"],
  };
};
