/**
 * 权限查询 API（真实后端）
 */
import { get } from "@/utils/request";

/** 菜单权限 */
export interface MenuPermission {
  id: string;
  name: string;
  description: string;
}

/** API 权限 */
export interface ApiPermission {
  id: string;
  name: string;
  description: string;
  module: string;
}

/**
 * 获取所有菜单权限
 */
export const getMenuPermissions = async (): Promise<MenuPermission[]> => {
  return get<MenuPermission[]>("/admin/permissions/menus");
};

/**
 * 获取所有 API 权限
 */
export const getApiPermissions = async (): Promise<ApiPermission[]> => {
  return get<ApiPermission[]>("/admin/permissions/apis");
};
