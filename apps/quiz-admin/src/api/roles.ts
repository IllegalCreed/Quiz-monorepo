/**
 * 角色管理 API（真实后端）
 */
import { get, post, put, del } from "@/utils/request";

/** 角色信息 */
export interface Role {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  menuPermissions: string[];
  apiPermissions: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    admins: number;
  };
}

/** 创建角色表单 */
export interface CreateRoleForm {
  name: string;
  description: string;
  menuPermissions: string[];
  apiPermissions: string[];
}

/** 更新角色表单 */
export interface UpdateRoleForm {
  name?: string;
  description?: string;
  menuPermissions?: string[];
  apiPermissions?: string[];
}

/**
 * 获取角色列表
 */
export const getRoles = async (): Promise<Role[]> => {
  return get<Role[]>("/admin/roles");
};

/**
 * 创建角色
 */
export const createRole = async (form: CreateRoleForm): Promise<Role> => {
  return post<Role>("/admin/roles", form);
};

/**
 * 更新角色
 */
export const updateRole = async (id: number, form: UpdateRoleForm): Promise<Role> => {
  return put<Role>(`/admin/roles/${id}`, form);
};

/**
 * 删除角色
 */
export const deleteRole = async (id: number): Promise<{ message: string }> => {
  return del<{ message: string }>(`/admin/roles/${id}`);
};
