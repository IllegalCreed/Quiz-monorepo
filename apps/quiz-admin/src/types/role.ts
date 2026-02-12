/**
 * 角色相关类型定义
 */

/**
 * 角色信息
 */
export interface Role {
  /** 角色 ID */
  id: number;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 是否系统内置角色（super_admin 角色，不可删除/修改） */
  isSystem: boolean;
  /** 菜单权限数组 */
  menuPermissions: string[];
  /** API 权限数组 */
  apiPermissions: string[];
  /** 使用该角色的管理员数量 */
  adminCount?: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 内部字段：管理员数量统计 */
  _count?: {
    admins: number;
  };
}

/**
 * 创建角色表单
 */
export interface CreateRoleForm {
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 菜单权限数组 */
  menuPermissions: string[];
  /** API 权限数组 */
  apiPermissions: string[];
}

/**
 * 更新角色表单
 */
export interface UpdateRoleForm {
  /** 角色名称 */
  name?: string;
  /** 角色描述 */
  description?: string;
  /** 菜单权限数组 */
  menuPermissions?: string[];
  /** API 权限数组 */
  apiPermissions?: string[];
}
